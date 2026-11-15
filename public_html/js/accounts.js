/* =========================================================
   accounts.js — USERS, DEMO LOGIN AND ACCOUNT APPROVALS
   Used by: login.html, register.html,
            staff_courier_approvals.html (Staff validates couriers),
            admin-staff.html (Admin validates staff),
            admin_dashboard.html and the top bar (pending counts)

   ONE list of people for the whole site, so every page tells
   the same story:
     Marta Ferreira  client   (marta.ferreira)
     Diogo Silva     courier  (diogo.silva)
     Rita Almeida    staff    (rita.almeida)
     Carlos Pinto    admin    (admin)
   plus other couriers and the accounts still waiting for
   approval.

   Sprint 1 has no database, so:
     - new registrations are kept in localStorage ("cmsAccounts")
     - Staff decisions about couriers in "cmsCourierDecisions"
     - Admin decisions about staff are saved by admin-staff.js
       in "cmsStaffApprovalDecisions" (we only read them here)
   In Sprint 2 all of this becomes the USER table.
   ========================================================= */


/* ---------------------------------------------------------
   1. WHERE EACH ROLE STARTS AFTER LOGGING IN
   --------------------------------------------------------- */
const ROLE_HOME = {
    client: "my-orders.html",
    courier: "courier-available-orders.html",
    staff: "staff_courier_approvals.html",
    admin: "admin_dashboard.html"
};

const ROLE_NAMES = {
    client: "Client",
    courier: "Courier",
    staff: "Staff",
    admin: "Admin"
};


/* ---------------------------------------------------------
   2. SAMPLE USERS (one object = one row of the USER table)
   status: "approved" | "pending" | "rejected"
   requestId: only for Staff requests (the id used on
              admin-staff.html, e.g. "STAFF-001")
   --------------------------------------------------------- */
const SAMPLE_ACCOUNTS = [
    // The four demo accounts (one per role)
    { username: "marta.ferreira", name: "Marta Ferreira", email: "marta.ferreira@email.pt", role: "client",  phone: "912345678", nif: "245678905", status: "approved", registered: "2026-09-02" },
    { username: "diogo.silva",    name: "Diogo Silva",    email: "diogo.silva@email.pt",    role: "courier", phone: "936123456", nif: "234567899", status: "approved", registered: "2026-09-15" },
    { username: "rita.almeida",   name: "Rita Almeida",   email: "rita.almeida@cms.pt",     role: "staff",   phone: "225081400", nif: "213456788", status: "approved", registered: "2026-09-01" },
    { username: "admin",          name: "Carlos Pinto",   email: "admin@cms.pt",            role: "admin",   phone: "225081401", nif: "198765436", status: "approved", registered: "2026-09-01" },

    // Other clients (their orders appear in Available Orders)
    { username: "carlos.mendes",  name: "Carlos Mendes",  email: "carlos.mendes@email.pt",  role: "client",  status: "approved", registered: "2026-10-06" },

    // Other approved couriers (their vehicles appear on the Staff pages)
    { username: "beatriz.costa",  name: "Beatriz Costa",  email: "beatriz.costa@email.pt",  role: "courier", status: "approved", registered: "2026-09-20" },
    { username: "rui.mendes",     name: "Rui Mendes",     email: "rui.mendes@email.pt",     role: "courier", status: "approved", registered: "2026-09-24" },
    { username: "sara.lima",      name: "Sara Lima",      email: "sara.lima@email.pt",      role: "courier", status: "approved", registered: "2026-09-28" },

    // Couriers waiting for Staff (Staff → Courier Approvals)
    { username: "tiago.ferreira", name: "Tiago Ferreira", email: "tiago.ferreira@hotmail.com", role: "courier", status: "pending", registered: "2026-10-18" },
    { username: "ines.santos",    name: "Inês Santos",    email: "ines.santos@outlook.com",    role: "courier", status: "pending", registered: "2026-10-22" },
    { username: "miguel.rocha",   name: "Miguel Rocha",   email: "miguel.rocha@yahoo.com",     role: "courier", status: "pending", registered: "2026-10-25" },

    // Staff waiting for the Admin (Admin → Staff Approvals)
    { username: "joao.silva",  name: "João Silva",  email: "joao.silva@cms.com",  role: "staff", status: "pending", registered: "2026-11-10", requestId: "STAFF-001" },
    { username: "maria.lopes", name: "Maria Lopes", email: "maria.lopes@cms.com", role: "staff", status: "pending", registered: "2026-11-10", requestId: "STAFF-002" },
    { username: "pedro.costa", name: "Pedro Costa", email: "pedro.costa@cms.com", role: "staff", status: "pending", registered: "2026-11-11", requestId: "STAFF-003" },
    { username: "ana.ribeiro", name: "Ana Ribeiro", email: "ana.ribeiro@cms.com", role: "staff", status: "pending", registered: "2026-11-11", requestId: "STAFF-004" }
];


/* ---------------------------------------------------------
   3. READING AND SAVING (localStorage)
   readStored / writeStored wrap localStorage in try/catch:
   if the browser blocks storage, the site still works with
   the sample data.
   --------------------------------------------------------- */
function readStored(key, emptyValue) {
    try {
        const saved = localStorage.getItem(key);
        return saved === null ? emptyValue : JSON.parse(saved);
    } catch (error) {
        return emptyValue;
    }
}

function writeStored(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        return false;
    }
}

// Accounts created on the Register page
function loadRegisteredAccounts() {
    return readStored("cmsAccounts", []);
}

