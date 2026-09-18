# Login Plan — টাকার হিসাব

This file explains how login works in the app, what is finished, and what is left.

The parts you must do by hand are in **[Part 5](#part-5--what-you-do-by-hand)**.

---

## Part 1 — Where we are

| Task | What it covers | Status |
|---|---|---|
| **Task 1 — Sign up** | Email sign-up, Google sign-up with "set password" page, auto login, locked pages, sign out | ✅ Built |
| **Task 2 — Sign in** | Email + password login, "মনে রাখো", clear error message | ✅ Built |
| **Task 3 — Forgot password** | Email → OTP → new password, OTP sent by Gmail | ✅ Built — waiting for your test |

After each task you test by hand. The next task starts only after you say OK.

---

## Part 2 — The rules we agreed on

### Rule 1: Every user has a password

Even people who sign up with Google. So everybody can log in **both ways** — with Google, or with email and password.

### Rule 2: Google sign-up saves nothing until the password is set

1. You click the Google button and pick your account.
2. Google tells us your name and email.
3. We keep that in a **secure temporary cookie for 15 minutes**. Nothing goes into the database yet.
4. The **"আর একটু বাকি"** page asks for a password and confirm password.
5. Only now is the account created, and you are logged in.

If you press **বাতিল করো**, or wait more than 15 minutes, nothing is saved.

### Rule 3: The Google button works the same on both tabs

- No account yet → you go to the "set password" page.
- Account already exists → you are logged straight in.
- Account was made with email and password → Google gets linked to it the first time. This happens only when Google says the email is **verified**, so a stranger cannot take over your account this way.

### Rule 4: How long a login lasts

| How you logged in | How long it lasts |
|---|---|
| Sign up (email or Google) | 30 days |
| Google login | 30 days |
| Email login, **মনে রাখো ticked** | 30 days |
| Email login, **মনে রাখো not ticked** | Until you close the browser, and 1 day at most |

### Rule 5: Wrong login never says which part was wrong

A wrong email and a wrong password show the same message: **"ইমেইল বা পাসওয়ার্ড মিলছে না।"** Both also take the same time to answer. This way nobody can use the login form to find out which emails have an account.

---

## Part 3 — How it is built

### Libraries

| Library | Job |
|---|---|
| `jose` | Makes and checks the signed login cookie |
| `arctic` | Talks to Google for login |
| `bcryptjs` | Scrambles passwords. We never store the real password |
| `prisma` + `@prisma/adapter-pg` | Talks to the Neon database |

**Why not Auth.js?** Rule 2 (no account until the password is set) and Rule 4 (different login lengths) do not fit how Auth.js works. Making it fit would need workarounds. Doing it ourselves with `jose` and `arctic` is less code, and it is the way the Next.js 16 docs recommend.

### The login cookie

- Name: `hishabi_session`.
- It holds only your user ID, signed with `AUTH_SECRET`. Nobody can change it without the secret.
- `httpOnly` — JavaScript in the browser cannot read it.

### Locked pages

[proxy.ts](proxy.ts) runs before every page.

- Logged out and opening `/home`, `/budget`, `/savings`, `/history` or `/add` → sent to `/login`.
- Logged in and opening `/login` or `/signup/...` → sent to `/home`.

⚠️ In Next.js 16 this file **must** be called `proxy.ts`. The old name `middleware.ts` is silently ignored.

### Database tables

**`User`** — one row per person

| Column | Meaning |
|---|---|
| `id` | Unique ID |
| `name` | From the sign-up form, or from Google |
| `email` | Unique, always saved in lowercase |
| `passwordHash` | The scrambled password. Never empty |
| `image` | Google profile picture, if any |
| `createdAt`, `updatedAt` | Dates |

**`Account`** — one row per Google connection

| Column | Meaning |
|---|---|
| `userId` | Which user it belongs to |
| `provider` | Always `"google"` for now |
| `providerAccountId` | Your ID inside Google |

One Google account can belong to only one user. Deleting a user deletes their `Account` rows too.

We do **not** store Google's access tokens. We only use Google to confirm who you are.

### Where the code lives

| File | What it does |
|---|---|
| [prisma/schema.prisma](prisma/schema.prisma) | The tables |
| [lib/db.ts](lib/db.ts) | One shared database connection |
| [lib/auth/token.ts](lib/auth/token.ts) | Sign and check tokens |
| [lib/auth/session.ts](lib/auth/session.ts) | Create, read and delete the login cookie |
| [lib/auth/google.ts](lib/auth/google.ts) | Google login and the 15-minute temporary cookie |
| [lib/auth/password.ts](lib/auth/password.ts) | Scramble and check passwords |
| [app/actions/auth.ts](app/actions/auth.ts) | Sign up, sign in, finish Google sign-up, sign out |
| [app/api/auth/google/route.ts](app/api/auth/google/route.ts) | Sends you to Google |
| [app/api/auth/callback/google/route.ts](app/api/auth/callback/google/route.ts) | Where Google sends you back |
| [app/(auth)/signup/complete/page.tsx](app/(auth)/signup/complete/page.tsx) | The "set password" page |
| [proxy.ts](proxy.ts) | Locks the pages |
| [lib/auth/password-reset.ts](lib/auth/password-reset.ts) | Make, check and use up OTP codes |
| [lib/email/mailer.ts](lib/email/mailer.ts) | Sends the OTP email through Gmail |
| [app/actions/password-reset.ts](app/actions/password-reset.ts) | Send code, resend, check code, save new password |
| [app/(auth)/forgot-password/](app/(auth)/forgot-password/) | The three forgot-password screens |

### A note about your budget data

Budget, savings and history still show sample data. When the real money tables come, **every one of them needs a `userId` column**, and every query must filter by the logged-in user. Otherwise one person could see another person's হিসাব.

---

## Part 4 — Task 3: Forgot password

### The three screens

**Screen 1 — Email.** Type the email of your account.

The next screen always says *"If this email has an account, we have sent a code."* We say this even when no account exists, so nobody can use this page to find out who has an account.

**Screen 2 — OTP.** Type the 6-digit code from your email.

**Screen 3 — New password.** New password and confirm password. After saving, you are logged in and taken to `/home`.

The **"পাসওয়ার্ড ভুলে গেছি"** link on the sign-in form will open Screen 1.

### OTP rules

| Rule | Value |
|---|---|
| Code length | 6 digits |
| Works for | 10 minutes |
| Wrong tries allowed | 5, then the code dies |
| Ask for a new code | After 60 seconds |
| Codes alive at once | Only one — a new code kills the old one |
| How it is stored | Scrambled, like passwords |
| After use | Dies at once, cannot be used again |

### New table: `PasswordResetOtp`

| Column | Meaning |
|---|---|
| `id` | Unique ID |
| `userId` | Whose code it is |
| `codeHash` | The scrambled code |
| `expiresAt` | 10 minutes after sending |
| `attempts` | How many wrong tries so far |
| `usedAt` | Set once the code is used |
| `createdAt` | When it was sent |

### Sending the email

We use **Gmail** with the `nodemailer` library. It is free and can send to anyone, up to 500 emails a day. You need to make a Gmail **App password** — see [Step 5](#step-5--gmail-app-password-for-task-3).

---

## Part 5 — What you do by hand

### Step 1 — Neon database ✅ Done

Your `.env.local` has `DATABASE_URL` (the one with `-pooler`) and `DATABASE_URL_UNPOOLED` (the direct one).

The app uses the pooled one. Table changes use the direct one.

### Step 2 — Google login keys ✅ Done

Google renamed its screens. For reference:

1. **console.cloud.google.com** → your `Hishab` project → **Google Auth Platform**.
2. **Clients** → **Create client** → type **Web application**.
3. **Authorized JavaScript origins:** `http://localhost:3000`
4. **Authorized redirect URIs:** `http://localhost:3000/api/auth/callback/google`
5. **Audience** → **Test users** → add every Gmail that should be able to log in. While the app is in **Testing** mode, other Gmails are blocked.

Google shows the **Client secret only once**, when you create it. If you lose it, make a new secret.

### Step 3 — Secret key ✅ Done

`AUTH_SECRET` in `.env.local`, made with `openssl rand -base64 32`.

### Step 4 — The `.env.local` file ✅ Done

[.env.example](.env.example) lists the names. The real values live only in `.env.local`, which git ignores.

```bash
DATABASE_URL=""
DATABASE_URL_UNPOOLED=""
AUTH_SECRET=""
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
```

**Never put these values in a normal file, a screenshot, or a chat message.**

### Step 5 — Gmail App password ✅ Done

1. Choose the Gmail that will send the codes. A new Gmail made only for the app is a good idea.
2. Go to **myaccount.google.com** → **Security** → turn on **2-Step Verification**. App passwords do not exist without it.
3. At the top of the page, search for **"App passwords"**.
4. Name it `Hishab` → **Create**.
5. Google shows a 16-letter code. Copy it now; it is shown only once.
6. Add two lines to `.env.local`:

```bash
GMAIL_USER="the-sending-address@gmail.com"
GMAIL_APP_PASSWORD="the-16-letter-code"
```

### Step 6 — Later, when you deploy to Vercel

1. Vercel → your project → **Settings** → **Environment Variables** → add every value from `.env.local`.
2. Google Cloud → **Clients** → your client → add the live address **next to** the localhost one. Google needs the exact address; it has no "root URL only" option.
   - **Authorized JavaScript origins:** `https://your-app.vercel.app`
   - **Authorized redirect URIs:** `https://your-app.vercel.app/api/auth/callback/google`
3. Changes can take from 5 minutes to a few hours to start working.
4. Google login works only on the main address and on localhost. **Preview deployments** get a new random address each time, so Google login fails there. Email login works everywhere.
5. To let any Gmail log in, not just test users: **Audience** → **Publish app**.
6. If you buy your own domain later, add its address as a third pair in step 2.

### Changing the tables

Whenever the tables change, this command updates Neon:

```bash
npx prisma migrate dev --name what_changed
```

---

## Checklist

- [x] Neon project and both connection strings
- [x] Google client, redirect URI, test users
- [x] `AUTH_SECRET`
- [x] `.env.local` filled in
- [x] Tables created in Neon
- [x] Task 1 — Sign up
- [x] Task 2 — Sign in
- [x] Gmail App password in `.env.local`
- [x] `PasswordResetOtp` table created in Neon
- [ ] Task 3 — Forgot password, tested by you
