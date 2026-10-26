import { useEffect, useRef, useState } from "react";

const categories = ["Programming", "Data Science", "Designing", "Networking", "Management", "Marketing", "Cybersecurity"];
const locations = ["Bangalore", "Washington", "Hyderabad", "Mumbai", "California", "Chennai", "New York"];
const qualifications = ["Doctorate/PhD", "Masters/Post-Graduation", "Graduation/Diploma", "12th", "10th", "Below 10th"];
const suggestedSkills = ["Java", "HTML", "CSS", "JavaScript", "Angular", "TypeScript", "Ajax", "ExtJS", "XHTML", "JSP", "jQuery", "Bootstrap"];
const sampleJobs = [
  {
    id: "specialist-programmer",
    title: "Specialist Programmer (Trainee)",
    company: "Infosys",
    rating: "3.5",
    reviews: "53.7K",
    experience: "0 - 2 years",
    salary: "11–21 Lacs P.A.",
    workMode: "Hybrid",
    locations: "Hyderabad, Bengaluru, Delhi / NCR",
    posted: "5 days ago",
    openings: "2000",
    applicants: "100+",
    description: "We are looking for candidates with strong programming backgrounds who will be responsible for developing full-stack applications and enterprise-grade platforms using modern frameworks. Work collaboratively in dynamic teams, apply AI in software engineering, and deliver high-quality products.",
    highlights: [
      "UG/PG graduates (2024–2026) with up to 2 years of experience in Java microservices, Big Data & ML, Functional Programming, and DevOps tools.",
      "Develop full-stack applications and enterprise platforms using modern frameworks, write scalable code, work in Agile teams, and contribute from requirements to production.",
      "Specialist Programmer roles with salaries from INR 10 LPA plus joining bonus up to INR 1 Lakh to INR 21 LPA.",
    ],
    skills: ["Java microservices", "Big data & ML", "Functional programming", "Spring Boot", "Docker"],
  },
  {
    id: "software-engineer-fresher",
    title: "Software Engineer Freshers",
    company: "NetM Corporate Solutions",
    rating: "4.1",
    reviews: "820",
    experience: "0 - 1 years",
    salary: "3–6 Lacs P.A.",
    workMode: "On-site",
    locations: "Hyderabad, Chennai, Bengaluru",
    posted: "6 days ago",
    openings: "45",
    applicants: "200+",
    description: "Join a collaborative engineering team building web applications and internal products. Fresh graduates will work alongside experienced engineers, learn modern development practices, and contribute to tested, reliable software.",
    highlights: [
      "Open to recent graduates with a degree in Computer Science or a related field.",
      "Build and maintain web applications with support from senior engineers.",
      "Training, mentorship, and opportunities to grow across product teams.",
    ],
    skills: ["JavaScript", "React", "HTML", "CSS", "SQL"],
  },
  {
    id: "software-engineer",
    title: "Software Engineer",
    company: "Meditechhire",
    rating: "4.0",
    reviews: "1.2K",
    experience: "1 - 4 years",
    salary: "6–12 Lacs P.A.",
    workMode: "Hybrid",
    locations: "Kochi, Kolkata, Bengaluru",
    posted: "2 days ago",
    openings: "18",
    applicants: "50+",
    description: "Help build digital health products that make care easier to access. You will partner with designers and engineers to ship secure, accessible features and improve existing applications.",
    highlights: [
      "Experience building and maintaining production web applications.",
      "Collaborate with product and design to deliver accessible user experiences.",
      "Work on secure, dependable tools for healthcare teams and patients.",
    ],
    skills: ["React", "TypeScript", "REST APIs", "Accessibility", "Testing"],
  },
  {
    id: "data-analyst",
    title: "Data Analyst Fresher, Data Analytics",
    company: "Nova Technologies",
    rating: "3.9",
    reviews: "640",
    experience: "0 - 1 years",
    salary: "4–7 Lacs P.A.",
    workMode: "On-site",
    locations: "Hyderabad, Bengaluru, Delhi / NCR",
    posted: "2 days ago",
    openings: "12",
    applicants: "80+",
    description: "Turn data into useful insights for product and business teams. This entry-level opportunity includes mentorship in analytics and hands-on work with dashboards, reports, and datasets.",
    highlights: [
      "Suitable for graduates interested in data, analytics, or business intelligence.",
      "Create reports and dashboards to help teams make informed decisions.",
      "Learn practical SQL, spreadsheet, and visualization workflows.",
    ],
    skills: ["SQL", "Excel", "Python", "Data visualization", "Statistics"],
  },
  {
    id: "it-fresher",
    title: "IT Fresher",
    company: "Creative Hands HR",
    rating: "3.8",
    reviews: "310",
    experience: "0 - 1 years",
    salary: "2.5–4 Lacs P.A.",
    workMode: "On-site",
    locations: "Hyderabad, Chennai, Bengaluru",
    posted: "4 days ago",
    openings: "25",
    applicants: "100+",
    description: "Start your IT career supporting business systems and collaborating with a friendly service desk team. Learn practical troubleshooting, documentation, and customer support skills.",
    highlights: [
      "Entry-level opening with onboarding and team mentorship.",
      "Help troubleshoot common software and workstation issues.",
      "Develop communication, documentation, and technical support skills.",
    ],
    skills: ["Troubleshooting", "Windows", "Networking", "Communication", "Support"],
  },
];

