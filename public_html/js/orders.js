/* =========================================================
   orders.js — ALL ORDERS OF THE PROTOTYPE, IN ONE PLACE
   Used by: my-orders.html, client_orders.html,
            client_new_order.html (new orders are added here),
            courier-available-orders.html, courier-active-route.html,
            courier-proof-delivery.html, courier-completed-orders.html

   Every page reads the orders from here, so a change made by
   one user is seen by the others. The story:
     #1001 Porto → Aveiro       Marta  Completed by Diogo (AA-12-BC)
     #1002 Braga → Porto        Marta  In Progress with Sara Lima
     #1003 Lisboa → Coimbra     Marta  Initiated, waiting for a courier
     #1004 Viana → Braga        Marta  Cancelled
     #1005 Matosinhos → Porto   Carlos Initiated, waiting for a courier
     #1006 Porto → Guimarães    Carlos Initiated, waiting for a courier
   The courier Diogo Silva can accept #1003, #1005 or #1006
   (one at a time), choose a vehicle, start, cancel or finish
   it with a Proof of Delivery. Marta then sees the new status.

   What changes is kept in localStorage:
     "cmsOrderUpdates"  changes to the sample orders (status, courier...)
     "cmsNewOrders"     orders created on New Order
     "cmsActiveOrder"   the order Diogo is doing now ("single active task")
   resetDemo() (accounts.js) or resetOrders() clears them.
   In Sprint 2 these become the ORDER and ROUTE tables.
   ========================================================= */


/* ---------------------------------------------------------
   1. SAMPLE ORDERS (one object = one row of the ORDER table)
   status:  "Initiated" | "In Progress" | "Completed" | "Cancelled"
   courier: null while no courier has accepted it
   products:  [name, quantity, weight of one unit in kg, volume of one unit in m³]
   --------------------------------------------------------- */
const COURIER_NAME = "Diogo Silva";          // the courier of the demo

const SAMPLE_ORDERS = [
    {
        id: 1001, client: "Marta Ferreira", created: "2026-10-15",
        origin: "Porto", originCoords: [41.1496, -8.6109],
        destination: "Aveiro", destinationCoords: [40.6405, -8.6538],
        distanceKm: 70, status: "Completed",
        courier: "Diogo Silva", vehicle: "AA-12-BC",
        deliveredOn: "2026-10-15", podType: "signature",
        products: [["Books", 1, 5, 0.01], ["Shoes", 1, 3, 0.02]]
    },
    {
        id: 1002, client: "Marta Ferreira", created: "2026-10-18",
        origin: "Braga", originCoords: [41.5454, -8.4265],
        destination: "Porto", destinationCoords: [41.1496, -8.6109],
        distanceKm: 55, status: "In Progress",
        courier: "Sara Lima", vehicle: "31-PQ-07",
        products: [["Laptop", 1, 3, 0.015]]
    },
    {
        id: 1003, client: "Marta Ferreira", created: "2026-10-20",
        origin: "Lisboa", originCoords: [38.7223, -9.1393],
        destination: "Coimbra", destinationCoords: [40.2033, -8.4103],
        distanceKm: 205, status: "Initiated",
        courier: null, vehicle: null,
        products: [["Kitchen set", 1, 12, 0.08]]
    },
    {
        id: 1004, client: "Marta Ferreira", created: "2026-10-21",
        origin: "Viana do Castelo", originCoords: [41.6932, -8.8329],
        destination: "Braga", destinationCoords: [41.5454, -8.4265],
        distanceKm: 60, status: "Cancelled",
        courier: null, vehicle: null,
        products: [["Office chair", 1, 7, 0.15]]
    },
    {
        id: 1005, client: "Carlos Mendes", created: "2026-11-12",
        origin: "Matosinhos", originCoords: [41.1821, -8.6891],
        destination: "Porto", destinationCoords: [41.1579, -8.6291],
        distanceKm: 9, status: "Initiated",
        courier: null, vehicle: null,
        products: [["Clothes", 2, 3, 0.04]]
    },
    {
        id: 1006, client: "Carlos Mendes", created: "2026-11-13",
        origin: "Porto", originCoords: [41.1579, -8.6291],
        destination: "Guimarães", destinationCoords: [41.4425, -8.2918],
        distanceKm: 55, status: "Initiated",
        courier: null, vehicle: null,
        products: [["Bookshelf", 1, 30, 0.35], ["Desk lamp", 2, 2, 0.02]]
    }
];


/* ---------------------------------------------------------
   2. READ THE ORDERS (sample + changes + new ones)
   readStored / writeStored are small helpers that use
   localStorage safely (they are also in accounts.js; here
   they get their own names so the two files never clash).
   --------------------------------------------------------- */
function readOrderStorage(key, emptyValue) {
    try {
        const saved = localStorage.getItem(key);
        return saved === null ? emptyValue : JSON.parse(saved);
    } catch (error) {
        return emptyValue;
    }
}

function writeOrderStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.warn("Could not save the order changes.", error);
    }
}

