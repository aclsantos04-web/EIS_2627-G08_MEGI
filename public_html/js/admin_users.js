const usersTable = document.getElementById("usersTable");
const userSearch = document.getElementById("userSearch");
const typeFilter = document.getElementById("typeFilter");

const userDialog = document.getElementById("userDialog");
const userDialogForm = document.getElementById("userDialogForm");
const userDialogTitle = document.getElementById("userDialogTitle");
const userDialogAvatar = document.getElementById("userDialogAvatar");
const userDialogNameTitle = document.getElementById("userDialogNameTitle");
const userDialogRole = document.getElementById("userDialogRole");
const userDialogName = document.getElementById("userDialogName");
const userDialogEmail = document.getElementById("userDialogEmail");
const userDialogUsername = document.getElementById("userDialogUsername");
const userDialogType = document.getElementById("userDialogType");
const userDialogDate = document.getElementById("userDialogDate");
const userDialogSave = document.getElementById("userDialogSave");
const closeUserDialog = document.getElementById("closeUserDialog");
const closeUserDialogButton = document.getElementById("closeUserDialogButton");
const userNameError = document.getElementById("userDialogName-error");
const userEmailError = document.getElementById("userDialogEmail-error");


let selectedUser = null;


/* Approved users, with their latest details.
   getAllAccounts() (accounts.js) already includes every change made
   on a Profile page or here, because both save to the same place. */
function getUsers() {
    return getAllAccounts()
        .filter(function (account) {
            return getAccountStatus(account) === "approved";
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


/* Limpar erros do modal */
function clearDialogErrors() {
    userDialogName.classList.remove("invalid");
    userDialogEmail.classList.remove("invalid");

    userNameError.textContent = "";
    userEmailError.textContent = "";
}


/* Abrir modal em modo View ou Edit */
function openUserDialog(account, editMode) {
    selectedUser = account;

    clearDialogErrors();

    userDialogTitle.textContent =
        editMode ? "Edit User" : "User Details";

    userDialogAvatar.textContent =
        getInitials(account.name);

    userDialogNameTitle.textContent =
        account.name;

    userDialogRole.textContent =
        ROLE_NAMES[account.role];

    userDialogName.value =
        account.name;

    userDialogEmail.value =
        account.email;

    userDialogUsername.textContent =
        account.username || "—";

    userDialogType.textContent =
        ROLE_NAMES[account.role];

    userDialogDate.textContent =
        formatDateText(account.registered);

    userDialogName.readOnly =
        !editMode;

    userDialogEmail.readOnly =
        !editMode;

    userDialogSave.hidden =
        !editMode;

    userDialog.showModal();
}


/* Ver informação do utilizador */
function viewUser(account) {
    openUserDialog(account, false);
}


/* Editar informação do utilizador */
function editUser(account) {
    openUserDialog(account, true);
}


/* Guardar edição feita no modal */
userDialogForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        if (!selectedUser) {
            return;
        }

        clearDialogErrors();

        const trimmedName =
            userDialogName.value.trim();

        const trimmedEmail =
            userDialogEmail.value.trim();

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        let isValid = true;


        if (trimmedName === "") {
            userDialogName.classList.add("invalid");

            userNameError.textContent =
                "Name cannot be empty.";

            isValid = false;
        }


        if (trimmedEmail === "") {
            userDialogEmail.classList.add("invalid");

            userEmailError.textContent =
                "Email cannot be empty.";

            isValid = false;

        } else if (!emailPattern.test(trimmedEmail)) {

            userDialogEmail.classList.add("invalid");

            userEmailError.textContent =
                "Please enter a valid email address.";

            isValid = false;
        }

        // Emails must be unique: users can log in with them (accounts.js)
        else if (emailTakenByOther(trimmedEmail, selectedUser.username)) {

            userDialogEmail.classList.add("invalid");

            userEmailError.textContent =
                "This email is already used by another account.";

            isValid = false;
        }


        if (!isValid) {
            userDialogForm
                .querySelector(".invalid")
                .focus();

            return;
        }


        // Saved where the Profile pages save too (accounts.js), so the
        // user sees the change on their own profile and top bar
        saveProfileChanges(selectedUser.username, {
            fullName: trimmedName,
            email: trimmedEmail
        });

        userDialog.close();

        selectedUser = null;

        renderUsers();
    }
);


/* Fechar modal */
closeUserDialog.addEventListener(
    "click",
    function () {
        userDialog.close();
    }
);

closeUserDialogButton.addEventListener(
    "click",
    function () {
        userDialog.close();
    }
);

userDialog.addEventListener(
    "close",
    function () {
        selectedUser = null;
        clearDialogErrors();
    }
);


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

    roleBadge.className =
        "badge badge-info";

    roleBadge.textContent =
        ROLE_NAMES[account.role];

    roleCell.appendChild(roleBadge);


    /* Actions */
    const actionsCell =
        document.createElement("td");

    const actions =
        document.createElement("div");

    actions.className =
        "user-actions";


    const viewButton =
        createActionButton(
            "View",
            "btn btn-secondary btn-sm",
            function () {
                viewUser(account);
            }
        );


    const editButton =
        createActionButton(
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
        userSearch.value
            .trim()
            .toLowerCase();

    const selectedType =
        typeFilter.value;

    const accounts =
        getUsers().filter(
            function (account) {

                const matchesSearch =
                    account.name
                        .toLowerCase()
                        .includes(search) ||

                    account.email
                        .toLowerCase()
                        .includes(search);

                const matchesType =
                    selectedType === "all" ||
                    account.role === selectedType;

                return (
                    matchesSearch &&
                    matchesType
                );
            }
        );


    usersTable.replaceChildren();


    accounts.forEach(
        function (account) {

            usersTable.appendChild(
                createUserRow(account)
            );

        }
    );


    if (accounts.length === 0) {

        const row =
            document.createElement("tr");

        const cell =
            document.createElement("td");

        cell.colSpan = 5;
        cell.className = "text-muted";
        cell.textContent =
            "No users found.";

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