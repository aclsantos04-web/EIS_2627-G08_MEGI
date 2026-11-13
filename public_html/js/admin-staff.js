/* =========================================================
   ADMIN - STAFF APPROVALS
   Handles request review, decisions, filters and history.
   ========================================================= */

const staffRows = document.querySelectorAll("#staffTable tr");
const staffSearch = document.getElementById("staffSearch");
const statusFilter = document.getElementById("statusFilter");

const pendingCount = document.getElementById("pendingCount");
const approvedCount = document.getElementById("approvedCount");
const rejectedCount = document.getElementById("rejectedCount");

const staffDialog = document.getElementById("staffDialog");
const dialogTitle = document.getElementById("dialogTitle");
const dialogRequestId = document.getElementById("dialogRequestId");
const dialogName = document.getElementById("dialogName");
const dialogAvatar = document.getElementById("dialogAvatar");
const dialogUsername = document.getElementById("dialogUsername");
const dialogEmail = document.getElementById("dialogEmail");
const dialogNif = document.getElementById("dialogNif");
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

const currentAdmin = "Carlos Pinto";
const storageKey = "cmsStaffApprovalDecisions";

let selectedRow = null;


/* ---------- Local storage ---------- */

/* Ler decisões guardadas */
function getStoredDecisions() {
    const storedData = localStorage.getItem(storageKey);

    if (!storedData) {
        return {};
    }

    try {
        return JSON.parse(storedData);
    } catch (error) {
        console.error("Could not read Staff approval decisions.", error);
        return {};
    }
}

/* Guardar decisões */
function saveStoredDecisions(decisions) {
    localStorage.setItem(storageKey, JSON.stringify(decisions));
}

/* Cada pedido possui um identificador próprio */
function getRequestKey(row) {
    return row.dataset.requestId;
}

function getRowEmail(row) {
    return row.children[1].textContent.trim();
}

/*
 * Compatibilidade com a versão anterior,
 * em que apenas era guardada a última decisão.
 */
function normalizeDecisionData(data) {
    if (!data) {
        return null;
    }

    if (Array.isArray(data.history)) {
        return data;
    }

    if (data.status) {
        return {
            currentStatus: data.status,
            history: [{
                previousStatus: "pending",
                decision: data.status,
                decidedBy: data.decidedBy || "Unknown Admin",
                date: data.date || "Date unavailable",
                justification: data.justification || "No justification recorded.",
                consequence: getAccessConsequence(data.status)
            }]
        };
    }

    return null;
}

/* Restaurar decisões depois de atualizar a página */
function restoreDecisions() {
    const decisions = getStoredDecisions();
    let changed = false;

    staffRows.forEach(function (row) {
        const requestId = getRequestKey(row);
        const email = getRowEmail(row);

        let savedData = decisions[requestId];

        /*
         * Compatibilidade com a versão anterior,
         * que utilizava o email como chave.
         */
        if (!savedData && decisions[email]) {
            savedData = normalizeDecisionData(decisions[email]);

            if (savedData) {
                decisions[requestId] = savedData;
                delete decisions[email];
                changed = true;
            }
        } else {
            savedData = normalizeDecisionData(savedData);
        }

        if (!savedData) {
            return;
        }

        decisions[requestId] = savedData;
        row.dataset.status = savedData.currentStatus;

        updateStatusBadge(row);
    });

    if (changed) {
        saveStoredDecisions(decisions);
    }
}


/* ---------- Status and statistics ---------- */

/* Atualizar a badge de estado da tabela */
function updateStatusBadge(row) {
    const status = row.dataset.status;
    const badge = row.querySelector(".badge");

    badge.className = "badge";

    if (status === "pending") {
        badge.classList.add("badge-warning");
        badge.textContent = "Pending";
    } else if (status === "approved") {
        badge.classList.add("badge-success");
        badge.textContent = "Approved";
    } else {
        badge.classList.add("badge-danger");
        badge.textContent = "Rejected";
    }
}

/* Atualizar os indicadores superiores */
function updateStatistics() {
    let pending = 0;
    let approved = 0;
    let rejected = 0;

    staffRows.forEach(function (row) {
        if (row.dataset.status === "pending") {
            pending++;
        } else if (row.dataset.status === "approved") {
            approved++;
        } else if (row.dataset.status === "rejected") {
            rejected++;
        }
    });

    pendingCount.textContent = pending;
    approvedCount.textContent = approved;
    rejectedCount.textContent = rejected;
}


