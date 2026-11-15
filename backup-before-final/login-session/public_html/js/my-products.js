
/* MY PRODUCTS — Sprint 1 Demo */

(function () {
    "use strict";

    // Sample products used for the Sprint 1 demonstration
    const sampleProducts = [
        {
            id: "demo-1",
            name: "Product A",
            category: "Electronics",
            description: "Laptop and accessories",
            weight: 5,
            volume: 0.02
        },
        {
            id: "demo-2",
            name: "Product B",
            category: "Home goods",
            description: "Kitchen supplies",
            weight: 12,
            volume: 0.05
        },
        {
            id: "demo-3",
            name: "Product C",
            category: "Clothing",
            description: "Folded clothes",
            weight: 1.5,
            volume: 0.005
        }
    ];

    const tableBody =
        document.getElementById("products-table-body");

    const tableContainer =
        document.querySelector(".products-table-container");

    const noProducts =
        document.getElementById("no-products");

    const details =
        document.getElementById("product-details");

    let savedProducts = [];

    try {
        const saved = JSON.parse(
            localStorage.getItem("cmsProducts") || "[]"
        );

        if (Array.isArray(saved)) {
            savedProducts = saved;
        }

    } catch (error) {
        console.warn("Could not load saved products.", error);
    }

    // Show sample products if none have been registered
    const showingDemo = savedProducts.length === 0;

    const products = showingDemo
        ? sampleProducts
        : savedProducts;

    // Inform the user when demo data is being displayed
    if (showingDemo) {

        const note = document.createElement("p");

        note.className = "text-muted";

        note.textContent =
            "Sample products for demonstration. " +
            "Use New Product to register your own products.";

        tableContainer.insertAdjacentElement(
            "beforebegin", note
        );
    }

    tableBody.replaceChildren();

    // Always show the table for the demo or saved products
    tableContainer.hidden = false;
    noProducts.hidden = true;

    // Create a table row for each product
    products.forEach(function (product) {

        const row = document.createElement("tr");

        const values = [
            product.name,
            product.category,
            product.description,
            product.weight + " kg",
            product.volume + " m³"
        ];

        values.forEach(function (value) {

            const cell = document.createElement("td");

            cell.textContent = value;

            row.appendChild(cell);
        });

        // Actions column
        const actionCell = document.createElement("td");

        const button = document.createElement("button");

        button.type = "button";
        button.className = "btn btn-primary btn-small";
        button.textContent = "View";

        // Show details when View is clicked
        button.addEventListener("click", function () {

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

            details.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });
        });

        actionCell.appendChild(button);
        row.appendChild(actionCell);

        tableBody.appendChild(row);
    });

    // Close product details
    document.getElementById("close-details")
        .addEventListener("click", function () {

            details.hidden = true;

        });

})();
