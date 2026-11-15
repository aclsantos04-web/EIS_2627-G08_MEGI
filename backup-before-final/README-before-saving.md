[![Open Website](https://img.shields.io/badge/Open-Website-blue)](https://aclsantos04-web.github.io/EIS_2627-G08_MEGI/)

# CMS – Courier Management System

Enterprise Information Systems · Team **G08** · Master in Industrial Engineering and Management (FEUP), 2026/27
**Sprint 1:** static, navigable frontend prototype (HTML5, CSS3, JavaScript).

**Live website:** https://aclsantos04-web.github.io/EIS_2627-G08_MEGI/

## How to explore it

1. Open the website (or `public_html/index.html`, which opens the home page).
2. **Evaluation Index:** the strip at the top of every public page ("Evaluating this project?") opens `evaluation-index.html`, a map with a link to every page, grouped by role.
3. **Demo accounts:** on the Login page, click a role card (Client, Courier, Staff, Admin), or log in with one of these usernames and any password:

| Role | Username | Opens |
|---|---|---|
| Client | `marta.ferreira` | My Orders |
| Courier | `diogo.silva` | Available Orders |
| Staff | `rita.almeida` | Courier Approvals |
| Admin | `admin` | Dashboard |

## A complete flow to try

1. **Client:** New Order → add products, choose origin and destination on the map, choose a delivery service (Standard, Express or Same Day) and see the price.
2. **Courier:** Available Orders → select order #1003 → Accept → Active Route: choose a valid vehicle → Start Delivery → Complete Delivery → sign (or take a photo) → Confirm.
3. **Client:** My Orders → #1003 is now Completed → View → See Proof of Delivery.
4. **Register** as a Courier → the account waits for approval → **Staff** approves it in Courier Approvals → the courier can now log in. Staff accounts are approved by the **Admin** in Staff Approvals.

All pages share the same sample data (`js/accounts.js`, `js/orders.js`, `js/vehicles.js`). Changes are kept in the browser (localStorage). To go back to the original sample data, open the browser console (F12) and type `resetDemo()`.

## Requirements covered

- **Pages:** Home, Login/Register, Client, Courier, Staff and Admin panels, Team page, plus Delivery Services, Contact, FAQs, Apply as Courier and Profile pages for every role.
- **Map (Leaflet.js + OpenStreetMap):** markers from GPS coordinates and a route line on New Order, Order Details and Active Route.
- **JavaScript validation:** every form blocks empty required fields and shows an error message under each field, plus checks for coordinates, email, phone, NIF, dates and files.
- **Business rules:** sequential order status (Initiated → In Progress → Completed / Cancelled), one active order per courier, a cancelled order returns to the list, vehicles need valid insurance and inspection to be chosen, document alerts 3 days before expiry, Staff approve couriers and vehicles, Admin approves staff.

## Project structure

```
public_html/
├── *.html           one file per page
├── css/style.css    shared design (layout, sidebar, cards, buttons, top bar)
├── css/*.css        page-specific styles (public-header, cms-footer, faq, client, courier, staff…)
├── js/              shared logic (validation, accounts, orders, vehicles, topbar, map) and page scripts
└── images/          logos, photos and icons
```

Libraries (loaded from CDN): Leaflet 1.9.4, Chart.js 4.4.1, Tabler Icons 3.19.0, Google Fonts (Inter, Poppins).

## Team G08

| Name | Student ID | Role |
|---|---|---|
| Sofia Monteiro | up202502534 | CEO |
| Ana Santos | up202206735 | COO |
| António Ribeiro | up202208824 | CFO |
| Lara Rego | up202503296 | CMO |

Sprint 2 will replace the browser storage with a database following our ER model (USER, VEHICLE, VEHICLE_TYPE, PRODUCT, ORDER, ROUTE).
