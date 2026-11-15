/* =========================================================
   vehicles.js — COURIER VEHICLES: DATA AND DATE HELPERS
   Used by: courier-vehicles.html, courier-add-vehicle.html,
            courier-active-route.html (choose a vehicle),
            courier-completed-orders.html (dates) and the Staff
            pages (vehicle approvals and document alerts)

   Sprint 1 has no database, so the list is kept in the
   browser with localStorage (key "cmsVehicles", same idea
   as "cmsProducts" on the client pages). A vehicle added on
   "Add Vehicle" therefore shows up on "My Vehicles".
   In Sprint 2 these functions will read the database instead.
   ========================================================= */


/* ---------------------------------------------------------
   1. SETTINGS
   --------------------------------------------------------- */
const VEHICLE_STORAGE_KEY = "cmsVehicles";
const ALERT_WINDOW_DAYS = 3;          // warn 3 days before a document expires (forum Q2)


/* ---------------------------------------------------------
   2. DATE HELPERS
   Dates are kept as text "YYYY-MM-DD", the same format as
   <input type="date"> and SQL DATE columns.
   --------------------------------------------------------- */

// Today + n days, as "YYYY-MM-DD" (negative n = in the past)
function addDays(n) {
    const date = new Date();
    date.setDate(date.getDate() + n);
    return date.toISOString().slice(0, 10);
}

// Days from today until dateText (negative = already passed)
function daysUntil(dateText) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);                       // ignore the time of day
    const target = new Date(dateText + "T00:00:00");
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    return Math.round((target.getTime() - today.getTime()) / millisecondsPerDay);
}

// "2026-10-15" -> "15/10/2026" (same date format as My Orders)
function formatDate(dateText) {
    const parts = dateText.split("-");
    return parts[2] + "/" + parts[1] + "/" + parts[0];
}

// Is a document valid, expiring soon or expired?
// "type" matches the badge classes of style.css: success / warning / danger
function getDocumentState(dateText) {
    const days = daysUntil(dateText);

    if (days < 0) {
        return { type: "danger", label: "Expired" };
    }
    if (days === 0) {
        return { type: "warning", label: "Expires today" };
    }
    if (days <= ALERT_WINDOW_DAYS) {
        const unit = days === 1 ? " day" : " days";
        return { type: "warning", label: "Expires in " + days + unit };
    }
    return { type: "success", label: "Valid" };
}


/* ---------------------------------------------------------
   3. SAMPLE TEST DATA
   The logged-in courier is Diogo Silva (the courier shown on
   the client's order page). His vehicles are the same ones
   offered on the Active Route page.
   Each object = one row of the VEHICLE table in the ER model.
   approval: "approved" | "pending" | "denied"
   --------------------------------------------------------- */
function getSampleVehicles() {
    return [
        { plate: "AA-12-BC", type: "Van",   model: "Renault Kangoo",  maxWeightKg: 650,  maxVolumeM3: 3.3, insuranceExpiry: "2027-05-15", inspectionExpiry: "2027-04-10", approval: "approved" },
        { plate: "CD-34-EF", type: "Van",   model: "Peugeot Partner", maxWeightKg: 600,  maxVolumeM3: 3.0, insuranceExpiry: addDays(2),   inspectionExpiry: addDays(140),  approval: "approved" },
        { plate: "GH-56-IJ", type: "Truck", model: "Iveco Daily",     maxWeightKg: 3500, maxVolumeM3: 16,  insuranceExpiry: addDays(95),  inspectionExpiry: addDays(-6),   approval: "approved" },
        { plate: "KL-78-MN", type: "Moto",  model: "Honda PCX 125",   maxWeightKg: 25,   maxVolumeM3: 0.08, insuranceExpiry: addDays(300), inspectionExpiry: addDays(250), approval: "pending" }
    ];
}


/* ---------------------------------------------------------
   4. LOAD, SAVE, RESET
   localStorage only keeps text, so the list is converted with
   JSON.stringify() (list -> text) and JSON.parse() (text -> list).
   try/catch: if the browser blocks storage, the page still
   works with the sample data (it just doesn't remember changes).
   --------------------------------------------------------- */
function loadVehicles() {
    try {
        const saved = localStorage.getItem(VEHICLE_STORAGE_KEY);
        if (saved !== null) {
            return JSON.parse(saved);
        }
    } catch (error) {
        console.warn("Could not read saved vehicles, using sample data.", error);
    }
    return getSampleVehicles();
}

function saveVehicles(vehicles) {
    try {
        localStorage.setItem(VEHICLE_STORAGE_KEY, JSON.stringify(vehicles));
    } catch (error) {
        console.warn("Could not save vehicles.", error);
    }
}