// Every order, with the saved changes applied on top.
// Object.assign({}, a, b) makes a copy of a with b's values over it.
function getAllOrders() {
    const updates = readOrderStorage("cmsOrderUpdates", {});
    const all = SAMPLE_ORDERS.concat(readOrderStorage("cmsNewOrders", []));
    return all.map(function (order) {
        return Object.assign({}, order, updates[order.id] || {});
    });
}

function getOrder(id) {
    return getAllOrders().find(function (order) {
        return String(order.id) === String(id);
    });
}

// Saves a change to one order, e.g. updateOrder(1003, { status: "In Progress" })
function updateOrder(id, changes) {
    const updates = readOrderStorage("cmsOrderUpdates", {});
    updates[id] = Object.assign({}, updates[id] || {}, changes);
    writeOrderStorage("cmsOrderUpdates", updates);
}


/* ---------------------------------------------------------
   3. SMALL HELPERS FOR SHOWING AN ORDER
   --------------------------------------------------------- */
// 1001 -> "#1001"
function orderNumber(order) {
    return "#" + order.id;
}

// Total weight in kg, e.g. Books 1 × 5 + Shoes 1 × 3 = 8
function orderWeight(order) {
    return order.products.reduce(function (total, product) {
        return total + product[1] * product[2];
    }, 0);
}

function orderVolume(order) {
    return order.products.reduce(function (total, product) {
        return total + product[1] * (product[3] || 0);
    }, 0);
}

// Number of packages (all units together)
function orderPackages(order) {
    return order.products.reduce(function (total, product) {
        return total + product[1];
    }, 0);
}

// "2 packages · 8 kg"
function orderLoadText(order) {
    const packages = orderPackages(order);
    return packages + (packages === 1 ? " package" : " packages") + " · " + orderWeight(order) + " kg";
}

// "Books (1 unit, 5 kg)"
function productText(product) {
    return product[0] + " (" + product[1] + (product[1] === 1 ? " unit, " : " units, ") + product[2] + " kg each)";
}

// "2026-10-15" -> "15/10/2026"
function orderDate(dateText) {
    const parts = dateText.split("-");
    return parts[2] + "/" + parts[1] + "/" + parts[0];
}

// Badge class of style.css for each status
const STATUS_BADGES = {
    "Initiated": "badge-warning",
    "In Progress": "badge-info",
    "Completed": "badge-success",
    "Cancelled": "badge-danger"
};


/* ---------------------------------------------------------
   4. THE CLIENT
   --------------------------------------------------------- */
function getClientOrders(clientName) {
    return getAllOrders().filter(function (order) {
        return order.client === clientName;
    });
}

// Saves an order made on New Order. It starts as "Initiated",
// so it appears straight away in the couriers' Available Orders.
function createOrder(details) {
    const newOrders = readOrderStorage("cmsNewOrders", []);
    const highestId = getAllOrders().reduce(function (highest, order) {
        return Math.max(highest, order.id);
    }, 0);
    const order = Object.assign({
        id: highestId + 1,
        created: new Date().toISOString().slice(0, 10),
        status: "Initiated",
        courier: null,
        vehicle: null
    }, details);
    newOrders.push(order);
    writeOrderStorage("cmsNewOrders", newOrders);
    return order;
}


/* ---------------------------------------------------------
   5. THE COURIER (Diogo Silva)
   "Single active task": he can only have one accepted order
   that is not finished. Its number is kept in "cmsActiveOrder".
   --------------------------------------------------------- */
// Orders nobody has accepted yet
function getAvailableOrders() {
    return getAllOrders().filter(function (order) {
        return order.status === "Initiated" && order.courier === null;
    });
}

// The order Diogo is doing now, or null
function getActiveOrder() {
    const id = readOrderStorage("cmsActiveOrder", null);
    if (id === null) {
        return null;
    }
    const order = getOrder(id);
    const unfinished = order !== undefined && (order.status === "Initiated" || order.status === "In Progress");
    return unfinished ? order : null;
}

// Accept: the order is his, still "Initiated" until he starts
function acceptOrder(id) {
    updateOrder(id, { courier: COURIER_NAME });
    writeOrderStorage("cmsActiveOrder", id);
}

// Start: a vehicle is chosen and the order is "In Progress"
function startOrder(id, plate) {
    updateOrder(id, { status: "In Progress", vehicle: plate });
}

// Cancel by the courier: the order goes back to the list of
// available orders (as the brief asks) and he is free again.
function releaseOrder(id) {
    updateOrder(id, { status: "Initiated", courier: null, vehicle: null });
    writeOrderStorage("cmsActiveOrder", null);
}

// Finish: after the Proof of Delivery
function completeOrder(id, podType) {
    updateOrder(id, {
        status: "Completed",
        deliveredOn: new Date().toISOString().slice(0, 10),
        podType: podType
    });
    writeOrderStorage("cmsActiveOrder", null);
}

// Orders this courier delivered
function getCourierCompletedOrders() {
    return getAllOrders().filter(function (order) {
        return order.courier === COURIER_NAME && order.status === "Completed";
    });
}


/* ---------------------------------------------------------
   6. RESET (only the orders)
   --------------------------------------------------------- */
function resetOrders() {
    ["cmsOrderUpdates", "cmsNewOrders", "cmsActiveOrder"].forEach(function (key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            // storage blocked: nothing to reset
        }
    });
}
