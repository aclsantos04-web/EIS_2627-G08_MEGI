/* =========================================================
   my-orders.js — CLIENT → MY ORDERS
   Lists Marta's orders from js/orders.js (newest first).
   "View" opens client_orders.html?order=ID.
   An order made on New Order, or accepted / delivered by a
   courier, shows its new status here straight away.
   ========================================================= */

const CLIENT_NAME = "Marta Ferreira";       // the client of the demo

(function () {
    const tableBody = document.getElementById("orderRows");

    const orders = getClientOrders(CLIENT_NAME).sort(function (a, b) {
        return b.id - a.id;                  // newest (highest number) first
    });

    orders.forEach(function (order) {
        const row = document.createElement("tr");

        [orderNumber(order), order.origin, order.destination].forEach(function (text) {
            const cell = document.createElement("td");
            cell.textContent = text;
            row.append(cell);
        });

        const statusCell = document.createElement("td");
        const badge = document.createElement("span");
        badge.className = "badge " + STATUS_BADGES[order.status];
        badge.textContent = order.status;
        statusCell.append(badge);

        const dateCell = document.createElement("td");
        dateCell.textContent = orderDate(order.created);

        const actionCell = document.createElement("td");
        const link = document.createElement("a");
        link.href = "client_orders.html?order=" + order.id;
        link.className = "btn btn-primary btn-small";
        link.textContent = "View";
        actionCell.append(link);

        row.append(statusCell, dateCell, actionCell);
        tableBody.append(row);
    });
})();
