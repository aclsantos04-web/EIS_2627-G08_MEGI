/* =========================================================
   staff_approvals.js — STAFF → COURIER APPROVALS
   Matches Admin Approvals (admin-staff.js) with search,
   status filters, justification and immutable decision history.
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    const tableBody = document.getElementById("courierTableBody");
    const courierSearch = document.getElementById("courierSearch");
    const statusFilter = document.getElementById("statusFilter");

    const pendingCount = document.getElementById("pendingCount");
    const approvedCount = document.getElementById("approvedCount");
    const rejectedCount = document.getElementById("rejectedCount");

    const courierDialog = document.getElementById("courierDialog");
    const dialogTitle = document.getElementById("dialogTitle");
    const dialogRequestId = document.getElementById("dialogRequestId");
    const dialogName = document.getElementById("dialogName");
    const dialogAvatar = document.getElementById("dialogAvatar");
    const dialogUsername = document.getElementById("dialogUsername");
    const dialogEmail = document.getElementById("dialogEmail");
    const dialogDate = document.getElementById("dialogDate");
    const dialogStatus = document.getElementById("dialogStatus");

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
    const historyStorageKey = "cmsCourierApprovalHistory";
    let selectedCourier = null;

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
            console.warn("Could not save courier decision history.", e);
        }
    }

    function getAllCouriers() {
        const store = getHistoryStore();
        const pendingList = typeof getPendingCouriers === "function" ? getPendingCouriers() : [];

        // Also include couriers that were already decided in this session/storage
        const map = new Map();
        pendingList.forEach(function (c, idx) {
            map.set(c.username, Object.assign({
                requestId: "COUR-" + String(idx + 1).padStart(3, "0"),
                status: store[c.username]?.currentStatus || "pending"
            }, c));
        });

        Object.keys(store).forEach(function (username) {
            if (!map.has(username) && store[username].profile) {
                map.set(username, Object.assign({}, store[username].profile, {
                    status: store[username].currentStatus
                }));
            }
        });

        return Array.from(map.values());
    }

    function getInitials(name) {
        const parts = name.trim().split(" ");
        return (parts[0]?.charAt(0) || "") + (parts[parts.length - 1]?.charAt(0) || "");
    }

    function updateStatistics(couriers) {
        let pending = 0, approved = 0, rejected = 0;
        couriers.forEach(function (c) {
            if (c.status === "pending") pending++;
            else if (c.status === "approved") approved++;
            else if (c.status === "rejected") rejected++;
        });
        pendingCount.textContent = pending;
        approvedCount.textContent = approved;
        rejectedCount.textContent = rejected;
    }

    function renderTable() {
        const couriers = getAllCouriers();
        updateStatistics(couriers);

        const searchVal = courierSearch.value.toLowerCase().trim();
        const filterVal = statusFilter.value;

        const filtered = couriers.filter(function (c) {
            const textMatch = (c.name + " " + c.email + " " + c.username + " " + c.requestId).toLowerCase().includes(searchVal);
            const statusMatch = filterVal === "all" || c.status === filterVal;
            return textMatch && statusMatch;
        });

        tableBody.replaceChildren();

        if (filtered.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");
            cell.colSpan = 5;
            cell.className = "empty-table-msg";
            cell.textContent = "No courier requests match the current filter.";
            row.appendChild(cell);
            tableBody.appendChild(row);
            return;
        }

        filtered.forEach(function (courier) {
            const row = document.createElement("tr");

            // Name + Avatar
            const userCell = document.createElement("td");
            const userDiv = document.createElement("div");
            userDiv.className = "staff-user";
            const avatar = document.createElement("span");
            avatar.className = "staff-avatar";
            avatar.textContent = getInitials(courier.name);
            const strong = document.createElement("strong");
            strong.textContent = courier.name;
            userDiv.append(avatar, strong);
            userCell.appendChild(userDiv);

            // Email
            const emailCell = document.createElement("td");
            emailCell.textContent = courier.email;

            // Date
            const dateCell = document.createElement("td");
            dateCell.textContent = typeof formatDateText === "function"
                ? formatDateText(courier.registered)
                : courier.registered;

            // Status Badge
            const statusCell = document.createElement("td");
            const badge = document.createElement("span");
            badge.className = "badge";
            if (courier.status === "pending") {
                badge.classList.add("badge-warning");
                badge.textContent = "Pending";
            } else if (courier.status === "approved") {
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
            viewBtn.className = courier.status === "pending"
                ? "btn btn-small btn-outline"
                : "btn btn-small btn-secondary";
            viewBtn.textContent = courier.status === "pending" ? "View" : "Review";
            viewBtn.addEventListener("click", function () {
                openCourierDialog(courier);
            });
            actionsDiv.appendChild(viewBtn);

            if (courier.status === "pending") {
                const appBtn = document.createElement("button");
                appBtn.type = "button";
                appBtn.className = "btn btn-small btn-success";
                appBtn.textContent = "Approve";
                appBtn.addEventListener("click", function () {
                    openCourierDialog(courier);
                    decisionReason.focus();
                });

                const rejBtn = document.createElement("button");
                rejBtn.type = "button";
                rejBtn.className = "btn btn-small btn-danger";
                rejBtn.textContent = "Reject";
                rejBtn.addEventListener("click", function () {
                    openCourierDialog(courier);
                    decisionReason.focus();
                });

                actionsDiv.append(appBtn, rejBtn);
            }

            actionCell.appendChild(actionsDiv);
            row.append(userCell, emailCell, dateCell, statusCell, actionCell);
            tableBody.appendChild(row);
        });
    }

    function openCourierDialog(courier) {
        selectedCourier = courier;
        dialogName.textContent = courier.name;
        dialogRequestId.textContent = "Request " + courier.requestId;
        dialogUsername.textContent = courier.username;
        dialogEmail.textContent = courier.email;
        dialogDate.textContent = typeof formatDateText === "function"
            ? formatDateText(courier.registered)
            : courier.registered;
        dialogAvatar.textContent = getInitials(courier.name);

        decisionReason.value = "";
        decisionReason.classList.remove("invalid");
        decisionError.textContent = "";

        updateDialogState();
        courierDialog.showModal();
    }

    function updateDialogState() {
        const status = selectedCourier.status;
        dialogStatus.className = "badge";

        if (status === "pending") {
            dialogStatus.classList.add("badge-warning");
            dialogStatus.textContent = "Pending";
            dialogTitle.textContent = "Courier Registration Request";
            decisionMessage.textContent = "Review the account information and justify the decision before approving or rejecting.";
            dialogApprove.disabled = false;
            dialogReject.disabled = false;
        } else if (status === "approved") {
            dialogStatus.classList.add("badge-success");
            dialogStatus.textContent = "Approved";
            dialogTitle.textContent = "Review Decision";
            decisionMessage.textContent = "This courier is currently approved. A new justification is required to change the decision.";
            dialogApprove.disabled = true;
            dialogReject.disabled = false;
        } else {
            dialogStatus.classList.add("badge-danger");
            dialogStatus.textContent = "Rejected";
            dialogTitle.textContent = "Review Decision";
            decisionMessage.textContent = "This courier is currently rejected. A new justification is required to change the decision.";
            dialogApprove.disabled = false;
            dialogReject.disabled = true;
        }

        renderDecisionHistory();
    }

    function renderDecisionHistory() {
        const store = getHistoryStore();
        const record = store[selectedCourier.username];
        historyList.replaceChildren();

        if (!record || !record.history || record.history.length === 0) {
            decisionHistory.hidden = true;
            return;
        }

        [...record.history].reverse().forEach(function (entry) {
            const article = document.createElement("article");
            article.className = "history-entry " + entry.decision;

            const prevLabel = entry.previousStatus.charAt(0).toUpperCase() + entry.previousStatus.slice(1);
            const decLabel = entry.decision.charAt(0).toUpperCase() + entry.decision.slice(1);

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

    function confirmDecision(newStatus) {
        if (!selectedCourier) return;

        const justification = decisionReason.value.trim();
        if (!justification) {
            decisionError.textContent = "A justification is required before confirming the decision.";
            decisionReason.classList.add("invalid");
            decisionReason.focus();
            return;
        }

        decisionError.textContent = "";
        decisionReason.classList.remove("invalid");

        const actionWord = newStatus === "approved" ? "approve" : "reject";
        if (!confirm(`Are you sure you want to ${actionWord} the Courier request from ${selectedCourier.name}?`)) {
            return;
        }

        const store = getHistoryStore();
        if (!store[selectedCourier.username]) {
            store[selectedCourier.username] = {
                currentStatus: "pending",
                profile: selectedCourier,
                history: []
            };
        }

        const previousStatus = store[selectedCourier.username].currentStatus;
        const decisionDate = new Date().toLocaleString("en-GB", {
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit"
        });

        store[selectedCourier.username].history.push({
            previousStatus: previousStatus,
            decision: newStatus,
            decidedBy: currentStaff,
            date: decisionDate,
            justification: justification,
            consequence: newStatus === "approved"
                ? "Courier account activated; user can log in and accept delivery orders."
                : "Courier access denied; user cannot log in or accept orders."
        });

        store[selectedCourier.username].currentStatus = newStatus;
        saveHistoryStore(store);

        if (typeof saveCourierDecision === "function") {
            saveCourierDecision(selectedCourier.username, newStatus);
        }

        selectedCourier.status = newStatus;
        decisionReason.value = "";
        renderTable();
        updateDialogState();
    }

    dialogApprove.addEventListener("click", function () {
        confirmDecision("approved");
    });

    dialogReject.addEventListener("click", function () {
        confirmDecision("rejected");
    });

    decisionReason.addEventListener("input", function () {
        if (decisionReason.value.trim()) {
            decisionError.textContent = "";
            decisionReason.classList.remove("invalid");
        }
    });

    courierSearch.addEventListener("input", renderTable);
    statusFilter.addEventListener("change", renderTable);

    function closeCourierModal() {
        courierDialog.close();
        selectedCourier = null;
    }

    closeDialog.addEventListener("click", closeCourierModal);
    closeDialogButton.addEventListener("click", closeCourierModal);

    renderTable();
});