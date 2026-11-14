/* =========================================================
   courier-completed-orders.js — LOGIC FOR courier-completed-orders.html
   1. Sample data (the courier's delivered orders)
   2. Summary cards
   3. Table + search
   4. Proof of Delivery pop-up
   ========================================================= */


/* ---------------------------------------------------------
   1. SAMPLE DATA
   Same story as the other pages: courier Diogo Silva, his
   vehicles (AA-12-BC, CD-34-EF, GH-56-IJ) and order #1001
   Porto → Aveiro, completed on 15/10/2026 (as on the
   client's My Orders page).
   podType: "signature" | "photo"   (Proof of Delivery type)
   --------------------------------------------------------- */
const completedOrders = [
    { id: 1001, origin: "Porto",    destination: "Aveiro",     deliveredOn: "2026-10-15", vehicle: "AA-12-BC", packages: 2, weightKg: 8,   podType: "signature" },
    { id: 998,  origin: "Braga",    destination: "Porto",      deliveredOn: "2026-10-12", vehicle: "CD-34-EF", packages: 1, weightKg: 3,   podType: "photo" },
    { id: 994,  origin: "Aveiro",   destination: "Coimbra",    deliveredOn: "2026-10-08", vehicle: "GH-56-IJ", packages: 6, weightKg: 140, podType: "signature" },
    { id: 990,  origin: "Porto",    destination: "Matosinhos", deliveredOn: "2026-10-02", vehicle: "AA-12-BC", packages: 3, weightKg: 12,  podType: "photo" },
    { id: 985,  origin: "Gaia",     destination: "Porto",      deliveredOn: "2026-09-28", vehicle: "CD-34-EF", packages: 1, weightKg: 2,   podType: "signature" }
];

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
   The signature drawn on the Proof of Delivery page is saved
   in localStorage as "savedSignature" (the same key the
   client's order page reads), so we show it here for
   signature orders. Photos need a server to be stored, so
   Sprint 1 shows a message instead.
   --------------------------------------------------------- */
const podDialog = document.getElementById("podDialog");

function getSavedSignature() {
    try {
        return localStorage.getItem("savedSignature");
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
    const savedSignature = getSavedSignature();

    if (order.podType === "signature" && savedSignature !== null) {
        const image = document.createElement("img");
        image.setAttribute("src", savedSignature);
        image.setAttribute("alt", "Client signature for order " + formatOrderId(order.id));
        preview.append(image);
    } else if (order.podType === "signature") {
        preview.textContent = "✍️ No signature saved in this browser yet. Sign one on the Proof of Delivery page to see it here.";
    } else {
        preview.textContent = "📷 Photo of the delivered package (photos are stored on the server from Sprint 2).";
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
