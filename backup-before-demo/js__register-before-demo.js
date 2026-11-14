
/* ==========================================
   CMS - REGISTER
   Form validation and role navigation
========================================== */

const nifInput = document.getElementById("reg-nif");

/* Allow only 9 numeric digits in NIF */

nifInput.addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "").slice(0, 9);
});

/* Validate Portuguese NIF */

function isValidNIF(nif) {

    if (!/^[1-9][0-9]{8}$/.test(nif)) {
        return false;
    }

    let sum = 0;

    for (let i = 0; i < 8; i++) {
        sum += Number(nif[i]) * (9 - i);
    }

    const remainder = sum % 11;
    const checkDigit = remainder < 2 ? 0 : 11 - remainder;

    return checkDigit === Number(nif[8]);
}

/* Register form */

document.getElementById("register-form")
    .addEventListener("submit", function (event) {

    event.preventDefault();

    let valid = true;

    /* Form fields */

    const fullName = document.getElementById("reg-name");
    const phone = document.getElementById("reg-phone");
    const username = document.getElementById("reg-username");
    const email = document.getElementById("reg-email");
    const nif = document.getElementById("reg-nif");
    const role = document.getElementById("reg-role");
    const password = document.getElementById("reg-password");
    const confirmPassword = document.getElementById("reg-confirm");

    const fields = [
        fullName,
        phone,
        username,
        email,
        nif,
        role,
        password,
        confirmPassword
    ];

    const message = document.getElementById("register-message");

    /* Clear previous validation messages */

    fields.forEach(function (field) {

        let error = document.getElementById(field.id + "-error");

        if (!error) {
            error = document.createElement("small");
            error.id = field.id + "-error";
            field.insertAdjacentElement("afterend", error);
        }

        error.classList.add("register-field-error");
        error.textContent = "";

        field.classList.remove("register-invalid");
    });

    if (message) {
        message.style.display = "none";
        message.replaceChildren();
    }

    /* Show red message under invalid field */

    function showError(field, text) {

        const error = document.getElementById(field.id + "-error");

        error.textContent = text;
        error.classList.add("register-field-error");

        field.classList.add("register-invalid");

        valid = false;
    }

    /* FULL NAME */

    if (fullName.value.trim().length < 2) {
        showError(
            fullName,
            "Please enter your full name."
        );
    }

    /* PHONE NUMBER */

    if (!/^[0-9]{9}$/.test(phone.value.trim())) {
        showError(
            phone,
            "Phone number must contain exactly 9 digits."
        );
    }

    /* USERNAME */

    if (username.value.trim() === "") {
        showError(
            username,
            "Username is required."
        );
    }

    /* EMAIL */

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email.value.trim() === "") {
        showError(
            email,
            "Email is required."
        );
    } else if (!emailPattern.test(email.value.trim())) {
        showError(
            email,
            "Please enter a valid email address."
        );
    }

    /* NIF */

    const nifValue = nif.value.trim();

    if (!/^[0-9]{9}$/.test(nifValue)) {
        showError(
            nif,
            "NIF must contain exactly 9 digits."
        );
    } else if (!isValidNIF(nifValue)) {
        showError(
            nif,
            "Please enter a valid Portuguese NIF."
        );
    }

    /* ROLE */

    if (role.value === "") {
        showError(
            role,
            "Please select a role."
        );
    }

    /* PASSWORD */

    if (password.value.trim() === "") {
        showError(
            password,
            "Password is required."
        );
    } else if (password.value.length < 8) {
        showError(
            password,
            "Password must contain at least 8 characters."
        );
    }

    /* CONFIRM PASSWORD */

    if (confirmPassword.value === "") {
        showError(
            confirmPassword,
            "Please confirm your password."
        );
    } else if (password.value !== confirmPassword.value) {
        showError(
            confirmPassword,
            "Passwords do not match."
        );
    }

    /* STOP IF ANY FIELD IS INVALID */

    if (!valid) {
        return;
    }

    /* SUCCESS - ROLE NAVIGATION */

    const rolePages = {
        client: "client_new_order.html",
        courier: "courier-available-orders.html",
        staff: "staff_courier_approvals.html"
    };

    const roleNames = {
        client: "Client",
        courier: "Courier",
        staff: "Staff"
    };

    if (message) {

        const text = document.createElement("p");

        

        
if (role.value === "courier") {

    text.textContent =
        "Form validated successfully! " +
        "Courier accounts require Staff approval. " ;

} else if (role.value === "staff") {

    text.textContent =
        "Form validated successfully! " +
        "Staff accounts require Admin approval. " ;

} else {

    text.textContent =
        "Form validated successfully! " +
        "You can now preview the Client area.";

}


        const link = document.createElement("a");

        link.href = rolePages[role.value];

        
link.textContent =
    role.value === "client"
        ? "Go to Client Area →"
        : "Preview " + roleNames[role.value] + " Area →";


        link.className = "register-button";

        link.style.display = "block";
        link.style.textAlign = "center";
        link.style.textDecoration = "none";
        link.style.marginTop = "15px";

        message.appendChild(text);
        message.appendChild(link);

        message.style.display = "block";
        
document.querySelector('#register-form button[type="submit"]').style.display = "none";

    }

});


/* Hide previous success message when Role changes */

document.getElementById("reg-role").addEventListener("change", function () {
    const message = document.getElementById("register-message");

    if (message) {
        message.style.display = "none";
        message.replaceChildren();
    }
    
    
document.querySelector('#register-form button[type="submit"]').style.display = "";

});
