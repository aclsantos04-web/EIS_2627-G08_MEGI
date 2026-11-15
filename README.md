CMS - COURIER MANAGEMENT SYSTEM
===============================

Enterprise Information Systems, Team G08
Master in Industrial Engineering and Management (FEUP), 2026/27

Sprint 1: a static, navigable frontend prototype built with HTML5, CSS3 and JavaScript.

Live website: https://aclsantos04-web.github.io/EIS_2627-G08_MEGI/


HOW TO EXPLORE IT
-----------------

1. Open the website, or open public_html/index.html (it opens the home page).

2. Evaluation Index: the light-blue strip at the top of every public page ("Evaluating this project?") opens a page with a link to every page of the site, grouped by role.

3. Demo accounts: on the Login page, click one of the four role cards, or log in with one of these usernames and any password:

- Client: marta.ferreira (opens My Orders)
- Courier: diogo.silva (opens Available Orders)
- Staff: rita.almeida (opens Courier Approvals)
- Admin: admin (opens the Dashboard)


A COMPLETE FLOW TO TRY
----------------------

1. Client: New Order. Add products, choose the origin and destination on the map, choose a delivery service (Standard, Express or Same Day) and submit. The order appears in My Orders as Initiated.

2. Courier: Available Orders. Select that order and accept it. On Active Route, choose a valid vehicle, then Start Delivery, then Complete Delivery. Sign (or take a photo) and confirm.

3. Client: My Orders. The order is now Completed. Click View, then See Proof of Delivery.

4. Register as a Courier. The account waits for approval. Log in as Staff and approve it in Courier Approvals; the courier can now log in. Staff accounts are approved by the Admin in Staff Approvals.

5. Your own account. Register as a Client (for example "Ana Santos") and log in with that username or email. Every page now shows that account: its name in the top bar, its profile (name, email, phone, NIF, member since), and its own My Orders and My Products, which start empty. Orders placed on New Order are saved under that client, and a client cannot open another client's order. A registered Courier (once approved) also starts with no vehicles: the vehicles they add are their own, Staff see them under that courier's name, and the orders they accept and complete appear only in their own lists. Log out (or open the Login page) to end the session.

The logged-in user is kept in the browser (js/session.js). A page opened directly, without logging in (for example from the Evaluation Index), shows the demo user of that role. Passwords are not checked, because Sprint 1 has no server to store them.

All pages share the same sample data (js/accounts.js, js/orders.js and js/vehicles.js). Changes are kept in the browser (localStorage). To go back to the original sample data, open the browser console (F12) and type resetDemo()


REQUIREMENTS COVERED
--------------------

- Pages: Home, Login and Register, the Client, Courier, Staff and Admin panels and the Team page, plus Delivery Services, Contact, FAQs, Apply as Courier and a Profile page for every role.

- Map (Leaflet.js and OpenStreetMap): markers from GPS coordinates and a route line on New Order, Order Details and Active Route.

- JavaScript validation: every form blocks empty required fields and shows an error message under each field. There are also checks for coordinates, email, phone, NIF, dates, files and duplicate license plates.

- Business rules:
  - orders move in order: Initiated, In Progress, then Completed or Cancelled
  - a courier has one active order at a time, and a cancelled order goes back to the list
  - a vehicle needs valid insurance and inspection to be chosen for an order
  - document alerts start 3 days before a document expires
  - a new certificate only counts after Staff validate it
  - Staff approve couriers and vehicles, and the Admin approves staff


PROJECT STRUCTURE
-----------------

- public_html: one HTML file per page
- public_html/css/style.css: shared design (layout, sidebar, cards, buttons, top bar)
- public_html/css: page-specific styles (public-header, cms-footer, faq, client, courier, staff and others)
- public_html/js: shared logic (validation, accounts, orders, vehicles, topbar, map) and one script per page
- public_html/images: logos, photos and icons

Libraries (loaded from the internet): Leaflet 1.9.4, Chart.js 4.4.1, Tabler Icons 3.19.0 and Google Fonts (Inter and Poppins).


TEAM G08
--------

- Sofia Monteiro, up202502534, CEO
- Ana Santos, up202206735, COO
- António Ribeiro, up202208824, CFO
- Lara Rego, up202503296, CMO


NEXT: SPRINT 2
--------------

Sprint 2 will replace the browser storage with a database that follows our ER model (USER, VEHICLE, VEHICLE_TYPE, PRODUCT, ORDER and ROUTE).
