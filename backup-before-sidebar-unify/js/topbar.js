/* =========================================================
   topbar.js — TOP BAR WITH NOTIFICATIONS AND THE USER MENU
   One shared script builds the bar, so each page only needs
   ONE line, placed at the end of <body>:

     <script src="js/topbar.js"
             data-name="Diogo Silva"
             data-role="Courier"
             data-username="diogo.silva"
             data-profile="courier_profile.html"></script>

   data-name      name shown in the menu (initials are made from it)
   data-role      Client | Courier | Staff | Admin
   data-username  optional: if this user saved a new name on the
                  profile page, that name is shown instead
   data-profile   the role's profile page

   The bar is added at the top of <main class="app-content">.
   Its styles are in style.css, section 13.
   ========================================================= */

/* document.currentScript = the <script> tag running this file,
   so we can read its data-... attributes (dataset). It is only
   available right now, while the file runs, so we keep it. */
const topbarSettings = document.currentScript.dataset;


/* ---------------------------------------------------------
   1. NOTIFICATIONS FOR EACH ROLE
   Sample data for Sprint 1, matching the other pages.
   Couriers get real alerts calculated from their vehicles.
   --------------------------------------------------------- */
const ROLE_NOTIFICATIONS = {
    Client: [
        { icon: "ti-truck", text: "Order #1002 is now In Progress.", link: "my-orders.html" },
        { icon: "ti-circle-check", text: "Order #1001 was delivered. Proof of delivery available.", link: "client_orders.html" }
    ],
    Staff: [
        { icon: "ti-user-check", text: "4 couriers are waiting for approval.", link: "staff_courier_approvals.html" },
        { icon: "ti-truck", text: "5 vehicles are waiting for approval.", link: "staff_vehicle_approvals.html" },
        { icon: "ti-alert-triangle", text: "4 vehicle documents need a review.", link: "staff_alerts.html" }
    ],
    Admin: [
        { icon: "ti-user-check", text: "4 staff registrations are waiting for approval.", link: "admin-staff.html" }
    ],
    Courier: []
};

// Courier: one notification for every document that is expired or
// expires soon. Uses loadVehicles() and getDocumentState() from
// vehicles.js, so courier pages must load vehicles.js first.
function getCourierNotifications() {
    if (typeof loadVehicles !== "function") {
        return [];
    }
    const notifications = [];
    loadVehicles().forEach(function (vehicle) {
        [["Insurance", vehicle.insuranceExpiry], ["Inspection", vehicle.inspectionExpiry]].forEach(function (pair) {
            const state = getDocumentState(pair[1]);
            if (state.type !== "success") {
                notifications.push({
                    icon: state.type === "danger" ? "ti-alert-triangle" : "ti-clock",
                    text: pair[0] + " for " + vehicle.plate + ": " + state.label.toLowerCase() + ".",
                    link: "courier-vehicles.html"
                });
            }
        });
    });
    return notifications;
}

function getNotifications(role) {
    if (role === "Courier") {
        return getCourierNotifications();
    }
    return ROLE_NOTIFICATIONS[role] || [];
}


/* ---------------------------------------------------------
   2. SMALL HELPERS
   --------------------------------------------------------- */

// "Diogo Silva" -> "DS"
function getTopbarInitials(fullName) {
    const words = fullName.trim().split(" ");
    const first = words[0].charAt(0);
    const last = words.length > 1 ? words[words.length - 1].charAt(0) : "";
    return first.concat(last).toUpperCase();
}

// If the user changed their name on the profile page, use that name
function getDisplayName() {
    let name = topbarSettings.name || "User";
    try {
        const profiles = JSON.parse(localStorage.getItem("cmsProfiles") || "{}");
        const saved = profiles[topbarSettings.username];
        if (saved !== undefined && saved.fullName) {
            name = saved.fullName;
        }
    } catch (error) {
        // storage blocked: keep the name from the HTML
    }
    return name;
}

// Creates an element with a class and (optional) text
function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) {
        element.className = className;
    }
    if (text !== undefined) {
        element.textContent = text;
    }
    return element;
}

// <i class="ti ti-bell" aria-hidden="true"></i>
function createIcon(iconName) {
    const icon = createElement("i", "ti " + iconName);
    icon.setAttribute("aria-hidden", "true");
    return icon;
}


/* ---------------------------------------------------------
   3. BUILD THE BAR
   --------------------------------------------------------- */