/* ---------- Table actions ---------- */

/* Criar as ações adequadas ao estado de cada pedido */
function updateRowActions(row) {
    const actions = row.querySelector(".approval-actions");
    const status = row.dataset.status;

    actions.innerHTML = "";

    const viewButton = document.createElement("button");
    viewButton.type = "button";

    if (status === "pending") {
        viewButton.className = "btn btn-small btn-outline";
        viewButton.textContent = "View";
    } else {
        viewButton.className = "btn btn-small btn-secondary";
        viewButton.textContent = "Review";
    }

    viewButton.addEventListener("click", function () {
        openStaffDialog(row);
    });

    actions.appendChild(viewButton);

    /*
     * Pending requests also show Approve and Reject.
     * The decision is only completed after reviewing,
     * justifying and confirming the action.
     */
    if (status === "pending") {
        const approveButton = document.createElement("button");
        const rejectButton = document.createElement("button");

        approveButton.type = "button";
        approveButton.className = "btn btn-small btn-success";
        approveButton.textContent = "Approve";

        rejectButton.type = "button";
        rejectButton.className = "btn btn-small btn-danger";
        rejectButton.textContent = "Reject";

        approveButton.addEventListener("click", function () {
            openStaffDialog(row);
            decisionReason.focus();
        });

        rejectButton.addEventListener("click", function () {
            openStaffDialog(row);
            decisionReason.focus();
        });

        actions.appendChild(approveButton);
        actions.appendChild(rejectButton);
    }
}


/* ---------- Staff request dialog ---------- */

/* Abrir o pedido em modo View ou Review */
function openStaffDialog(row) {
    selectedRow = row;

    const name = row.querySelector(".staff-user strong").textContent;
    const names = name.split(" ");

    dialogName.textContent = name;
    dialogRequestId.textContent = "Request " + row.dataset.requestId;
    dialogUsername.textContent = row.dataset.username;
    dialogEmail.textContent = getRowEmail(row);
    dialogNif.textContent = row.dataset.nif;
    dialogDate.textContent = row.children[2].textContent.trim();

    dialogAvatar.textContent =
        names[0].charAt(0) +
        names[names.length - 1].charAt(0);

    decisionReason.value = "";
    decisionError.textContent = "";

    updateDialog();
    staffDialog.showModal();
}

/* Atualizar o modal de acordo com o estado atual */
function updateDialog() {
    const status = selectedRow.dataset.status;

    updateDialogStatusBadge(status);

    if (status === "pending") {
        dialogTitle.textContent = "Staff Access Request";
        decisionMessage.textContent =
            "Review the account information and justify the decision before approving or rejecting this Staff request.";

        dialogApprove.disabled = false;
        dialogReject.disabled = false;

    } else if (status === "approved") {
        dialogTitle.textContent = "Review Decision";
        decisionMessage.textContent =
            "This request is currently approved. A new justification is required to change the decision.";

        dialogApprove.disabled = true;
        dialogReject.disabled = false;

    } else {
        dialogTitle.textContent = "Review Decision";
        decisionMessage.textContent =
            "This request is currently rejected. A new justification is required to change the decision.";

        dialogApprove.disabled = false;
        dialogReject.disabled = true;
    }

    renderDecisionHistory();
}

/* Atualizar a badge apresentada no modal */
function updateDialogStatusBadge(status) {
    dialogStatus.className = "badge";

    if (status === "pending") {
        dialogStatus.classList.add("badge-warning");
        dialogStatus.textContent = "Pending";
    } else if (status === "approved") {
        dialogStatus.classList.add("badge-success");
        dialogStatus.textContent = "Approved";
    } else {
        dialogStatus.classList.add("badge-danger");
        dialogStatus.textContent = "Rejected";
    }
}


/* ---------- Decision history ---------- */

/* Mostrar todas as decisões anteriores */
function renderDecisionHistory() {
    const decisions = getStoredDecisions();
    const requestId = getRequestKey(selectedRow);
    const requestData = normalizeDecisionData(decisions[requestId]);

    historyList.innerHTML = "";

    if (!requestData || requestData.history.length === 0) {
        decisionHistory.hidden = true;
        return;
    }

    const reversedHistory = [...requestData.history].reverse();

    reversedHistory.forEach(function (entry) {
        const historyEntry = document.createElement("article");

        historyEntry.className =
            "history-entry " + entry.decision;

        const previousLabel =
            capitalizeStatus(entry.previousStatus);

        const decisionLabel =
            capitalizeStatus(entry.decision);

        historyEntry.innerHTML = `
            <div class="history-top">
                <span class="history-change">
                    ${previousLabel} → ${decisionLabel}
                </span>

                <span class="history-date">
                    ${entry.date}
                </span>
            </div>

            <p>
                <strong>Decided by:</strong>
                ${entry.decidedBy}
            </p>

            <p>
                <strong>Justification:</strong>
                ${entry.justification}
            </p>

            <p>
                <strong>Consequence:</strong>
                ${entry.consequence}
            </p>
        `;

        historyList.appendChild(historyEntry);
    });

    decisionHistory.hidden = false;
}

