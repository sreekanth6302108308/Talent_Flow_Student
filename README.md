# Talent Flow

Talent Flow is a React and Express prototype with account registration, sign-in, profile setup, demo mobile verification, education details, and a profile dashboard.

## Run locally

```powershell
npm install
npm run dev
```

Open the Vite URL printed in the terminal. The React app uses the Express API through the `/api` development proxy.

## Demo behavior

- Create an account with an email and a password of at least 8 characters, then complete the profile and education steps.
- Mobile verification is simulated locally. The page displays a demo OTP; no SMS is sent.
- Accounts and profile details are saved under `.data/`. Passwords are stored as scrypt hashes.
- Sessions are held in server memory and will need signing in again after the server restarts.
- Job listings need a jobs API before real openings can be displayed.

## Production preview

Run `npm run build`, set `NODE_ENV=production`, then start the Express server with `npm start`. Configure a real SMS provider before enabling mobile verification in production; the demo OTP endpoint intentionally returns an error in production.
