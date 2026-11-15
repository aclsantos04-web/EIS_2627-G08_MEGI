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
   The demo courier is Diogo Silva (the courier shown on
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
/* Each courier has their own list (session.js):
   - the demo courier (Diogo) uses "cmsVehicles" and starts with the samples
   - any other courier uses "cmsVehicles_<username>" and starts with none
   Without session.js on the page, everything is Diogo's, as before. */
function vehicleStorageKey() {
    return typeof userStorageKey === "function"
        ? userStorageKey(VEHICLE_STORAGE_KEY, "courier")
        : VEHICLE_STORAGE_KEY;
}

// The vehicles saved under one storage key ([] if none yet)
function readVehicleList(key) {
    try {
        return JSON.parse(localStorage.getItem(key) || "[]");
    } catch (error) {
        return [];
    }
}

function loadVehicles() {
    const key = vehicleStorageKey();
    try {
        const saved = localStorage.getItem(key);
        if (saved !== null) {
            return JSON.parse(saved);
        }
    } catch (error) {
        console.warn("Could not read saved vehicles, using sample data.", error);
    }
    // only the demo courier has sample vehicles
    return key === VEHICLE_STORAGE_KEY ? getSampleVehicles() : [];
}

function saveVehicles(vehicles) {
    try {
        localStorage.setItem(vehicleStorageKey(), JSON.stringify(vehicles));
    } catch (error) {
        console.warn("Could not save vehicles.", error);
    }
}

// Puts the sample data back. Type resetVehicles() in the
// browser console (F12) before a presentation.
function resetVehicles() {
    try {
        localStorage.removeItem(vehicleStorageKey());
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
   pendingExpiry:   the expiry date of that new certificate. It is
   kept APART from insuranceExpiry / inspectionExpiry and only
   replaces the real date when Staff validate it. If Staff reject
   it, it is thrown away and the old date still counts.
   --------------------------------------------------------- */
function getOtherCourierVehicles() {
    return [
        { plate: "31-PQ-07", courier: "Sara Lima",     courierUsername: "sara.lima", type: "Van",   model: "Ford Transit Connect", maxWeightKg: 700,  maxVolumeM3: 3.6,  insuranceExpiry: addDays(210), inspectionExpiry: addDays(180), approval: "approved" },
        { plate: "55-RT-90", courier: "Sara Lima",     courierUsername: "sara.lima", type: "Truck", model: "MAN TGL",              maxWeightKg: 4000, maxVolumeM3: 18,   insuranceExpiry: addDays(120), inspectionExpiry: addDays(-3),  approval: "approved" },
        { plate: "78-LM-33", courier: "Rui Mendes",    courierUsername: "rui.mendes", type: "Van",   model: "Citroën Berlingo",     maxWeightKg: 650,  maxVolumeM3: 3.3,  insuranceExpiry: addDays(3),   inspectionExpiry: addDays(90),  approval: "approved" },
        { plate: "23-AB-45", courier: "Beatriz Costa", courierUsername: "beatriz.costa", type: "Van",   model: "Renault Master",       maxWeightKg: 1200, maxVolumeM3: 10,   insuranceExpiry: addDays(2),   inspectionExpiry: addDays(200), approval: "approved", updatedDocument: "insurance", pendingExpiry: addDays(365) },
        { plate: "94-XF-21", courier: "Beatriz Costa", courierUsername: "beatriz.costa", type: "Moto",  model: "Yamaha NMAX 125",      maxWeightKg: 25,   maxVolumeM3: 0.08, insuranceExpiry: addDays(280), inspectionExpiry: addDays(270), approval: "pending" },
        { plate: "10-ZZ-44", courier: "Rui Mendes",    courierUsername: "rui.mendes", type: "Moto",  model: "Piaggio Liberty",      maxWeightKg: 20,   maxVolumeM3: 0.06, insuranceExpiry: addDays(300), inspectionExpiry: addDays(240), approval: "pending" }
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
    // Diogo's list is read directly, so the Staff pages see it
    // even when someone else is logged in.
    const savedDiogo = localStorage.getItem(VEHICLE_STORAGE_KEY);
    const diogos = (savedDiogo !== null ? readVehicleList(VEHICLE_STORAGE_KEY) : getSampleVehicles())
        .map(function (vehicle) {
            return Object.assign({ courier: "Diogo Silva", courierUsername: "diogo.silva" }, vehicle);
        });
    const others = getOtherCourierVehicles().map(function (vehicle) {
        return Object.assign({}, vehicle, changes[vehicle.plate] || {});
    });
    // Couriers who registered on the site: each one's own list
    const registered = [];
    getRegisteredCouriers().forEach(function (courier) {
        readVehicleList(VEHICLE_STORAGE_KEY + "_" + courier.username).forEach(function (vehicle) {
            registered.push(Object.assign({ courier: courier.name, courierUsername: courier.username }, vehicle));
        });
    });
    // Show each courier's CURRENT name (they may have edited their profile)
    return diogos.concat(registered, others).map(function (vehicle) {
        const owner = typeof findAccount === "function" && vehicle.courierUsername
            ? findAccount(vehicle.courierUsername)
            : undefined;
        return owner ? Object.assign({}, vehicle, { courier: owner.name }) : vehicle;
    });
}

// Courier accounts created on Register (accounts.js), not the demo one
function getRegisteredCouriers() {
    if (typeof loadRegisteredAccounts !== "function") {
        return [];
    }
    return loadRegisteredAccounts().filter(function (account) {
        return account.role === "courier";
    }).map(applyProfileChanges);                       // their latest name (accounts.js)
}

// Staff change something about a vehicle (approve, reject, review a document)
function updateFleetVehicle(plate, changes) {
    // Is it in Diogo's list, or in the list of a courier who registered?
    const savedDiogo = localStorage.getItem(VEHICLE_STORAGE_KEY);
    const courierLists = [{
        key: VEHICLE_STORAGE_KEY,
        vehicles: savedDiogo !== null ? readVehicleList(VEHICLE_STORAGE_KEY) : getSampleVehicles()
    }];
    getRegisteredCouriers().forEach(function (courier) {
        const key = VEHICLE_STORAGE_KEY + "_" + courier.username;
        courierLists.push({ key: key, vehicles: readVehicleList(key) });
    });
    for (const list of courierLists) {
        const found = list.vehicles.find(function (vehicle) {
            return vehicle.plate === plate;
        });
        if (found !== undefined) {                  // change that courier's own list
            Object.assign(found, changes);
            try {
                localStorage.setItem(list.key, JSON.stringify(list.vehicles));
            } catch (error) {
                console.warn("Could not save the vehicle change.", error);
            }
            return;
        }
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

/* ---------------------------------------------------------
   DECISION ARCHIVE (Staff > Vehicle Approvals > history)
   Every approve / reject / disapprove of a vehicle is written here,
   whichever Staff page it was made on, so the archive is complete.
   Same format as staff_vehicles.js uses ("cmsVehicleApprovalHistory").
   --------------------------------------------------------- */
function recordVehicleDecision(vehicle, decision, justification, consequence) {
    let store = {};
    try {
        store = JSON.parse(localStorage.getItem("cmsVehicleApprovalHistory") || "{}");
    } catch (error) {
        store = {};
    }
    if (!store[vehicle.plate]) {
        store[vehicle.plate] = { currentStatus: vehicle.approval, history: [] };
    }
    store[vehicle.plate].history.push({
        previousStatus: vehicle.approval,
        decision: decision,
        // the Staff member who is logged in (session.js)
        decidedBy: typeof getPageUser === "function" ? getPageUser("staff").name : "Staff",
        date: new Date().toLocaleString("en-GB", {
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit"
        }),
        justification: justification,
        consequence: consequence
    });
    store[vehicle.plate].currentStatus = decision;
    try {
        localStorage.setItem("cmsVehicleApprovalHistory", JSON.stringify(store));
    } catch (error) {
        console.warn("Could not save the vehicle decision.", error);
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