function capitalizeStatus(status) {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

/* Consequência associada a cada decisão */
function getAccessConsequence(status) {
    if (status === "approved") {
        return "Staff access granted to Courier Approvals, Vehicle Approvals and Document Alerts.";
    }

    return "No Staff Panel access granted.";
}


/* ---------- Decision ---------- */

/* Validar a justificação e pedir confirmação */
function confirmDecision(newStatus) {
    if (!selectedRow) {
        return;
    }

    const justification = decisionReason.value.trim();

    if (!justification) {
        decisionError.textContent =
            "A justification is required before confirming the decision.";

        decisionReason.classList.add("invalid");
        decisionReason.focus();

        return;
    }

    decisionError.textContent = "";
    decisionReason.classList.remove("invalid");

    const name =
        selectedRow.querySelector(".staff-user strong").textContent;

    const action =
        newStatus === "approved"
            ? "approve"
            : "reject";

    const confirmed = confirm(
        "Are you sure you want to " +
        action +
        " the Staff request from " +
        name +
        "?"
    );

    if (!confirmed) {
        return;
    }

    saveDecision(newStatus, justification);
}

/* Guardar uma nova decisão sem eliminar as anteriores */
function saveDecision(newStatus, justification) {
    const decisions = getStoredDecisions();
    const requestId = getRequestKey(selectedRow);

    let requestData =
        normalizeDecisionData(decisions[requestId]);

    if (!requestData) {
        requestData = {
            currentStatus: "pending",
            history: []
        };
    }

    const previousStatus = requestData.currentStatus;

    const decisionDate = new Date().toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });

    /*
     * Cada decisão é adicionada ao histórico.
     * As decisões anteriores nunca são eliminadas.
     */
    requestData.history.push({
        previousStatus: previousStatus,
        decision: newStatus,
        decidedBy: currentAdmin,
        date: decisionDate,
        justification: justification,
        consequence: getAccessConsequence(newStatus)
    });

    requestData.currentStatus = newStatus;
    decisions[requestId] = requestData;

    saveStoredDecisions(decisions);

    selectedRow.dataset.status = newStatus;

    updateStatusBadge(selectedRow);
    updateRowActions(selectedRow);
    updateStatistics();
    filterRows();

    decisionReason.value = "";
    decisionReason.classList.remove("invalid");

    /* Manter o modal aberto para mostrar imediatamente o novo registo */
    updateDialog();
}


/* ---------- Search and filters ---------- */

function filterRows() {
    const searchValue = staffSearch.value.toLowerCase();
    const selectedStatus = statusFilter.value;

    staffRows.forEach(function (row) {
        const rowText =
            (
                row.textContent +
                " " +
                row.dataset.username +
                " " +
                row.dataset.nif +
                " " +
                row.dataset.requestId
            ).toLowerCase();

        const matchesSearch =
            rowText.includes(searchValue);

        const matchesStatus =
            selectedStatus === "all" ||
            row.dataset.status === selectedStatus;

        row.style.display =
            matchesSearch && matchesStatus
                ? ""
                : "none";
    });
}


/* ---------- Close dialog ---------- */

function closeStaffDialog() {
    staffDialog.close();

    selectedRow = null;
    decisionReason.value = "";
    decisionReason.classList.remove("invalid");
    decisionError.textContent = "";
}


/* ---------- Event listeners ---------- */

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

staffSearch.addEventListener("input", filterRows);
statusFilter.addEventListener("change", filterRows);

closeDialog.addEventListener("click", closeStaffDialog);
closeDialogButton.addEventListener("click", closeStaffDialog);


/* ---------- Initialisation ---------- */

/*
 * Restaurar decisões antes de construir os botões,
 * para apresentar sempre o estado correto.
 */
restoreDecisions();

staffRows.forEach(function (row) {
    updateRowActions(row);
});

updateStatistics();
