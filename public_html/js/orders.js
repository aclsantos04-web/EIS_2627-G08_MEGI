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
// The courier using the page (session.js): the logged-in courier,
// or the demo courier Diogo Silva when nobody is logged in.
const COURIER_NAME = typeof getPageUser === "function"
    ? getPageUser("courier").name
    : "Diogo Silva";
// Each courier has their own active order ("cmsActiveOrder" for Diogo,
// "cmsActiveOrder_<username>" for the others)
const COURIER_USERNAME = typeof getPageUser === "function"
    ? getPageUser("courier").username
    : "diogo.silva";
const ACTIVE_ORDER_KEY = typeof userStorageKey === "function"
    ? userStorageKey("cmsActiveOrder", "courier")
    : "cmsActiveOrder";

const SAMPLE_ORDERS = [
    {
        id: 1001, client: "Marta Ferreira", clientUsername: "marta.ferreira", created: "2026-10-15", service: "Standard",
        origin: "Porto", originCoords: [41.1496, -8.6109],
        destination: "Aveiro", destinationCoords: [40.6405, -8.6538],
        distanceKm: 70, status: "Completed",
        courier: "Diogo Silva", courierUsername: "diogo.silva", vehicle: "AA-12-BC",
        deliveredOn: "2026-10-15", podType: "signature",
        products: [["Books", 1, 5, 0.01], ["Shoes", 1, 3, 0.02]]
    },
    {
        id: 1002, client: "Marta Ferreira", clientUsername: "marta.ferreira", created: "2026-10-18", service: "Express",
        origin: "Braga", originCoords: [41.5454, -8.4265],
        destination: "Porto", destinationCoords: [41.1496, -8.6109],
        distanceKm: 55, status: "In Progress",
        courier: "Sara Lima", courierUsername: "sara.lima", vehicle: "31-PQ-07",
        products: [["Laptop", 1, 3, 0.015]]
    },
    {
        id: 1003, client: "Marta Ferreira", clientUsername: "marta.ferreira", created: "2026-10-20", service: "Standard",
        origin: "Lisboa", originCoords: [38.7223, -9.1393],
        destination: "Coimbra", destinationCoords: [40.2033, -8.4103],
        distanceKm: 205, status: "Initiated",
        courier: null, vehicle: null,
        products: [["Kitchen set", 1, 12, 0.08]],
        notes: "Fragile: glass items inside, please keep upright."
    },
    {
        id: 1004, client: "Marta Ferreira", clientUsername: "marta.ferreira", created: "2026-10-21", service: "Standard",
        origin: "Viana do Castelo", originCoords: [41.6932, -8.8329],
        destination: "Braga", destinationCoords: [41.5454, -8.4265],
        distanceKm: 60, status: "Cancelled",
        courier: null, vehicle: null,
        products: [["Office chair", 1, 7, 0.15]]
    },
    {
        id: 1005, client: "Carlos Mendes", clientUsername: "carlos.mendes", created: "2026-11-12", service: "Same Day",
        origin: "Matosinhos", originCoords: [41.1821, -8.6891],
        destination: "Porto", destinationCoords: [41.1579, -8.6291],
        distanceKm: 9, status: "Initiated",
        courier: null, vehicle: null,
        products: [["Clothes", 2, 3, 0.04]],
        notes: "Please ring the bell at door 2. If nobody answers, leave it with the neighbour at door 3."
    },
    {
        id: 1006, client: "Carlos Mendes", clientUsername: "carlos.mendes", created: "2026-11-13", service: "Express",
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
        const full = Object.assign({}, order, updates[order.id] || {});
        // Orders are linked to people by USERNAME; the name shown is
        // always the person's current name (if they edited their profile,
        // every order shows the new one). findAccount is in accounts.js.
        if (typeof findAccount === "function") {
            const client = full.clientUsername ? findAccount(full.clientUsername) : undefined;
            const courier = full.courierUsername ? findAccount(full.courierUsername) : undefined;
            if (client) { full.client = client.name; }
            if (courier) { full.courier = courier.name; }
        }
        return full;
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

// "2 packages · 8 kg · 0.12 m³"
function orderLoadText(order) {
    const packages = orderPackages(order);

    return packages +
        (packages === 1 ? " package" : " packages") +
        " · " +
        orderWeight(order) +
        " kg · " +
        orderVolume(order).toFixed(2) +
        " m³";
}

// Delivery service (chosen on New Order) and how fast it is
const SERVICE_ETAS = {
    "Standard": "2 – 3 business days",
    "Express": "Next business day",
    "Same Day": "4 – 6 hours"
};

// "Express · next business day"
function serviceText(order) {
    const service = order.service || "Standard";
    return service + " · " + SERVICE_ETAS[service].charAt(0).toLowerCase() + SERVICE_ETAS[service].slice(1);
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

// Orders of one client account. New orders remember the
// username (clientUsername); the name is only a fallback for orders without one.
function getUserOrders(user) {
    return getAllOrders().filter(function (order) {
        return order.clientUsername === user.username ||
            (!order.clientUsername && order.client === user.name);
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

// The order this courier is doing now, or null
function getActiveOrder() {
    const id = readOrderStorage(ACTIVE_ORDER_KEY, null);
    if (id === null) {
        return null;
    }
    const order = getOrder(id);
    const unfinished = order !== undefined && (order.status === "Initiated" || order.status === "In Progress");
    return unfinished ? order : null;
}

// Accept: the order is his, still "Initiated" until he starts
function acceptOrder(id) {
    if (getActiveOrder() !== null) {
        return false;
    }

    const order = getOrder(id);

    if (!order ||
        order.status !== "Initiated" ||
        order.courier !== null) {
        return false;
    }

    updateOrder(id, { courier: COURIER_NAME, courierUsername: COURIER_USERNAME });
    writeOrderStorage(ACTIVE_ORDER_KEY, id);

    return true;
}

// Start: a vehicle is chosen and the order is "In Progress"
function startOrder(id, plate) {
    updateOrder(id, { status: "In Progress", vehicle: plate });
}

// Cancel by the courier: the order goes back to the list of
// available orders (as the brief asks) and he is free again.
function releaseOrder(id) {
    updateOrder(id, { status: "Initiated", courier: null, courierUsername: null, vehicle: null });
    writeOrderStorage(ACTIVE_ORDER_KEY, null);
}

// Finish: after the Proof of Delivery
function completeOrder(id, podType) {
    updateOrder(id, {
        status: "Completed",
        deliveredOn: new Date().toISOString().slice(0, 10),
        podType: podType
    });
    writeOrderStorage(ACTIVE_ORDER_KEY, null);
}

// Orders this courier delivered
function getCourierCompletedOrders() {
    return getAllOrders().filter(function (order) {
        return isMyCourierOrder(order) && order.status === "Completed";
    });
}

// Is this order assigned to the courier using the page?
// (by username; very old saved orders may only have the name)
function isMyCourierOrder(order) {
    return order.courierUsername
        ? order.courierUsername === COURIER_USERNAME
        : order.courier === COURIER_NAME;
}


/* ---------------------------------------------------------
   6. RESET (only the orders)
   --------------------------------------------------------- */
function resetOrders() {
    ["cmsOrderUpdates", "cmsNewOrders", "cmsActiveOrder", ACTIVE_ORDER_KEY].forEach(function (key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            // storage blocked: nothing to reset
        }
    });
}
