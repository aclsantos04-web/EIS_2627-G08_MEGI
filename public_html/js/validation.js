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


/* ---------- Confirmation message ----------
   Shows a green message with a close button (×) in a box like:
     <p class="success-message" id="successMessage" role="status" hidden></p>
   The box can also hold a link: put <span class="success-text"></span>
   before it, and the text goes in that span.
   The message closes by itself after 8 seconds. */
function showSuccessMessage(boxId, text) {
    const box = document.getElementById(boxId);

    // The part that holds the text (created the first time)
    let textPart = box.querySelector(".success-text");
    if (textPart === null) {
        textPart = document.createElement("span");
        textPart.classList.add("success-text");
        box.prepend(textPart);
    }
    textPart.textContent = text;

    // The × button (created the first time)
    if (box.querySelector(".message-close") === null) {
        const closeButton = document.createElement("button");
        closeButton.type = "button";
        closeButton.classList.add("message-close");
        closeButton.setAttribute("aria-label", "Close message");
        closeButton.textContent = "×";
        closeButton.addEventListener("click", function () {
            box.hidden = true;
        });
        box.append(closeButton);
    }

    box.hidden = false;

    // Close automatically after 8 seconds. clearTimeout() cancels an
    // earlier timer, so a second message gets its full 8 seconds.
    clearTimeout(box.hideTimer);
    box.hideTimer = setTimeout(function () {
        box.hidden = true;
    }, 8000);
}


/* ---------- Empty states ---------- */
/* Builds a friendly "nothing here" message (styles: style.css, section 14):
   an icon, a title, a sentence and, optionally, a button.
   button = { text: "...", href: "..." } for a link,
            or { text: "...", onClick: function } for an action. */
function createEmptyState(iconName, title, text, button) {
    const box = document.createElement("div");
    box.classList.add("empty-state");

    const iconCircle = document.createElement("span");
    iconCircle.classList.add("empty-state-icon");
    const icon = document.createElement("i");
    icon.className = "ti " + iconName;
    icon.setAttribute("aria-hidden", "true");
    iconCircle.append(icon);

    const heading = document.createElement("h3");
    heading.textContent = title;
    const sentence = document.createElement("p");
    sentence.textContent = text;
    box.append(iconCircle, heading, sentence);

    if (button !== undefined) {
        const action = document.createElement(button.href ? "a" : "button");
        action.className = "btn btn-primary btn-small";
        action.textContent = button.text;
        if (button.href) {
            action.href = button.href;
        } else {
            action.type = "button";
            action.addEventListener("click", button.onClick);
        }
        box.append(action);
    }
    return box;
}

// One table row with the empty state across all the columns
function createEmptyRow(columns, emptyState) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.setAttribute("colspan", String(columns));
    cell.append(emptyState);
    row.append(cell);
    return row;
}
