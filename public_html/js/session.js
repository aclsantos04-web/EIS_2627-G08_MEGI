/* =========================================================
   session.js — WHO IS LOGGED IN
   Needs js/accounts.js to be loaded first.

   1. Logging in (login.js) saves the username in localStorage
      ("cmsSession"). Opening the login page (Log out) clears it.
   2. Every logged-in page asks getPageUser("client" | "courier" |
      "staff" | "admin") for "the user of this page":
        - the logged-in user, if they have that role
        - otherwise the demo user of that role, so pages opened
          directly (e.g. from the Evaluation Index) still work
   3. The demo users keep their sample data (orders, products,
      vehicles). Anyone who registers starts with empty lists.

   In Sprint 2 the server will keep the session (a cookie) and
   check the password; here we only remember the username.
   ========================================================= */

const SESSION_KEY = "cmsSession";

// The demo account of each role (the one with the sample data)
const DEMO_USERNAMES = {
    client: "marta.ferreira",
    courier: "diogo.silva",
    staff: "rita.almeida",
    admin: "admin"
};


/* ---------- 1. Start / end the session ---------- */

function startSession(username) {
    try {
        localStorage.setItem(SESSION_KEY, username);
    } catch (error) {
        // storage blocked: the demo users are used instead
    }
}

function endSession() {
    try {
        localStorage.removeItem(SESSION_KEY);
    } catch (error) {
        // nothing to clear
    }
}

// The logged-in account, or null
function getSessionAccount() {
    let username = null;
    try {
        username = localStorage.getItem(SESSION_KEY);
    } catch (error) {
        return null;
    }
    if (!username) {
        return null;
    }
    const account = findAccount(username);                         // accounts.js
    if (account === undefined || getAccountStatus(account) !== "approved") {
        return null;                                               // deleted, pending or rejected
    }
    return account;
}


/* ---------- 2. The user of this page ---------- */

function getPageUser(role) {
    const account = getSessionAccount();
    if (account !== null && account.role === role) {
        return account;
    }
    return findAccount(DEMO_USERNAMES[role]);                      // the demo user
}

// true when the page shows the demo user (who has sample data)
function isDemoUser(role) {
    return getPageUser(role).username === DEMO_USERNAMES[role];
}


/* ---------- 3. Data that belongs to each user ----------
   The demo user keeps the original key (so the sample data and
   anything saved before still works); everyone else gets their
   own key, e.g. "cmsProducts_ana.santos". */

function userStorageKey(baseKey, role) {
    const user = getPageUser(role);
    return user.username === DEMO_USERNAMES[role] ? baseKey : baseKey + "_" + user.username;
}
