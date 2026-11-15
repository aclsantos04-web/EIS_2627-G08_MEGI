/* =========================================================
   login.js — LOGIN FORM
   1. Check the fields are filled in (validation)
   2. Find the account (username or email) in accounts.js
   3. Pending or rejected accounts can't come in yet
   4. Everyone else goes to their role's area

   Sprint 1 has no server, so any password is accepted for
   the demo accounts. In Sprint 2 the server will check the
   password against password_hash in the USER table.
   Needs js/accounts.js to be loaded first.
   ========================================================= */

const loginForm = document.getElementById("login-form");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const usernameError = document.getElementById("username-error");
const passwordError = document.getElementById("password-error");
const loginMessage = document.getElementById("login-message");


/* ---------- Small helpers ---------- */

function showFieldError(input, errorElement, text) {
    errorElement.textContent = text;
    input.classList.add("input-error");
}

function clearLoginErrors() {
    usernameError.textContent = "";
    passwordError.textContent = "";
    usernameInput.classList.remove("input-error");
    passwordInput.classList.remove("input-error");
    loginMessage.textContent = "";
    loginMessage.style.display = "none";
}

function showLoginMessage(text) {
    loginMessage.textContent = text;
    loginMessage.style.display = "block";
}

// Errors disappear as soon as the user starts typing again
[usernameInput, passwordInput].forEach(function (input) {
    input.addEventListener("input", clearLoginErrors);
});


/* ---------- Coming back from Register ----------
   register.js sends new clients here with ?user=their.username,
   so the username is already filled in. */
const sentUsername = new URLSearchParams(window.location.search).get("user");
if (sentUsername) {
    usernameInput.value = sentUsername;
    passwordInput.focus();
}


/* ---------- Submit ---------- */

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();                     // don't reload the page
    clearLoginErrors();

    // 1. Required fields (every error shows at once)
    let valid = true;
    if (usernameInput.value.trim() === "") {
        showFieldError(usernameInput, usernameError, "Email or username is required.");
        valid = false;
    }
    if (passwordInput.value.trim() === "") {
        showFieldError(passwordInput, passwordError, "Password is required.");
        valid = false;
    }
    if (!valid) {
        return;
    }

    // 2. Does the account exist?
    const account = findAccount(usernameInput.value);            // accounts.js
    if (account === undefined) {
        showFieldError(usernameInput, usernameError,
            "No account found with this email or username. Try a demo account below.");
        return;
    }

    // 3. Waiting for approval, or rejected?
    const status = getAccountStatus(account);                     // accounts.js
    if (status === "pending") {
        const approver = account.role === "staff" ? "the Admin" : "Staff";
        showLoginMessage("Your " + ROLE_NAMES[account.role].toLowerCase() +
            " account is waiting for approval by " + approver +
            ". You can log in as soon as it is approved.");
        return;
    }
    if (status === "rejected") {
        showLoginMessage("This account was not approved. Please contact CMS support.");
        return;
    }

    // 4. Go to the role's area
    window.location.href = ROLE_HOME[account.role];
});
