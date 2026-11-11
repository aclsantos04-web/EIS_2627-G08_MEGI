/* =========================================================
   validation.js — SHARED FORM CHECKS
   Works with this HTML pattern (from style.css):

     <div class="form-group">
         <label for="plate">License plate *</label>
         <input id="plate">
         <span class="error-message" id="plate-error"></span>
     </div>

   The error <span> must have the field's id + "-error".
   Each check returns true (OK) or false (and shows the error).
   Any page can use it: add <script src="js/validation.js">
   before the page's own script.
   ========================================================= */


/* ---------- Show / clear errors ---------- */

function showError(fieldId, message) {
    document.getElementById(fieldId).classList.add("invalid");
    document.getElementById(fieldId + "-error").textContent = message;
}

function clearError(fieldId) {
    document.getElementById(fieldId).classList.remove("invalid");
    document.getElementById(fieldId + "-error").textContent = "";
}

// Clears every error inside one form
function clearAllErrors(form) {
    form.querySelectorAll(".invalid").forEach(function (field) {
        field.classList.remove("invalid");
    });
    form.querySelectorAll(".error-message").forEach(function (message) {
        message.textContent = "";
    });
}

// Removes a field's error as soon as the user changes it
function clearErrorsWhileTyping(form) {
    form.querySelectorAll("input, select, textarea").forEach(function (field) {
        if (field.id === "") {
            return;
        }
        field.addEventListener("input", function () { clearError(field.id); });
        field.addEventListener("change", function () { clearError(field.id); });
    });
}


/* ---------- Checks ---------- */

// Not empty (only spaces also counts as empty)
function checkRequired(fieldId, message) {
    const value = document.getElementById(fieldId).value.trim();
    if (value.length === 0) {
        showError(fieldId, message);
        return false;
    }
    return true;
}

// A number greater than zero (weight, volume, quantity)
function checkPositiveNumber(fieldId, label) {
    const text = document.getElementById(fieldId).value.trim();
    if (text.length === 0) {
        showError(fieldId, label + " is required.");
        return false;
    }
    const number = Number(text);
    if (!Number.isFinite(number) || number <= 0) {
        showError(fieldId, label + " must be greater than zero.");
        return false;
    }
    return true;
}

// A number between min and max (e.g. latitude -90..90, longitude -180..180)
function checkNumberInRange(fieldId, label, min, max) {
    const text = document.getElementById(fieldId).value.trim();
    if (text.length === 0) {
        showError(fieldId, label + " is required.");
        return false;
    }
    const number = Number(text);
    if (!Number.isFinite(number) || number < min || number > max) {
        showError(fieldId, label + " must be a number between " + min + " and " + max + ".");
        return false;
    }
    return true;
}

// A date after today (expiry dates). Uses daysUntil() from vehicles.js.
function checkFutureDate(fieldId) {
    const value = document.getElementById(fieldId).value;
    if (value.length === 0) {
        showError(fieldId, "Expiry date is required.");
        return false;
    }
    if (daysUntil(value) <= 0) {
        showError(fieldId, "The expiry date must be after today.");
        return false;
    }
    return true;
}

// A file was chosen and it is a PDF, JPG or PNG
function checkDocumentFile(fieldId) {
    const files = document.getElementById(fieldId).files;
    if (files.length === 0) {
        showError(fieldId, "Please upload the certificate.");
        return false;
    }
    const extension = files[0].name.split(".").pop().toLowerCase();
    const allowed = ["pdf", "jpg", "jpeg", "png"];
    if (!allowed.includes(extension)) {
        showError(fieldId, "Only PDF, JPG or PNG files are accepted.");
        return false;
    }
    return true;
}
