
/* MY PRODUCTS PAGE */

// Get saved products
let products = JSON.parse(localStorage.getItem("cmsProducts") || "[]");

// Get HTML elements
let tableBody = document.getElementById("products-table-body");
let noProducts = document.getElementById("no-products");
let details = document.getElementById("product-details");

// Check if there are products
if (products.length === 0) {

    noProducts.hidden = false;

} else {

    // Add each product to the table
    products.forEach(function(product) {

        let row = document.createElement("tr");

        // Product information
        let values = [
            product.name,
            product.category,
            product.description,
            product.weight + " kg",
            product.volume + " m³"
        ];

        values.forEach(function(value) {

            let cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);

        });

        // Create View button
        let actionCell = document.createElement("td");

        let button = document.createElement("button");
        button.type = "button";
        button.className = "view-product";
        button.textContent = "View";

        // View product details
        button.addEventListener("click", function() {

            document.getElementById("detail-name").textContent =
                product.name;

            document.getElementById("detail-category").textContent =
                product.category;

            document.getElementById("detail-description").textContent =
                product.description;

            document.getElementById("detail-weight").textContent =
                product.weight + " kg";

            document.getElementById("detail-volume").textContent =
                product.volume + " m³";

            details.hidden = false;

        });

        actionCell.appendChild(button);
        row.appendChild(actionCell);

        tableBody.appendChild(row);

    });

}

// Close product details
document.getElementById("close-details").addEventListener("click", function() {

    details.hidden = true;

});
