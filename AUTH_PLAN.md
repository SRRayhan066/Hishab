# Login Plan — টাকার হিসাব

This file explains how we turn the current fake login screen into a real one using **Auth.js v5** and **Neon Postgres**.

Read it top to bottom. The parts you must do by hand are in **[Part 5](#part-5--what-you-do-by-hand)**. Everything else I will write in code.

---

## Part 1 — What we have right now

The login screen looks finished, but nothing behind it is real.

| File | What it does now | Problem |
|---|---|---|
| [SignInForm.tsx](components/auth/SignInForm.tsx) | Waits, then `console.log` | Nobody actually signs in |
| [SignUpForm.tsx](components/auth/SignUpForm.tsx) | Waits, then `console.log` | No account is created |
| [GoogleButton.tsx](components/auth/GoogleButton.tsx) | Waits, then `console.log` | Google is not connected |
| [login/page.tsx](app/(auth)/login/page.tsx) | Shows the screen | Fine, no change needed |

The form validation in [lib/validation/auth.ts](lib/validation/auth.ts) is good and we keep it as is.

### Five gaps in the design

**1. The app has no lock on the door.**
Anyone can open `/home`, `/budget`, `/savings`, `/history`, `/add` without logging in. Right now that is harmless because the data is fake. Once the data is real, this is the most serious hole.

**2. There is no way to sign out.**
No logout button exists anywhere in the app. We need one.

**3. "পাসওয়ার্ড ভুলে গেছি" goes nowhere.**
In [SignInForm.tsx](components/auth/SignInForm.tsx) the link is `href="#reset"`. That is a dead link. A real password reset needs a database table and an email service.

**4. "মনে রাখো" does nothing.**
The checkbox value is collected and thrown away. Auth.js uses one fixed session length for everybody, so making this checkbox real takes a small piece of custom code.

**5. The privacy line will become a lie.**
[AuthScreen.tsx](components/auth/AuthScreen.tsx) says *"তোমার তথ্য শুধু তোমার ডিভাইসের হিসাবেই থাকছে।"* — "your data stays only on your device."

Once we add a database, the data lives on a server. We must change this line. Suggested replacement:

> তোমার হিসাব নিরাপদে জমা থাকছে, শুধু তুমিই দেখতে পাবে।

---

## Part 2 — Three decisions, and what I picked

### Decision 1: How do we remember a logged-in user?

Auth.js has two ways. **Database sessions** store a row per login. **JWT sessions** store a signed cookie in the browser and no row at all.

**I picked JWT.** Not really a choice — Auth.js does not support email/password login with database sessions. Since your screen has an email/password form, JWT is the only option.

*What this costs you:* logging out on one device does not log out the other devices instantly. For a personal budget app that is fine.

### Decision 2: Same email, two ways to log in

Someone signs up with `rakib@gmail.com` and a password. Next month they forget, and click "গুগল দিয়ে সাইন ইন" with the same Gmail.

By default Auth.js **refuses** and shows an ugly `OAuthAccountNotLinked` error. It does this on purpose, to stop a stranger from stealing an account by registering the same email with Google.

**I picked: allow the link, but only when Google confirms the email is verified.** Google checks its own users' emails, so this is safe, and your user just gets in instead of hitting a wall.

### Decision 3: How long does a login last?

**I picked: 30 days if "মনে রাখো" is ticked, 1 day if not.**

---

## Part 3 — The database design

We use **Prisma** to talk to Neon Postgres. Five tables.

Four of them are required by Auth.js and their column names **cannot be changed** — Auth.js looks for these exact names, including the odd `snake_case` ones like `access_token`. The fifth one is ours.

### Table 1: `User` — one row per person

| Column | Type | Meaning |
|---|---|---|
| `id` | String | Unique ID, auto-generated |
| `name` | String? | From the signup form, or from Google |
| `email` | String | **Unique.** No two users share an email |
| `emailVerified` | DateTime? | When they confirmed their email |
| `image` | String? | Profile picture URL from Google |
| `passwordHash` | String? | The scrambled password |
| `createdAt` | DateTime | When they joined |
| `updatedAt` | DateTime | Last change |

Two things worth understanding:

- **`passwordHash` can be empty.** A user who only ever used Google has no password. That is normal, not a bug.
- **We never store the real password.** We store a scrambled version made by `bcrypt`. Even I cannot read it back. When someone logs in, we scramble what they typed and compare the two scrambles.

`passwordHash` is our own addition — Auth.js does not manage passwords for you.

### Table 2: `Account` — one row per Google connection

This table only fills up when someone uses Google. Email/password users get no row here.

| Column | Type | Meaning |
|---|---|---|
| `id` | String | Unique ID |
| `userId` | String | Which user this belongs to |
| `type` | String | Always `"oauth"` for Google |
| `provider` | String | `"google"` |
| `providerAccountId` | String | The user's ID **inside Google** |
| `refresh_token` | String? | Google's tokens |
| `access_token` | String? | |
| `expires_at` | Int? | |
| `token_type` | String? | |
| `scope` | String? | |
| `id_token` | String? | |
| `session_state` | String? | |

Rule: `provider` + `providerAccountId` together must be unique. One Google account cannot attach to two users.

### Table 3: `Session` — required, but unused

Auth.js's Prisma adapter insists this table exists. Because we chose JWT, **it will always stay empty.** Leave it. It costs nothing and it means we can switch strategies later without a migration.

| Column | Type |
|---|---|
| `id` | String |
| `sessionToken` | String, unique |
| `userId` | String |
| `expires` | DateTime |

### Table 4: `VerificationToken` — for email confirmation links

| Column | Type | Meaning |
|---|---|---|
| `identifier` | String | The email address |
| `token` | String | Unique random string in the link |
| `expires` | DateTime | When the link dies |

### Table 5: `PasswordResetToken` — ours, for "forgot password"

| Column | Type | Meaning |
|---|---|---|
| `id` | String | Unique ID |
| `email` | String | Who asked |
| `token` | String | Unique random string in the link |
| `expires` | DateTime | We will use 1 hour |
| `usedAt` | DateTime? | Stamped once used, so a link works only once |

### How they connect

```
User (1) ──────< Account       one user, many login methods
User (1) ──────< Session       stays empty for us

PasswordResetToken             stands alone, matched by email
VerificationToken              stands alone, matched by email
```

Deleting a `User` deletes their `Account` and `Session` rows automatically (`onDelete: Cascade`).

### A note about your budget data

Your money tables — income, fixed costs, categories, entries — come in a later task. When they do, **every single one needs a `userId` column**, and every query must filter by the logged-in user. Otherwise one user sees another's হিসাব. I am flagging it now so the shape is not a surprise later.

---

## Part 4 — What I will build

### Phase 1 — Database ready

1. Install `prisma`, `@prisma/client`, `@auth/prisma-adapter`, `next-auth@beta`, `bcryptjs`.
2. Write `prisma/schema.prisma` with the five tables above.
3. Write `lib/db.ts` — a single shared Prisma connection. This avoids a common dev bug where hot reload opens hundreds of database connections.

### Phase 2 — Email and password login

4. Write `auth.config.ts` and `auth.ts`.

   Two files instead of one because the lightweight file (`auth.config.ts`) can run in the route-checking layer without dragging the whole database library along with it.

5. Write `app/api/auth/[...nextauth]/route.ts`. Three lines. This is the address Google and the login forms talk to.
6. Write `app/actions/auth.ts` — the signup function. Auth.js does **not** do signup, only login, so this part is ours: check the email is free, scramble the password, create the `User` row.
7. Rewire [SignInForm.tsx](components/auth/SignInForm.tsx) to call `signIn("credentials", ...)`, and show a real error when the password is wrong.
8. Rewire [SignUpForm.tsx](components/auth/SignUpForm.tsx) to create the account, then log in immediately and go to `/home`.

### Phase 3 — Google

9. Add the Google provider, with the safe email-verified linking from Decision 2.
10. Rewire [GoogleButton.tsx](components/auth/GoogleButton.tsx) to call `signIn("google")`.

### Phase 4 — Lock the door

11. Write **`proxy.ts`** in the project root.

    ⚠️ **Important for this Next.js version.** In older tutorials this file is called `middleware.ts`. Next.js 16 renamed it to `proxy.ts`. If we name it the old way, **the file is silently ignored and every page stays unprotected with no error message.** Also, `export const runtime` must not appear inside it — that now throws.

12. Send logged-out visitors from `/home`, `/budget`, `/savings`, `/history`, `/add` to `/login`.
13. Send already-logged-in visitors away from `/login`.
14. Add a sign-out button to the app header.

### Phase 5 — Loose ends

15. Make "মনে রাখো" real (30 days vs 1 day).
16. Build the forgot-password pages and connect an email service.
17. Fix the privacy line in [AuthScreen.tsx](components/auth/AuthScreen.tsx).

**Phases 1–4 give you a working login.** Phase 5 can wait.

---

## Part 5 — What you do by hand

I cannot do these. They need your accounts and your passwords. Do them in order.

### Step 1 — Create the database (5 minutes)

1. Go to **https://neon.com** and sign up (GitHub login is quickest).
2. Click **New Project**.
3. Name it `hishab`. Pick the region closest to Bangladesh — **Singapore** is usually the best choice.
4. Click **Create**.
5. You land on a page showing a connection string. You need **two versions** of it:
   - Find the **Pooled connection** string. It has `-pooler` in the middle of the address. Copy it.
   - Find the toggle or checkbox for **Direct connection** (sometimes labelled "unpooled"). Copy that one too.
6. Paste both into a scratch file for a moment. Step 4 needs them.

> **Why two?** The normal one is for the app. The direct one is only for changing the table structure, because the pooled connection cannot do that. Using the wrong one causes confusing errors later.

### Step 2 — Get Google login keys (10 minutes)

1. Go to **https://console.cloud.google.com**.
2. Top bar → project dropdown → **New Project**. Name it `Hishab`. Create it, then make sure it is selected in the top bar.
3. Left menu → **APIs & Services** → **OAuth consent screen**.
   - User type: **External** → Create.
   - App name: `টাকার হিসাব` (or `Hishab`).
   - Support email: your email.
   - Developer contact: your email.
   - Save and continue through the next screens. You can skip "Scopes".
   - On **Test users**, click **Add users** and add your own Gmail. **Do not skip this** — while the app is unpublished, only emails listed here can log in.
4. Left menu → **Credentials** → **Create Credentials** → **OAuth client ID**.
5. Application type: **Web application**. Name: `Hishab Web`.
6. Under **Authorised JavaScript origins**, click Add URI:
   ```
   http://localhost:3000
   ```
7. Under **Authorised redirect URIs**, click Add URI and paste this **exactly**:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
   One wrong character here gives a `redirect_uri_mismatch` error at login. Check it twice.
8. Click **Create**. A box shows your **Client ID** and **Client Secret**. Copy both now — the secret is hard to see again later.

### Step 3 — Make a secret key (30 seconds)

Open a terminal in the project folder and run:

```bash
openssl rand -base64 32
```

Copy the line it prints. This is what signs the login cookie.

### Step 4 — Create the `.env.local` file

Make a new file named `.env.local` in the project root and fill in the five values you just collected:

```bash
# From Step 1 — the one WITH -pooler
DATABASE_URL="postgresql://...-pooler.../hishab?sslmode=require"

# From Step 1 — the one WITHOUT -pooler
DATABASE_URL_UNPOOLED="postgresql://.../hishab?sslmode=require"

# From Step 3
AUTH_SECRET="paste-the-random-line-here"

# From Step 2
AUTH_GOOGLE_ID="paste-client-id-here"
AUTH_GOOGLE_SECRET="paste-client-secret-here"
```

The names must be spelled exactly like this. Auth.js finds `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` on its own — no extra wiring needed.

✅ Your [.gitignore](.gitignore) already ignores `.env*`, so this file will not be committed. Good. **Never put these values in a normal file, a screenshot, or a chat message.**

### Step 5 — Tell me you are ready

Once Steps 1–4 are done, say so. Then I write the code from Part 4, and you run one command to create the tables:

```bash
npx prisma migrate dev --name init_auth
```

You should see the five tables appear in the Neon dashboard under **Tables**.

### Step 6 — Later, when you deploy to Vercel

Not needed yet. Written down so it is not forgotten:

1. In Vercel → your project → **Settings** → **Environment Variables**, add all five values from Step 4.
2. Go back to Google Cloud → Credentials → your OAuth client, and **add a second redirect URI** for the live site:
   ```
   https://your-real-domain.com/api/auth/callback/google
   ```
   Keep the localhost one too, so local development keeps working.
3. If you want Google login open to anyone and not just your test users, go to **OAuth consent screen** and click **Publish App**.

### Step 7 — Even later, for "forgot password"

Only needed for Phase 5. Sending email requires an email service — **https://resend.com** has a free tier. Sign up, get an API key, and add it as `RESEND_API_KEY`. Do not bother with this until Phases 1–4 work.

---

## Quick checklist

Tick these off as you go.

- [ ] Neon account made, project created
- [ ] Pooled connection string copied
- [ ] Direct (unpooled) connection string copied
- [ ] Google Cloud project made
- [ ] OAuth consent screen filled in
- [ ] Your own Gmail added as a test user
- [ ] Redirect URI added, spelled exactly right
- [ ] Client ID and Client Secret copied
- [ ] `AUTH_SECRET` generated
- [ ] `.env.local` created with all five values
- [ ] Told Claude to start writing code
