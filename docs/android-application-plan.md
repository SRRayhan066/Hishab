# Hishab Android App: Build Guide (React Native)

This file explains, step by step, how to build the **Android version of Hishab** with React Native.
Each step is small and has a clear "Done when" line, so you can pick up the work in any chat.

> **This repo is the web app. Leave it as it is.**
> The Android app is a **new, separate project**. We only *copy* code from here into it.
> Whether to remove the web app's database later is a separate decision.

---

## How to use this file in a new chat

1. Copy this `README.md` into the new project's root too, so every chat there can see it.
2. Start the chat with something like:

   > Read `README.md`. The web app is in `~/Documents/Hishab`, and the Android app is in `~/Documents/hishab-mobile`. Do **Step 5**. Don't change the web app.

3. When a step is finished, tick its box in the [Progress tracker](#progress-tracker).

---

## The big picture

| What changes | Web app today | Android app |
|---|---|---|
| **Where data lives** | Our Postgres database on a server | **Only on the user's phone**. We keep nothing. |
| **Accounts / login** | Email + password, or Google | **No login.** Guest by default, and Google only for Drive backup |
| **Backup** | Not needed (server has it) | Optional backup to the user's **own Google Drive** |
| **Language** | Bengali + English | **English only** |
| **Logo / currency** | ৳ logo, BDT by default | **Neutral logo**, and the user picks a currency |
| **Time zone** | Always Dhaka | **Phone's own time zone** |

### The two data modes

| Mode | Where data is saved | If the user uninstalls and installs again |
|---|---|---|
| **Guest** (default) | Only on the phone | Data is **gone** |
| **Google Drive backup** | Phone + one backup file in the user's Google Drive | User taps **"Restore from Google Drive"** and everything comes back |

How the Drive backup works:
- The app asks only for the `drive.appdata` permission. That gives a **hidden folder only our app can use**.
- The app cannot see any of the user's other files.
- The data goes from the phone straight to the user's Drive. **It never touches our server.**

---

## Decisions already made (no need to ask again)

- **React Native with Expo**, written in TypeScript.
- The web app stays untouched, and the Android app is a separate project.
- **No backend server** for the Android app.
- Guest mode plus optional Google Drive backup, with an optional "export / import file" as well.
- English only.
- Neutral logo (no ৳).
- Android's own automatic backup is **turned off**, so guest data really disappears on uninstall.

---

## Tools we will use

| Need | Tool | Why |
|---|---|---|
| App framework | **Expo** (React Native) + TypeScript | Easiest way to build and publish React Native apps |
| Screens / navigation | **Expo Router** | File-based routes, like the `app/` folder in Next.js |
| Styling | **NativeWind** | Lets us keep writing Tailwind classes |
| Database on phone | **expo-sqlite** + **Drizzle ORM** | Real database on the phone; Drizzle feels like Prisma |
| Forms + validation | **react-hook-form** + **zod** | The same libraries the web app uses |
| Icons | **lucide-react-native** | The same icon set as the web (`lucide-react`) |
| Charts / SVG | **react-native-svg** | The burndown chart is SVG |
| Bottom sheets | **@gorhom/bottom-sheet** | Replaces the web `Sheet` / `<dialog>` |
| Small app state | **zustand** | For "data changed", settings, the chosen month |
| Phone region / currency / time zone | **expo-localization** | To guess the currency and read the time zone |
| Google sign-in | **@react-native-google-signin/google-signin** | To get permission for Drive |
| Drive upload / download | Plain `fetch` to the **Google Drive REST API v3** | No extra library needed |
| Export / import file | **expo-file-system**, **expo-sharing**, **expo-document-picker** | Save and open a backup file |
| IDs | **expo-crypto** (`randomUUID()`) | Unique IDs for rows |
| Build + publish | **EAS** (`eas-cli`) | Builds the Android app file (AAB) in the cloud and signs it |
| Tests | **jest-expo** | Unit tests for the money logic |

> Always install Expo packages with `npx expo install <package>`. It picks the version that matches your Expo SDK.

---

## Progress tracker

- [ ] [Step 1: Get ready (accounts and tools)](#step-1-get-ready-accounts-and-tools)
- [ ] [Step 2: Create the project](#step-2-create-the-project)
- [ ] [Step 3: Copy the reusable code from the web app](#step-3-copy-the-reusable-code-from-the-web-app)
- [ ] [Step 4: English only](#step-4-english-only)
- [ ] [Step 5: Make it work for every country](#step-5-make-it-work-for-every-country)
- [ ] [Step 6: New logo and app icons](#step-6-new-logo-and-app-icons)
- [ ] [Step 7: Database on the phone](#step-7-database-on-the-phone)
- [ ] [Step 8: Actions (same names as the web app)](#step-8-actions-same-names-as-the-web-app)
- [ ] [Step 9: Build the screens](#step-9-build-the-screens)
- [ ] [Step 10: Welcome screen and guest mode](#step-10-welcome-screen-and-guest-mode)
- [ ] [Step 11: Google Drive backup and restore](#step-11-google-drive-backup-and-restore)
- [ ] [Step 12: Export / import a backup file (optional)](#step-12-export--import-a-backup-file-optional)
- [ ] [Step 13: Test everything](#step-13-test-everything)
- [ ] [Step 14: Publish on Google Play](#step-14-publish-on-google-play)

---

## Step 1: Get ready (accounts and tools)

**What:** Install the tools and create the accounts you'll need later.

**How:**
1. Install **Node.js (LTS)** and **Android Studio**. Android Studio gives you the Android SDK and an emulator.
2. Make an **Expo account** at expo.dev, then install the EAS command-line tool: `npm i -g eas-cli`, then `eas login`.
3. Make a **Google Play Developer account**. It costs a one-time fee. Start early, because identity checks take a few days.
4. Make a **Google Cloud project** for the app. You'll use it in Step 11.
5. **Choose the Android package name now**, for example `com.yourname.hishab`. ⚠️ It can **never change** after you publish.

**Done when:** `node -v` and `eas whoami` work, an Android emulator starts, and the package name is written down.

---

## Step 2: Create the project

**What:** Make a fresh Expo app next to the web app folder.

**How:**
1. In `~/Documents`, run: `npx create-expo-app@latest hishab-mobile`. The default template already has TypeScript and Expo Router.
2. `cd hishab-mobile` and `git init`. This is its **own git repo**.
3. Add a **development build**:
   - Run `npx expo install expo-dev-client`.
   - Google Sign-In is native code, so **Expo Go will not work** for this app.
   - To run the app, use `npx expo run:android`, or an EAS development build.
4. Set up **NativeWind** by following its Expo install guide. Use the version its docs say works with your Expo SDK.
5. Copy the web app's colors into the Tailwind config, so the app looks the same. They live in `app/globals.css` → `@theme`:
   - `canvas #f7f4ee`, `surface #ffffff`, `panel #eaf1e6`
   - `ink #2a2825`, `primary #4f7a4a`, `primary-dark #3d5f39`
   - `warn #e8b23e`, `over/danger #c0472c`, `line #e2ddd2`
   - …and the rest from that file, plus the radius values.
6. Pick English fonts with `@expo-google-fonts`, for example **Inter** for body text and **Plus Jakarta Sans** for headings. The web fonts (Hind Siliguri, Anek Bangla) are Bengali fonts, so we drop them.
7. In `app.json`, set:
   - `"name": "Hishab"`
   - `"android.package"` to your chosen package name
   - `"android.allowBackup": false`

Suggested folders:

```
hishab-mobile/
  app/                    ← screens (Expo Router)
  src/
    logic/                ← money logic copied from the web app (Step 3)
    i18n/                 ← English text + t() helper (Step 4)
    db/                   ← database schema, client, migrations (Step 7)
    actions/              ← addExpense, addTransfer, … (Step 8)
    backup/               ← Drive + file backup (Steps 11–12)
    store/                ← zustand stores
    components/           ← React Native UI pieces
  assets/                 ← icons, splash, fonts
```

**Done when:** a "Hello" screen runs on the emulator with NativeWind styles and the custom fonts.

---

## Step 3: Copy the reusable code from the web app

**What:** Bring over the code that is plain TypeScript. It works the same on a phone.

**Copy these from the web repo into `src/logic/`. Almost no changes are needed.**

| File in web repo | What it does |
|---|---|
| `lib/finance/summary.ts` | Builds all the month numbers (spent, left, per-day, burndown…) |
| `lib/finance/budget.ts` | Budget math |
| `lib/finance/debts.ts` | Debt book: who owes whom, settled people, repayments |
| `lib/finance/accounts.ts` | Overdraft checks, "can this account be removed?" |
| `lib/finance/entries.ts` | Recent-spending list, last used account |
| `lib/finance/history.ts` | Past-months math |
| `lib/finance/period.ts` | Month/day helpers (edited in Step 5) |
| `lib/finance/types.ts` | Shared types |
| `lib/finance/account-style.ts` | Account colors and icons |
| `lib/finance/day-label.ts` | "Today", "Yesterday", … labels |
| `lib/validation/finance.ts` | zod rules for forms |
| `lib/i18n/translate.ts`, `lib/i18n/format.ts`, `lib/i18n/config.ts` | Text helper and number formatting (edited in Steps 4–5) |
| `types/finance.ts` | Action result types |
| `lib/i18n/dictionaries/en.ts` | All English text |

**Fix the imports:** the web code uses `@/lib/...`. Change them to the new paths, or set up the same `@/` alias in `tsconfig.json`.

**Do NOT copy** (not needed on the phone):
- `lib/db.ts`, `prisma/`, and every `*-store.ts` file. These are server database code, and Step 7 replaces them. Keep `prisma/schema.prisma` open as a **reference** for the tables.
- `lib/auth/`, `lib/email/`, `lib/pwa/`, `app/api/`, `proxy.ts`, `public/sw.js`.
- `components/auth/*`, `NameForm`, `PasswordForm`, `LanguageSwitcher`, `InstallBanner`, `ServiceWorkerRegistrar`.

**Components** (`components/*`) **can't be copied as-is.** They use web tags like `<div>` and `<button>`. Use them as a **guide** in Step 9 and rebuild each one in React Native.

**Done when:** the copied files compile (`npx tsc --noEmit`) with no imports from `next`, `prisma` or `server-only`.

---

## Step 4: English only

**What:** Remove everything Bengali and keep the simple `t("key")` helper.

**How:**
1. Keep only `en.ts`. Don't copy `bn.ts`.
2. Today `en.ts` borrows its type from `bn.ts` (`export const en: Dictionary = {…}`, with `Dictionary` defined in `bn.ts`). Break that link:
   - In `en.ts`, remove the import and the `: Dictionary`, so it reads `export const en = {…}`.
   - At the bottom of `en.ts`, add `export type Dictionary = typeof en;`.
   - In `translate.ts`, import `Dictionary` from `./dictionaries/en` instead of `./dictionaries/bn`.
3. In `config.ts`:
   - Delete `locales`, `defaultLocale`, `localeCookie`, `localeNames`, `localeShortNames` and `isLocale`.
   - Keep the currency parts.
4. In `format.ts`:
   - Delete the Bengali month names, weekday names and Bengali digits (`banglaDigits`, `toLatinDigits`).
   - Remove the `locale` parameter, so it is always English.
5. Make a tiny `useT("namespace")` hook that reads from `en.ts`. Then screens can keep calling `t("someKey")` like on the web.
6. Delete text that is no longer used: the `auth`, `email`, `language` and `install` namespaces, plus password and email messages.

**Done when:** searching the project for Bengali letters (`grep -rP "[\x{0980}-\x{09FF}]" src app`) finds nothing.

---

## Step 5: Make it work for every country

**What:** The web app assumes Bangladesh. Remove those assumptions.

**How:**
1. **Time zone.** `period.ts` hard-codes `APP_TIME_ZONE = "Asia/Dhaka"`. On a phone, the phone's own clock is already in the user's time zone. So:
   - `zonedToday()` simply returns `{ year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() }` from `new Date()`.
   - Delete `APP_TIME_ZONE` and the `Intl.DateTimeFormat` with `timeZone`.
2. **Currency.**
   - On first launch, show a **currency picker**. Preselect it from the phone with `expo-localization`: `getLocales()[0].currencyCode`.
   - Save it in the settings table (Step 7). Change it later from Settings.
   - Grow the `currencySymbols` list in `config.ts` with the common world currencies.
3. **Decimals (recommended).**
   - The web app stores **whole numbers only** (`wholeTaka` in `lib/validation/finance.ts`). That is fine for ৳ but not for $ or €.
   - Store every amount as an **integer in cents** (amount × 100). The math stays integer-only, so it stays exact.
   - Then:
     - Amount inputs accept up to 2 decimals.
     - Validation converts the typed value to cents.
     - `format` divides by 100 when showing a number.
     - Currencies without decimals (like JPY) show no decimals.
4. **Rename** `taka` → `money` and `signedTaka` → `signedMoney` in `format.ts`, and wherever they are used.

**Done when:** you can pick USD, enter `12.50`, and see `$12.50`. Changing the phone's time zone changes which day counts as "today".

---

## Step 6: New logo and app icons

**What:** Replace the ৳ logo with a neutral one.

**How:**
1. Design a simple mark that isn't tied to any currency, for example:
   - a **wallet**
   - an **open ledger / notebook**
   - an **"H" monogram**

   Keep the same style as today: a rounded green square (`#4f7a4a`) with a white symbol.
2. Make these files and put them in `assets/`:

   | File | Size | Used for |
   |---|---|---|
   | `icon.png` | 1024×1024 | Main app icon |
   | `adaptive-icon.png` | 1024×1024, symbol in the middle ~66% (safe zone), transparent background | Android adaptive icon foreground |
   | `monochrome-icon.png` (optional) | 1024×1024, single color | Android 13+ themed icons |
   | `splash-icon.png` | ~1024×1024 | Splash screen |
   | Play Store icon | 512×512 PNG | Store listing |
   | Feature graphic | 1024×500 PNG | Store listing banner |

3. In `app.json`, set:
   - `icon`
   - `android.adaptiveIcon.foregroundImage`, with `backgroundColor: "#4f7a4a"`
   - `monochromeImage` (optional)
   - the splash settings
4. Build a `Logo` component in React Native (mark + "Hishab"). The web version is `components/icons/Logo.tsx`.

**Done when:** the home-screen icon, the splash screen and the in-app logo all show the new mark, and no ৳ appears anywhere.

---

## Step 7: Database on the phone

**What:** Replace Postgres/Prisma with SQLite on the phone, using Drizzle ORM.

**How:**
1. Install `expo-sqlite`, `drizzle-orm` and `drizzle-kit`. Follow **Drizzle's "Expo SQLite" guide**, including how to run migrations inside the app.
2. Create `src/db/schema.ts`. Copy the tables from the web's `prisma/schema.prisma`, with these changes:
   - **Remove** `User`, `Account` and `PasswordResetOtp`. There is only one person per phone.
   - **Remove every `userId` column.**
   - **Keep:**
     - `MoneyAccount`
     - `BudgetMonth` (unique on `year + month`)
     - `IncomeSource`
     - `SpendCategory`
     - `Expense`
     - `Transfer`
     - `BalanceAdjustment`
     - `DebtPerson` (unique `name`)
     - `DebtEntry`
   - **Keep every field** that has a meaning, such as `lineageId`, `temporary`, `sortOrder` and `seededFromId`.
   - **Add** a `settings` table (key → value) for `currency` and `tourCompletedAt`.
   - IDs are text from `randomUUID()`. Store dates as numbers (milliseconds), and amounts as integers in **cents** (Step 5).
   - Turn on foreign keys (`PRAGMA foreign_keys = ON`). Keep the same "on delete" rules as Prisma: deleting a month deletes its rows.
3. Keep settings for **this phone only** out of the database, because they must not go into a backup. These are: the data mode (`guest` / `drive`), the last backup time, and the "backup pending" flag. Use `expo-secure-store` or a small separate store.
4. On first launch, create **one default account** using the `defaultAccount` text from `en.ts`. This is the same as the web app.
5. Write the **read functions** that replace the web's store files. The data is small, so do the math in TypeScript:

   | Web file to replace | New function | What it returns |
   |---|---|---|
   | `lib/finance/month-store.ts` | `loadMonthSnapshot(viewed)` | Same shape as the web: `{ monthId, period, isPast, months, data }` |
   | `lib/finance/account-store.ts` | `loadAccounts(asOf?)` | Accounts with `balance`, `inUse`, `openingLocked` |
   | `lib/finance/debt-store.ts` | `loadDebtBook()` | Uses `buildDebtBook()` from `debts.ts` |
   | `lib/finance/view.ts` | `getMonthView()` and `getEntryContext()` | Same as the web, without sessions or cookies |

   The rules these must follow are in [Business rules to keep](#business-rules-to-keep).
6. **"Data changed" signal:**
   - Make a tiny zustand store with a `version` number.
   - Every action (Step 8) bumps it after writing.
   - Screens re-read their data when it changes. This replaces the web's `refresh()`.
   - The same signal triggers auto-backup in Step 11.

**Done when:** on a fresh install the app creates the current month and one default account. Adding rows by code and calling `getMonthView()` gives the right totals and balances.

---

## Step 8: Actions (same names as the web app)

**What:** Re-create the web's server actions as normal functions that write to the phone's database.

**Why the same names?** If `addExpense(values)` has the same name, inputs and result type (`{ error?: string }`), the screens you rebuild can follow the web components almost line by line.

**How:** create `src/actions/` with these functions. Each one should:
1. Validate with the copied zod schemas.
2. Run inside **one database transaction**, so it's all-or-nothing.
3. Apply the [business rules](#business-rules-to-keep).
4. Bump the "data changed" version.

| Web file | Functions to re-create |
|---|---|
| `app/actions/expense.ts` | `addExpense`, `removeExpense` |
| `app/actions/income.ts` | `saveIncomeSection` |
| `app/actions/budget.ts` | `saveCategorySection`, `addCategoryRow` |
| `app/actions/accounts.ts` | `saveAccountSection`, `addAccount`, `addTransfer`, `removeTransfer`, `correctBalance`, `removeCorrection` |
| `app/actions/debts.ts` | `addDebtEntry`, `removeDebtEntry` |
| `app/actions/currency.ts` | `changeCurrency` → saves to the settings table |
| `app/actions/tour.ts` | `completeTour` → saves to the settings table |
| `app/actions/month.ts` | `viewMonth` → just sets the chosen month in a zustand store (no cookie) |
| `app/actions/profile.ts` | Only `clearAllData`: delete everything, then create one default account |

**Skip** (not needed on the phone):
- everything in `auth.ts` and `password-reset.ts`
- `locale.ts`
- `updateName` and `changePassword`

**Helpful:** the web's `lib/finance/section-store.ts` shows exactly how "save a whole section" works (update, create and delete rows). Port that logic.

**Done when:**
- Every action works from a test screen.
- Each error case returns the same message as the web, for example "not enough balance" or "day in the future".
- Jest tests pass for the main rules.

---

## Step 9: Build the screens

**What:** Rebuild each web screen in React Native, using the web components as the guide.

**Screens (Expo Router):**

| Screen | Web reference |
|---|---|
| Tabs layout (bottom navigation) | `components/app/AppShell.tsx`, `AppNav.tsx` |
| Home | `app/(app)/home/page.tsx`, `components/home/*` |
| Spending | `components/spending/*` |
| Budget | `components/budget/*` |
| Accounts | `components/accounts/*` |
| Debts + person detail (`debts/[id]`) | `components/debts/*` |
| History | `components/history/*` |
| Add entry sheet (spend / transfer / debt) | `components/entry/*` |
| Month picker + "viewing a past month" banner | `components/app/MonthPicker.tsx`, `PastBanner.tsx` |
| Settings (currency, backup & restore, clear data, about / privacy policy link) | `components/profile/*` (only the currency and clear-data parts) |
| Product tour (can come later) | `components/tour/*`, `lib/tour/steps.ts` |

**Web → React Native cheat sheet:**

| Web | React Native |
|---|---|
| `<div>` | `<View>` |
| `<span>`, `<p>`, any text | `<Text>`. ⚠️ All text **must** be inside `<Text>` |
| `<button>` | `<Pressable>` |
| `<input>` | `<TextInput>` (`keyboardType="decimal-pad"` for money) |
| `<dialog>` / `Sheet.tsx` | `@gorhom/bottom-sheet` |
| `<svg>` (burndown chart) | `react-native-svg` |
| Long lists | `<FlatList>` |
| `next/link`, `useRouter` | `Link`, `useRouter` from `expo-router` |
| CSS grid, `hover:`, CSS animations | Use flexbox, and skip hover (there's no mouse) |
| `useT()` / `getT()` | Your `useT()` hook from Step 4 |
| Server page that called `getMonthView()` | Screen calls `getMonthView()` and re-reads when the "data changed" version changes |

**Done when:** every screen works on the emulator and matches the web app's look and behavior.

---

## Step 10: Welcome screen and guest mode

**What:** The first screen a new user sees.

**How:**
1. If the phone has no data yet, show **Welcome** with three buttons:
   - **Start fresh**: choose a currency, then go to Home. Mode = `guest`.
   - **Restore from Google Drive**: Step 11.
   - **Import backup file**: Step 12 (optional).
2. In guest mode, show a small, friendly note in Settings: *"Your data is only on this phone. Turn on Google Drive backup to keep it safe."*
3. A guest can turn on Drive backup any time. That uploads the current data (Step 11).
4. Double-check that `android.allowBackup` is `false` in `app.json`. Otherwise Android may quietly restore guest data after a reinstall.

**Done when:** after a fresh install you see Welcome, "Start fresh" works, and uninstall then reinstall shows Welcome again with **no old data**.

---

## Step 11: Google Drive backup and restore

**What:** Save one backup file in the user's hidden Drive "app data" folder, and restore it after a reinstall.

**Set up Google Cloud (one time):**
1. In your Google Cloud project, **enable the Google Drive API**.
2. Set up the **OAuth consent screen**:
   - App name, support email and privacy policy link.
   - Add the scope `https://www.googleapis.com/auth/drive.appdata`.
   - It's a non-sensitive scope, so Google's heavy security review shouldn't be needed.
3. ⚠️ Set the consent screen to **"In production"** before release. While it is in "Testing", only listed test users can sign in, and their sign-in expires after 7 days.
4. Create OAuth client IDs:
   - **Android** client: package name + **SHA-1**. You need one for each signing key: your debug key, the EAS key, and Google Play's **App Signing key**.
   - **Web** client: its ID goes into `GoogleSignin.configure({ webClientId })`.
5. ⚠️ The most common bug is that sign-in works in development but **fails in the Play Store build**. The cause is a missing SHA-1 for Play's App Signing key. You find it in Play Console → App integrity.

**In the app:**
1. Install `@react-native-google-signin/google-signin` and add its Expo config plugin to `app.json`.
2. Configure it with `scopes: ["https://www.googleapis.com/auth/drive.appdata"]`.
3. After `GoogleSignin.signIn()`, get an access token with `GoogleSignin.getTokens()`.
4. Write `src/backup/drive.ts` with four tiny functions. Each one calls `fetch` with the header `Authorization: Bearer <accessToken>`:

   | Function | Request |
   |---|---|
   | `findBackup()` | `GET https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='hishab-backup.json'&fields=files(id,modifiedTime)` |
   | `createBackup(json)` | `POST https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart` with metadata `{ "name": "hishab-backup.json", "parents": ["appDataFolder"] }` |
   | `updateBackup(id, json)` | `PATCH https://www.googleapis.com/upload/drive/v3/files/{id}?uploadType=media` |
   | `downloadBackup(id)` | `GET https://www.googleapis.com/drive/v3/files/{id}?alt=media` |

5. Write `src/backup/format.ts`:
   - `exportAll()` reads every table and the user-data settings, and returns the [backup file](#backup-file-format) as JSON.
   - `importAll(json)` checks the file with zod, then, **in one transaction**, deletes all rows and inserts the backup.
   - If the backup came from an older app version, upgrade it first.
6. **When to back up:**
   - About 10 seconds after the last change (listen to the "data changed" version).
   - When the app goes to the background (`AppState`).
   - When the user taps **"Back up now"**.
7. **If there is no internet:** remember "backup pending" and try again when the app opens. Show **"Last backed up: …"** in Settings.
8. **Restore:**
   - From Welcome: sign in → find the backup → show its date → **Restore**.
   - If no backup is found, say so and offer "Start fresh".
9. **Turning backup on when the phone already has data and Drive also has a backup:** ask the user which to keep:
   - "Use the Drive backup (replaces this phone's data)"
   - "Keep this phone's data (replaces the Drive backup)"
10. Settings also gets:
    - **Turn off backup**: signs out and keeps the phone data.
    - **Delete my Drive backup**.

**Done when:** add data → back up → uninstall → reinstall → Restore → every account, month, expense, transfer, correction and debt is back and the balances match.

---

## Step 12: Export / import a backup file (optional)

**What:** A backup that works without Google, for people who don't use Google Drive.

**How:**
1. **Export:**
   - Call `exportAll()` and write the result to a file with `expo-file-system`, named like `hishab-backup-2026-11-11.json`.
   - Open the share menu with `expo-sharing`, so the user can save it to Files, email or any cloud app.
2. **Import:** pick the file with `expo-document-picker`, then call `importAll()`. Ask first: "This replaces all data on this phone."

**Done when:** export on one phone (or emulator) and import on another gives the same data.

---

## Step 13: Test everything

**Automatic tests (jest-expo):**
- The copied logic: `summary`, `debts`, `accounts`, `budget`, `history`, `period`.
- Balance math, and every "not allowed" rule in [Business rules to keep](#business-rules-to-keep).
- `exportAll()` → `importAll()` gives back exactly the same data.

**Manual tests (emulator + a real phone):**
- [ ] Works fully **offline**, with no internet at all.
- [ ] **Guest:** add data → uninstall → reinstall → data is gone.
- [ ] **Drive:** add data → back up → uninstall → reinstall → restore → all data matches.
- [ ] **Guest → Drive:** turning on backup uploads the existing data.
- [ ] **New month:** change the phone date to the 1st of next month → the plan is copied, and spending starts at zero.
- [ ] **Past month:** pick last month → balances show that month's end. Adding an entry goes to the current month.
- [ ] **Overdraft:** spending more than an account has is refused with a clear message.
- [ ] **Currency + decimals:** USD shows `$12.50`, and changing the currency updates every screen.
- [ ] **No Bengali text and no ৳** anywhere.
- [ ] A release build installed from Play's internal testing can **sign in to Google** (checks the SHA-1 setup).

---

## Step 14: Publish on Google Play

**How:**
1. **Privacy policy page** (required even though we collect nothing). Host it somewhere public, for example GitHub Pages. Say simply:
   - Data stays on your phone.
   - If you turn on backup, a copy goes to **your own** Google Drive.
   - We have no server and see nothing.
2. **Build:** `eas build --platform android --profile production` makes a signed **AAB** file. Let EAS manage the signing key, and turn on **Play App Signing**.
3. **Play Console → create the app**, then fill in:
   - store listing: name, short and full description, screenshots, the 512×512 icon, the 1024×500 feature graphic
   - content rating
   - target audience
   - ads (none)
   - **Data safety form**: read Google's help on how to declare the Drive backup; it is user-chosen and goes to the user's own Drive
   - any other app-content questions
4. **Testing tracks:**
   - Upload to **Internal testing** first, and test Google sign-in there.
   - New personal developer accounts must run a **closed test with at least 12 testers for 14 days in a row** before going public. Check the current rule in Play Console.
5. **Apply for production**, then release.
6. **Updates later:** bump `version` (and the Android `versionCode`) in `app.json`, then `eas build` and `eas submit`. If the database tables change, add a Drizzle migration **and** handle older backup files in `importAll()`.

**Done when:** the app is live on Google Play.

---

## Business rules to keep

These rules live in the web app's code today. The phone version must behave exactly the same.

**Months**
1. **A month is created the first time the app is opened in it.** It copies the **newest earlier month's** income sources and (non-temporary) categories:
   - It copies names, amounts, order and `lineageId`.
   - It does **not** copy spending, transfers, corrections or temporary categories.
   - Skipped months are never created. Coming back in December after September copies September.

   *(Web: `ensureCurrentMonth` in `lib/finance/month-store.ts`)*
2. **Past months are for looking back.** New entries always go into the **current** month. When you view a past month, account balances are shown **as of that month's end**. *(Web: `loadMonthSnapshot`, `EntrySheet.tsx`)*
3. **History** shows the last **12** earlier months as totals (income, budget, spent, corrections), and **hides empty months**. *(Web: `loadHistory`)*

**Money and accounts**

4. **Account balance** =
   - opening balance
   - \+ income − spending
   - \+ transfers in − transfers out
   - \+ corrections
   - \+ debt effect: borrow and got-back **add**; lend and paid-back **subtract**

   *(Web: `selectAccounts` in `lib/finance/account-store.ts`, `accountEffect` in `debts.ts`)*
5. **No account may go below zero.** Every change that lowers a balance is refused if it would: spending, transfers, debts, editing income, removing a correction. *(Web: `overdrawnAccount` in `accounts.ts`)*
6. **No entries for future days.** `day` must be ≤ today. *(Web: `lastRecordableDay`)*
7. **Opening balance is locked** after the month the account was created. To fix it later, the user makes a **balance correction**. *(Web: `openingLocked`)*
8. **An account can't be removed** if it is used anywhere, or if its opening balance is locked and not zero. *(Web: `lib/finance/accounts.ts` line 12)*
9. **Account names are unique.** *(Web: `accountNameTaken` error)*

**Budget**

10. **Saving a section** (income, categories, accounts) sends the whole list:
    - rows with a known id are **updated**
    - rows without an id are **created**
    - rows missing from the list are **deleted**
    - completely empty rows are **dropped**
    - the order in the list becomes `sortOrder`

    *(Web: `planChanges` in `lib/finance/section-store.ts`)*
11. **Temporary categories** are added from the add-spending screen. They belong to **this month only**, have no budget, and are not copied forward. *(Web: `SpendCategory.temporary`)*

**Debts**

12. You **can't get back more** than the person owes you, and you **can't pay back more** than you owe. You can't delete a debt entry if later repayments depend on it. *(Web: `app/actions/debts.ts`: `debtGotBackTooMuch`, `debtPaidBackTooMuch`, `debtRepaidFirst`)*

**Settings**

13. **Clear all data** deletes everything and creates **one default account** again. *(Web: `clearAllData` in `app/actions/profile.ts`)*

---

## Backup file format

One JSON file, `hishab-backup.json`:

```json
{
  "app": "hishab",
  "formatVersion": 1,
  "exportedAt": 1762857600000,
  "settings": { "currency": "USD", "tourCompletedAt": null },
  "moneyAccounts": [],
  "budgetMonths": [],
  "incomeSources": [],
  "spendCategories": [],
  "expenses": [],
  "transfers": [],
  "balanceAdjustments": [],
  "debtPeople": [],
  "debtEntries": []
}
```

- Each list holds the table rows exactly as they are in the database.
- Raise `formatVersion` whenever the tables change, and teach `importAll()` to upgrade older files.
- Phone-only settings (mode, last backup time) are **not** in the file.
