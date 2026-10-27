import { randomBytes, randomInt, scrypt as nodeScrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";

const scrypt = promisify(nodeScrypt);
const app = express();
const projectDirectory = path.dirname(fileURLToPath(import.meta.url));
const dataDirectory = path.resolve(process.env.TALENT_FLOW_DATA_DIR || path.join(projectDirectory, ".data"));
const profilesFile = path.join(dataDirectory, "profiles.json");
const sessions = new Map();
const otpChallenges = new Map();
const sessionCookie = "talent_flow_session";

let profiles = new Map();
let storeQueue = Promise.resolve();

app.disable("x-powered-by");
app.use(express.json({ limit: "20kb" }));

function readSessionId(request) {
  const cookies = request.headers.cookie?.split(";") ?? [];
  const cookie = cookies.find((item) => item.trim().startsWith(`${sessionCookie}=`));
  return cookie ? decodeURIComponent(cookie.trim().slice(sessionCookie.length + 1)) : null;
}

function getAuthenticatedUser(request, response) {
  const sessionId = readSessionId(request);
  const email = sessionId ? sessions.get(sessionId) : null;
  const user = email ? profiles.get(email) : null;

  if (!user) {
    response.status(401).json({ error: "Please sign in to continue." });
    return null;
  }

  return { sessionId, user };
}

function publicProfile(user) {
  const { passwordSalt, passwordHash, ...safeUser } = user;
  return safeUser;
}

function setSessionCookie(response, sessionId) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.setHeader(
    "Set-Cookie",
    `${sessionCookie}=${encodeURIComponent(sessionId)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800${secure}`,
  );
}

function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isString(value, maxLength = 160) {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maxLength;
}

async function saveProfiles() {
  const temporaryFile = `${profilesFile}.tmp`;
  const serialized = JSON.stringify([...profiles.entries()], null, 2);
  await writeFile(temporaryFile, serialized, { mode: 0o600 });
  await rename(temporaryFile, profilesFile);
}

function updateProfile(email, update) {
  const operation = storeQueue.then(async () => {
    const existingUser = profiles.get(email);
    if (!existingUser) {
      throw new Error("Account no longer exists.");
    }
    const updatedUser = { ...existingUser, ...update, updatedAt: new Date().toISOString() };
    profiles.set(email, updatedUser);
    await saveProfiles();
    return updatedUser;
  });
  storeQueue = operation.catch(() => {});
  return operation;
}

function addApplication(email, application) {
  const operation = storeQueue.then(async () => {
    const existingUser = profiles.get(email);
    if (!existingUser) {
      throw new Error("Account no longer exists.");
    }
    const applications = existingUser.applications || [];
    if (applications.some((item) => item.id === application.id)) {
      return { applications, created: false };
    }
    const updatedApplications = [...applications, { ...application, appliedAt: new Date().toISOString() }];
    const updatedUser = { ...existingUser, applications: updatedApplications, updatedAt: new Date().toISOString() };
    profiles.set(email, updatedUser);
    await saveProfiles();
    return { applications: updatedApplications, created: true };
  });
  storeQueue = operation.catch(() => {});
  return operation;
}

app.post("/api/auth/register", async (request, response) => {
  const { fullName, email: emailInput, password } = request.body ?? {};
  const email = normalizeEmail(emailInput);

  if (!isString(fullName, 100) || !validEmail(email) || typeof password !== "string" || password.length < 8 || password.length > 128) {
    response.status(400).json({ error: "Enter your name, a valid email, and a password between 8 and 128 characters." });
    return;
  }
  if (profiles.has(email)) {
    response.status(409).json({ error: "An account with this email already exists. Please sign in." });
    return;
  }

  const passwordSalt = randomBytes(16).toString("hex");
  const passwordHash = (await scrypt(password, passwordSalt, 64)).toString("hex");
  const user = {
    fullName: fullName.trim(),
    email,
    passwordSalt,
    passwordHash,
    phone: "",
    phoneVerified: false,
    workStatus: "",
    city: "",
    education: {
      qualification: "",
      course: "",
      courseType: "",
      specialization: "",
      university: "",
      startingYear: "",
      passingYear: "",
      gradingSystem: "",
      cgpa: "",
      skills: [],
    },
    applications: [],
    profileCompleted: false,
    createdAt: new Date().toISOString(),
  };

  profiles.set(email, user);
  try {
    await saveProfiles();
  } catch (error) {
    profiles.delete(email);
    throw error;
  }

  const sessionId = randomBytes(32).toString("hex");
  sessions.set(sessionId, email);
  setSessionCookie(response, sessionId);
  response.status(201).json({ user: publicProfile(user) });
});

