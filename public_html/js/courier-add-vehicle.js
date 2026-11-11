/* =========================================================
   courier-add-vehicle.js — LOGIC FOR courier-add-vehicle.html
   1. Check every field (all errors appear at once)
   2. Build the new vehicle object
   3. Save it with the other vehicles and confirm
   ========================================================= */

const vehicleForm = document.getElementById("vehicleForm");

// Remove a field's red error as soon as the user edits it (validation.js)
clearErrorsWhileTyping(vehicleForm);


/* ---------------------------------------------------------
   1. CHECKS
   --------------------------------------------------------- */

// Portuguese plate: 3 pairs of letters/numbers separated by "-"
// ^ start, [A-Z0-9]{2} two letters or digits, $ end
const PLATE_PATTERN = /^[A-Z0-9]{2}-[A-Z0-9]{2}-[A-Z0-9]{2}$/;

// Text of the plate field in capitals, e.g. "aa-12-bc" -> "AA-12-BC"
function getPlate() {
    return document.getElementById("plate").value.trim().toUpperCase();
}

function checkPlate() {
    const plate = getPlate();

    if (plate.length === 0) {
        showError("plate", "License plate is required.");
        return false;
    }
    if (!PLATE_PATTERN.test(plate)) {
        showError("plate", "Use the format AA-00-AA.");
        return false;
    }

    // The same plate can't be registered twice.
    // some() returns true if at least one vehicle matches.
    const alreadyExists = loadVehicles().some(function (vehicle) {
        return vehicle.plate === plate;
    });
    if (alreadyExists) {
        showError("plate", "This vehicle is already registered.");
        return false;
    }
    return true;
}

function validateVehicleForm() {
    clearAllErrors(vehicleForm);                          // validation.js
    let isValid = true;

    // Each check runs on its own line (no "&&"), so every
    // error is shown, not only the first one.
    if (!checkPlate()) { isValid = false; }
    if (!checkRequired("vehicleType", "Choose a vehicle type.")) { isValid = false; }
    if (!checkRequired("model", "Model is required.")) { isValid = false; }
    if (!checkPositiveNumber("maxWeight", "Max weight")) { isValid = false; }
    if (!checkPositiveNumber("maxVolume", "Max volume")) { isValid = false; }
    if (!checkFutureDate("insuranceDate")) { isValid = false; }
    if (!checkDocumentFile("insuranceDoc")) { isValid = false; }
    if (!checkFutureDate("inspectionDate")) { isValid = false; }
    if (!checkDocumentFile("inspectionDoc")) { isValid = false; }

    return isValid;
}

// Puts the cursor on the first field with an error
function focusFirstError() {
    const firstInvalid = vehicleForm.querySelector(".invalid");
    if (firstInvalid !== null) {
        firstInvalid.focus();
    }
}


/* ---------------------------------------------------------
   2 + 3. SUBMIT: BUILD, SAVE, CONFIRM
   --------------------------------------------------------- */
vehicleForm.addEventListener("submit", function (event) {
    event.preventDefault();                               // don't reload the page

    const message = document.getElementById("successMessage");
    message.hidden = true;

    if (!validateVehicleForm()) {
        focusFirstError();
        return;
    }

    // New vehicle, with the same fields as the sample data in vehicles.js.
    // The certificate files can't be stored without a server, so we keep
    // their names (Sprint 2 will upload the real files).
    const newVehicle = {
        plate: getPlate(),
        type: document.getElementById("vehicleType").value,
        model: document.getElementById("model").value.trim(),
        maxWeightKg: Number(document.getElementById("maxWeight").value),
        maxVolumeM3: Number(document.getElementById("maxVolume").value),
        insuranceExpiry: document.getElementById("insuranceDate").value,
        inspectionExpiry: document.getElementById("inspectionDate").value,
        insuranceFile: document.getElementById("insuranceDoc").files[0].name,
        inspectionFile: document.getElementById("inspectionDoc").files[0].name,
        approval: "pending"                               // always waits for Staff
    };

    const vehicles = loadVehicles();                      // vehicles.js
    vehicles.push(newVehicle);
    saveVehicles(vehicles);

    document.getElementById("successText").textContent =
        "Vehicle " + newVehicle.plate + " submitted. It will be available once Staff approve it.";
    message.hidden = false;
    message.scrollIntoView({ behavior: "smooth", block: "center" });

    vehicleForm.reset();
});
