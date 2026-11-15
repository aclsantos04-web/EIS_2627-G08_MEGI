/* =========================================================
   my-orders.js — CLIENT → MY ORDERS
   Lists the orders of the logged-in client (session.js),
   from js/orders.js, newest first. The demo client (Marta)
   has sample orders; a new client starts with none.
   "View" opens client_orders.html?order=ID.
   An order made on New Order, or accepted / delivered by a
   courier, shows its new status here straight away.
   ========================================================= */

const currentClient = getPageUser("client");     // session.js

(function () {
    const tableBody = document.getElementById("orderRows");

    const orders = getUserOrders(currentClient).sort(function (a, b) {
        return b.id - a.id;                  // newest (highest number) first
    });

    // No orders yet: a friendly message with a link to New Order
    if (orders.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 6;
        cell.className = "empty-row";
        cell.append("You haven't placed any orders yet. ");
        const link = document.createElement("a");
        link.href = "client_new_order.html";
        link.textContent = "Place your first order";
        cell.append(link);
        row.append(cell);
        tableBody.append(row);
        return;
    }

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