async function api(path, options = {}) {
  let response;
  try {
    response = await fetch(path, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch (requestError) {
    if (requestError instanceof TypeError) {
      throw new Error("Can't connect to the Talent Flow server. Start the app with `npm run dev`, then reload this page.");
    }
    throw requestError;
  }
  const responseBody = await response.text();
  let result = {};
  if (responseBody) {
    try {
      result = JSON.parse(responseBody);
    } catch {
      throw new Error(`The server returned an invalid response (${response.status}). Please try again.`);
    }
  }
  if (!response.ok) {
    const message = result.error || (
      !responseBody && response.status >= 500
        ? "The Talent Flow API server is unavailable. Start the app with `npm run dev`, then try again."
        : "The request could not be completed."
    );
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  if (!result || typeof result !== "object" || Array.isArray(result)) {
    throw new Error("The server returned an unexpected response. Please try again.");
  }
  return result;
}

function Brand({ muted = false }) {
  return (
    <a className={`brand${muted ? " brand-muted" : ""}`} href="#" aria-label="Talent Flow home">
      <span className="brand-mark" aria-hidden="true">✦</span>
      <span>TALENT FLOW</span>
    </a>
  );
}

function App() {
  const [screen, setScreen] = useState("loading");
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [register, setRegister] = useState({ fullName: "", email: "", password: "" });
  const [profile, setProfile] = useState({ fullName: "", phone: "", workStatus: "experienced", city: "" });
  const [education, setEducation] = useState({
    qualification: "",
    course: "",
    courseType: "Full Time",
    specialization: "",
    university: "",
    startingYear: "",
    passingYear: "",
    gradingSystem: "Scale 10 Grading System",
    cgpa: "",
    skills: [],
  });
  const [skillDraft, setSkillDraft] = useState("");
  const [otp, setOtp] = useState("");
  const [demoCode, setDemoCode] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedJobId, setSelectedJobId] = useState(sampleJobs[0].id);
  const [jobSearch, setJobSearch] = useState("");
  const [savedJobs, setSavedJobs] = useState([]);
  const [applicationNotice, setApplicationNotice] = useState("");
  const [applications, setApplications] = useState([]);
  const [applying, setApplying] = useState(false);
  const otpRequested = useRef(false);
  const authDialog = useRef(null);

  useEffect(() => {
    const dialog = authDialog.current;
    if (!dialog) return;
    if (screen === "login" && !dialog.open) {
      dialog.showModal();
    } else if (screen !== "login" && dialog.open) {
      dialog.close();
    }
  }, [screen]);

  useEffect(() => {
    api("/api/auth/me")
      .then(({ user: currentUser }) => {
        setUser(currentUser);
        setApplications(currentUser.applications || []);
        setProfile({
          fullName: currentUser.fullName || "",
          phone: currentUser.phone || "",
          workStatus: currentUser.workStatus || "experienced",
          city: currentUser.city || "",
        });
        if (currentUser.profileCompleted) {
          setScreen("dashboard");
        } else if (currentUser.phoneVerified) {
          setEducation((current) => ({ ...current, ...currentUser.education }));
          setScreen("education");
        } else if (currentUser.phone) {
          setScreen("otp");
        } else {
          setScreen("profile");
        }
      })
      .catch((requestError) => {
        if (requestError.status === 401) {
          setScreen("landing");
        } else {
          setError(requestError.message);
          setScreen("landing");
        }
      });
  }, []);

  useEffect(() => {
    if (screen !== "otp") {
      otpRequested.current = false;
      return;
    }
    if (otpRequested.current) return;
    otpRequested.current = true;
    setError("");
    api("/api/otp/send", { method: "POST", body: {} })
      .then((result) => setDemoCode(result.developmentCode || ""))
      .catch((requestError) => setError(requestError.message));
  }, [screen]);

  function startSignIn() {
    setError("");
    setAuthMode("login");
    setScreen("login");
  }

  function startRegistration() {
    setError("");
    setAuthMode("register");
    setScreen("login");
  }

  function enterNextStep(currentUser) {
    setUser(currentUser);
    setApplications(currentUser.applications || []);
    setProfile({
      fullName: currentUser.fullName || "",
      phone: currentUser.phone || "",
      workStatus: currentUser.workStatus || "experienced",
      city: currentUser.city || "",
    });
    if (currentUser.profileCompleted) {
      setEducation((current) => ({ ...current, ...currentUser.education }));
      setScreen("dashboard");
    } else if (currentUser.phoneVerified) {
      setEducation((current) => ({ ...current, ...currentUser.education }));
      setScreen("education");
    } else if (currentUser.phone) {
      setScreen("otp");
    } else {
      setScreen("profile");
    }
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const route = authMode === "register" ? "/api/auth/register" : "/api/auth/login";
      const body = authMode === "register" ? register : { email: loginEmail, password: loginPassword };
      const result = await api(route, { method: "POST", body });
      enterNextStep(result.user);
    } catch (requestError) {
      if (authMode === "register" && requestError.status === 409) {
        setLoginEmail(register.email);
        setLoginPassword("");
        setAuthMode("login");
        setError("An account with this email already exists. Sign in with your password.");
      } else {
        setError(requestError.message);
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await api("/api/profile", { method: "PATCH", body: profile });
      setUser(result.user);
      setScreen("otp");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleOtpSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await api("/api/otp/verify", { method: "POST", body: { code: otp } });
      setUser(result.user);
      setDemoCode("");
      setScreen("education");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleEducationSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await api("/api/profile/education", { method: "PUT", body: education });
      setUser(result.user);
      setNotice("Your profile is ready. Start exploring opportunities.");
      setScreen("dashboard");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    setBusy(true);
    try {
      await api("/api/auth/logout", { method: "POST" });
      setUser(null);
      setApplications([]);
      setError("");
      setNotice("");
      setScreen("landing");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  function addSkill(skill) {
    const value = skill.trim().replace(/,$/, "");
    if (!value || education.skills.some((item) => item.toLowerCase() === value.toLowerCase())) return;
    setEducation((current) => ({ ...current, skills: [...current.skills, value] }));
  }

  async function handleApply(job) {
    if (!user) {
      startSignIn();
      setError("Please sign in before applying for this job.");
      return;
    }
    if (applications.some((application) => application.id === job.id)) {
      setApplicationNotice(`You have already applied to ${job.company}.`);
      return;
    }

    setApplying(true);
    setApplicationNotice("");
    try {
      const result = await api("/api/applications", {
        method: "POST",
        body: { id: job.id, title: job.title, company: job.company },
      });
      setApplications(result.applications);
      setApplicationNotice(result.created ? "Applied successfully!" : `You have already applied to ${job.company}.`);
    } catch (requestError) {
      setApplicationNotice(requestError.message);
    } finally {
      setApplying(false);
    }
  }

  function renderLanding() {
    return (
      <div className="landing">
        <div className="landing-shell">
          <header className="site-header">
            <Brand />
            <nav className="header-actions" aria-label="Account">
              <button className="recruiter-link explore-link" type="button" onClick={() => { setApplicationNotice(""); setScreen("jobs"); }}>Explore jobs</button>
              <button className="primary-button header-login" type="button" onClick={startSignIn}>Login</button>
            </nav>
          </header>
          {screen === "landing" && error && <p className="site-error" role="alert">{error}</p>}
          <main>
            <section className="hero">
              <div className="hero-content">
                <span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span>
                <h1>Find work that moves <span>you forward.</span></h1>
                <p className="hero-copy">Discover the right opportunity, build your career profile, and take your next step with confidence.</p>
                <button className="primary-button hero-cta" type="button" onClick={startRegistration}>Create your profile <span aria-hidden="true">→</span></button>
              </div>
              <div className="hero-orbit" aria-hidden="true">
                <div className="orbit-ring orbit-ring-one" />
                <div className="orbit-ring orbit-ring-two" />
                <div className="orbit-center"><span>TF</span></div>
                <span className="orbit-dot orbit-dot-one" />
                <span className="orbit-dot orbit-dot-two" />
                <span className="orbit-dot orbit-dot-three" />
              </div>
            </section>
            <section className="trusted" aria-label="Companies that trust Talent Flow">
              <span>Trusted by teams at</span>
              {["Microsoft", "Walmart", "accenture", "SAMSUNG", "amazon", "Adobe"].map((company) => <strong key={company}>{company}</strong>)}
            </section>
            <section className="jobs-section" id="jobs">
              <aside className="filters">
                <h2>Filters</h2>
                <FilterGroup title="Category" options={categories} />
                <FilterGroup title="Location" options={locations} />
              </aside>
              <div className="jobs-content">
                <div className="jobs-heading">
                  <div><span className="eyebrow">FIND YOUR FIT</span><h2>Latest jobs</h2><p>Hand-picked opportunities from top companies</p></div>
                  <span className="job-count">Connect a jobs service to see openings</span>
                </div>
                <div className="empty-state">
                  <span className="empty-state-icon" aria-hidden="true">⌕</span>
                  <h3>Your next opportunity is out there</h3>
                  <p>Create your profile to get started. Job listings will appear here when a jobs service is connected.</p>
                  <button className="text-button" type="button" onClick={startRegistration}>Build your profile <span aria-hidden="true">→</span></button>
                </div>
              </div>
            </section>
          </main>
          <footer className="site-footer"><Brand muted /><span>© {new Date().getFullYear()} Talent Flow</span></footer>
        </div>
        {screen === "login" && renderAuthDialog()}
      </div>
    );
  }

  function renderAuthDialog() {
    return (
      <dialog ref={authDialog} className="auth-dialog" aria-labelledby="auth-title" onClose={() => setScreen((current) => current === "login" ? "landing" : current)} onMouseDown={(event) => event.target === event.currentTarget && event.currentTarget.close()}>
        <button className="modal-close" type="button" aria-label="Close sign-in" onClick={() => setScreen("landing")}>×</button>
        <Brand muted />
        <span className="eyebrow">{authMode === "register" ? "GET STARTED" : "WELCOME BACK"}</span>
        <h2 id="auth-title">{authMode === "register" ? "Create your account" : "Sign in to Talent Flow"}</h2>
        <p className="auth-copy">{authMode === "register" ? "Create an account to build your profile and explore opportunities." : "Continue your job search and pick up where you left off."}</p>
        <form className="form-stack" onSubmit={handleAuthSubmit}>
          {authMode === "register" && <TextField label="Full name" name="fullName" autoComplete="name" value={register.fullName} onChange={(value) => setRegister({ ...register, fullName: value })} required />}
          <TextField label="Email address" name="email" type="email" autoComplete="email" value={authMode === "register" ? register.email : loginEmail} onChange={(value) => authMode === "register" ? setRegister({ ...register, email: value }) : setLoginEmail(value)} required autoFocus />
          <TextField label="Password" name="password" type="password" autoComplete={authMode === "register" ? "new-password" : "current-password"} value={authMode === "register" ? register.password : loginPassword} onChange={(value) => authMode === "register" ? setRegister({ ...register, password: value }) : setLoginPassword(value)} minLength={8} required />
          <ErrorMessage>{error}</ErrorMessage>
          <button className="primary-button full-button" type="submit" disabled={busy}>{busy ? "Please wait…" : authMode === "register" ? "Create account" : "Sign in"}</button>
        </form>
        <p className="auth-switch">{authMode === "register" ? "Already have an account?" : "New to Talent Flow?"}{" "}
          <button className="text-button" type="button" onClick={() => { setError(""); setAuthMode(authMode === "register" ? "login" : "register"); }}> {authMode === "register" ? "Sign in" : "Create an account"}</button>
        </p>
      </dialog>
    );
  }

  function renderProfile() {
    return (
      <OnboardingLayout step={1} title="Create your profile" subtitle="Share a few details so we can personalize your job search." onLogout={handleLogout}>
        <form className="form-stack" onSubmit={handleProfileSubmit}>
          <div className="two-column">
            <TextField label="Full name" name="fullName" autoComplete="name" value={profile.fullName} onChange={(value) => setProfile({ ...profile, fullName: value })} required />
            <TextField label="Email address" name="email" type="email" value={user?.email || ""} disabled />
          </div>
          <TextField label="Mobile number" name="phone" type="tel" placeholder="+91 98765 43210" autoComplete="tel" value={profile.phone} onChange={(value) => setProfile({ ...profile, phone: value })} required />
          <fieldset className="choice-fieldset">
            <legend>Work status <span className="required">*</span></legend>
            <div className="choice-grid">
              <ChoiceCard selected={profile.workStatus === "experienced"} title="I'm experienced" description="I have work experience (excluding internships)" icon="▣" onClick={() => setProfile({ ...profile, workStatus: "experienced" })} />
              <ChoiceCard selected={profile.workStatus === "fresher"} title="I'm a fresher" description="I'm a student / haven't worked after graduation" icon="✎" onClick={() => setProfile({ ...profile, workStatus: "fresher" })} />
            </div>
          </fieldset>
          <TextField label="Current city" name="city" autoComplete="address-level2" placeholder="e.g. Hyderabad" value={profile.city} onChange={(value) => setProfile({ ...profile, city: value })} required />
          <ErrorMessage>{error}</ErrorMessage>
          <div className="form-actions"><button className="primary-button" type="submit" disabled={busy}>{busy ? "Saving…" : "Continue to mobile verification"}</button></div>
        </form>
      </OnboardingLayout>
    );
  }

  function renderOtp() {
    return (
      <OnboardingLayout step={2} title="Verify mobile number" subtitle={`We'll verify ${profile.phone || user?.phone || "your mobile number"} before you continue.`} onLogout={handleLogout}>
        <form className="form-stack otp-form" onSubmit={handleOtpSubmit}>
          <label className="field-label" htmlFor="otp-code">Verification code</label>
          <input id="otp-code" className="text-input otp-input" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="Enter 6-digit code" required />
          {demoCode && <p className="demo-code">Local demo only: your code is <strong>{demoCode}</strong>. No SMS was sent.</p>}
          <p className="helper-text">In production, connect an SMS provider to deliver this code.</p>
          <ErrorMessage>{error}</ErrorMessage>
          <div className="form-actions">
            <button className="secondary-button" type="button" onClick={() => setScreen("profile")}>Back</button>
            <button className="primary-button" type="submit" disabled={busy || otp.length !== 6}>{busy ? "Verifying…" : "Verify and continue"}</button>
          </div>
        </form>
      </OnboardingLayout>
    );
  }

  function renderEducation() {
    return (
      <OnboardingLayout step={3} title="Education details" subtitle="These details help recruiters understand your background." onLogout={handleLogout}>
        <form className="form-stack education-form" onSubmit={handleEducationSubmit}>
          <fieldset className="choice-fieldset">
            <legend>Highest qualification / degree <span className="required">*</span></legend>
            <div className="chip-list">
              {qualifications.map((item) => <button className={`choice-chip${education.qualification === item ? " selected" : ""}`} type="button" key={item} onClick={() => setEducation({ ...education, qualification: item })}>{item}</button>)}
            </div>
          </fieldset>
          <div className="two-column">
            <TextField label="Course" name="course" placeholder="e.g. B.Tech" value={education.course} onChange={(value) => setEducation({ ...education, course: value })} required />
            <SelectField label="Course type" name="courseType" value={education.courseType} onChange={(value) => setEducation({ ...education, courseType: value })} options={["Full Time", "Part Time", "Distance Learning", "Online"]} />
            <TextField label="Specialization" name="specialization" placeholder="e.g. Computer Science" value={education.specialization} onChange={(value) => setEducation({ ...education, specialization: value })} required />
            <TextField label="University / Institute" name="university" placeholder="University or institute name" value={education.university} onChange={(value) => setEducation({ ...education, university: value })} required />
            <TextField label="Starting year" name="startingYear" type="number" min="1950" max={new Date().getFullYear() + 10} placeholder="2022" value={education.startingYear} onChange={(value) => setEducation({ ...education, startingYear: value })} required />
            <TextField label="Passing year" name="passingYear" type="number" min={education.startingYear || "1950"} max={new Date().getFullYear() + 10} placeholder="2026" value={education.passingYear} onChange={(value) => setEducation({ ...education, passingYear: value })} required />
            <SelectField label="Grading system" name="gradingSystem" value={education.gradingSystem} onChange={(value) => setEducation({ ...education, gradingSystem: value })} options={["Scale 10 Grading System", "Scale 4 Grading System", "Percentage", "Course requires no grading"]} />
            <TextField label="CGPA / percentage" name="cgpa" type="number" min="0" max="100" step="any" placeholder="e.g. 8.5" value={education.cgpa} onChange={(value) => setEducation({ ...education, cgpa: value })} />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="skills">Key skills</label>
            <div className="skill-entry">
              <div className="skill-chips">{education.skills.map((skill) => <button className="skill-chip" type="button" key={skill} onClick={() => setEducation({ ...education, skills: education.skills.filter((item) => item !== skill) })}>{skill} <span aria-hidden="true">×</span></button>)}
                <input id="skills" value={skillDraft} onChange={(event) => setSkillDraft(event.target.value)} onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === ",") {
                    event.preventDefault();
                    addSkill(skillDraft);
                    setSkillDraft("");
                  }
                }} onBlur={() => { if (skillDraft.trim()) { addSkill(skillDraft); setSkillDraft(""); } }} placeholder="Type a skill and press Enter" />
              </div>
            </div>
            <span className="helper-text">Suggestions</span>
            <div className="chip-list skill-suggestions">{suggestedSkills.map((skill) => <button className="suggestion-chip" type="button" key={skill} onClick={() => addSkill(skill)} disabled={education.skills.includes(skill)}>{skill} <span aria-hidden="true">+</span></button>)}</div>
          </div>
          <ErrorMessage>{error}</ErrorMessage>
          <div className="form-actions"><button className="secondary-button" type="button" onClick={() => setScreen("otp")}>Back</button><button className="primary-button" type="submit" disabled={busy || !education.qualification}>{busy ? "Saving…" : "Save and continue"}</button></div>
        </form>
      </OnboardingLayout>
    );
  }

  function renderDashboard() {
    const courseAndQualification = [user?.education?.course, user?.education?.qualification].filter(Boolean).join(" · ");
    return (
      <div className="dashboard-page">
        <header className="dashboard-header">
          <Brand muted />
          <div className="dashboard-header-actions"><span className="user-email">{user?.email}</span><button className="secondary-button" type="button" onClick={handleLogout} disabled={busy}>{busy ? "Signing out…" : "Sign out"}</button></div>
        </header>
        <main className="dashboard-main">
          <section className="welcome-card">
            <div><span className="eyebrow">YOUR CAREER SPACE</span><h1>Welcome, {user?.fullName || "there"}.</h1><p>Your profile is set up. You’re ready to explore your next opportunity.</p></div>
            <div className="welcome-mark" aria-hidden="true">✦</div>
          </section>
          {notice && <p className="success-notice" role="status">{notice}</p>}
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <section className="dashboard-stats" aria-label="Profile summary">
            <article className="stat-card"><span className="stat-icon">✓</span><span className="stat-label">Profile status</span><strong>Complete</strong><span className="stat-detail">Your profile is ready to share</span></article>
            <article className="stat-card"><span className="stat-icon">⌖</span><span className="stat-label">Preferred location</span><strong>{user?.city || "Not set"}</strong><span className="stat-detail">{user?.workStatus === "fresher" ? "Early-career opportunities" : "Experienced roles"}</span></article>
            <article className="stat-card"><span className="stat-icon">▤</span><span className="stat-label">Education</span><strong>{courseAndQualification || "Added"}</strong><span className="stat-detail">{user?.education?.university || "Education details saved"}</span></article>
          </section>
          <section className="dashboard-grid">
            <article className="dashboard-panel">
              <div className="panel-heading"><div><span className="eyebrow">YOUR PROFILE</span><h2>Career snapshot</h2></div><span className="complete-badge">Complete</span></div>
              <dl className="profile-details">
                <div><dt>Name</dt><dd>{user?.fullName}</dd></div><div><dt>Email</dt><dd>{user?.email}</dd></div>
                <div><dt>Mobile</dt><dd>{user?.phone} <span className="verified-label">Verified</span></dd></div><div><dt>City</dt><dd>{user?.city}</dd></div>
                <div><dt>Work status</dt><dd>{user?.workStatus === "fresher" ? "Fresher" : "Experienced"}</dd></div><div><dt>Graduation</dt><dd>{user?.education?.passingYear || "—"}</dd></div>
              </dl>
            </article>
            <article className="dashboard-panel opportunities-panel">
              <span className="eyebrow">NEXT STEP</span><h2>Explore opportunities</h2>
              <p>Job listings will appear here when a jobs service is connected. Your completed profile will be ready to use.</p>
              <button className="primary-button link-button" type="button" onClick={() => setScreen("jobs")}>Explore jobs <span aria-hidden="true">→</span></button>
            </article>
          </section>
          <section className="dashboard-panel applications-panel">
            <div className="panel-heading"><div><span className="eyebrow">YOUR ACTIVITY</span><h2>Companies you applied to</h2></div><span className="application-count">{applications.length}</span></div>
            {applications.length ? (
              <ul className="application-list">
                {applications.map((application) => (
                  <li key={application.id}>
                    <div><strong>{application.company}</strong><span>{application.title}</span></div>
                    <time dateTime={application.appliedAt}>Applied {new Date(application.appliedAt).toLocaleDateString()}</time>
                  </li>
                ))}
              </ul>
            ) : <p className="applications-empty">You haven’t applied to any companies yet. Explore jobs to get started.</p>}
          </section>
          <section className="dashboard-panel skills-panel"><div className="panel-heading"><div><span className="eyebrow">STAND OUT</span><h2>Your key skills</h2></div></div>
            <div className="chip-list">{(user?.education?.skills || []).length ? user.education.skills.map((skill) => <span className="saved-skill" key={skill}>{skill}</span>) : <p className="helper-text">Add skills to your profile to help recruiters find you.</p>}</div>
          </section>
        </main>
        <footer className="dashboard-footer"><Brand muted /><span>© {new Date().getFullYear()} Talent Flow</span></footer>
      </div>
    );
  }

  function renderJobsDashboard() {
    const selectedJob = sampleJobs.find((job) => job.id === selectedJobId) || sampleJobs[0];
    const normalizedSearch = jobSearch.trim().toLowerCase();
    const visibleJobs = sampleJobs.filter((job) =>
      `${job.title} ${job.company} ${job.locations} ${job.skills.join(" ")}`.toLowerCase().includes(normalizedSearch),
    );
    const isSaved = savedJobs.includes(selectedJob.id);

    return (
      <div className="jobs-dashboard">
        <header className="jobs-dashboard-header">
          <Brand muted />
          <nav className="jobs-nav" aria-label="Main navigation">
            <button className="jobs-nav-link active" type="button" onClick={() => setScreen("jobs")}>Find jobs</button>
            <button className="jobs-nav-link" type="button" onClick={() => user ? setScreen("dashboard") : startSignIn()}>My dashboard</button>
          </nav>
          <div className="jobs-user-actions">
            {user ? <><span className="user-email">{user.email}</span><button className="secondary-button" type="button" onClick={handleLogout} disabled={busy}>{busy ? "Signing out…" : "Sign out"}</button></> : <button className="primary-button header-login" type="button" onClick={startSignIn}>Login</button>}
          </div>
        </header>
        <main className="jobs-dashboard-main">
          <form className="jobs-search-bar" onSubmit={(event) => event.preventDefault()}>
            <label><span aria-hidden="true">⌕</span><input aria-label="Search jobs" value={jobSearch} onChange={(event) => setJobSearch(event.target.value)} placeholder="Job title, skill, or company" /></label>
            <button className="primary-button" type="submit">Search jobs</button>
          </form>
          {applicationNotice && <p className="jobs-notice" role="status">{applicationNotice}</p>}
          <div className="job-detail-layout">
            <div className="job-detail-column">
              <article className="job-summary-card">
                <div className="job-summary-top">
                  <div>
                    <span className="eyebrow">FEATURED OPPORTUNITY</span>
                    <h1>{selectedJob.title}</h1>
                    <p className="job-company-line">{selectedJob.company} <span className="rating-star">★</span> {selectedJob.rating} <span className="review-link">| {selectedJob.reviews} reviews</span></p>
                  </div>
                  <span className="company-logo">{selectedJob.company === "Infosys" ? "Infosys" : selectedJob.company.split(" ").map((word) => word[0]).join("").slice(0, 2)}</span>
                </div>
                <div className="job-facts">
                  <span><b aria-hidden="true">◷</b> {selectedJob.experience}</span>
                  <span><b aria-hidden="true">₹</b> {selectedJob.salary}</span>
                  <span><b aria-hidden="true">⌖</b> {selectedJob.workMode}</span>
                  <span><b aria-hidden="true">⌖</b> {selectedJob.locations}</span>
                </div>
                <button className="job-alert-link" type="button" onClick={() => setApplicationNotice("Job alerts are a preview feature; connect an alert service to receive notifications.")}>Send me jobs like this</button>
                <div className="job-summary-bottom">
                  <p>Posted: <strong>{selectedJob.posted}</strong><i /> Openings: <strong>{selectedJob.openings}</strong><i /> Applicants: <strong>{selectedJob.applicants}</strong></p>
                  <div className="job-actions">
                    <button className={`secondary-button save-job-button${isSaved ? " is-saved" : ""}`} type="button" onClick={() => setSavedJobs((current) => isSaved ? current.filter((id) => id !== selectedJob.id) : [...current, selectedJob.id])}>{isSaved ? "Saved" : "Save"}</button>
                    <button className="primary-button apply-job-button" type="button" onClick={() => handleApply(selectedJob)} disabled={applying || applications.some((application) => application.id === selectedJob.id)}>{applying ? "Applying…" : applications.some((application) => application.id === selectedJob.id) ? "Applied" : "Apply"}</button>
                  </div>
                </div>
                <label className="follow-company"><input type="checkbox" /> Follow {selectedJob.company} as you apply to stay updated</label>
              </article>

              <article className="job-description-card">
                <section className="job-highlights">
                  <h2>Job highlights</h2>
                  <ul>{selectedJob.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>
                  <h3>Job match score</h3>
                  <div className="match-tags"><span>⊗ Early Applicant</span><span>⊗ Key skills</span><span className="match-positive">● Location</span><span>⊗ Work Experience</span></div>
                </section>
                <section className="job-description">
                  <h2>Job description</h2>
                  <h3>Role & responsibilities</h3>
                  <p>{selectedJob.description}</p>
                  <h3>Skills and areas of focus</h3>
                  <ul>{selectedJob.skills.map((skill) => <li key={skill}>{skill}</li>)}</ul>
                </section>
              </article>
            </div>

            <aside className="job-recommendations">
              <section className="recommendation-card">
                <h2>Jobs you might be interested in</h2>
                {visibleJobs.length ? visibleJobs.map((job) => (
                  <button className={`recommendation-item${job.id === selectedJob.id ? " selected" : ""}`} type="button" key={job.id} onClick={() => { setSelectedJobId(job.id); setApplicationNotice(""); }}>
                    <span className="recommendation-main">
                      <strong>{job.title}</strong>
                      <span>{job.company}</span>
                      <span className="recommendation-rating"><span className="rating-star">★</span> {job.rating} | {job.reviews} reviews</span>
                      <span className="recommendation-location">⌖ {job.locations}</span>
                    </span>
                    <span className="company-logo recommendation-logo">{job.company === "Infosys" ? "Infosys" : job.company.split(" ").map((word) => word[0]).join("").slice(0, 2)}</span>
                    <span className="recommendation-date">Posted {job.posted}</span>
                  </button>
                )) : <p className="no-matching-jobs">No sample jobs match that search. Try a different title, company, or skill.</p>}
              </section>
              <section className="reviews-card">
                <div className="reviews-heading"><div><h2>Reviews</h2><span>{selectedJob.reviews} employee reviews</span></div><button className="text-button" type="button" onClick={() => setApplicationNotice("Company reviews are a preview and aren’t connected to a review service.")}>View all</button></div>
                <div className="review-score"><span><b className="rating-star">★</b> 5.0</span><small>rated by {selectedJob.title} in {selectedJob.locations.split(",")[0]}</small></div>
                <h3>Likes</h3>
                <p>Collaborative teams, interesting projects, and opportunities to keep learning.</p>
              </section>
              <p className="sample-jobs-note">Sample listings for this prototype. Connect a jobs service for live openings.</p>
            </aside>
          </div>
        </main>
      </div>
    );
  }

  if (screen === "loading") return <div className="loading-screen" role="status">Loading your Talent Flow workspace…</div>;
  if (screen === "landing" || screen === "login") return renderLanding();
  if (screen === "profile") return renderProfile();
  if (screen === "otp") return renderOtp();
  if (screen === "education") return renderEducation();
  if (screen === "dashboard") return renderDashboard();
  if (screen === "jobs") return renderJobsDashboard();
  return renderLanding();
}

function FilterGroup({ title, options }) {
  return <fieldset className="filter-group"><legend>{title}</legend>{options.map((option) => <label className="filter-option" key={option}><input type="checkbox" />{option}</label>)}</fieldset>;
}

function TextField({ label, name, value, onChange, type = "text", ...inputProps }) {
  return <div className="field"><label className="field-label" htmlFor={name}>{label}{inputProps.required && <span className="required"> *</span>}</label><input className="text-input" id={name} name={name} type={type} value={value} onChange={onChange ? (event) => onChange(event.target.value) : undefined} {...inputProps} /></div>;
}

function SelectField({ label, name, value, onChange, options }) {
  return <div className="field"><label className="field-label" htmlFor={name}>{label}<span className="required"> *</span></label><select className="text-input" id={name} name={name} value={value} onChange={(event) => onChange(event.target.value)} required>{options.map((option) => <option key={option}>{option}</option>)}</select></div>;
}

function ChoiceCard({ selected, title, description, icon, onClick }) {
  return <button className={`choice-card${selected ? " selected" : ""}`} type="button" aria-pressed={selected} onClick={onClick}><span className="choice-copy"><strong>{title}</strong><span>{description}</span></span><span className="choice-icon" aria-hidden="true">{icon}</span></button>;
}

function ErrorMessage({ children }) {
  return children ? <p className="error-message" role="alert">{children}</p> : null;
}

function OnboardingLayout({ step, title, subtitle, onLogout, children }) {
  const steps = ["Profile", "Mobile verification", "Education"];
  return (
    <main className="onboarding-page">
      <header className="onboarding-header"><Brand muted /><button className="text-button" type="button" onClick={onLogout}>Sign out</button></header>
      <section className="onboarding-card" aria-labelledby="onboarding-title">
        <div className="step-indicator" aria-label={`Step ${step} of 3`}>
          {steps.map((label, index) => <div className={`step-item${index + 1 === step ? " active" : ""}${index + 1 < step ? " complete" : ""}`} key={label}><span className="step-number">{index + 1 < step ? "✓" : index + 1}</span><span>{label}</span></div>)}
        </div>
        <div className="onboarding-heading"><span className="eyebrow">STEP {step} OF 3</span><h1 id="onboarding-title">{title}</h1><p>{subtitle}</p></div>
        {children}
      </section>
      <footer className="onboarding-footer"><span>Talent Flow · Your career, in motion.</span><span>Keep your profile details up to date.</span></footer>
    </main>
  );
}

export default App;
