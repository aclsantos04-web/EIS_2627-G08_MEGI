/* =========================================================
   staff_vehicles.js — STAFF → VEHICLE APPROVALS
   - Visual expiry badges on every date in the table
   - Certificate verification (View Insurance / View Inspection)
   - Matches Admin Approvals layout, justification & history
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    const tableBody = document.getElementById("vehicleTableBody");
    const vehicleSearch = document.getElementById("vehicleSearch");
    const statusFilter = document.getElementById("statusFilter");

    const pendingCount = document.getElementById("pendingCount");
    const approvedCount = document.getElementById("approvedCount");
    const rejectedCount = document.getElementById("rejectedCount");

    const vehicleDialog = document.getElementById("vehicleDialog");
    const dialogTitle = document.getElementById("dialogTitle");
    const dialogSubTitle = document.getElementById("dialogSubTitle");
    const dialogPlate = document.getElementById("dialogPlate");
    const dialogCourier = document.getElementById("dialogCourier");
    const dialogTypeModel = document.getElementById("dialogTypeModel");
    const dialogCapacity = document.getElementById("dialogCapacity");
    const dialogStatus = document.getElementById("dialogStatus");

    const insFileName = document.getElementById("insFileName");
    const insExpiryBadge = document.getElementById("insExpiryBadge");
    const insExpiryText = document.getElementById("insExpiryText");
    const insVerifiedStatus = document.getElementById("insVerifiedStatus");
    const btnViewInsurance = document.getElementById("btnViewInsurance");

    const inspFileName = document.getElementById("inspFileName");
    const inspExpiryBadge = document.getElementById("inspExpiryBadge");
    const inspExpiryText = document.getElementById("inspExpiryText");
    const inspVerifiedStatus = document.getElementById("inspVerifiedStatus");
    const btnViewInspection = document.getElementById("btnViewInspection");

    const certPreviewBox = document.getElementById("certPreviewBox");
    const certPreviewTitle = document.getElementById("certPreviewTitle");
    const certPreviewMeta = document.getElementById("certPreviewMeta");

    const decisionHistory = document.getElementById("decisionHistory");
    const historyList = document.getElementById("historyList");
    const decisionMessage = document.getElementById("decisionMessage");
    const decisionReason = document.getElementById("decisionReason");
    const decisionError = document.getElementById("decisionError");

    const dialogApprove = document.getElementById("dialogApprove");
    const dialogReject = document.getElementById("dialogReject");
    const closeDialog = document.getElementById("closeDialog");
    const closeDialogButton = document.getElementById("closeDialogButton");

    // The Staff member who is logged in (session.js) is the one
    // recorded as "Decided by" in the history.
    const currentStaff = getPageUser("staff").name;
    const historyStorageKey = "cmsVehicleApprovalHistory";

    let selectedVehicle = null;
    let verifiedInsurance = false;
    let verifiedInspection = false;

    if (!tableBody) return;

    function getHistoryStore() {
        try {
            return JSON.parse(localStorage.getItem(historyStorageKey) || "{}");
        } catch (e) {
            return {};
        }
    }

    function saveHistoryStore(store) {
        try {
            localStorage.setItem(historyStorageKey, JSON.stringify(store));
        } catch (e) {
            console.warn("Could not save vehicle decision history.", e);
        }
    }

    function updateStatistics(fleet) {
        let pending = 0, approved = 0, rejected = 0;
        fleet.forEach(function (v) {
            if (v.approval === "pending") pending++;
            else if (v.approval === "approved") approved++;
            else if (v.approval === "denied") rejected++;
        });
        pendingCount.textContent = pending;
        approvedCount.textContent = approved;
        rejectedCount.textContent = rejected;
    }

    function createDateCell(dateText) {
        const state = getDocumentState(dateText);
        const cell = document.createElement("td");
        const wrapper = document.createElement("div");
        wrapper.className = "date-with-badge";

        const date = document.createElement("span");
        date.textContent = formatDate(dateText);

        const badge = document.createElement("span");
        badge.className = "badge badge-" + state.type;
        badge.textContent = state.label;

        wrapper.append(date, badge);
        cell.append(wrapper);
        return cell;
    }

    function renderTable() {
        const fleet = getFleet();
        updateStatistics(fleet);

        const searchVal = vehicleSearch.value.toLowerCase().trim();
        const filterVal = statusFilter.value;

        const filtered = fleet.filter(function (v) {
            const textMatch = (v.plate + " " + v.model + " " + v.courier + " " + v.type).toLowerCase().includes(searchVal);
            const statusMatch = filterVal === "all" || v.approval === filterVal;
            return textMatch && statusMatch;
        });

        tableBody.replaceChildren();

        if (filtered.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");
            cell.colSpan = 7;
            cell.className = "empty-table-msg";
            cell.textContent = "No vehicles match the current filter.";
            row.appendChild(cell);
            tableBody.appendChild(row);
            return;
        }

        filtered.forEach(function (vehicle) {
            const row = document.createElement("tr");

            // Plate + Model
            const plateCell = document.createElement("td");
            const plate = document.createElement("strong");
            plate.textContent = vehicle.plate;
            const model = document.createElement("span");
            model.className = "vehicle-model";
            model.textContent = vehicle.model;
            plateCell.append(plate, model);

            // Courier
            const courierCell = document.createElement("td");
            courierCell.textContent = vehicle.courier;

            // Type
            const typeCell = document.createElement("td");
            typeCell.textContent = vehicle.type;

            // Status Badge
            const statusCell = document.createElement("td");
            const badge = document.createElement("span");
            badge.className = "badge";
            if (vehicle.approval === "pending") {
                badge.classList.add("badge-warning");
                badge.textContent = "Pending";
            } else if (vehicle.approval === "approved") {
                badge.classList.add("badge-success");
                badge.textContent = "Approved";
            } else {
                badge.classList.add("badge-danger");
                badge.textContent = "Rejected";
            }
            statusCell.appendChild(badge);

            // Actions
            const actionCell = document.createElement("td");
            const actionsDiv = document.createElement("div");
            actionsDiv.className = "approval-actions";

            const viewBtn = document.createElement("button");
            viewBtn.type = "button";
            viewBtn.className = vehicle.approval === "pending"
                ? "btn btn-small btn-outline"
                : "btn btn-small btn-secondary";
            viewBtn.textContent = vehicle.approval === "pending" ? "Verify & View" : "Review";
            viewBtn.addEventListener("click", function () {
                openVehicleDialog(vehicle);
            });
            actionsDiv.appendChild(viewBtn);

            if (vehicle.approval === "pending") {
                const appBtn = document.createElement("button");
                appBtn.type = "button";
                appBtn.className = "btn btn-small btn-success";
                appBtn.textContent = "Approve";
                appBtn.addEventListener("click", function () {
                    openVehicleDialog(vehicle);
                });

                const rejBtn = document.createElement("button");
                rejBtn.type = "button";
                rejBtn.className = "btn btn-small btn-danger";
                rejBtn.textContent = "Reject";
                rejBtn.addEventListener("click", function () {
                    openVehicleDialog(vehicle);
                    decisionReason.focus();
                });

                actionsDiv.append(appBtn, rejBtn);
            }

            actionCell.appendChild(actionsDiv);

            row.append(
                plateCell,
                courierCell,
                typeCell,
                createDateCell(vehicle.insuranceExpiry),
                createDateCell(vehicle.inspectionExpiry),
                statusCell,
                actionCell
            );
            tableBody.appendChild(row);
        });
    }

    function openVehicleDialog(vehicle) {
        selectedVehicle = vehicle;

        // If already approved in the past, consider documents already verified
        verifiedInsurance = vehicle.approval === "approved";
        verifiedInspection = vehicle.approval === "approved";

        dialogPlate.textContent = vehicle.plate;
        dialogSubTitle.textContent = "Vehicle " + vehicle.plate + " · Owned by " + vehicle.courier;
        dialogCourier.textContent = vehicle.courier;
        dialogTypeModel.textContent = vehicle.type + " — " + vehicle.model;
        dialogCapacity.textContent = vehicle.maxWeightKg + " kg / " + vehicle.maxVolumeM3 + " m³";

        // Insurance info
        const insState = getDocumentState(vehicle.insuranceExpiry);
        insFileName.textContent = vehicle.insuranceFile || `insurance_${vehicle.plate.toLowerCase()}.pdf`;
        insExpiryText.textContent = formatDate(vehicle.insuranceExpiry);
        insExpiryBadge.className = "badge badge-" + insState.type;
        insExpiryBadge.textContent = insState.label;

        // Inspection info
        const inspState = getDocumentState(vehicle.inspectionExpiry);
        inspFileName.textContent = vehicle.inspectionFile || `inspection_${vehicle.plate.toLowerCase()}.pdf`;
        inspExpiryText.textContent = formatDate(vehicle.inspectionExpiry);
        inspExpiryBadge.className = "badge badge-" + inspState.type;
        inspExpiryBadge.textContent = inspState.label;

        certPreviewBox.hidden = true;
        decisionReason.value = "";
        decisionReason.classList.remove("invalid");
        decisionError.textContent = "";

        updateVerificationBadges();
        updateDialogState();
        vehicleDialog.showModal();
    }

    function updateVerificationBadges() {
        if (verifiedInsurance) {
            insVerifiedStatus.textContent = "✓ Verified";
            insVerifiedStatus.className = "cert-verified-tag";
        } else {
            insVerifiedStatus.textContent = "Pending check";
            insVerifiedStatus.className = "cert-unverified-tag";
        }

        if (verifiedInspection) {
            inspVerifiedStatus.textContent = "✓ Verified";
            inspVerifiedStatus.className = "cert-verified-tag";
        } else {
            inspVerifiedStatus.textContent = "Pending check";
            inspVerifiedStatus.className = "cert-unverified-tag";
        }

        updateDialogState();
    }

    btnViewInsurance.addEventListener("click", function () {
        if (!selectedVehicle) return;
        verifiedInsurance = true;
        certPreviewTitle.textContent = "Insurance Policy — " + selectedVehicle.plate;
        certPreviewMeta.textContent =
            "File: " + insFileName.textContent + " · Holder: " + selectedVehicle.courier +
            " · Valid until: " + formatDate(selectedVehicle.insuranceExpiry);
        certPreviewBox.hidden = false;
        updateVerificationBadges();
    });

    btnViewInspection.addEventListener("click", function () {
        if (!selectedVehicle) return;
        verifiedInspection = true;
        certPreviewTitle.textContent = "Periodic Inspection Certificate — " + selectedVehicle.plate;
        certPreviewMeta.textContent =
            "File: " + inspFileName.textContent + " · Vehicle: " + selectedVehicle.model +
            " · Valid until: " + formatDate(selectedVehicle.inspectionExpiry);
        certPreviewBox.hidden = false;
        updateVerificationBadges();
    });

    function updateDialogState() {
        if (!selectedVehicle) return;
        const status = selectedVehicle.approval;
        const hasExpiredDoc =
            daysUntil(selectedVehicle.insuranceExpiry) < 0 ||
            daysUntil(selectedVehicle.inspectionExpiry) < 0;

        dialogStatus.className = "badge";
        if (status === "pending") {
            dialogStatus.classList.add("badge-warning");
            dialogStatus.textContent = "Pending";
            dialogTitle.textContent = "Vehicle & Certificate Review";
        } else if (status === "approved") {
            dialogStatus.classList.add("badge-success");
            dialogStatus.textContent = "Approved";
            dialogTitle.textContent = "Review Vehicle Decision";
        } else {
            dialogStatus.classList.add("badge-danger");
            dialogStatus.textContent = "Rejected";
            dialogTitle.textContent = "Review Vehicle Decision";
        }

        if (hasExpiredDoc) {
            dialogApprove.disabled = true;
            decisionMessage.textContent =
                "Cannot approve: one or more certificates are expired. Reject the request or ask the courier to upload valid documents.";
        } else if (!verifiedInsurance || !verifiedInspection) {
            dialogApprove.disabled = true;
            decisionMessage.textContent =
                "Click 'View Insurance' and 'View Inspection' above to verify both certificates before approving.";
        } else if (status === "approved") {
            dialogApprove.disabled = true;
            decisionMessage.textContent =
                "This vehicle is currently approved. Enter a justification to revoke/reject it.";
        } else {
            dialogApprove.disabled = false;
            decisionMessage.textContent =
                "Both certificates verified and valid. Provide a justification to confirm your decision.";
        }

        dialogReject.disabled = status === "denied";
        renderDecisionHistory();
    }

    function renderDecisionHistory() {
        const store = getHistoryStore();
        const record = store[selectedVehicle.plate];
        historyList.replaceChildren();

        if (!record || !record.history || record.history.length === 0) {
            decisionHistory.hidden = true;
            return;
        }

        [...record.history].reverse().forEach(function (entry) {
            const article = document.createElement("article");
            article.className = "history-entry " + entry.decision;

            const prevLabel = entry.previousStatus.charAt(0).toUpperCase() + entry.previousStatus.slice(1);
            const decLabel = entry.decision === "denied" ? "Rejected" : "Approved";

            article.innerHTML = `
                <div class="history-top">
                    <span class="history-change">${prevLabel} → ${decLabel}</span>
                    <span class="history-date">${entry.date}</span>
                </div>
                <p><strong>Decided by:</strong> ${entry.decidedBy}</p>
                <p><strong>Justification:</strong> ${entry.justification}</p>
                <p><strong>Consequence:</strong> ${entry.consequence}</p>
            `;
            historyList.appendChild(article);
        });

        decisionHistory.hidden = false;
    }

    function confirmDecision(newApproval) {
        if (!selectedVehicle) return;

        const justification = decisionReason.value.trim();
        if (!justification) {
            decisionError.textContent = "A justification is required before confirming the decision.";
            decisionReason.classList.add("invalid");
            decisionReason.focus();
            return;
        }

        decisionError.textContent = "";
        decisionReason.classList.remove("invalid");

        const actionWord = newApproval === "approved" ? "approve" : "reject";
        if (!confirm(`Are you sure you want to ${actionWord} vehicle ${selectedVehicle.plate}?`)) {
            return;
        }

        const store = getHistoryStore();
        if (!store[selectedVehicle.plate]) {
            store[selectedVehicle.plate] = {
                currentStatus: selectedVehicle.approval,
                history: []
            };
        }

        const previousStatus = selectedVehicle.approval;
        const decisionDate = new Date().toLocaleString("en-GB", {
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit"
        });

        store[selectedVehicle.plate].history.push({
            previousStatus: previousStatus,
            decision: newApproval,
            decidedBy: currentStaff,
            date: decisionDate,
            justification: justification,
            consequence: newApproval === "approved"
                ? "Vehicle approved for active delivery routes."
                : "Vehicle denied; courier cannot select it for deliveries."
        });

        store[selectedVehicle.plate].currentStatus = newApproval;
        saveHistoryStore(store);

        updateFleetVehicle(selectedVehicle.plate, { approval: newApproval });
        selectedVehicle.approval = newApproval;

        decisionReason.value = "";
        renderTable();
        updateDialogState();
    }

    dialogApprove.addEventListener("click", function () {
        confirmDecision("approved");
    });

    dialogReject.addEventListener("click", function () {
        confirmDecision("denied");
    });

    decisionReason.addEventListener("input", function () {
        if (decisionReason.value.trim()) {
            decisionError.textContent = "";
            decisionReason.classList.remove("invalid");
        }
    });

    vehicleSearch.addEventListener("input", renderTable);
    statusFilter.addEventListener("change", renderTable);

    function closeVehicleModal() {
        vehicleDialog.close();
        selectedVehicle = null;
    }

    closeDialog.addEventListener("click", closeVehicleModal);
    closeDialogButton.addEventListener("click", closeVehicleModal);

    renderTable();
});