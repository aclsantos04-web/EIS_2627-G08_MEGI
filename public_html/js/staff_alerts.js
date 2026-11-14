/* =========================================================
   staff_alerts.js — STAFF → DOCUMENT ALERTS
   Built from js/vehicles.js (getFleet), as the forum answer
   asks: Staff get an alert when
     - a document of an approved vehicle is expired or expires
       in the next 3 days  -> Notify the courier, or Disapprove
                              the vehicle if it is already expired
     - a courier uploads a new certificate -> Review and Validate
   The dates are counted from today, so these alerts always
   match the courier's My Vehicles page.
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    const tableBody = document.getElementById("alertsTableBody");
    const feedback = document.getElementById("staffFeedback");
    const docDialog = document.getElementById("docDialog");
    const docDialogDetails = document.getElementById("docDialogDetails");
    const docDialogName = document.getElementById("docDialogName");
    const btnCloseDoc = document.getElementById("btnCloseDoc");
    const btnValidateDoc = document.getElementById("btnValidateDoc");

    let alertBeingReviewed = null;
    let feedbackTimer = null;

    if (tableBody === null) {
        return;
    }

    const DOCUMENT_NAMES = {
        insurance: "Insurance Policy",
        inspection: "Inspection Certificate"
    };

    function showFeedback(text, isWarning) {
        feedback.textContent = text;
        feedback.className = "alert staff-feedback " + (isWarning ? "alert-danger" : "alert-success");
        feedback.hidden = false;
        clearTimeout(feedbackTimer);
        feedbackTimer = setTimeout(function () {
            feedback.hidden = true;
        }, 6000);
    }

    /* ---------- 1. Which alerts are there? ---------- */
    function getAlerts() {
        const alerts = [];
        getFleet().forEach(function (vehicle) {                     // vehicles.js
            if (vehicle.approval !== "approved") {
                return;                                              // not in use yet
            }
            // A new certificate waiting for review
            if (vehicle.updatedDocument) {
                const dateText = vehicle[vehicle.updatedDocument + "Expiry"];
                alerts.push({ vehicle: vehicle, kind: "upload", documentType: vehicle.updatedDocument, dateText: dateText });
            }
            // Expired or expiring documents
            ["insurance", "inspection"].forEach(function (documentType) {
                const dateText = vehicle[documentType + "Expiry"];
                const state = getDocumentState(dateText);
                if (state.type !== "success" && vehicle.updatedDocument !== documentType) {
                    alerts.push({ vehicle: vehicle, kind: state.type, documentType: documentType, dateText: dateText, state: state });
                }
            });
        });
        // Expired first, then expiring, then new uploads
        const order = { danger: 0, warning: 1, upload: 2 };
        return alerts.sort(function (a, b) {
            return order[a.kind] - order[b.kind];
        });
    }

    /* ---------- 2. Draw the table ---------- */
    function createCell(content) {
        const cell = document.createElement("td");
        if (typeof content === "string") {
            cell.textContent = content;
        } else {
            cell.append(content);
        }
        return cell;
    }

    function createBadge(type, text) {
        const badge = document.createElement("span");
        badge.className = "badge badge-" + type;
        badge.textContent = text;
        return badge;
    }

    function createButton(text, className, onClick) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "btn btn-small " + className;
        button.textContent = text;
        button.addEventListener("click", onClick);
        return button;
    }

    function renderTable() {
        tableBody.replaceChildren();
        const alerts = getAlerts();

        if (alerts.length === 0) {
            const row = document.createElement("tr");
            const cell = createCell("All documents are valid. There are no alerts.");
            cell.colSpan = 6;
            cell.className = "empty-table-msg";
            row.append(cell);
            tableBody.append(row);
            return;
        }

        alerts.forEach(function (alert) {
            const vehicle = alert.vehicle;
            const documentName = DOCUMENT_NAMES[alert.documentType];
            const row = document.createElement("tr");

            const plate = document.createElement("strong");
            plate.textContent = vehicle.plate;

            const date = document.createElement("span");
            date.textContent = formatDate(alert.dateText);              // vehicles.js
            if (alert.kind === "danger") {
                date.className = "text-danger";
            }

            const actions = document.createElement("div");
            actions.className = "table-actions";

            let badge;
            if (alert.kind === "upload") {
                badge = createBadge("info", "New upload");
                actions.append(createButton("Review", "btn-primary btn-review", function () {
                    alertBeingReviewed = alert;
                    docDialogDetails.textContent = "Vehicle: " + vehicle.plate + " · Courier: " + vehicle.courier +
                        " · New expiry date: " + formatDate(alert.dateText);
                    docDialogName.textContent = documentName + " (uploaded by " + vehicle.courier + ")";
                    docDialog.showModal();
                }));
            } else {
                badge = createBadge(alert.kind, alert.state.label);
                actions.append(createButton("Notify", "btn-outline btn-notify", function () {
                    showFeedback("Reminder sent to " + vehicle.courier + " to upload a new " +
                        documentName.toLowerCase() + " for " + vehicle.plate + ".", false);
                }));
                // Forum: Staff can disapprove a vehicle whose document has expired
                if (alert.kind === "danger") {
                    actions.append(createButton("Disapprove", "btn-danger btn-reject", function () {
                        if (!confirm("Disapprove " + vehicle.plate + "? It can't be used until a new " +
                                documentName.toLowerCase() + " is approved.")) {
                            return;
                        }
                        updateFleetVehicle(vehicle.plate, { approval: "denied" });   // vehicles.js
                        showFeedback(vehicle.plate + " was disapproved. " + vehicle.courier + " has been told.", true);
                        renderTable();
                    }));
                }
            }

            row.append(
                createCell(plate),
                createCell(vehicle.courier),
                createCell(documentName),
                createCell(date),
                createCell(badge),
                createCell(actions)
            );
            tableBody.append(row);
        });
    }

    /* ---------- 3. Review pop-up ---------- */
    btnValidateDoc.addEventListener("click", function () {
        if (alertBeingReviewed !== null) {
            const vehicle = alertBeingReviewed.vehicle;
            updateFleetVehicle(vehicle.plate, { updatedDocument: null });   // reviewed
            showFeedback("New " + DOCUMENT_NAMES[alertBeingReviewed.documentType].toLowerCase() +
                " for " + vehicle.plate + " validated.", false);
            alertBeingReviewed = null;
            renderTable();
        }
        docDialog.close();
    });

    btnCloseDoc.addEventListener("click", function () {
        docDialog.close();
    });

    renderTable();
});
