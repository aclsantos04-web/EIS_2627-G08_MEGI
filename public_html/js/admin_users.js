const usersTable = document.getElementById("usersTable");
const userSearch = document.getElementById("userSearch");
const typeFilter = document.getElementById("typeFilter");

const USER_EDITS_KEY = "cmsAdminUserEdits";


/* Obter alterações feitas pelo Admin */
function getUserEdits() {
    try {
        return JSON.parse(
            localStorage.getItem(USER_EDITS_KEY) || "{}"
        );
    } catch (error) {
        return {};
    }
}


/* Guardar alterações feitas pelo Admin */
function saveUserEdits(edits) {
    localStorage.setItem(
        USER_EDITS_KEY,
        JSON.stringify(edits)
    );
}


/* Aplicar alterações guardadas aos utilizadores */
function getUsers() {
    const edits = getUserEdits();

    return getAllAccounts()
        .filter(function (account) {
            return getAccountStatus(account) === "approved";
        })
        .map(function (account) {
            const key = account.username || account.email;

            return Object.assign(
                {},
                account,
                edits[key] || {}
            );
        });
}


/* Obter iniciais do nome */
function getInitials(name) {
    const parts = name.trim().split(" ");

    return (
        parts[0].charAt(0) +
        parts[parts.length - 1].charAt(0)
    ).toUpperCase();
}


/* Criar botão de ação */
function createActionButton(text, className, action) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = className;
    button.textContent = text;

    button.addEventListener("click", action);

    return button;
}


/* Ver informação do utilizador */
function viewUser(account) {
    alert(
        "Name: " + account.name +
        "\nEmail: " + account.email +
        "\nUsername: " + account.username +
        "\nRole: " + ROLE_NAMES[account.role] +
        "\nRegistration date: " +
        formatDateText(account.registered)
    );
}


/* Editar informação do utilizador */
function editUser(account) {
    const newName = prompt(
        "Name:",
        account.name
    );

    if (newName === null) {
        return;
    }

    const trimmedName = newName.trim();

    if (trimmedName === "") {
        alert("Name cannot be empty.");
        return;
    }


    const newEmail = prompt(
        "Email:",
        account.email
    );

    if (newEmail === null) {
        return;
    }

    const trimmedEmail = newEmail.trim();

    if (trimmedEmail === "") {
        alert("Email cannot be empty.");
        return;
    }


    const edits = getUserEdits();
    const key = account.username || account.email;

    edits[key] = Object.assign(
        {},
        edits[key] || {},
        {
            name: trimmedName,
            email: trimmedEmail
        }
    );

    saveUserEdits(edits);
    renderUsers();
}


/* Criar linha da tabela */
function createUserRow(account) {
    const row = document.createElement("tr");

    row.dataset.type = account.role;


    /* Name */
    const nameCell = document.createElement("td");

    const userCell = document.createElement("div");
    userCell.className = "user-cell";

    const avatar = document.createElement("div");
    avatar.className = "user-avatar";
    avatar.textContent = getInitials(account.name);

    const name = document.createElement("strong");
    name.textContent = account.name;

    userCell.append(avatar, name);
    nameCell.appendChild(userCell);


    /* Email */
    const emailCell = document.createElement("td");
    emailCell.textContent = account.email;


    /* Registration Date */
    const dateCell = document.createElement("td");
    dateCell.textContent =
        formatDateText(account.registered);


    /* Type */
    const roleCell = document.createElement("td");

    const roleBadge = document.createElement("span");
    roleBadge.className = "badge badge-info";
    roleBadge.textContent = ROLE_NAMES[account.role];

    roleCell.appendChild(roleBadge);


    /* Actions */
    const actionsCell = document.createElement("td");

    const actions = document.createElement("div");
    actions.className = "user-actions";

    const viewButton = createActionButton(
        "View",
        "btn btn-secondary btn-sm",
        function () {
            viewUser(account);
        }
    );

    const editButton = createActionButton(
        "Edit",
        "btn btn-primary btn-sm",
        function () {
            editUser(account);
        }
    );

    actions.append(
        viewButton,
        editButton
    );

    actionsCell.appendChild(actions);


    row.append(
        nameCell,
        emailCell,
        dateCell,
        roleCell,
        actionsCell
    );

    return row;
}


/* Mostrar utilizadores */
function renderUsers() {
    const search =
        userSearch.value.trim().toLowerCase();

    const selectedType =
        typeFilter.value;

    const accounts =
        getUsers().filter(function (account) {
            const matchesSearch =
                account.name.toLowerCase().includes(search) ||
                account.email.toLowerCase().includes(search);

            const matchesType =
                selectedType === "all" ||
                account.role === selectedType;

            return matchesSearch && matchesType;
        });

    usersTable.replaceChildren();


    accounts.forEach(function (account) {
        usersTable.appendChild(
            createUserRow(account)
        );
    });


    if (accounts.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 5;
        cell.className = "text-muted";
        cell.textContent = "No users found.";

        row.appendChild(cell);
        usersTable.appendChild(row);
    }
}


/* Pesquisa e filtro */
userSearch.addEventListener(
    "input",
    renderUsers
);

typeFilter.addEventListener(
    "change",
    renderUsers
);


/* Carregar tabela */
renderUsers();