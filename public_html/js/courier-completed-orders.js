/* =========================================================
   courier-completed-orders.js — LOGIC FOR courier-completed-orders.html
   1. Sample data (the courier's delivered orders)
   2. Summary cards
   3. Table + search
   4. Proof of Delivery pop-up
   ========================================================= */


/* ---------------------------------------------------------
   1. THE COURIER'S DELIVERED ORDERS
   - from js/orders.js: #1001 (Marta, Porto → Aveiro) and any
     order Diogo finishes with a Proof of Delivery
   - plus some older deliveries for other clients (below)
   podType: "signature" | "photo"   (Proof of Delivery type)
   --------------------------------------------------------- */
const pastDeliveries = [
    { id: 998,  origin: "Braga",    destination: "Porto",      deliveredOn: "2026-10-12", vehicle: "CD-34-EF", packages: 1, weightKg: 3,   podType: "photo" },
    { id: 994,  origin: "Aveiro",   destination: "Coimbra",    deliveredOn: "2026-10-08", vehicle: "GH-56-IJ", packages: 6, weightKg: 140, podType: "signature" },
    { id: 990,  origin: "Porto",    destination: "Matosinhos", deliveredOn: "2026-10-02", vehicle: "AA-12-BC", packages: 3, weightKg: 12,  podType: "photo" },
    { id: 985,  origin: "Gaia",     destination: "Porto",      deliveredOn: "2026-09-28", vehicle: "CD-34-EF", packages: 1, weightKg: 2,   podType: "signature" }
];

// Orders from orders.js, turned into the same shape as the list above
const fromOrders = getCourierCompletedOrders().map(function (order) {     // orders.js
    return {
        id: order.id,
        origin: order.origin,
        destination: order.destination,
        deliveredOn: order.deliveredOn,
        vehicle: order.vehicle,
        packages: orderPackages(order),
        weightKg: orderWeight(order),
        podType: order.podType
    };
});

const completedOrders = fromOrders.concat(pastDeliveries);

// Newest first. sort() compares two orders at a time;
// localeCompare() works because dates are "YYYY-MM-DD".
completedOrders.sort(function (a, b) {
    return b.deliveredOn.localeCompare(a.deliveredOn);
});

// "1001" -> "#1001", 998 -> "#0998" (same look as My Orders)
function formatOrderId(id) {
    return "#" + id.toString().padStart(4, "0");
}

function formatPodType(type) {
    return type === "signature" ? "Signature" : "Photo";
}


/* ---------------------------------------------------------
   2. SUMMARY CARDS
   --------------------------------------------------------- */
function renderSummary() {
    // reduce() adds the weight of every order, starting at 0
    const totalWeight = completedOrders.reduce(function (total, order) {
        return total + order.weightKg;
    }, 0);

    document.getElementById("totalDeliveries").textContent = completedOrders.length;
    document.getElementById("totalWeight").textContent = totalWeight + " kg";
    document.getElementById("lastDelivery").textContent =
        completedOrders.length > 0 ? formatDate(completedOrders[0].deliveredOn) : "—";
}


/* ---------------------------------------------------------
   3. TABLE + SEARCH
   --------------------------------------------------------- */

// Plain text cell
function createTextCell(text) {
    const cell = document.createElement("td");
    cell.textContent = text;
    return cell;
}

// Does this order match what was typed in the search box?
// includes() checks if one text contains another.
function matchesSearch(order, searchText) {
    if (searchText.length === 0) {
        return true;
    }
    const searchable = [
        formatOrderId(order.id),
        order.id.toString(),
        order.origin,
        order.destination
    ].join(" ").toLowerCase();

    return searchable.includes(searchText.toLowerCase());
}

