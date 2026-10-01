## Reen Bank

A responsive, front-end banking demo built with **HTML, Tailwind CSS and JavaScript**. All data lives in the `browser's localStorage`, so no backend is needed to try the full flow: register, verify, fund, withdraw, track transactions and manage a profile.

---

**Pages**

| Page | Purpose |
|---|---|
| index.html | Landing page: services, FAQs, sign-up email capture |
| register.html | Sign-up form, OTP verification popup, success screen |
| login.html | Login checked against the registered user |
| dashboard.html | Overview: balances, accounts, statistics, transactions, notifications |
| accounts.html | Fund, withdraw and add accounts, with a transaction list |
| transactions.html | Full transaction list, filtered by account, with search |
| profile.html | User details, photo, phone, gender, password reset, logout |

**Project files**

| File | Role |
|---|---|
| store.js | Shared data layer. Load it **before** every other script |
| script.js | Landing page, register, OTP countdown, login |
| dashboard.js | Overview, accounts and transactions pages |
| profile.js | Profile page, logout modal, reset-password overlays |

Script order on each page: store.js, then the page's own script.

---

**Features**

**Register and login**
- Details are saved only after the OTP step is completed.
- A random 10-digit account number is generated.
- The OTP countdown runs from 0:59 and becomes a "Resend code" link at 0:00.
- Duplicate emails are rejected. Login checks the saved email and password.

**Overview**
- Balances are hidden (`*****`) until the eye icon is toggled.
- The date dropdown shows this month and the previous two.
- Income, expense and the statistics bars are calculated from real transactions.
- Notifications are recorded for every transaction, starting with a welcome message.
- The `+` button leads to the Accounts page.

**Accounts**
- Default accounts: Main Account, Savings and Plan.
- Fund by Direct Pay or Credit Card, or withdraw to another account. Withdrawals are blocked when the balance is too low.
- New accounts are saved and appear on every page.

**Transactions**
- Cards filter the list by account, and the search box matches name, type, status, amount and date.

**Profile**
- Photo upload (resized before saving), editable phone and gender.
- Reset password flow: email, OTP, new password, confirmation. The new password replaces the saved one.
- Logout modal.

Every page has mobile and desktop layouts.

---

**Data model (`localStorage`)**

| Key | Contents |
|---|---|
| reen_user | { name, email, password, accountNumber } |
| reen_accounts | Balance per account name |
| reen_extra_accounts | Accounts added by the user, with description |
| reen_transactions | Newest first: name, type, amount, status, account, timestamp |
| reen_notifications | Newest first, capped at 50 |
| reen_notif_unread | Controls the red notification dot |
| reen_user_image | Profile photo (data URL); empty means the person icon |
| reen_user_phone, reen_user_gender | Profile fields |

Registering again clears all of the above for a fresh start.

**How balances work**

- Funding adds to an account and counts as **income**.
- Withdrawing subtracts from it and counts as **expense**.
- **Current Balance** is the total of all accounts.
- Overview, Accounts, Transactions and Profile all read the same stored values.

---

**Known limitations**

This is a front-end demo, so it must not be used with real money or real credentials.

- Passwords are saved as plain text in `localStorage`. A real app needs a backend and hashed passwords.
- OTP codes are not verified. Any six digits pass.
- Only one user is stored per browser.
- Anyone with browser dev tools can edit balances and transactions.
- Clearing browser data erases the account.

**Developed by Akanmu Qodri Adeniyi**
**Github = Analysisbuilds**
**Linkedin = Qodri Akanmu**




