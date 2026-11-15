
/* ==========================================
   CMS - REGISTER
   Form validation and role navigation
========================================== */

const nifInput = document.getElementById("reg-nif");

/* Allow only 9 numeric digits in NIF */

nifInput.addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "").slice(0, 9);
});

/* Validate Portuguese NIF */

function isValidNIF(nif) {

    if (!/^[1-9][0-9]{8}$/.test(nif)) {
        return false;
    }

    let sum = 0;

    for (let i = 0; i < 8; i++) {
        sum += Number(nif[i]) * (9 - i);
    }

    const remainder = sum % 11;
    const checkDigit = remainder < 2 ? 0 : 11 - remainder;

    return checkDigit === Number(nif[8]);
}

/* Register form */

document.getElementById("register-form")
    .addEventListener("submit", function (event) {

    event.preventDefault();

    let valid = true;

    /* Form fields */

    const fullName = document.getElementById("reg-name");
    const phone = document.getElementById("reg-phone");
    const username = document.getElementById("reg-username");
    const email = document.getElementById("reg-email");
    const nif = document.getElementById("reg-nif");
    const role = document.getElementById("reg-role");
    const password = document.getElementById("reg-password");
    const confirmPassword = document.getElementById("reg-confirm");

    const fields = [
        fullName,
        phone,
        username,
        email,
        nif,
        role,
        password,
        confirmPassword
    ];

    const message = document.getElementById("register-message");

    /* Clear previous validation messages */

    fields.forEach(function (field) {

        let error = document.getElementById(field.id + "-error");

        if (!error) {
            error = document.createElement("small");
            error.id = field.id + "-error";
            field.insertAdjacentElement("afterend", error);
        }

        error.classList.add("register-field-error");
        error.textContent = "";

        field.classList.remove("register-invalid");
    });

    if (message) {
        message.style.display = "none";
        message.replaceChildren();
    }

    /* Show red message under invalid field */

    function showError(field, text) {

        const error = document.getElementById(field.id + "-error");

        error.textContent = text;
        error.classList.add("register-field-error");

        field.classList.add("register-invalid");

        valid = false;
    }

    /* FULL NAME */

    if (fullName.value.trim().length < 2) {
        showError(
            fullName,
            "Please enter your full name."
        );
    }

    /* PHONE NUMBER */

    if (!/^[29][0-9]{8}$/.test(phone.value.trim())) {
        showError(
            phone,
            "Phone must have 9 digits and start with 2 or 9."
        );
    }

    /* USERNAME */

    if (username.value.trim() === "") {
        showError(
            username,
            "Username is required."
        );
    }

    /* EMAIL */

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email.value.trim() === "") {
        showError(
            email,
            "Email is required."
        );
    } else if (!emailPattern.test(email.value.trim())) {
        showError(
            email,
            "Please enter a valid email address."
        );
    }

    /* NIF */

    const nifValue = nif.value.trim();

    if (!/^[1-9][0-9]{8}$/.test(nifValue)) {
        showError(
            nif,
            "NIF must contain exactly 9 digits."
        );
    } else if (!isValidNIF(nifValue)) {
        showError(
            nif,
            "Please enter a valid Portuguese NIF."
        );
    }

    /* ROLE */

    if (role.value === "") {
        showError(
            role,
            "Please select a role."
        );
    }

    /* PASSWORD */

    if (password.value.trim() === "") {
        showError(
            password,
            "Password is required."
        );
    } else if (password.value.length < 8) {
        showError(
            password,
            "Password must contain at least 8 characters."
        );
    }

    /* CONFIRM PASSWORD */

    if (confirmPassword.value === "") {
        showError(
            confirmPassword,
            "Please confirm your password."
        );
    } else if (password.value !== confirmPassword.value) {
        showError(
            confirmPassword,
            "Passwords do not match."
        );
    }

    /* USERNAME AND EMAIL MUST BE NEW (accounts.js) */

    if (username.value.trim() !== "" && findAccount(username.value)) {
        showError(
            username,
            "This username is already taken."
        );
    }

    if (emailPattern.test(email.value.trim()) && findAccount(email.value)) {
        showError(
            email,
            "An account with this email already exists. Log in instead."
        );
    }

    /* STOP IF ANY FIELD IS INVALID */

    if (!valid) {
        return;
    }

    /* SUCCESS - SAVE THE ACCOUNT AND SHOW WHAT HAPPENS NEXT */

    const account = registerAccount({            // accounts.js
        username: username.value.trim(),
        name: fullName.value.trim(),
        email: email.value.trim(),
        phone: phone.value.trim(),
        nif: nifValue,
        role: role.value
    });

    showRegisterResult(account);
});


/* ==========================================
   AFTER REGISTERING
   The form is replaced by a box that explains
   the next step for each role:
   - Client:  account ready, log in now
   - Courier: Staff must approve the account
   - Staff:   the Admin must approve the account
   (the rules from the brief and the forum)
========================================== */

function showRegisterResult(account) {

    const form = document.getElementById("register-form");
    const result = document.getElementById("register-result");
    const icon = document.getElementById("result-icon");
    const title = document.getElementById("result-title");
    const text = document.getElementById("result-text");
    const steps = document.getElementById("result-steps");
    const actions = document.getElementById("result-actions");

    const firstName = account.name.split(" ")[0];

    if (account.role === "client") {

        icon.textContent = "✅";
        icon.className = "result-icon is-ready";
        title.textContent = "Welcome, " + firstName + "!";
        text.textContent =
            "Your client account is ready. Log in to place your " +
            "first order and follow it until it is delivered.";

        addSteps(steps, ["Registered", "Log in"], 1);
        addLink(actions, "Log in now", "login.html?user=" +
            encodeURIComponent(account.username), true);

    } else {

        const approver = account.role === "courier" ? "Staff" : "the Admin";
        const page = account.role === "courier"
            ? "Courier Approvals"
            : "Staff Approvals";

        icon.textContent = "⏳";
        icon.className = "result-icon is-waiting";
        title.textContent = "Account created, waiting for approval";
        text.textContent =
            "Thanks, " + firstName + "! " + capitalize(approver) +
            " will review your " + account.role + " account before you can log in. " +
            "Your request now appears on the " + page + " page.";

        addSteps(steps, ["Registered", "Approval by " + approver, "Log in"], 1);
        addLink(actions, "Back to home", "cms-home.html", true);
        addLink(actions, "Go to login", "login.html", false);
    }

    form.hidden = true;
    document.getElementById("register-login-link").hidden = true;
    result.hidden = false;
    result.scrollIntoView({ behavior: "smooth", block: "center" });
}

/* Steps list: the ones before "current" are done,
   "current" is highlighted, the rest are still to come */
function addSteps(list, names, current) {
    list.replaceChildren();
    names.forEach(function (name, index) {
        const item = document.createElement("li");
        item.textContent = (index < current ? "✓ " : "") + name;
        if (index < current) {
            item.className = "done";
        } else if (index === current) {
            item.className = "now";
        }
        list.append(item);
    });
}

function addLink(container, text, href, isPrimary) {
    const link = document.createElement("a");
    link.textContent = text;
    link.href = href;
    link.className = isPrimary ? "result-primary" : "result-secondary";
    container.append(link);
}

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}
