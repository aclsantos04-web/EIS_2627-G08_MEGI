/* =========================================================
   admin.js — ADMIN DASHBOARD LOGIC
   1. Sample data   (what the database will give us in Sprint 2)
   2. Calculations  (KPIs are worked out from the data, so the
                     numbers on the page always agree with each other)
   3. Fill the number cards
   4. Draw the two charts with Chart.js
   ========================================================= */


/* ---------------------------------------------------------
   1. SAMPLE DATA
     users      -> USER.role  (and account_status = "pending")
     orders     -> ORDER.status
     routes     -> ROUTE.status
     documents  -> VEHICLE insurance / inspection expiry dates
   --------------------------------------------------------- */
const dashboardData = {
    month: "October 2026",

    users: {
        clients: 100,
        couriers: 27,
        staff: 6,
        pendingStaff: 2              // staff accounts waiting for the Admin
    },

    orders: {                        // orders created this month, by status
        initiated: 38,
        inProgress: 17,
        completed: 132,
        cancelled: 13
    },

    ordersPerWeek: [
        { week: "W1", orders: 42 },
        { week: "W2", orders: 55 },
        { week: "W3", orders: 48 },
        { week: "W4", orders: 55 }
    ],

    routes: {
        active: 9,
        completed: 64
    },

    averageDeliveryDays: 1.8,

    expiringDocuments: {             // expired or expiring in 3 days or less
        insurance: 2,
        inspection: 1
    },

    averageLoad: 0.30                // 30% of vehicle capacity used on average
};


/* ---------------------------------------------------------
   2. CALCULATIONS
   --------------------------------------------------------- */

// Adds up every number inside an object, e.g. { a: 2, b: 3 } -> 5
// Object.values() gives [2, 3]; reduce() adds them one by one.
function sumValues(object) {
    return Object.values(object).reduce(function (total, value) {
        return total + value;
    }, 0);
}

// Turns 0.912 into "91%"
function toPercent(fraction) {
    return Math.round(fraction * 100).toString().concat("%");
}

// "Active" = not finished yet = Initiated + In Progress
function getActiveOrders(orders) {
    return orders.initiated + orders.inProgress;
}

// Of the orders that are finished, how many were delivered (not cancelled)?
function getCompletionRate(orders) {
    const finished = orders.completed + orders.cancelled;
    if (finished === 0) {
        return 0;                    // avoid dividing by zero
    }
    return orders.completed / finished;
}

// Below 50% means vehicles are travelling mostly empty
function describeLoad(load) {
    if (load < 0.5) {
        return "under-utilized";
    }
    if (load > 0.9) {
        return "close to full capacity";
    }
    return "good utilization";
}

// "1 courier" / "2 couriers"
function plural(count, word) {
    return count === 1 ? count + " " + word : count + " " + word + "s";
}


/* ---------------------------------------------------------
   3. FILL THE NUMBER CARDS
   setText() finds an element by its id and writes text in it.
   --------------------------------------------------------- */
function setText(id, text) {
    document.getElementById(id).textContent = text;
}

function renderKpis(data) {
    const totalOrders = sumValues(data.orders);
    const activeOrders = getActiveOrders(data.orders);
    const completionRate = getCompletionRate(data.orders);
    const expiringTotal = sumValues(data.expiringDocuments);

    setText("periodLabel", "Overview for " + data.month);

    // Row 1
    setText("kpiClients", data.users.clients);
    setText("kpiCouriers", data.users.couriers);
    setText("kpiStaff", data.users.staff);
    setText("kpiActiveRoutes", data.routes.active);
    setText("kpiCompletedRoutes", plural(data.routes.completed, "route") + " completed");
    setText("kpiDeliveryTime", data.averageDeliveryDays.toFixed(1));

    // Only show the "waiting for approval" link if someone is waiting
    const pendingLink = document.getElementById("kpiPendingStaff");
    if (data.users.pendingStaff > 0) {
        pendingLink.textContent = data.users.pendingStaff + " waiting for approval";
    } else {
        pendingLink.remove();
    }

    // Row 3
    setText("kpiActiveOrders", activeOrders);
    setText("kpiActiveOrdersNote", "of " + totalOrders + " this month");

    setText("kpiCompletion", toPercent(completionRate));
    setText("kpiCompletionNote", toPercent(1 - completionRate) + " cancelled");

    setText("kpiExpiring", expiringTotal);
    setText("kpiExpiringNote",
        data.expiringDocuments.insurance + " insurance, " +
        data.expiringDocuments.inspection + " inspection");

    setText("kpiLoad", toPercent(data.averageLoad));
    setText("kpiLoadNote", describeLoad(data.averageLoad));
}


/* ---------------------------------------------------------
   4. CHARTS (Chart.js)
   new Chart(canvas, { type, data, options }) draws a chart
   inside a <canvas>. Docs: https://www.chartjs.org/docs/
   --------------------------------------------------------- */

// Same blues as style.css, plus the status colours from the mockup
const COLORS = {
    initiated: "#4A7FD4",
    inProgress: "#F5D547",
    completed: "#86B97D",
    cancelled: "#F0646A",
    bar: "#1B4B91"
};

function drawStatusChart(orders) {
    const total = sumValues(orders);
    const counts = [orders.initiated, orders.inProgress, orders.completed, orders.cancelled];

    // Labels include the percentage, e.g. "Initiated (19%)"
    const names = ["Initiated", "In Progress", "Completed", "Cancelled"];
    const labels = names.map(function (name, i) {
        return name + " (" + toPercent(counts[i] / total) + ")";
    });

    new Chart(document.getElementById("statusChart"), {
        type: "doughnut",
        data: {
            labels: labels,
            datasets: [{
                data: counts,
                backgroundColor: [COLORS.initiated, COLORS.inProgress, COLORS.completed, COLORS.cancelled],
                borderWidth: 2
            }]
        },
        options: {
            maintainAspectRatio: false,          // fill the .chart-box height
            cutout: "55%",                       // size of the hole in the middle
            plugins: {
                legend: { position: "right" }
            }
        }
    });
}

function drawWeeklyChart(weeks) {
    new Chart(document.getElementById("weeklyChart"), {
        type: "bar",
        data: {
            labels: weeks.map(function (w) { return w.week; }),
            datasets: [{
                label: "Orders",
                data: weeks.map(function (w) { return w.orders; }),
                backgroundColor: COLORS.bar,
                borderRadius: 6
            }]
        },
        options: {
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }       // only one series, no legend needed
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// If the Chart.js file could not be downloaded (no internet),
// show a message instead of leaving an empty box.
function showChartError() {
    document.querySelectorAll(".chart-box").forEach(function (box) {
        box.innerHTML = "<p class='chart-error'>Chart unavailable (no internet connection).</p>";
    });
}


/* ---------------------------------------------------------
   START: runs once when the page loads
   --------------------------------------------------------- */
renderKpis(dashboardData);

if (typeof Chart === "undefined") {
    showChartError();
} else {
    drawStatusChart(dashboardData.orders);
    drawWeeklyChart(dashboardData.ordersPerWeek);
}