function renderTable() {
    const searchText = document.getElementById("orderSearch").value.trim();
    const tbody = document.getElementById("orderRows");
    tbody.innerHTML = "";

    // filter() keeps only the orders that match the search
    const visibleOrders = completedOrders.filter(function (order) {
        return matchesSearch(order, searchText);
    });

    document.getElementById("resultCount").textContent =
        visibleOrders.length + " of " + completedOrders.length + " orders";

    // Nothing to show: a friendly message (helpers in validation.js)
    if (completedOrders.length === 0) {
        tbody.append(createEmptyRow(8, createEmptyState(
            "ti-clipboard-list",
            "No completed deliveries yet",
            "Orders you deliver will appear here with their proof of delivery.",
            { text: "See available orders", href: "courier-available-orders.html" }
        )));
        return;
    }
    if (visibleOrders.length === 0) {
        tbody.append(createEmptyRow(8, createEmptyState(
            "ti-search",
            "No orders match “" + searchText + "”",
            "Try another order number or city.",
            { text: "Clear search", onClick: function () {
                document.getElementById("orderSearch").value = "";
                renderTable();
            } }
        )));
        return;
    }

    visibleOrders.forEach(function (order) {
        const row = document.createElement("tr");

        // Proof of Delivery badge
        const podCell = document.createElement("td");
        const badge = document.createElement("span");
        badge.classList.add("badge", "badge-success");
        badge.textContent = formatPodType(order.podType);
        podCell.append(badge);

        // "View POD" button (same look as the "View" button on My Orders)
        const actionCell = document.createElement("td");
        const button = document.createElement("button");
        button.setAttribute("type", "button");
        button.classList.add("btn", "btn-primary", "btn-small");
        button.textContent = "View POD";
        button.addEventListener("click", function () {
            openPodDialog(order);
        });
        actionCell.append(button);

        row.append(
            createTextCell(formatOrderId(order.id)),
            createTextCell(order.origin),
            createTextCell(order.destination),
            createTextCell(formatDate(order.deliveredOn)),
            createTextCell(order.vehicle),
            createTextCell(order.packages + (order.packages === 1 ? " package" : " packages") + " · " + order.weightKg + " kg"),
            podCell,
            actionCell
        );
        tbody.append(row);
    });
}

// Redraw the table every time the search text changes
document.getElementById("orderSearch").addEventListener("input", renderTable);


/* ---------------------------------------------------------
   4. PROOF OF DELIVERY POP-UP
   The Proof of Delivery page saves the signature or photo of
   each order as "signature_ID" or "photo_ID", so we show it
   here. The older sample orders have no stored image.
   --------------------------------------------------------- */
const podDialog = document.getElementById("podDialog");

// The proof saved for THIS order (courier-proof-delivery.html
// saves "signature_ID" or "photo_ID")
function getSavedProof(order) {
    try {
        return localStorage.getItem((order.podType === "photo" ? "photo_" : "signature_") + order.id);
    } catch (error) {
        return null;
    }
}

function setText(id, text) {
    document.getElementById(id).textContent = text;
}

function openPodDialog(order) {
    setText("podOrder", formatOrderId(order.id));
    setText("podRoute", order.origin + " → " + order.destination);
    setText("podDate", formatDate(order.deliveredOn));
    setText("podVehicle", order.vehicle);
    setText("podType", formatPodType(order.podType));

    const preview = document.getElementById("podPreview");
    preview.innerHTML = "";
    const savedSignature = getSavedProof(order);

    if (savedSignature !== null) {
        const image = document.createElement("img");
        image.setAttribute("src", savedSignature);
        image.setAttribute("alt", "Proof of delivery for order " + formatOrderId(order.id));
        preview.append(image);
    } else if (order.podType === "signature") {
        preview.textContent = "✍️ Signed by the recipient. (Sample order: the image is not stored.)";
    } else {
        preview.textContent = "📷 Photo of the delivered package. (Sample order: the image is not stored.)";
    }

    podDialog.showModal();
}

document.getElementById("closePodButton").addEventListener("click", function () {
    podDialog.close();
});


/* ---------------------------------------------------------
   START
   --------------------------------------------------------- */
renderSummary();
renderTable();
