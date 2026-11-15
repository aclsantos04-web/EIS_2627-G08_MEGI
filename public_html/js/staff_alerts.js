/* =========================================================
   staff_alerts.js — STAFF → DOCUMENT ALERTS
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    const tableBody = document.getElementById("alertsTableBody");
    const feedback = document.getElementById("staffFeedback");
    const documentAlertsBox = document.getElementById("documentAlerts");
    const documentAlertList = document.getElementById("documentAlertList");

    const docDialog = document.getElementById("docDialog");
    const docDialogDetails = document.getElementById("docDialogDetails");
    const docDialogName = document.getElementById("docDialogName");
    const docDialogFile = document.getElementById("docDialogFile");
    const btnCloseDoc = document.getElementById("btnCloseDoc");
    const btnCloseDocTop = document.getElementById("btnCloseDocTop");
    const btnValidateDoc = document.getElementById("btnValidateDoc");
    const btnRejectDoc = document.getElementById("btnRejectDoc");

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

    function getAlerts() {
        const alerts = [];
        getFleet().forEach(function (vehicle) {
            if (vehicle.approval !== "approved") {
                return;
            }
            if (vehicle.updatedDocument) {
                const dateText = vehicle[vehicle.updatedDocument + "Expiry"];
                alerts.push({
                    vehicle: vehicle,
                    kind: "upload",
                    documentType: vehicle.updatedDocument,
                    dateText: dateText
                });
            }
            ["insurance", "inspection"].forEach(function (documentType) {
                const dateText = vehicle[documentType + "Expiry"];
                const state = getDocumentState(dateText);
                if (state.type !== "success" && vehicle.updatedDocument !== documentType) {
                    alerts.push({
                        vehicle: vehicle,
                        kind: state.type,
                        documentType: documentType,
                        dateText: dateText,
                        state: state
                    });
                }
            });
        });

        const order = { danger: 0, warning: 1, upload: 2 };
        return alerts.sort(function (a, b) {
            return order[a.kind] - order[b.kind];
        });
    }

    /* Render top yellow banner listing expired & expiring-in-3-days vehicles */
    function renderTopWarningBanner(alerts) {
        documentAlertList.replaceChildren();

        alerts.forEach(function (alert) {
            if (alert.kind === "upload") {
                return;
            }
            const item = document.createElement("li");
            const docLabel = alert.documentType === "insurance" ? "Insurance" : "Inspection";

            if (alert.kind === "danger") {
                item.className = "text-danger";
                item.textContent =
                    docLabel + " for " + alert.vehicle.plate + " (" + alert.vehicle.courier + ") expired on " +
                    formatDate(alert.dateText) + ". Notify the courier or disapprove the vehicle.";
            } else {
                item.textContent =
                    docLabel + " for " + alert.vehicle.plate + " (" + alert.vehicle.courier + ") " +
                    alert.state.label.toLowerCase() + " (" + formatDate(alert.dateText) + ").";
            }
            documentAlertList.appendChild(item);
        });

        documentAlertsBox.hidden = documentAlertList.children.length === 0;
    }

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
        renderTopWarningBanner(alerts);

        if (alerts.length === 0) {
            const row = document.createElement("tr");
            const cell = createCell("All documents are valid. There are no pending alerts.");
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

            const plateCell = document.createElement("td");
            const plate = document.createElement("strong");
            plate.textContent = vehicle.plate;
            const model = document.createElement("span");
            model.className = "vehicle-model";
            model.textContent = vehicle.model;
            plateCell.append(plate, model);

            const date = document.createElement("span");
            date.textContent = formatDate(alert.dateText);
            if (alert.kind === "danger") {
                date.className = "text-danger";
            }

            const actions = document.createElement("div");
            actions.className = "approval-actions";

            let badge;
            if (alert.kind === "upload") {
                badge = createBadge("info", "New upload");
                actions.append(createButton("Review", "btn-primary", function () {
                    alertBeingReviewed = alert;
                    const fileName = alert.documentType === "insurance"
                        ? (vehicle.insuranceFile || `insurance_${vehicle.plate.toLowerCase()}.pdf`)
                        : (vehicle.inspectionFile || `inspection_${vehicle.plate.toLowerCase()}.pdf`);

                    docDialogDetails.textContent =
                        "Vehicle: " + vehicle.plate + " (" + vehicle.model + ") · Courier: " + vehicle.courier +
                        " · New expiry date: " + formatDate(alert.dateText);
                    docDialogName.textContent = documentName + " — uploaded by " + vehicle.courier;
                    docDialogFile.textContent = "File: " + fileName;
                    docDialog.showModal();
                }));
            } else {
                badge = createBadge(alert.kind, alert.state.label);
                actions.append(createButton("Notify", "btn-outline", function () {
                    showFeedback(
                        "Reminder sent to " + vehicle.courier + " to upload a renewed " +
                        documentName.toLowerCase() + " for " + vehicle.plate + ".",
                        false
                    );
                }));
                if (alert.kind === "danger") {
                    actions.append(createButton("Disapprove", "btn-danger", function () {
                        if (!confirm("Disapprove " + vehicle.plate + "? It cannot be used until a valid " +
                                documentName.toLowerCase() + " is approved.")) {
                            return;
                        }
                        updateFleetVehicle(vehicle.plate, { approval: "denied" });
                        showFeedback(vehicle.plate + " has been disapproved. " + vehicle.courier + " has been notified.", true);
                        renderTable();
                    }));
                }
            }

            row.append(
                plateCell,
                createCell(vehicle.courier),
                createCell(documentName),
                createCell(date),
                createCell(badge),
                createCell(actions)
            );
            tableBody.append(row);
        });
    }

    btnValidateDoc.addEventListener("click", function () {
        if (alertBeingReviewed !== null) {
            const vehicle = alertBeingReviewed.vehicle;
            updateFleetVehicle(vehicle.plate, { updatedDocument: null });
            showFeedback(
                "New " + DOCUMENT_NAMES[alertBeingReviewed.documentType].toLowerCase() +
                " for " + vehicle.plate + " has been validated.",
                false
            );
            alertBeingReviewed = null;
            renderTable();
        }
        docDialog.close();
    });

    btnRejectDoc.addEventListener("click", function () {
        if (alertBeingReviewed !== null) {
            const vehicle = alertBeingReviewed.vehicle;
            updateFleetVehicle(vehicle.plate, { updatedDocument: null });
            showFeedback(
                "Uploaded " + DOCUMENT_NAMES[alertBeingReviewed.documentType].toLowerCase() +
                " for " + vehicle.plate + " was rejected. " + vehicle.courier + " has been asked to re-upload.",
                true
            );
            alertBeingReviewed = null;
            renderTable();
        }
        docDialog.close();
    });

    btnCloseDoc.addEventListener("click", function () {
        docDialog.close();
    });

    btnCloseDocTop.addEventListener("click", function () {
        docDialog.close();
    });

    renderTable();
});