app.post("/api/auth/login", async (request, response) => {
  const email = normalizeEmail(request.body?.email);
  const password = request.body?.password;
  const user = profiles.get(email);

  if (!validEmail(email) || typeof password !== "string" || !user) {
    response.status(401).json({ error: "Email or password is incorrect." });
    return;
  }

  const passwordHash = await scrypt(password, user.passwordSalt, 64);
  const storedHash = Buffer.from(user.passwordHash, "hex");
  if (storedHash.length !== passwordHash.length || !timingSafeEqual(storedHash, passwordHash)) {
    response.status(401).json({ error: "Email or password is incorrect." });
    return;
  }

  const sessionId = randomBytes(32).toString("hex");
  sessions.set(sessionId, email);
  setSessionCookie(response, sessionId);
  response.json({ user: publicProfile(user) });
});

app.post("/api/auth/logout", (request, response) => {
  const sessionId = readSessionId(request);
  if (sessionId) {
    sessions.delete(sessionId);
    otpChallenges.delete(sessionId);
  }
  response.setHeader("Set-Cookie", `${sessionCookie}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
  response.json({ success: true });
});

app.get("/api/auth/me", (request, response) => {
  const sessionId = readSessionId(request);
  const email = sessionId ? sessions.get(sessionId) : null;
  const user = email ? profiles.get(email) : null;
  if (!user) {
    response.status(401).json({ error: "Please sign in to continue." });
    return;
  }
  response.json({ user: publicProfile(user) });
});

app.post("/api/applications", async (request, response) => {
  const authenticated = getAuthenticatedUser(request, response);
  if (!authenticated) return;

  const { id, title, company } = request.body ?? {};
  if (typeof id !== "string" || !/^[a-z0-9-]{1,80}$/.test(id) ||
      !isString(title, 160) || !isString(company, 120)) {
    response.status(400).json({ error: "Choose a valid job before applying." });
    return;
  }

  const result = await addApplication(authenticated.user.email, {
    id,
    title: title.trim(),
    company: company.trim(),
  });
  response.json({ ...result });
});

app.patch("/api/profile", async (request, response) => {
  const authenticated = getAuthenticatedUser(request, response);
  if (!authenticated) return;
  const { fullName, phone, workStatus, city } = request.body ?? {};

  if (!isString(fullName, 100) || !isString(phone, 30) || !/^[+\d\s()-]{7,20}$/.test(phone) ||
      !["experienced", "fresher"].includes(workStatus) || !isString(city, 100)) {
    response.status(400).json({ error: "Complete each required profile field with a valid value." });
    return;
  }

  const user = await updateProfile(authenticated.user.email, {
    fullName: fullName.trim(),
    phone: phone.trim(),
    workStatus,
    city: city.trim(),
    phoneVerified: false,
  });
  response.json({ user: publicProfile(user) });
});

app.post("/api/otp/send", (request, response) => {
  const authenticated = getAuthenticatedUser(request, response);
  if (!authenticated) return;
  if (process.env.NODE_ENV === "production") {
    response.status(503).json({ error: "SMS delivery is not configured for this deployment." });
    return;
  }
  if (!authenticated.user.phone) {
    response.status(400).json({ error: "Save a mobile number before requesting verification." });
    return;
  }

  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
  otpChallenges.set(authenticated.sessionId, {
    code,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });
  response.json({
    message: "Demo verification code created. No SMS was sent.",
    developmentCode: code,
  });
});

app.post("/api/otp/verify", async (request, response) => {
  const authenticated = getAuthenticatedUser(request, response);
  if (!authenticated) return;
  const challenge = otpChallenges.get(authenticated.sessionId);
  const code = request.body?.code;

  if (!challenge || challenge.expiresAt < Date.now()) {
    otpChallenges.delete(authenticated.sessionId);
    response.status(400).json({ error: "Request a new verification code to continue." });
    return;
  }
  if (typeof code !== "string" || !/^\d{6}$/.test(code) || code !== challenge.code) {
    response.status(400).json({ error: "That verification code is incorrect." });
    return;
  }

  otpChallenges.delete(authenticated.sessionId);
  const user = await updateProfile(authenticated.user.email, { phoneVerified: true });
  response.json({ user: publicProfile(user) });
});

app.put("/api/profile/education", async (request, response) => {
  const authenticated = getAuthenticatedUser(request, response);
  if (!authenticated) return;
  const education = request.body ?? {};
  const requiredFields = ["qualification", "course", "courseType", "specialization", "university", "startingYear", "passingYear", "gradingSystem"];
  if (!authenticated.user.phoneVerified) {
    response.status(403).json({ error: "Verify your mobile number before saving education details." });
    return;
  }
  if (requiredFields.some((field) => !isString(education[field], 120)) ||
      !Array.isArray(education.skills) || education.skills.length > 30 ||
      education.skills.some((skill) => !isString(skill, 40))) {
    response.status(400).json({ error: "Complete the required education fields and enter valid skills." });
    return;
  }

  const startingYear = Number(education.startingYear);
  const passingYear = Number(education.passingYear);
  const currentYear = new Date().getFullYear();
  if (!Number.isInteger(startingYear) || !Number.isInteger(passingYear) ||
      startingYear < 1950 || passingYear < startingYear || passingYear > currentYear + 10) {
    response.status(400).json({ error: "Enter a valid education start and passing year." });
    return;
  }
  const cgpa = education.cgpa === "" ? "" : Number(education.cgpa);
  if (cgpa !== "" && (!Number.isFinite(cgpa) || cgpa < 0 || cgpa > 100)) {
    response.status(400).json({ error: "Enter a valid CGPA or percentage between 0 and 100." });
    return;
  }

  const user = await updateProfile(authenticated.user.email, {
    education: {
      qualification: education.qualification.trim(),
      course: education.course.trim(),
      courseType: education.courseType.trim(),
      specialization: education.specialization.trim(),
      university: education.university.trim(),
      startingYear: String(startingYear),
      passingYear: String(passingYear),
      gradingSystem: education.gradingSystem.trim(),
      cgpa: cgpa === "" ? "" : String(cgpa),
      skills: education.skills.map((skill) => skill.trim()).filter(Boolean),
    },
    profileCompleted: true,
  });
  response.json({ user: publicProfile(user) });
});

app.use("/api", (request, response) => {
  response.status(404).json({ error: "API endpoint not found." });
});

if (process.env.NODE_ENV === "production") {
  const distDirectory = path.join(projectDirectory, "dist");
  app.use(express.static(distDirectory));
  app.get("/{*path}", (request, response) => {
    response.sendFile(path.join(distDirectory, "index.html"));
  });
}

app.use((error, request, response, next) => {
  console.error("Request failed:", error);
  if (response.headersSent) {
    next(error);
    return;
  }
  response.status(500).json({ error: "The server could not complete the request." });
});

async function startServer() {
  await mkdir(dataDirectory, { recursive: true });
  try {
    const savedProfiles = JSON.parse(await readFile(profilesFile, "utf8"));
    if (!Array.isArray(savedProfiles)) {
      throw new Error("The profile data file has an invalid format.");
    }
    profiles = new Map(savedProfiles);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
    await writeFile(profilesFile, "[]", { mode: 0o600 });
  }

  const port = Number(process.env.PORT) || 3001;
  app.listen(port, () => {
    console.log(`Talent Flow API listening on http://localhost:${port}`);
  });
}

if (!process.env.VERCEL) {
  startServer().catch((error) => {
    console.error("Unable to start Talent Flow API:", error);
    process.exitCode = 1;
  });
}

export default app;
