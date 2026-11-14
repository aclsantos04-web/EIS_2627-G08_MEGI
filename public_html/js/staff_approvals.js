/* =========================================================
   staff_approvals.js — STAFF → COURIER APPROVALS
   The list comes from js/accounts.js: the sample couriers
   waiting for approval plus anyone who registered as a
   courier on this browser.
   Approve / Reject saves the decision (saveCourierDecision),
   so the courier can (or can't) log in afterwards.
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    const tableBody = document.getElementById("courierTableBody");
    const feedback = document.getElementById("staffFeedback");
    let feedbackTimer = null;

    if (tableBody === null) {
        return;
    }

    // Green confirmation above the table, hidden again after 6 seconds
    function showFeedback(text, isRejection) {
        feedback.textContent = text;
        feedback.className = "alert staff-feedback " + (isRejection ? "alert-danger" : "alert-success");
        feedback.hidden = false;
        clearTimeout(feedbackTimer);
        feedbackTimer = setTimeout(function () {
            feedback.hidden = true;
        }, 6000);
    }

    function createCell(text, isBold) {
        const cell = document.createElement("td");
        if (isBold) {
            const strong = document.createElement("strong");
            strong.textContent = text;
            cell.append(strong);
        } else {
            cell.textContent = text;
        }
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

    // Draws the table again from the data
    function renderTable() {
        tableBody.replaceChildren();
        const couriers = getPendingCouriers();                 // accounts.js

        if (couriers.length === 0) {
            const row = document.createElement("tr");
            const cell = createCell("No courier registrations are waiting for approval.");
            cell.colSpan = 4;
            cell.className = "empty-table-msg";
            row.append(cell);
            tableBody.append(row);
            return;
        }

        couriers.forEach(function (courier) {
            const row = document.createElement("tr");
            const actions = document.createElement("div");
            actions.className = "table-actions";

            actions.append(
                createButton("Approve", "btn-success btn-approve", function () {
                    saveCourierDecision(courier.username, "approved");   // accounts.js
                    showFeedback(courier.name + " was approved and can now log in and accept orders.", false);
                    renderTable();
                }),
                createButton("Reject", "btn-danger btn-reject", function () {
                    // confirm() asks before a decision that can't be undone here
                    if (!confirm("Reject the registration of " + courier.name + "?")) {
                        return;
                    }
                    saveCourierDecision(courier.username, "rejected");
                    showFeedback(courier.name + "'s registration was rejected.", true);
                    renderTable();
                })
            );

            const actionCell = document.createElement("td");
            actionCell.append(actions);

            row.append(
                createCell(courier.name, true),
                createCell(courier.email),
                createCell(formatDateText(courier.registered)),   // accounts.js
                actionCell
            );
            tableBody.append(row);
        });
    }

    renderTable();
});