function buildNotificationsMenu(notifications) {
    const wrapper = createElement("div", "topbar-item");

    const button = createElement("button", "topbar-icon-button");
    button.type = "button";
    button.setAttribute("aria-label", "Notifications (" + notifications.length + ")");
    button.setAttribute("aria-expanded", "false");
    button.append(createIcon("ti-bell"));

    if (notifications.length > 0) {
        button.append(createElement("span", "topbar-badge", String(notifications.length)));
    }

    const panel = createElement("div", "topbar-panel topbar-notifications");
    panel.hidden = true;
    panel.append(createElement("p", "topbar-panel-title", "Notifications"));

    if (notifications.length === 0) {
        // Friendly empty state
        const empty = createElement("div", "topbar-empty");
        empty.append(createIcon("ti-bell-check"), createElement("span", "", "You're all caught up."));
        panel.append(empty);
    } else {
        const list = createElement("ul", "topbar-list");
        notifications.forEach(function (notification) {
            const item = document.createElement("li");
            const link = createElement("a", "topbar-notification");
            link.href = notification.link;
            link.append(createIcon(notification.icon), createElement("span", "", notification.text));
            item.append(link);
            list.append(item);
        });
        panel.append(list);
    }

    wrapper.append(button, panel);
    return { wrapper: wrapper, button: button, panel: panel };
}

function buildUserMenu(name, role) {
    const wrapper = createElement("div", "topbar-item");

    const button = createElement("button", "topbar-user");
    button.type = "button";
    button.setAttribute("aria-label", "Account menu for " + name);
    button.setAttribute("aria-expanded", "false");

    const avatar = createElement("span", "topbar-avatar", getTopbarInitials(name));
    avatar.setAttribute("aria-hidden", "true");

    const text = createElement("span", "topbar-user-text");
    text.append(createElement("strong", "", name), createElement("small", "", role));

    button.append(avatar, text, createIcon("ti-chevron-down"));

    const panel = createElement("div", "topbar-panel topbar-account");
    panel.hidden = true;

    const header = createElement("div", "topbar-account-header");
    header.append(createElement("strong", "", name), createElement("small", "", role));

    const profileLink = createElement("a", "topbar-menu-link");
    profileLink.href = topbarSettings.profile || "#";
    profileLink.append(createIcon("ti-user"), createElement("span", "", "My profile"));

    const logoutLink = createElement("a", "topbar-menu-link topbar-logout");
    logoutLink.href = "login.html";
    logoutLink.append(createIcon("ti-logout"), createElement("span", "", "Log out"));

    panel.append(header, profileLink, logoutLink);
    wrapper.append(button, panel);
    return { wrapper: wrapper, button: button, panel: panel };
}


/* ---------------------------------------------------------
   4. OPEN AND CLOSE THE MENUS
   Only one menu is open at a time. A click outside, or the
   Esc key, closes it.
   --------------------------------------------------------- */
const topbarMenus = [];

function closeAllTopbarMenus() {
    topbarMenus.forEach(function (menu) {
        menu.panel.hidden = true;
        menu.button.setAttribute("aria-expanded", "false");
    });
}

function connectMenu(menu) {
    topbarMenus.push(menu);
    menu.button.addEventListener("click", function (event) {
        event.stopPropagation();                 // this click shouldn't count as "outside"
        const wasOpen = !menu.panel.hidden;
        closeAllTopbarMenus();
        if (!wasOpen) {
            menu.panel.hidden = false;
            menu.button.setAttribute("aria-expanded", "true");
        }
    });
    menu.panel.addEventListener("click", function (event) {
        event.stopPropagation();                 // clicks inside the panel keep it open
    });
}

document.addEventListener("click", closeAllTopbarMenus);
document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeAllTopbarMenus();
    }
});


/* ---------------------------------------------------------
   5. START: put the bar at the top of the page content
   --------------------------------------------------------- */
function renderTopbar() {
    const main = document.querySelector(".app-content");
    if (main === null) {
        return;
    }
    const name = getDisplayName();
    const role = topbarSettings.role || "";

    const bar = createElement("header", "topbar");
    const notificationsMenu = buildNotificationsMenu(getNotifications(role));
    const userMenu = buildUserMenu(name, role);
    connectMenu(notificationsMenu);
    connectMenu(userMenu);

    bar.append(notificationsMenu.wrapper, userMenu.wrapper);
    main.prepend(bar);                           // first thing inside <main>
}

renderTopbar();