/* ---------------------------------------------------------
   PROFILE CHANGES: ONE PLACE FOR EVERY PAGE
   When a user edits their Profile, or the Admin edits a user on
   Admin > Users, the change is saved in ONE place: "cmsProfiles",
   one entry per username: { fullName, email, phone, nif }.
   getAllAccounts() puts those changes on top of the account, so
   every page (top bar, profile, Admin > Users, Staff lists, orders)
   shows the same, latest details. There is never a second copy.
   --------------------------------------------------------- */
const PROFILE_CHANGES_KEY = "cmsProfiles";

// The account with its saved profile changes applied
function applyProfileChanges(account) {
    const changes = readStored(PROFILE_CHANGES_KEY, {})[account.username];
    if (!changes) {
        return account;
    }
    return Object.assign({}, account, {
        name: changes.fullName || account.name,
        email: changes.email || account.email,
        phone: changes.phone || account.phone,
        nif: changes.nif || account.nif
    });
}

// Saves changes to a user's details. Only the fields given are changed:
// saveProfileChanges("marta.ferreira", { fullName: "Marta F.", email: "..." })
function saveProfileChanges(username, changes) {
    const all = readStored(PROFILE_CHANGES_KEY, {});
    all[username] = Object.assign({}, all[username] || {}, changes);
    writeStored(PROFILE_CHANGES_KEY, all);
}

// Is this email already used by a DIFFERENT account? (emails must be unique,
// because users can log in with their email)
function emailTakenByOther(email, username) {
    const owner = findAccount(email);
    return owner !== undefined && owner.username !== username;
}

// Sample users + registered users, in one list (with their profile changes)
function getAllAccounts() {
    return SAMPLE_ACCOUNTS.concat(loadRegisteredAccounts()).map(applyProfileChanges);
}

// Finds an account by username OR email (capital letters don't matter)
function findAccount(usernameOrEmail) {
    const text = usernameOrEmail.trim().toLowerCase();
    return getAllAccounts().find(function (account) {
        return account.username.toLowerCase() === text || account.email.toLowerCase() === text;
    });
}

// Saves a new registration. Clients can start right away;
// couriers wait for Staff and staff wait for the Admin.
function registerAccount(details) {
    const accounts = loadRegisteredAccounts();
    const account = {
        username: details.username,
        name: details.name,
        email: details.email,
        phone: details.phone,
        nif: details.nif,
        role: details.role,
        status: details.role === "client" ? "approved" : "pending",
        registered: new Date().toISOString().slice(0, 10)
    };
    if (account.role === "staff") {
        account.requestId = "REG-" + account.username;    // its row on admin-staff.html
    }
    accounts.push(account);
    writeStored("cmsAccounts", accounts);
    return account;
}


/* ---------------------------------------------------------
   4. APPROVAL STATUS
   The status written in the list above can be changed later:
     - a courier by Staff  (saved in "cmsCourierDecisions")
     - a staff member by the Admin (saved by admin-staff.js)
   --------------------------------------------------------- */
function getAccountStatus(account) {
    if (account.role === "courier") {
        const decisions = readStored("cmsCourierDecisions", {});
        return decisions[account.username] || account.status;
    }
    if (account.role === "staff" && account.requestId) {
        const decisions = readStored("cmsStaffApprovalDecisions", {});
        const decision = decisions[account.requestId];
        if (decision && decision.currentStatus) {
            return decision.currentStatus;
        }
    }
    return account.status;
}

// Called by the Staff page when a courier is approved or rejected
function saveCourierDecision(username, status) {
    const decisions = readStored("cmsCourierDecisions", {});
    decisions[username] = status;
    writeStored("cmsCourierDecisions", decisions);
}

// Couriers still waiting for Staff (sample + newly registered)
function getPendingCouriers() {
    return getAllAccounts().filter(function (account) {
        return account.role === "courier" && getAccountStatus(account) === "pending";
    });
}

// Staff still waiting for the Admin
function getPendingStaff() {
    return getAllAccounts().filter(function (account) {
        return account.role === "staff" && account.requestId && getAccountStatus(account) === "pending";
    });
}


/* ---------------------------------------------------------
   5. ADMIN → STAFF APPROVALS: ROWS FOR NEW REGISTRATIONS
   admin-staff.html already has rows for the sample requests.
   This adds one row for each staff member who registered on
   this browser, copying the first row so it looks the same.
   It must run BEFORE admin-staff.js (which reads the rows).
   --------------------------------------------------------- */
function addRegisteredStaffRows() {
    const table = document.getElementById("staffTable");
    if (table === null || table.querySelector("tr") === null) {
        return;
    }
    const template = table.querySelector("tr");

    loadRegisteredAccounts().forEach(function (account) {
        if (account.role !== "staff") {
            return;
        }
        const row = template.cloneNode(true);
        row.dataset.requestId = account.requestId;
        row.dataset.status = "pending";
        row.dataset.username = account.username;
        row.dataset.nif = account.nif || "—";

        const words = account.name.trim().split(" ");
        row.querySelector(".staff-avatar").textContent =
            (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
        row.querySelector(".staff-user strong").textContent = account.name;
        row.children[1].textContent = account.email;
        row.children[2].textContent = formatDateText(account.registered);
        row.querySelector(".approval-actions").replaceChildren();
        table.append(row);
    });
}

// "2026-11-14" -> "14/11/2026"
function formatDateText(dateText) {
    const parts = dateText.split("-");
    return parts[2] + "/" + parts[1] + "/" + parts[0];
}


/* ---------------------------------------------------------
   6. RESET THE DEMO
   Type resetDemo() in the browser console (F12) before a
   presentation: every cms... key is removed, so all pages go
   back to the sample data.
   --------------------------------------------------------- */
function resetDemo() {
    try {
        Object.keys(localStorage).forEach(function (key) {
            if (key.indexOf("cms") === 0) {
                localStorage.removeItem(key);
            }
        });
    } catch (error) {
        // storage blocked: nothing was saved anyway
    }
}