// Puts the sample data back. Type resetVehicles() in the
// browser console (F12) before a presentation.
function resetVehicles() {
    try {
        localStorage.removeItem(VEHICLE_STORAGE_KEY);
    } catch (error) {
        console.warn("Could not reset vehicles.", error);
    }
}

/* ---------------------------------------------------------
   5. THE WHOLE FLEET (for the Staff pages)
   Diogo's vehicles come from loadVehicles(), so when Staff
   approve his KL-78-MN, he sees it approved on My Vehicles.
   The other couriers' vehicles are below. Their dates are
   also counted from today, so the alerts never go out of date.
   updatedDocument: the courier uploaded a new certificate that
   Staff haven't reviewed yet ("insurance" or "inspection").
   --------------------------------------------------------- */
function getOtherCourierVehicles() {
    return [
        { plate: "31-PQ-07", courier: "Sara Lima",     type: "Van",   model: "Ford Transit Connect", maxWeightKg: 700,  maxVolumeM3: 3.6,  insuranceExpiry: addDays(210), inspectionExpiry: addDays(180), approval: "approved" },
        { plate: "55-RT-90", courier: "Sara Lima",     type: "Truck", model: "MAN TGL",              maxWeightKg: 4000, maxVolumeM3: 18,   insuranceExpiry: addDays(120), inspectionExpiry: addDays(-3),  approval: "approved" },
        { plate: "78-LM-33", courier: "Rui Mendes",    type: "Van",   model: "Citroën Berlingo",     maxWeightKg: 650,  maxVolumeM3: 3.3,  insuranceExpiry: addDays(3),   inspectionExpiry: addDays(90),  approval: "approved" },
        { plate: "23-AB-45", courier: "Beatriz Costa", type: "Van",   model: "Renault Master",       maxWeightKg: 1200, maxVolumeM3: 10,   insuranceExpiry: addDays(365), inspectionExpiry: addDays(200), approval: "approved", updatedDocument: "insurance" },
        { plate: "94-XF-21", courier: "Beatriz Costa", type: "Moto",  model: "Yamaha NMAX 125",      maxWeightKg: 25,   maxVolumeM3: 0.08, insuranceExpiry: addDays(280), inspectionExpiry: addDays(270), approval: "pending" },
        { plate: "10-ZZ-44", courier: "Rui Mendes",    type: "Moto",  model: "Piaggio Liberty",      maxWeightKg: 20,   maxVolumeM3: 0.06, insuranceExpiry: addDays(300), inspectionExpiry: addDays(240), approval: "pending" }
    ];
}

const FLEET_STORAGE_KEY = "cmsFleetUpdates";   // Staff decisions about the other couriers' vehicles

// Every vehicle, each with the courier's name
function getFleet() {
    let changes = {};
    try {
        changes = JSON.parse(localStorage.getItem(FLEET_STORAGE_KEY) || "{}");
    } catch (error) {
        changes = {};
    }
    const diogos = loadVehicles().map(function (vehicle) {
        return Object.assign({ courier: "Diogo Silva" }, vehicle);
    });
    const others = getOtherCourierVehicles().map(function (vehicle) {
        return Object.assign({}, vehicle, changes[vehicle.plate] || {});
    });
    return diogos.concat(others);
}

// Staff change something about a vehicle (approve, reject, review a document)
function updateFleetVehicle(plate, changes) {
    const myVehicles = loadVehicles();
    const mine = myVehicles.find(function (vehicle) {
        return vehicle.plate === plate;
    });
    if (mine !== undefined) {                       // one of Diogo's: change his list
        Object.assign(mine, changes);
        saveVehicles(myVehicles);
        return;
    }
    let saved = {};
    try {
        saved = JSON.parse(localStorage.getItem(FLEET_STORAGE_KEY) || "{}");
    } catch (error) {
        saved = {};
    }
    saved[plate] = Object.assign({}, saved[plate] || {}, changes);
    try {
        localStorage.setItem(FLEET_STORAGE_KEY, JSON.stringify(saved));
    } catch (error) {
        console.warn("Could not save the vehicle change.", error);
    }
}

// Can this vehicle be used for an order? Returns "" if yes,
// otherwise the reason (shown next to it in the vehicle list).
function vehicleProblem(vehicle, loadKg, loadM3) {
    if (vehicle.approval !== "approved") {
        return "waiting for Staff approval";
    }
    if (daysUntil(vehicle.insuranceExpiry) < 0) {
        return "insurance expired";
    }
    if (daysUntil(vehicle.inspectionExpiry) < 0) {
        return "inspection expired";
    }
    if (loadKg > vehicle.maxWeightKg) {
        return "too small for " + loadKg + " kg";
    }
    if (loadM3 > vehicle.maxVolumeM3) {
        return "too small for " + loadM3.toFixed(2) + " m³";
    }
    return "";
}
