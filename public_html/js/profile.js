/* =========================================================
   profile.js — SHARED LOGIC FOR THE FOUR PROFILE PAGES
   Used by: client_profile.html, courier_profile.html,
            staff_profile.html, admin_profile.html

   The four pages have the same form. Only the sidebar and
   the sample details change.
   This script does the part that is the same for everyone:
     1. Load changes saved earlier
     2. Check the fields (same rules as the Register page)
     3. Save the changes and show a confirmation
     4. Profile photo: add, change or remove it

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

// Updates the name and the round avatar at the top of the page
// (refreshAvatars() is in section 4)
function updateHeader(fullName) {
    document.getElementById("profileName").textContent = fullName;
    refreshAvatars();
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

    showSuccessMessage("successMessage", passwordChanged   // validation.js
        ? "Profile and password updated successfully!"
        : "Profile updated successfully!");
    message.scrollIntoView({ behavior: "smooth", block: "center" });

    // Empty the password fields after saving
    ["currentPassword", "newPassword", "confirmPassword"].forEach(function (fieldId) {
        document.getElementById(fieldId).value = "";
    });
});



/* ---------------------------------------------------------
   4. PROFILE PHOTO
   How it works:
     a. The camera button (or "Change photo") opens the
        hidden <input type="file">.
     b. We check the file (type and size).
     c. The photo is cropped to a square and made small
        (256 x 256 px) with a <canvas>, so it takes little space.
     d. It is saved as text (a "data URL") in localStorage,
        key "cmsProfilePhotos", one photo per username:
          { "diogo.silva": "data:image/jpeg;base64,..." }
        It has its own key so that saving the form (section 3)
        never deletes the photo.
     e. The avatar on this page and in the top bar show it.
   In Sprint 2 the photo will be uploaded to the server.
   --------------------------------------------------------- */
const PHOTO_STORAGE_KEY = "cmsProfilePhotos";
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const PHOTO_MAX_MB = 5;          // bigger files are refused
const PHOTO_SIZE = 256;          // saved photo: 256 x 256 pixels

const photoInput = document.getElementById("photoInput");
const removePhotoButton = document.getElementById("removePhotoButton");

function loadAllPhotos() {
    try {
        return JSON.parse(localStorage.getItem(PHOTO_STORAGE_KEY) || "{}");
    } catch (error) {
        return {};
    }
}

// The photo of this user, or null if there is none
function loadPhoto() {
    const photo = loadAllPhotos()[username];
    return photo === undefined ? null : photo;
}

// Saves (or, with null, removes) this user's photo.
// Returns false if the browser couldn't save it.
function savePhoto(photo) {
    const photos = loadAllPhotos();
    if (photo === null) {
        delete photos[username];
    } else {
        photos[username] = photo;
    }
    try {
        localStorage.setItem(PHOTO_STORAGE_KEY, JSON.stringify(photos));
        return true;
    } catch (error) {
        return false;                                  // storage full or blocked
    }
}

// Shows either the photo or the initials inside one round avatar
function showAvatar(avatar, initials, photo) {
    avatar.replaceChildren();                          // empty it
    if (photo === null) {
        avatar.textContent = initials;
        avatar.classList.remove("has-photo");
    } else {
        const image = document.createElement("img");
        image.setAttribute("src", photo);
        image.setAttribute("alt", "");                 // the name is already written next to it
        avatar.append(image);
        avatar.classList.add("has-photo");
    }
}

// Updates every avatar of this user: the big one on this page and
// the small one in the top bar. Also shows "Remove photo" only
// when there is a photo to remove.
function refreshAvatars() {
    const initials = getInitials(document.getElementById("profileName").textContent);
    const photo = loadPhoto();

    showAvatar(document.getElementById("profileInitials"), initials, photo);
    document.querySelectorAll(".topbar-avatar").forEach(function (avatar) {
        showAvatar(avatar, initials, photo);
    });
    removePhotoButton.hidden = photo === null;
}

// Crops the picture to a square in the middle and shrinks it.
// When it's ready, calls whenDone(photo) with the result.
function makeSquarePhoto(file, whenDone, whenFailed) {
    const image = new Image();
    const fileAddress = URL.createObjectURL(file);     // temporary address for the chosen file

    image.addEventListener("load", function () {
        const side = Math.min(image.naturalWidth, image.naturalHeight);
        const left = (image.naturalWidth - side) / 2;
        const top = (image.naturalHeight - side) / 2;

        const canvas = document.createElement("canvas");
        canvas.width = PHOTO_SIZE;
        canvas.height = PHOTO_SIZE;
        const drawing = canvas.getContext("2d");
        drawing.fillStyle = "#FFFFFF";                 // white behind transparent PNGs
        drawing.fillRect(0, 0, PHOTO_SIZE, PHOTO_SIZE);
        // copy the square from the middle of the photo into the canvas
        drawing.drawImage(image, left, top, side, side, 0, 0, PHOTO_SIZE, PHOTO_SIZE);

        URL.revokeObjectURL(fileAddress);              // free the temporary address
        whenDone(canvas.toDataURL("image/jpeg", 0.85));
    });

    image.addEventListener("error", function () {
        URL.revokeObjectURL(fileAddress);
        whenFailed();
    });

    image.src = fileAddress;
}

// a. Both buttons open the file picker
document.getElementById("changePhotoButton").addEventListener("click", function () {
    photoInput.click();
});
document.getElementById("choosePhotoLink").addEventListener("click", function () {
    photoInput.click();
});

// b-e. A file was chosen
photoInput.addEventListener("change", function () {
    clearError("photoInput");                          // validation.js
    const file = photoInput.files[0];
    photoInput.value = "";                             // so the same file can be chosen again
    if (file === undefined) {
        return;                                        // the user pressed Cancel
    }

    if (!PHOTO_TYPES.includes(file.type)) {
        showError("photoInput", "Please choose a JPG, PNG or WEBP image.");
        return;
    }
    if (file.size > PHOTO_MAX_MB * 1024 * 1024) {
        showError("photoInput", "The image is too big. Choose one under " + PHOTO_MAX_MB + " MB.");
        return;
    }

    makeSquarePhoto(file, function (photo) {
        if (!savePhoto(photo)) {
            showError("photoInput", "The photo couldn't be saved in this browser.");
            return;
        }
        refreshAvatars();
        showSuccessMessage("successMessage", "Profile photo updated!");
    }, function () {
        showError("photoInput", "This image couldn't be opened. Try another one.");
    });
});

// Remove the photo: the initials come back
removePhotoButton.addEventListener("click", function () {
    clearError("photoInput");
    savePhoto(null);
    refreshAvatars();
    showSuccessMessage("successMessage", "Profile photo removed.");
});


/* ---------------------------------------------------------
   START
   --------------------------------------------------------- */
fillSavedProfile();
refreshAvatars();
