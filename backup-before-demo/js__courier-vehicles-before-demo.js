/* =========================================================
   courier-vehicles.js — LOGIC FOR courier-vehicles.html
   1. Load the vehicles
   2. Small builders (badge, table cell)
   3. Draw the table
   4. Draw the document warnings
   5. "Update documents" pop-up: open, check, save
   ========================================================= */


/* ---------------------------------------------------------
   1. LOAD THE VEHICLES (loadVehicles is in vehicles.js)
   --------------------------------------------------------- */
let vehicles = loadVehicles();

// Which vehicle the pop-up is editing (its position in the list)
let selectedVehicleIndex = null;

// Text and colour for each approval value
const APPROVAL_LABELS = {
    approved: { text: "Approved", type: "success" },
    pending:  { text: "Pending",  type: "warning" },
    denied:   { text: "Denied",   type: "danger" }
};


/* ---------------------------------------------------------
   2. SMALL BUILDERS
   They create elements with createElement() and fill them
   with textContent (safe: text is never read as HTML).
   --------------------------------------------------------- */

// <span class="badge badge-success">Valid</span>
function createBadge(text, type) {
    const badge = document.createElement("span");
    badge.classList.add("badge", "badge-" + type);
    badge.textContent = text;
    return badge;
}

// <td><strong>main</strong><br><span class="text-muted">second line</span></td>
function createCell(mainText, secondLine) {
    const cell = document.createElement("td");

    const main = document.createElement("strong");
    main.textContent = mainText;
    cell.append(main);

    if (secondLine !== undefined) {
        const sub = document.createElement("span");
        sub.classList.add("text-muted");
        sub.textContent = secondLine;
        cell.append(document.createElement("br"), sub);
    }
    return cell;
}

// Expiry cell: the date, then a coloured badge underneath
function createExpiryCell(dateText) {
    const state = getDocumentState(dateText);            // vehicles.js
    const cell = document.createElement("td");
    cell.append(formatDate(dateText), document.createElement("br"), createBadge(state.label, state.type));
    return cell;
}


/* ---------------------------------------------------------
   3. DRAW THE TABLE
   Runs when the page opens and after every change.
   --------------------------------------------------------- */
function renderTable() {
    const tbody = document.getElementById("vehicleRows");
    tbody.innerHTML = "";                                 // remove old rows

    // No vehicles: a friendly message across all 7 columns (validation.js)
    if (vehicles.length === 0) {
        tbody.append(createEmptyRow(7, createEmptyState(
            "ti-truck-off",
            "No vehicles yet",
            "Register a vehicle with its insurance and inspection documents to start accepting orders.",
            { text: "+ Add Vehicle", href: "courier-add-vehicle.html" }
        )));
        return;
    }

    vehicles.forEach(function (vehicle, index) {
        const row = document.createElement("tr");
        const approval = APPROVAL_LABELS[vehicle.approval];

        const statusCell = document.createElement("td");
        statusCell.append(createBadge(approval.text, approval.type));

        // "Update documents" button. The click function remembers
        // "index", so each button opens the pop-up for its own vehicle.
        const actionCell = document.createElement("td");
        const button = document.createElement("button");
        button.setAttribute("type", "button");
        button.classList.add("btn", "btn-secondary", "btn-small");
        button.textContent = "Update documents";
        button.addEventListener("click", function () {
            openDocumentDialog(index);
        });
        actionCell.append(button);

        row.append(
            createCell(vehicle.plate, vehicle.model),
            createCell(vehicle.type),
            createCell(vehicle.maxWeightKg + " kg", vehicle.maxVolumeM3 + " m³"),
            createExpiryCell(vehicle.insuranceExpiry),
            createExpiryCell(vehicle.inspectionExpiry),
            statusCell,
            actionCell
        );
        tbody.append(row);
    });
}


/* ---------------------------------------------------------
   4. DRAW THE DOCUMENT WARNINGS
   One line for every document that is expired or expires
   within 3 days. Expired ones are red.
   --------------------------------------------------------- */
function renderAlerts() {
    const list = document.getElementById("documentAlertList");
    list.innerHTML = "";

    vehicles.forEach(function (vehicle) {
        const documents = [
            { name: "Insurance",  date: vehicle.insuranceExpiry },
            { name: "Inspection", date: vehicle.inspectionExpiry }
        ];

        documents.forEach(function (doc) {
            const state = getDocumentState(doc.date);
            if (state.type === "success") {
                return;                                   // valid: nothing to say
            }

            const item = document.createElement("li");
            if (state.type === "danger") {
                item.classList.add("text-danger");
                item.textContent = doc.name + " for " + vehicle.plate + " expired on " + formatDate(doc.date) +
                    ". Upload a new certificate or Staff may disapprove this vehicle.";
            } else {
                item.textContent = doc.name + " for " + vehicle.plate + " " + state.label.toLowerCase() +
                    " (" + formatDate(doc.date) + "). Upload the renewed certificate.";
            }
            list.append(item);
        });
    });

    // Hide the yellow box when there are no warnings
    document.getElementById("documentAlerts").hidden = list.children.length === 0;
}

function renderPage() {
    renderTable();
    renderAlerts();
}


/* ---------------------------------------------------------
   5. "UPDATE DOCUMENTS" POP-UP
   --------------------------------------------------------- */
const dialog = document.getElementById("documentDialog");
const documentForm = document.getElementById("documentForm");

function openDocumentDialog(index) {
    selectedVehicleIndex = index;
    const vehicle = vehicles[index];
    document.getElementById("documentDialogVehicle").textContent =
        vehicle.plate + " · " + vehicle.model + ". Staff will be notified to review the new document.";
    dialog.showModal();                                   // built-in <dialog> method
}

// Every time the pop-up closes (Cancel, Esc or after saving):
// empty the form and remove old errors.
dialog.addEventListener("close", function () {
    documentForm.reset();
    clearAllErrors(documentForm);                         // validation.js
    selectedVehicleIndex = null;
});

document.getElementById("cancelDocumentButton").addEventListener("click", function () {
    dialog.close();
});

clearErrorsWhileTyping(documentForm);                     // validation.js

// Every check runs (it doesn't stop at the first error),
// so the user sees all the problems at once.
function validateDocumentForm() {
    clearAllErrors(documentForm);
    let isValid = true;

    if (!checkRequired("documentType", "Choose which document you are updating.")) {
        isValid = false;
    }
    if (!checkFutureDate("newExpiryDate")) {
        isValid = false;
    }
    if (!checkDocumentFile("newCertificate")) {
        isValid = false;
    }
    return isValid;
}

documentForm.addEventListener("submit", function (event) {
    event.preventDefault();                               // don't reload the page

    if (!validateDocumentForm()) {
        return;                                           // errors are on screen
    }

    const vehicle = vehicles[selectedVehicleIndex];
    const documentType = document.getElementById("documentType").value;
    const newDate = document.getElementById("newExpiryDate").value;

    if (documentType === "insurance") {
        vehicle.insuranceExpiry = newDate;
    } else {
        vehicle.inspectionExpiry = newDate;
    }

    saveVehicles(vehicles);                               // vehicles.js

    showSuccessMessage("successMessage", "New " + documentType + " certificate for " + vehicle.plate +
        " uploaded. Staff have been notified to review it.");   // validation.js

    dialog.close();
    renderPage();
});


/* ---------------------------------------------------------
   START
   --------------------------------------------------------- */
renderPage();
