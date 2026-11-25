-- =====================================================================
-- CMS - Courier Management System | EIS 2026/27 | Group G08
-- Sprint 2 physical schema (MySQL / MariaDB via phpMyAdmin, InnoDB)
--
-- Built from the team's ER model (v4) plus the tables Sprint 2 needs:
--   payment (WP1), route_stop (WP2), dispatch_proposal (WP3),
--   re-weighing columns on orders (WP4), tariff with the official rates.
--
-- How to use: phpMyAdmin > Import > choose this file > Go.
-- Running it again deletes all tables and data and recreates them.
-- This file has the structure only. Import seed.sql afterwards for sample data.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS cms
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cms;
SET NAMES utf8mb4;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS proof_of_delivery, dispatch_proposal, route_stop, route,
                     payment, order_line, orders, product, category,
                     tariff, delivery_type, alert, vehicle_document, vehicle,
                     vehicle_type, account_decision, `user`;
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- 1. PEOPLE AND APPROVALS
-- =====================================================================

-- One table for all four roles (ER: unified User entity).
CREATE TABLE `user` (
  user_id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username        VARCHAR(50)  NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,              -- password_hash() in PHP
  email           VARCHAR(120) NOT NULL UNIQUE,        -- users can log in with email
  name            VARCHAR(120) NOT NULL,
  phone           VARCHAR(20),
  nif             CHAR(9) UNIQUE,
  profile_photo   VARCHAR(255),
  role            ENUM('client','courier','staff','admin') NOT NULL,
  account_status  ENUM('pending','active','rejected') NOT NULL DEFAULT 'pending',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Approval history, never deleted (ER: AccountDecision).
-- Admin decides on staff accounts; staff decide on courier accounts.
CREATE TABLE account_decision (
  decision_id      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id          INT UNSIGNED NOT NULL,   -- Concerns: the account decided on
  decided_by       INT UNSIGNED NOT NULL,   -- Decides: the admin / staff member
  previous_status  ENUM('pending','active','rejected') NOT NULL,
  decision         ENUM('approved','rejected') NOT NULL,
  justification    VARCHAR(500),
  decided_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_decision_user    FOREIGN KEY (user_id)    REFERENCES `user`(user_id),
  CONSTRAINT fk_decision_decider FOREIGN KEY (decided_by) REFERENCES `user`(user_id)
) ENGINE=InnoDB;

-- =====================================================================
-- 2. VEHICLES, DOCUMENTS AND ALERTS
-- =====================================================================

-- Standard categories. Capacity here is the type's limit (spec: "from Vehicle_Type").
CREATE TABLE vehicle_type (
  type_id        TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  type_name      VARCHAR(30) NOT NULL UNIQUE,
  max_weight_kg  DECIMAL(10,3) NOT NULL,
  max_vol_m3     DECIMAL(10,4) NOT NULL
) ENGINE=InnoDB;

-- A courier's own vehicle (ER: Vehicle, Owns, Of-type).
CREATE TABLE vehicle (
  vehicle_id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  courier_id       INT UNSIGNED NOT NULL,
  type_id          TINYINT UNSIGNED NOT NULL,
  license_plate    VARCHAR(12)  NOT NULL UNIQUE,     -- unique across all couriers
  model            VARCHAR(80)  NOT NULL,
  max_weight_kg    DECIMAL(10,3) NOT NULL,           -- must not exceed the type's limit
  max_vol_m3       DECIMAL(10,4) NOT NULL,
  approval_status  ENUM('pending','approved','disapproved') NOT NULL DEFAULT 'pending',
  approved_by      INT UNSIGNED,                     -- staff member who decided
  approved_at      DATETIME,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_vehicle_courier  FOREIGN KEY (courier_id)  REFERENCES `user`(user_id),
  CONSTRAINT fk_vehicle_type     FOREIGN KEY (type_id)     REFERENCES vehicle_type(type_id),
  CONSTRAINT fk_vehicle_approver FOREIGN KEY (approved_by) REFERENCES `user`(user_id)
) ENGINE=InnoDB;

-- Insurance and inspection documents, with upload history (ER: VehicleDocument, Reviews).
-- A renewed document stays 'pending' until staff validate it; the previous
-- validated row keeps the old expiry date in force until then.
CREATE TABLE vehicle_document (
  document_id    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  vehicle_id     INT UNSIGNED NOT NULL,
  doc_type       ENUM('insurance','inspection') NOT NULL,
  file_path      VARCHAR(255),
  expiry_date    DATE NOT NULL,
  uploaded_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  review_status  ENUM('pending','validated','rejected') NOT NULL DEFAULT 'pending',
  reviewed_by    INT UNSIGNED,
  reviewed_at    DATETIME,
  CONSTRAINT fk_document_vehicle  FOREIGN KEY (vehicle_id)  REFERENCES vehicle(vehicle_id) ON DELETE CASCADE,
  CONSTRAINT fk_document_reviewer FOREIGN KEY (reviewed_by) REFERENCES `user`(user_id)
) ENGINE=InnoDB;

-- Notifications sent to staff or couriers (ER: Alert).
-- Expiring = within 3 days of expiry_date.
CREATE TABLE alert (
  alert_id     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED NOT NULL,          -- who receives it
  document_id  INT UNSIGNED,                   -- the document that caused it, if any
  alert_type   ENUM('expiring','expired','updated','reminder') NOT NULL,
  message      VARCHAR(255) NOT NULL,
  is_read      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_alert_user     FOREIGN KEY (user_id)     REFERENCES `user`(user_id),
  CONSTRAINT fk_alert_document FOREIGN KEY (document_id) REFERENCES vehicle_document(document_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================================
-- 3. PRICING
-- =====================================================================

-- Standard / Express / Same Day (ER: DeliveryType).
-- If the team drops the multipliers, set them all to 1.00.
CREATE TABLE delivery_type (
  dtype_id          TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name              VARCHAR(30) NOT NULL UNIQUE,
  price_multiplier  DECIMAL(4,2) NOT NULL DEFAULT 1.00,
  estimated_time    VARCHAR(60)
) ENGINE=InnoDB;

-- Official Sprint 2 rates (ER: Tariff, Priced-with).
-- Price = base_fee + km * rate_km + MAX(real kg, m3 * volumetric_factor) * rate_kg
-- When the admin changes the rates, close the current row (valid_to = NOW())
-- and insert a new one. Old orders keep pointing at the tariff they were priced with.
CREATE TABLE tariff (
  tariff_id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  base_fee           DECIMAL(8,2) NOT NULL,
  rate_km            DECIMAL(8,2) NOT NULL,
  rate_kg            DECIMAL(8,2) NOT NULL,
  volumetric_factor  SMALLINT UNSIGNED NOT NULL DEFAULT 200,  -- kg per m3
  valid_from         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  valid_to           DATETIME,                                 -- NULL = tariff in force
  created_by         INT UNSIGNED,                             -- admin who set it
  CONSTRAINT fk_tariff_admin FOREIGN KEY (created_by) REFERENCES `user`(user_id)
) ENGINE=InnoDB;

-- =====================================================================
-- 4. PRODUCTS AND ORDERS
-- =====================================================================

CREATE TABLE category (
  category_id  SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- A client's registered products (ER: Product, Registers, In-category).
CREATE TABLE product (
  product_id   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  client_id    INT UNSIGNED NOT NULL,
  category_id  SMALLINT UNSIGNED NOT NULL,
  name         VARCHAR(100) NOT NULL,
  description  VARCHAR(500),
  weight_kg    DECIMAL(10,3) NOT NULL CHECK (weight_kg > 0),
  volume_m3    DECIMAL(10,4) NOT NULL CHECK (volume_m3 > 0),
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_product_client   FOREIGN KEY (client_id)   REFERENCES `user`(user_id),
  CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES category(category_id)
) ENGINE=InnoDB;

-- ER: Order. Named "orders" because ORDER is a reserved word in SQL.
-- Status flow: pending_payment -> paid -> initiated -> in_progress -> completed
--              rto_hold (WP4) from initiated / in_progress; returned; cancelled
CREATE TABLE orders (
  order_id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  client_id           INT UNSIGNED NOT NULL,
  dtype_id            TINYINT UNSIGNED NOT NULL,
  tariff_id           INT UNSIGNED NOT NULL,
  origin_address      VARCHAR(255) NOT NULL,
  origin_lat          DECIMAL(9,6) NOT NULL,
  origin_long         DECIMAL(9,6) NOT NULL,
  dest_address        VARCHAR(255) NOT NULL,
  dest_lat            DECIMAL(9,6) NOT NULL,
  dest_long           DECIMAL(9,6) NOT NULL,
  distance_km         DECIMAL(8,2) NOT NULL,          -- OSRM road distance used for the price
  declared_weight_kg  DECIMAL(10,3) NOT NULL,          -- sum of the order lines when placed
  declared_volume_m3  DECIMAL(10,4) NOT NULL,
  price               DECIMAL(10,2) NOT NULL,
  notes               VARCHAR(500),
  status              ENUM('pending_payment','paid','initiated','in_progress',
                           'rto_hold','completed','returned','cancelled')
                      NOT NULL DEFAULT 'pending_payment',
  attempt             TINYINT UNSIGNED NOT NULL DEFAULT 1,
  -- WP4 re-weighing (NULL until the courier weighs the parcel)
  real_weight_kg      DECIMAL(10,3),
  reweighed_by        INT UNSIGNED,
  reweighed_at        DATETIME,
  rto_extra_fee       DECIMAL(10,2),                  -- difference + distance adjustment
  rto_reason          VARCHAR(255),
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  paid_at             DATETIME,
  completed_at        DATETIME,
  CONSTRAINT fk_order_client    FOREIGN KEY (client_id)    REFERENCES `user`(user_id),
  CONSTRAINT fk_order_dtype     FOREIGN KEY (dtype_id)     REFERENCES delivery_type(dtype_id),
  CONSTRAINT fk_order_tariff    FOREIGN KEY (tariff_id)    REFERENCES tariff(tariff_id),
  CONSTRAINT fk_order_reweigher FOREIGN KEY (reweighed_by) REFERENCES `user`(user_id),
  INDEX idx_order_status (status)
) ENGINE=InnoDB;

-- Products in an order (ER: OrderLine, associative class Order <-> Product).
CREATE TABLE order_line (
  order_id    INT UNSIGNED NOT NULL,
  product_id  INT UNSIGNED NOT NULL,
  quantity    SMALLINT UNSIGNED NOT NULL DEFAULT 1 CHECK (quantity > 0),
  PRIMARY KEY (order_id, product_id),
  CONSTRAINT fk_line_order   FOREIGN KEY (order_id)   REFERENCES orders(order_id) ON DELETE CASCADE,
  CONSTRAINT fk_line_product FOREIGN KEY (product_id) REFERENCES product(product_id)
) ENGINE=InnoDB;

-- WP1: MockGateway payments. An order is visible to couriers only after a
-- 'succeeded' payment with purpose 'order'. WP4 adds an 'rto_adjustment' payment.
CREATE TABLE payment (
  payment_id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id           INT UNSIGNED NOT NULL,
  purpose            ENUM('order','rto_adjustment') NOT NULL DEFAULT 'order',
  amount             DECIMAL(10,2) NOT NULL,
  gateway_reference  VARCHAR(100),                   -- id returned by MockGateway
  status             ENUM('pending','succeeded','failed') NOT NULL DEFAULT 'pending',
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  paid_at            DATETIME,
  CONSTRAINT fk_payment_order FOREIGN KEY (order_id) REFERENCES orders(order_id)
) ENGINE=InnoDB;

-- =====================================================================
-- 5. ROUTES, DISPATCH AND DELIVERY
-- =====================================================================

-- A courier's trip with one vehicle (ER: Route, Performs, Used-in).
-- Rule (in PHP): one route 'initiated' or 'in_progress' per courier at a time.
CREATE TABLE route (
  route_id      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  courier_id    INT UNSIGNED NOT NULL,
  vehicle_id    INT UNSIGNED NOT NULL,
  status        ENUM('initiated','in_progress','completed','cancelled') NOT NULL DEFAULT 'initiated',
  accepted_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  started_at    DATETIME,
  completed_at  DATETIME,
  CONSTRAINT fk_route_courier FOREIGN KEY (courier_id) REFERENCES `user`(user_id),
  CONSTRAINT fk_route_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicle(vehicle_id)
) ENGINE=InnoDB;

-- WP2: 1 route : N orders. Also keeps every delivery attempt of an order.
-- Rule (in PHP): total kg and m3 of a route's orders <= the vehicle's capacity.
CREATE TABLE route_stop (
  route_id       INT UNSIGNED NOT NULL,
  order_id       INT UNSIGNED NOT NULL,
  stop_sequence  TINYINT UNSIGNED NOT NULL,      -- delivery order on the map
  attempt_no     TINYINT UNSIGNED NOT NULL DEFAULT 1,
  delivered_at   DATETIME,                       -- last drop-off = courier's location (WP3)
  PRIMARY KEY (route_id, order_id),
  CONSTRAINT fk_stop_route FOREIGN KEY (route_id) REFERENCES route(route_id) ON DELETE CASCADE,
  CONSTRAINT fk_stop_order FOREIGN KEY (order_id) REFERENCES orders(order_id)
) ENGINE=InnoDB;

-- WP3: proposal sent to the nearest courier, who has 60 seconds to answer.
CREATE TABLE dispatch_proposal (
  proposal_id   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id      INT UNSIGNED NOT NULL,
  courier_id    INT UNSIGNED NOT NULL,
  distance_km   DECIMAL(8,2),                    -- courier's last drop-off to pickup
  offered_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at    DATETIME NOT NULL,               -- offered_at + 60 seconds
  response      ENUM('pending','accepted','declined','expired') NOT NULL DEFAULT 'pending',
  responded_at  DATETIME,
  CONSTRAINT fk_proposal_order   FOREIGN KEY (order_id)   REFERENCES orders(order_id),
  CONSTRAINT fk_proposal_courier FOREIGN KEY (courier_id) REFERENCES `user`(user_id),
  INDEX idx_proposal_courier_response (courier_id, response)
) ENGINE=InnoDB;

-- e-POD, not checked by anyone (forum answer) (ER: ProofOfDelivery, Has-POD).
CREATE TABLE proof_of_delivery (
  pod_id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id      INT UNSIGNED NOT NULL UNIQUE,    -- 0..1 per order
  route_id      INT UNSIGNED NOT NULL,
  pod_type      ENUM('signature','photo') NOT NULL,
  file_path     VARCHAR(255) NOT NULL,
  submitted_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pod_order FOREIGN KEY (order_id) REFERENCES orders(order_id),
  CONSTRAINT fk_pod_route FOREIGN KEY (route_id) REFERENCES route(route_id)
) ENGINE=InnoDB;
