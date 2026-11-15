
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
            // the logged-in client's own list (session.js)
            localStorage.getItem(userStorageKey("cmsProducts", "client")) || "[]"
        );

        if (Array.isArray(saved)) {
            savedProducts = saved;
        }

    } catch (error) {
        console.warn("Could not load saved products.", error);
    }

    // The demo client (Marta) always has the 3 sample products, plus any
    // she registers, the same list New Order offers her.
    // A new client has NO sample products: only the ones they register.
    const isDemo = isDemoUser("client");                    // session.js
    const products = isDemo
        ? sampleProducts.concat(savedProducts)
        : savedProducts;

    // A new client with no products yet: show the empty message
    if (products.length === 0) {
        tableContainer.hidden = true;
        noProducts.hidden = false;
        return;
    }

    // Tell the demo client which ones are samples
    if (isDemo) {

        const note = document.createElement("p");

        note.className = "text-muted";

        note.textContent =
            "Products A, B and C are sample products for the demonstration. " +
            "Products you register with New Product are added below them.";

        tableContainer.insertAdjacentElement(
            "beforebegin", note
        );
    }

    tableBody.replaceChildren();

    // Show the table
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
