/* =========================================================
   profile.js — SHARED LOGIC FOR THE FOUR PROFILE PAGES
   Used by: client_profile.html, courier_profile.html,
            staff_profile.html, admin_profile.html

   The four pages have the same form. Only the sidebar and
   the sample details (written in each HTML file) change.
   This script does the part that is the same for everyone:
     1. Load changes saved earlier
     2. Check the fields (same rules as the Register page)
     3. Save the changes and show a confirmation

   Needs js/validation.js (showError, clearAllErrors...)
   to be loaded first.

   Sprint 1 has no database, so changes are saved in the
   browser (localStorage key "cmsProfiles"), one entry per
   username. In Sprint 2 they will be saved in the USER table.
   ========================================================= */

const PROFILE_STORAGE_KEY = "cmsProfiles";

const profileForm = document.getElementById("profileForm");

// Each page writes the username on the form: <form data-username="diogo.silva">
const username = profileForm.dataset.username;

// The fields that can be edited and saved
const EDITABLE_FIELDS = ["fullName", "email", "phone", "nif"];


/* ---------------------------------------------------------
   1. LOAD CHANGES SAVED EARLIER
   All profiles are kept in one object:
     { "diogo.silva": { fullName: ..., email: ... }, "marta.ferreira": {...} }
   --------------------------------------------------------- */
function loadAllProfiles() {
    try {
        const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
        return saved === null ? {} : JSON.parse(saved);
    } catch (error) {
        return {};                                   // storage blocked: start empty
    }
}

function saveAllProfiles(profiles) {
    try {
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profiles));
        return true;
    } catch (error) {
        return false;
    }
}

// "Diogo Silva" -> "DS" (shown in the round avatar)
function getInitials(fullName) {
    const words = fullName.trim().split(" ");
    const first = words[0].charAt(0);
    const last = words[words.length - 1].charAt(0);
    return words.length > 1 ? first.concat(last).toUpperCase() : first.toUpperCase();
}

// Updates the name and initials at the top of the page
function updateHeader(fullName) {
    document.getElementById("profileName").textContent = fullName;
    document.getElementById("profileInitials").textContent = getInitials(fullName);
}

// If this user saved changes before, put them in the fields
// (otherwise the sample values written in the HTML stay).
function fillSavedProfile() {
    const savedProfile = loadAllProfiles()[username];
    if (savedProfile === undefined) {
        return;
    }
    EDITABLE_FIELDS.forEach(function (fieldId) {
        if (savedProfile[fieldId] !== undefined) {
            document.getElementById(fieldId).value = savedProfile[fieldId];
        }
    });
    updateHeader(savedProfile.fullName);
}


/* ---------------------------------------------------------
   2. CHECKS
   Same rules as register.js, so both pages agree.
   --------------------------------------------------------- */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;   // something@something.something
const NIF_PATTERN = /^[0-9]{9}$/;                     // exactly 9 digits
const PHONE_PATTERN = /^[29][0-9]{8}$/;               // 9 digits, starts with 2 or 9

// Checks a field against a pattern (used for email, NIF, phone)
function checkPattern(fieldId, pattern, emptyMessage, wrongMessage) {
    const value = document.getElementById(fieldId).value.trim();
    if (value.length === 0) {
        showError(fieldId, emptyMessage);
        return false;
    }
    if (!pattern.test(value)) {
        showError(fieldId, wrongMessage);
        return false;
    }
    return true;
}

// The password part is optional: it is only checked if the
// user started filling it in.
function wantsToChangePassword() {
    return ["currentPassword", "newPassword", "confirmPassword"].some(function (fieldId) {
        return document.getElementById(fieldId).value.length > 0;
    });
}

function checkPasswordChange() {
    const current = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirm = document.getElementById("confirmPassword").value;
    let isValid = true;

    if (current.length === 0) {
        showError("currentPassword", "Enter your current password.");
        isValid = false;
    }

    if (newPassword.length === 0) {
        showError("newPassword", "Enter a new password.");
        isValid = false;
    } else if (newPassword.length < 8) {
        showError("newPassword", "Password must contain at least 8 characters.");
        isValid = false;
    } else if (newPassword === current) {
        showError("newPassword", "The new password must be different from the current one.");
        isValid = false;
    }

    if (confirm.length === 0) {
        showError("confirmPassword", "Please confirm your new password.");
        isValid = false;
    } else if (confirm !== newPassword) {
        showError("confirmPassword", "Passwords do not match.");
        isValid = false;
    }

    return isValid;
}

function validateProfileForm() {
    clearAllErrors(profileForm);                          // validation.js
    let isValid = true;

    // One check per line, so every error appears at once
    if (!checkRequired("fullName", "Full name is required.")) { isValid = false; }
    if (!checkPattern("email", EMAIL_PATTERN, "Email is required.", "Please enter a valid email address.")) { isValid = false; }
    if (!checkPattern("phone", PHONE_PATTERN, "Phone number is required.", "Phone must have 9 digits and start with 2 or 9.")) { isValid = false; }
    if (!checkPattern("nif", NIF_PATTERN, "NIF is required.", "NIF must contain exactly 9 digits.")) { isValid = false; }

    if (wantsToChangePassword() && !checkPasswordChange()) {
        isValid = false;
    }
    return isValid;
}


/* ---------------------------------------------------------
   3. SAVE
   --------------------------------------------------------- */
clearErrorsWhileTyping(profileForm);                      // validation.js

profileForm.addEventListener("submit", function (event) {
    event.preventDefault();                               // don't reload the page

    const message = document.getElementById("successMessage");
    message.hidden = true;

    if (!validateProfileForm()) {
        const firstInvalid = profileForm.querySelector(".invalid");
        firstInvalid.focus();                             // jump to the first error
        return;
    }

    // Collect the edited values into one object
    const profile = {};
    EDITABLE_FIELDS.forEach(function (fieldId) {
        profile[fieldId] = document.getElementById(fieldId).value.trim();
    });

    // Passwords are not saved in the browser. In Sprint 2 the
    // server will check the current one and store the new one safely.
    const passwordChanged = wantsToChangePassword();

    const profiles = loadAllProfiles();
    profiles[username] = profile;
    saveAllProfiles(profiles);

    updateHeader(profile.fullName);

    message.textContent = passwordChanged
        ? "Profile and password updated successfully!"
        : "Profile updated successfully!";
    message.hidden = false;
    message.scrollIntoView({ behavior: "smooth", block: "center" });

    // Empty the password fields after saving
    ["currentPassword", "newPassword", "confirmPassword"].forEach(function (fieldId) {
        document.getElementById(fieldId).value = "";
    });
});

fillSavedProfile();
