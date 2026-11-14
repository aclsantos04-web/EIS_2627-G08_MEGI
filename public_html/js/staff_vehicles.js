/* =========================================================
   staff_vehicles.js — STAFF → VEHICLE APPROVALS
   The list comes from js/vehicles.js (getFleet): every
   vehicle still waiting for approval, including the one
   Diogo added on "Add Vehicle". Each expiry date has a badge
   (Valid / Expires in n days / Expired), so Staff see at once
   if a document is a problem.
   Approve / Reject is saved with updateFleetVehicle(), so the
   courier sees the new status on My Vehicles.
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    const tableBody = document.getElementById("vehicleTableBody");
    const feedback = document.getElementById("staffFeedback");
    let feedbackTimer = null;

    if (tableBody === null) {
        return;
    }

    function showFeedback(text, isRejection) {
        feedback.textContent = text;
        feedback.className = "alert staff-feedback " + (isRejection ? "alert-danger" : "alert-success");
        feedback.hidden = false;
        clearTimeout(feedbackTimer);
        feedbackTimer = setTimeout(function () {
            feedback.hidden = true;
        }, 6000);
    }

    // A cell with the date and its badge under it
    function createDateCell(dateText) {
        const state = getDocumentState(dateText);                // vehicles.js
        const cell = document.createElement("td");
        const wrapper = document.createElement("div");
        wrapper.className = "date-with-badge";

        const date = document.createElement("span");
        date.textContent = formatDate(dateText);                 // vehicles.js

        const badge = document.createElement("span");
        badge.className = "badge badge-" + state.type;
        badge.textContent = state.label;

        wrapper.append(date, badge);
        cell.append(wrapper);
        return cell;
    }

    function createTextCell(text) {
        const cell = document.createElement("td");
        cell.textContent = text;
        return cell;
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
        const pending = getFleet().filter(function (vehicle) {     // vehicles.js
            return vehicle.approval === "pending";
        });

        if (pending.length === 0) {
            const row = document.createElement("tr");
            const cell = createTextCell("No vehicles are waiting for approval.");
            cell.colSpan = 6;
            cell.className = "empty-table-msg";
            row.append(cell);
            tableBody.append(row);
            return;
        }

        pending.forEach(function (vehicle) {
            const row = document.createElement("tr");

            // Plate in bold with the model under it
            const plateCell = document.createElement("td");
            const plate = document.createElement("strong");
            plate.textContent = vehicle.plate;
            const model = document.createElement("span");
            model.className = "vehicle-model";
            model.textContent = vehicle.model;
            plateCell.append(plate, model);

            // A vehicle with an expired document can't be approved
            const expired = daysUntil(vehicle.insuranceExpiry) < 0 || daysUntil(vehicle.inspectionExpiry) < 0;

            const approveButton = createButton("Approve", "btn-success btn-approve", function () {
                updateFleetVehicle(vehicle.plate, { approval: "approved" });   // vehicles.js
                showFeedback(vehicle.plate + " (" + vehicle.courier + ") was approved and can now be used for orders.", false);
                renderTable();
            });
            if (expired) {
                approveButton.disabled = true;
                approveButton.title = "A document is expired: ask the courier for a new certificate first.";
            }

            const rejectButton = createButton("Reject", "btn-danger btn-reject", function () {
                if (!confirm("Reject vehicle " + vehicle.plate + "?")) {
                    return;
                }
                updateFleetVehicle(vehicle.plate, { approval: "denied" });
                showFeedback(vehicle.plate + " was rejected. " + vehicle.courier + " will see it as Denied.", true);
                renderTable();
            });

            const actions = document.createElement("div");
            actions.className = "table-actions";
            actions.append(approveButton, rejectButton);
            const actionCell = document.createElement("td");
            actionCell.append(actions);

            row.append(
                plateCell,
                createTextCell(vehicle.courier),
                createTextCell(vehicle.type),
                createDateCell(vehicle.insuranceExpiry),
                createDateCell(vehicle.inspectionExpiry),
                actionCell
            );
            tableBody.append(row);
        });
    }

    renderTable();
});
