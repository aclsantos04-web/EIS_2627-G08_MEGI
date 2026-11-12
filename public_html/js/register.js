
/* REGISTER FORM VALIDATION */

/* NIF - ONLY NUMBERS */

const nifInput = document.getElementById("reg-nif");

nifInput.addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "").slice(0, 9);
});

/* Check Portuguese NIF */

function isValidNIF(nif) {

    if (!/^[1-9][0-9]{8}$/.test(nif)) {
        return false;
    }

    let sum = 0;

    for (let i = 0; i < 8; i++) {
        sum += Number(nif[i]) * (9 - i);
    }

    const remainder = sum % 11;

    const checkDigit =
        remainder < 2 ? 0 : 11 - remainder;

    return checkDigit === Number(nif[8]);
}

document.getElementById("register-form").addEventListener("submit", function(event) {

    event.preventDefault();

    let valid = true;

    // Get form fields
    let username = document.getElementById("reg-username");
    let email = document.getElementById("reg-email");
    let nif = document.getElementById("reg-nif");
    let role = document.getElementById("reg-role");
    let password = document.getElementById("reg-password");
    let confirmPassword = document.getElementById("reg-confirm");

    let fields = [username, email, nif, role, password, confirmPassword];

    // Clear previous errors
    fields.forEach(function(field) {

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

    // Hide general message
    let message = document.getElementById("register-message");

    if (message) {
        message.style.display = "none";
        message.textContent = "";
    }

    // Function to show errors under each field
    function showError(field, text) {

        document.getElementById(field.id + "-error").textContent = text;

        field.classList.add("register-invalid");

        valid = false;
    }

    // Username validation
    if (username.value.trim() === "") {
        showError(username, "Username is required.");
    }

    // Email validation
    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email.value.trim() === "") {
        showError(email, "Email is required.");
    } else if (!emailPattern.test(email.value.trim())) {
        showError(email, "Please enter a valid email address.");
    }

   
// NIF validation
const nifValue = nif.value.trim();

if (!/^[0-9]{9}$/.test(nifValue)) {

    showError(nif, "NIF must contain exactly 9 digits.");

} else if (!isValidNIF(nifValue)) {

    showError(nif, "Please enter a valid Portuguese NIF.");

}


    // Role validation
    if (role.value === "") {
        showError(role, "Please select a role.");
    }

    // Password validation
    if (password.value.trim() === "") {
        showError(password, "Password is required.");
    } else if (password.value.length < 8) {
        showError(password, "Password must contain at least 8 characters.");
    }

    // Confirm password validation
    if (confirmPassword.value === "") {
        showError(confirmPassword, "Please confirm your password.");
    } else if (password.value !== confirmPassword.value) {
        showError(confirmPassword, "Passwords do not match.");
    }

    // Stop submission if there are errors
    if (!valid) {
        return;
    }

    // Successful validation
    if (message) {

        if (role.value === "staff") {
            message.textContent = "Form validated! Staff approval by Admin is required. Demo mode.";
        } else {
            message.textContent = "Form validated successfully! Demo mode.";
        }

        message.style.display = "block";
    }

});
