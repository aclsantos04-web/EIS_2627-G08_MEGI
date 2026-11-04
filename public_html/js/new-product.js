
/* CREATE NEW PRODUCT - VALIDATION */

document.getElementById("product-form").addEventListener("submit", function(event) {

    event.preventDefault();

    let valid = true;

    // Get form fields
    let name = document.getElementById("product-name");
    let description = document.getElementById("product-description");
    let category = document.getElementById("product-category");
    let weight = document.getElementById("product-weight");
    let volume = document.getElementById("product-volume");

    let fields = [name, description, category, weight, volume];

    // Clear previous errors
    fields.forEach(function(field) {

        let error = document.getElementById(field.id + "-error");

        if (!error) {
            error = document.createElement("small");
            error.id = field.id + "-error";
            field.insertAdjacentElement("afterend", error);
        }

        error.classList.add("product-field-error");
        error.textContent = "";

        field.classList.remove("product-invalid");
    });

    let message = document.getElementById("product-message");
    message.style.display = "none";
    message.textContent = "";

    // Function to show errors
    function showError(field, text) {

        document.getElementById(field.id + "-error").textContent = text;

        field.classList.add("product-invalid");

        valid = false;
    }

    // Product Name
    if (name.value.trim() === "") {
        showError(name, "Product name is required.");
    }

    // Product Description
    if (description.value.trim() === "") {
        showError(description, "Product description is required.");
    }

    // Product Category
    if (category.value.trim() === "") {
        showError(category, "Product category is required.");
    }

    // Weight
    if (weight.value.trim() === "") {
        showError(weight, "Weight is required.");
    } else if (!Number.isFinite(Number(weight.value)) ||
               Number(weight.value) <= 0) {
        showError(weight, "Weight must be greater than zero.");
    }

    // Volume
    if (volume.value.trim() === "") {
        showError(volume, "Volume is required.");
    } else if (!Number.isFinite(Number(volume.value)) ||
               Number(volume.value) <= 0) {
        showError(volume, "Volume must be greater than zero.");
    }

    // Stop if there are errors
    if (!valid) {
        return;
    }

    // Create product object
    let product = {
        id: Date.now(),
        name: name.value.trim(),
        description: description.value.trim(),
        category: category.value.trim(),
        weight: Number(weight.value),
        volume: Number(volume.value)
    };

    // Get previously saved products
    let products = JSON.parse(localStorage.getItem("cmsProducts") || "[]");

    // Add new product
    products.push(product);

    // Save products
    localStorage.setItem("cmsProducts", JSON.stringify(products));

    // Success message
    message.textContent = "Product registered successfully!";
    message.style.display = "block";

    // Clear form
    document.getElementById("product-form").reset();

});
