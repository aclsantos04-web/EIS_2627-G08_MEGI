
/* LOGIN FORM VALIDATION */

document.getElementById("login-form").addEventListener("submit", function(event) {

    event.preventDefault();

    // Get form elements
    let username = document.getElementById("username");
    let password = document.getElementById("password");

    let usernameError = document.getElementById("username-error");
    let passwordError = document.getElementById("password-error");
    let message = document.getElementById("login-message");

    let valid = true;

    // Clear previous errors
    usernameError.textContent = "";
    passwordError.textContent = "";

    username.classList.remove("input-error");
    password.classList.remove("input-error");

    message.textContent = "";
    message.style.display = "none";

    // Validate username
    if (username.value.trim() === "") {

        usernameError.textContent = "Email or username is required.";
        username.classList.add("input-error");

        valid = false;
    }

    // Validate password
    if (password.value.trim() === "") {

        passwordError.textContent = "Password is required.";
        password.classList.add("input-error");

        valid = false;
    }

    // Stop if there are errors
    if (!valid) {
        return;
    }

    // Successful validation
    message.textContent = "Fields validated successfully! Demo mode.";
    message.style.display = "block";

});
