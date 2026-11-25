-- =====================================================================
-- CMS - sample data (seed) | EIS 2026/27 | Group G08
-- Import AFTER cms.sql. Safe to run again: it empties every table first.
-- Login: any username below, password demo123
-- Dates are relative to NOW(), so the data always looks current.
-- Prices follow: (base_fee + km*rate_km + MAX(kg, m3*200)*rate_kg) * multiplier
-- =====================================================================

USE cms;
SET NAMES utf8mb4;

-- Empty the tables children-first, so foreign keys are never broken
DELETE FROM proof_of_delivery;
DELETE FROM dispatch_proposal;
DELETE FROM route_stop;
DELETE FROM route;
DELETE FROM payment;
DELETE FROM order_line;
DELETE FROM orders;
DELETE FROM product;
DELETE FROM category;
DELETE FROM tariff;
DELETE FROM delivery_type;
DELETE FROM alert;
DELETE FROM vehicle_document;
DELETE FROM vehicle;
DELETE FROM vehicle_type;
DELETE FROM account_decision;
DELETE FROM `user`;
-- Restart the auto-increment counters at 1
ALTER TABLE proof_of_delivery AUTO_INCREMENT = 1;
ALTER TABLE dispatch_proposal AUTO_INCREMENT = 1;
ALTER TABLE route_stop AUTO_INCREMENT = 1;
ALTER TABLE route AUTO_INCREMENT = 1;
ALTER TABLE payment AUTO_INCREMENT = 1;
ALTER TABLE order_line AUTO_INCREMENT = 1;
ALTER TABLE orders AUTO_INCREMENT = 1;
ALTER TABLE product AUTO_INCREMENT = 1;
ALTER TABLE category AUTO_INCREMENT = 1;
ALTER TABLE tariff AUTO_INCREMENT = 1;
ALTER TABLE delivery_type AUTO_INCREMENT = 1;
ALTER TABLE alert AUTO_INCREMENT = 1;
ALTER TABLE vehicle_document AUTO_INCREMENT = 1;
ALTER TABLE vehicle AUTO_INCREMENT = 1;
ALTER TABLE vehicle_type AUTO_INCREMENT = 1;
ALTER TABLE account_decision AUTO_INCREMENT = 1;
ALTER TABLE `user` AUTO_INCREMENT = 1;

-- ---------------- Reference data ----------------
INSERT INTO vehicle_type (type_id, type_name, max_weight_kg, max_vol_m3) VALUES
  (1, 'Bike', 15.000, 0.0800),
  (2, 'Moto', 30.000, 0.1500),
  (3, 'Van', 800.000, 6.0000),
  (4, 'Truck', 3500.000, 20.0000);

INSERT INTO delivery_type (dtype_id, name, price_multiplier, estimated_time) VALUES
  (1, 'Standard', 1.00, 'Next business day'),
  (2, 'Express', 1.50, 'Within 4 hours'),
  (3, 'Same Day', 2.20, 'Same day');

INSERT INTO category (category_id, name) VALUES
  (1, 'Documents'),
  (2, 'Electronics'),
  (3, 'Clothing'),
  (4, 'Food'),
  (5, 'Books'),
  (6, 'Other');

-- ---------------- Users (password demo123) ----------------
INSERT INTO `user` (user_id, username, password_hash, email, name, phone, nif, role, account_status, created_at) VALUES
  (1, 'admin', '$2y$10$S0cxuftXHNHpp8DaorRUwelWfDYPzv76rZ/C.H963EDK9aGakIBbC', 'admin@cms.pt', 'Carlos Pinto', '910000001', '200000001', 'admin', 'active', NOW() - INTERVAL 172800 MINUTE),
  (2, 'rita.almeida', '$2y$10$S0cxuftXHNHpp8DaorRUwelWfDYPzv76rZ/C.H963EDK9aGakIBbC', 'rita.almeida@cms.pt', 'Rita Almeida', '910000002', '200000002', 'staff', 'active', NOW() - INTERVAL 158400 MINUTE),
  (3, 'joao.costa', '$2y$10$S0cxuftXHNHpp8DaorRUwelWfDYPzv76rZ/C.H963EDK9aGakIBbC', 'joao.costa@cms.pt', 'João Costa', '910000003', '200000003', 'staff', 'pending', NOW() - INTERVAL 2880 MINUTE),
  (4, 'diogo.silva', '$2y$10$S0cxuftXHNHpp8DaorRUwelWfDYPzv76rZ/C.H963EDK9aGakIBbC', 'diogo.silva@cms.pt', 'Diogo Silva', '910000004', '200000004', 'courier', 'active', NOW() - INTERVAL 144000 MINUTE),
  (5, 'ana.martins', '$2y$10$S0cxuftXHNHpp8DaorRUwelWfDYPzv76rZ/C.H963EDK9aGakIBbC', 'ana.martins@cms.pt', 'Ana Martins', '910000005', '200000005', 'courier', 'active', NOW() - INTERVAL 136800 MINUTE),
  (6, 'pedro.sousa', '$2y$10$S0cxuftXHNHpp8DaorRUwelWfDYPzv76rZ/C.H963EDK9aGakIBbC', 'pedro.sousa@cms.pt', 'Pedro Sousa', '910000006', '200000006', 'courier', 'active', NOW() - INTERVAL 129600 MINUTE),
  (7, 'tiago.lopes', '$2y$10$S0cxuftXHNHpp8DaorRUwelWfDYPzv76rZ/C.H963EDK9aGakIBbC', 'tiago.lopes@cms.pt', 'Tiago Lopes', '910000007', '200000007', 'courier', 'pending', NOW() - INTERVAL 1440 MINUTE),
  (8, 'sofia.nunes', '$2y$10$S0cxuftXHNHpp8DaorRUwelWfDYPzv76rZ/C.H963EDK9aGakIBbC', 'sofia.nunes@cms.pt', 'Sofia Nunes', '910000008', '200000008', 'courier', 'rejected', NOW() - INTERVAL 43200 MINUTE),
  (9, 'marta.ferreira', '$2y$10$S0cxuftXHNHpp8DaorRUwelWfDYPzv76rZ/C.H963EDK9aGakIBbC', 'marta.ferreira@cms.pt', 'Marta Ferreira', '910000009', '200000009', 'client', 'active', NOW() - INTERVAL 144000 MINUTE),
  (10, 'joana.reis', '$2y$10$S0cxuftXHNHpp8DaorRUwelWfDYPzv76rZ/C.H963EDK9aGakIBbC', 'joana.reis@cms.pt', 'Joana Reis', '910000010', '200000010', 'client', 'active', NOW() - INTERVAL 122400 MINUTE),
  (11, 'rui.carvalho', '$2y$10$S0cxuftXHNHpp8DaorRUwelWfDYPzv76rZ/C.H963EDK9aGakIBbC', 'rui.carvalho@cms.pt', 'Rui Carvalho', '910000011', '200000011', 'client', 'active', NOW() - INTERVAL 100800 MINUTE);

INSERT INTO account_decision (user_id, decided_by, previous_status, decision, justification, decided_at) VALUES
  (2, 1, 'pending', 'approved', 'Staff contract confirmed', NOW() - INTERVAL 156960 MINUTE),
  (4, 2, 'pending', 'approved', 'Driving licence and ID verified', NOW() - INTERVAL 142560 MINUTE),
  (5, 2, 'pending', 'approved', 'Driving licence and ID verified', NOW() - INTERVAL 135360 MINUTE),
  (6, 2, 'pending', 'approved', 'Driving licence and ID verified', NOW() - INTERVAL 128160 MINUTE),
  (8, 2, 'pending', 'rejected', 'Driving licence expired', NOW() - INTERVAL 41760 MINUTE);

-- ---------------- Vehicles, documents and alerts ----------------
INSERT INTO vehicle (vehicle_id, courier_id, type_id, license_plate, model, max_weight_kg, max_vol_m3, approval_status, approved_by, approved_at, created_at) VALUES
  (1, 4, 2, 'AA-12-BC', 'Honda PCX 125', 30.000, 0.1500, 'approved', 2, NOW() - INTERVAL 141120 MINUTE, NOW() - INTERVAL 142560 MINUTE),
  (2, 4, 3, '45-XY-78', 'Renault Kangoo', 600.000, 3.5000, 'approved', 2, NOW() - INTERVAL 86400 MINUTE, NOW() - INTERVAL 87840 MINUTE),
  (3, 5, 1, 'BK-0001', 'Urban Arrow cargo bike', 15.000, 0.0800, 'approved', 2, NOW() - INTERVAL 133920 MINUTE, NOW() - INTERVAL 135360 MINUTE),
  (4, 6, 3, '12-AB-34', 'Peugeot Partner', 700.000, 4.0000, 'approved', 2, NOW() - INTERVAL 126720 MINUTE, NOW() - INTERVAL 128160 MINUTE),
  (5, 7, 2, '98-ZZ-11', 'Yamaha NMAX', 30.000, 0.1500, 'pending', NULL, NULL, NOW() - INTERVAL 1440 MINUTE),
  (6, 6, 4, '77-TR-22', 'Mercedes Atego', 3000.000, 18.0000, 'disapproved', 2, NOW() - INTERVAL 7200 MINUTE, NOW() - INTERVAL 57600 MINUTE);

INSERT INTO vehicle_document (document_id, vehicle_id, doc_type, file_path, expiry_date, uploaded_at, review_status, reviewed_by, reviewed_at) VALUES
  (1, 1, 'insurance', 'uploads/documents/vehicle1_insurance_1.pdf', CURDATE() + INTERVAL 200 DAY, NOW() - INTERVAL 141120 MINUTE, 'validated', 2, NOW() - INTERVAL 139680 MINUTE),
  (2, 1, 'inspection', 'uploads/documents/vehicle1_inspection_2.pdf', CURDATE() + INTERVAL 2 DAY, NOW() - INTERVAL 141120 MINUTE, 'validated', 2, NOW() - INTERVAL 139680 MINUTE),
  (3, 2, 'insurance', 'uploads/documents/vehicle2_insurance_3.pdf', CURDATE() + INTERVAL 300 DAY, NOW() - INTERVAL 86400 MINUTE, 'validated', 2, NOW() - INTERVAL 84960 MINUTE),
  (4, 2, 'inspection', 'uploads/documents/vehicle2_inspection_4.pdf', CURDATE() + INTERVAL 150 DAY, NOW() - INTERVAL 86400 MINUTE, 'validated', 2, NOW() - INTERVAL 84960 MINUTE),
  (5, 3, 'insurance', 'uploads/documents/vehicle3_insurance_5.pdf', CURDATE() + INTERVAL 100 DAY, NOW() - INTERVAL 133920 MINUTE, 'validated', 2, NOW() - INTERVAL 132480 MINUTE),
  (6, 3, 'inspection', 'uploads/documents/vehicle3_inspection_6.pdf', CURDATE() + INTERVAL 90 DAY, NOW() - INTERVAL 133920 MINUTE, 'validated', 2, NOW() - INTERVAL 132480 MINUTE),
  (7, 4, 'insurance', 'uploads/documents/vehicle4_insurance_7.pdf', CURDATE() - INTERVAL 5 DAY, NOW() - INTERVAL 126720 MINUTE, 'validated', 2, NOW() - INTERVAL 125280 MINUTE),
  (8, 4, 'insurance', 'uploads/documents/vehicle4_insurance_8.pdf', CURDATE() + INTERVAL 360 DAY, NOW() - INTERVAL 1440 MINUTE, 'pending', NULL, NULL),
  (9, 4, 'inspection', 'uploads/documents/vehicle4_inspection_9.pdf', CURDATE() + INTERVAL 60 DAY, NOW() - INTERVAL 126720 MINUTE, 'validated', 2, NOW() - INTERVAL 125280 MINUTE),
  (10, 5, 'insurance', 'uploads/documents/vehicle5_insurance_10.pdf', CURDATE() + INTERVAL 365 DAY, NOW() - INTERVAL 1440 MINUTE, 'pending', NULL, NULL),
  (11, 5, 'inspection', 'uploads/documents/vehicle5_inspection_11.pdf', CURDATE() + INTERVAL 365 DAY, NOW() - INTERVAL 1440 MINUTE, 'pending', NULL, NULL),
  (12, 6, 'insurance', 'uploads/documents/vehicle6_insurance_12.pdf', CURDATE() + INTERVAL 100 DAY, NOW() - INTERVAL 57600 MINUTE, 'validated', 2, NOW() - INTERVAL 56160 MINUTE),
  (13, 6, 'inspection', 'uploads/documents/vehicle6_inspection_13.pdf', CURDATE() - INTERVAL 30 DAY, NOW() - INTERVAL 57600 MINUTE, 'validated', 2, NOW() - INTERVAL 56160 MINUTE);

INSERT INTO alert (user_id, document_id, alert_type, message, is_read, created_at) VALUES
  (4, 2, 'expiring', 'Inspection of AA-12-BC expires in 2 days.', 0, NOW() - INTERVAL 1440 MINUTE),
  (2, 2, 'expiring', 'Inspection of AA-12-BC (Diogo Silva) expires in 2 days.', 0, NOW() - INTERVAL 1440 MINUTE),
  (6, 7, 'expired', 'Insurance of 12-AB-34 expired. Upload a renewed document.', 1, NOW() - INTERVAL 7200 MINUTE),
  (2, 7, 'expired', 'Insurance of 12-AB-34 (Pedro Sousa) has expired.', 1, NOW() - INTERVAL 7200 MINUTE),
  (2, 8, 'updated', 'Pedro Sousa uploaded a renewed insurance for 12-AB-34.', 0, NOW() - INTERVAL 1440 MINUTE),
  (2, 10, 'updated', 'Tiago Lopes uploaded documents for 98-ZZ-11.', 0, NOW() - INTERVAL 1440 MINUTE),
  (6, 13, 'reminder', '77-TR-22 was disapproved: inspection expired.', 1, NOW() - INTERVAL 7200 MINUTE);

-- ---------------- Tariffs: old one closed 25 days ago, current one in force ----------------
INSERT INTO tariff (tariff_id, base_fee, rate_km, rate_kg, volumetric_factor, valid_from, valid_to, created_by) VALUES
  (1, 2.00, 0.35, 0.25, 200, NOW() - INTERVAL 172800 MINUTE, NOW() - INTERVAL 36000 MINUTE, 1),
  (2, 2.50, 0.40, 0.30, 200, NOW() - INTERVAL 36000 MINUTE, NULL, 1);

-- ---------------- Products ----------------
INSERT INTO product (product_id, client_id, category_id, name, description, weight_kg, volume_m3, created_at) VALUES
  (1, 9, 1, 'Product A', 'Contract envelope', 0.300, 0.0020, NOW() - INTERVAL 86400 MINUTE),
  (2, 9, 2, 'Product B', 'Laptop in padded box', 2.500, 0.0120, NOW() - INTERVAL 86400 MINUTE),
  (3, 9, 3, 'Product C', 'Clothing box', 4.000, 0.0600, NOW() - INTERVAL 86400 MINUTE),
  (4, 10, 5, 'Book box', 'University textbooks', 8.000, 0.0300, NOW() - INTERVAL 86400 MINUTE),
  (5, 10, 4, 'Food hamper', 'Non-perishable food', 6.000, 0.0500, NOW() - INTERVAL 86400 MINUTE),
  (6, 11, 2, 'Monitor 27"', 'Boxed computer monitor', 7.500, 0.0900, NOW() - INTERVAL 86400 MINUTE),
  (7, 11, 6, 'Spare parts', 'Car spare parts', 12.000, 0.0400, NOW() - INTERVAL 86400 MINUTE);

-- ---------------- Orders: one or more in every status ----------------
INSERT INTO orders (order_id, client_id, dtype_id, tariff_id, origin_address, origin_lat, origin_long, dest_address, dest_lat, dest_long, distance_km, declared_weight_kg, declared_volume_m3, price, notes, status, attempt, real_weight_kg, reweighed_by, reweighed_at, rto_extra_fee, rto_reason, created_at, paid_at, completed_at) VALUES
  (1, 9, 1, 1, 'Rua Dr. Roberto Frias, Porto', 41.178000, -8.595800, 'Avenida dos Aliados, Porto', 41.148600, -8.611100, 5.40, 0.300, 0.0020, 3.99, 'Reception desk', 'completed', 1, NULL, NULL, NULL, NULL, NULL, NOW() - INTERVAL 115200 MINUTE, NOW() - INTERVAL 115195 MINUTE, NOW() - INTERVAL 115050 MINUTE),
  (2, 10, 2, 1, 'Avenida da República, Vila Nova de Gaia', 41.133900, -8.617400, 'Praça do Município, Maia', 41.235700, -8.619900, 16.80, 8.000, 0.0300, 14.82, NULL, 'completed', 1, NULL, NULL, NULL, NULL, NULL, NOW() - INTERVAL 100800 MINUTE, NOW() - INTERVAL 100795 MINUTE, NOW() - INTERVAL 100660 MINUTE),
  (3, 11, 1, 1, 'Rua Brito Capelo, Matosinhos', 41.182400, -8.689400, 'Avenida da Liberdade, Braga', 41.550300, -8.420000, 58.00, 12.000, 0.0400, 25.30, 'Workshop entrance', 'completed', 1, 15.000, 6, NOW() - INTERVAL 79140 MINUTE, 21.05, 'Real weight 15.000 kg is above the declared 12.000 kg.', NOW() - INTERVAL 79200 MINUTE, NOW() - INTERVAL 79195 MINUTE, NOW() - INTERVAL 78900 MINUTE),
  (4, 9, 3, 1, 'Rua Dr. Roberto Frias, Porto', 41.178000, -8.595800, 'Avenida da Boavista, Porto', 41.157900, -8.629100, 6.90, 2.500, 0.0120, 11.09, NULL, 'completed', 1, NULL, NULL, NULL, NULL, NULL, NOW() - INTERVAL 57600 MINUTE, NOW() - INTERVAL 57595 MINUTE, NOW() - INTERVAL 57510 MINUTE),
  (5, 10, 1, 2, 'Avenida dos Aliados, Porto', 41.148600, -8.611100, 'Avenida Dr. Lourenço Peixinho, Aveiro', 40.640500, -8.653800, 76.00, 6.000, 0.0500, 35.90, NULL, 'completed', 1, NULL, NULL, NULL, NULL, NULL, NOW() - INTERVAL 28800 MINUTE, NOW() - INTERVAL 28795 MINUTE, NOW() - INTERVAL 28560 MINUTE),
  (6, 11, 2, 2, 'Avenida da Boavista, Porto', 41.157900, -8.629100, 'Avenida da República, Vila Nova de Gaia', 41.133900, -8.617400, 6.20, 7.500, 0.0900, 15.57, 'Call before arriving', 'completed', 2, NULL, NULL, NULL, NULL, NULL, NOW() - INTERVAL 14400 MINUTE, NOW() - INTERVAL 14395 MINUTE, NOW() - INTERVAL 14200 MINUTE),
  (7, 9, 1, 2, 'Rua Dr. Roberto Frias, Porto', 41.178000, -8.595800, 'Rua Brito Capelo, Matosinhos', 41.182400, -8.689400, 11.50, 4.000, 0.0600, 10.70, NULL, 'completed', 1, NULL, NULL, NULL, NULL, NULL, NOW() - INTERVAL 480 MINUTE, NOW() - INTERVAL 475 MINUTE, NOW() - INTERVAL 260 MINUTE),
  (8, 10, 1, 2, 'Praça do Município, Maia', 41.235700, -8.619900, 'Avenida dos Aliados, Porto', 41.148600, -8.611100, 15.30, 16.000, 0.0600, 13.42, NULL, 'completed', 1, NULL, NULL, NULL, NULL, NULL, NOW() - INTERVAL 420 MINUTE, NOW() - INTERVAL 415 MINUTE, NOW() - INTERVAL 240 MINUTE),
  (9, 9, 1, 2, 'Rua Dr. Roberto Frias, Porto', 41.178000, -8.595800, 'Avenida da República, Vila Nova de Gaia', 41.133900, -8.617400, 9.80, 2.500, 0.0120, 7.17, 'Fragile', 'in_progress', 1, NULL, NULL, NULL, NULL, NULL, NOW() - INTERVAL 180 MINUTE, NOW() - INTERVAL 175 MINUTE, NULL),
  (10, 11, 1, 2, 'Avenida da Boavista, Porto', 41.157900, -8.629100, 'Avenida da República, Vila Nova de Gaia', 41.133900, -8.617400, 6.00, 12.000, 0.0400, 8.50, NULL, 'in_progress', 1, NULL, NULL, NULL, NULL, NULL, NOW() - INTERVAL 180 MINUTE, NOW() - INTERVAL 175 MINUTE, NULL),
  (11, 10, 2, 2, 'Avenida dos Aliados, Porto', 41.148600, -8.611100, 'Rua Brito Capelo, Matosinhos', 41.182400, -8.689400, 9.10, 6.000, 0.0500, 13.71, NULL, 'initiated', 1, NULL, NULL, NULL, NULL, NULL, NOW() - INTERVAL 90 MINUTE, NOW() - INTERVAL 85 MINUTE, NULL),
  (12, 11, 1, 2, 'Rua Brito Capelo, Matosinhos', 41.182400, -8.689400, 'Praça do Município, Maia', 41.235700, -8.619900, 13.20, 7.500, 0.0900, 13.18, NULL, 'rto_hold', 1, 11.000, 6, NOW() - INTERVAL 240 MINUTE, 5.28, 'Real weight 11.000 kg is above the declared 7.500 kg.', NOW() - INTERVAL 300 MINUTE, NOW() - INTERVAL 295 MINUTE, NULL),
  (13, 9, 1, 2, 'Rua Dr. Roberto Frias, Porto', 41.178000, -8.595800, 'Avenida da República, Lisboa', 38.736900, -9.142600, 315.00, 8.000, 0.1200, 135.70, 'Deliver to the office', 'paid', 1, NULL, NULL, NULL, NULL, NULL, NOW() - INTERVAL 10 MINUTE, NOW() - INTERVAL 5 MINUTE, NULL),
  (14, 10, 1, 2, 'Avenida da República, Vila Nova de Gaia', 41.133900, -8.617400, 'Avenida da Boavista, Porto', 41.157900, -8.629100, 7.00, 8.000, 0.0300, 7.70, NULL, 'paid', 1, NULL, NULL, NULL, NULL, NULL, NOW() - INTERVAL 40 MINUTE, NOW() - INTERVAL 35 MINUTE, NULL),
  (15, 11, 3, 2, 'Avenida da Boavista, Porto', 41.157900, -8.629100, 'Avenida dos Aliados, Porto', 41.148600, -8.611100, 3.10, 12.000, 0.0400, 16.15, NULL, 'pending_payment', 1, NULL, NULL, NULL, NULL, NULL, NOW() - INTERVAL 30 MINUTE, NULL, NULL),
  (16, 9, 1, 2, 'Avenida dos Aliados, Porto', 41.148600, -8.611100, 'Rua Dr. Roberto Frias, Porto', 41.178000, -8.595800, 5.60, 0.300, 0.0020, 4.86, NULL, 'pending_payment', 1, NULL, NULL, NULL, NULL, NULL, NOW() - INTERVAL 15 MINUTE, NULL, NULL),
  (17, 10, 1, 2, 'Praça do Município, Maia', 41.235700, -8.619900, 'Avenida da República, Vila Nova de Gaia', 41.133900, -8.617400, 20.00, 6.000, 0.0500, 13.50, NULL, 'cancelled', 1, NULL, NULL, NULL, NULL, NULL, NOW() - INTERVAL 4320 MINUTE, NULL, NULL),
  (18, 11, 1, 2, 'Rua Brito Capelo, Matosinhos', 41.182400, -8.689400, 'Avenida da Liberdade, Braga', 41.550300, -8.420000, 58.00, 12.000, 0.0400, 29.30, NULL, 'returned', 1, 16.000, 6, NOW() - INTERVAL 8580 MINUTE, 24.40, 'Real weight 16.000 kg is above the declared 12.000 kg.', NOW() - INTERVAL 8640 MINUTE, NOW() - INTERVAL 8635 MINUTE, NOW() - INTERVAL 5760 MINUTE);

INSERT INTO order_line (order_id, product_id, quantity) VALUES
  (1, 1, 1),
  (2, 4, 1),
  (3, 7, 1),
  (4, 2, 1),
  (5, 5, 1),
  (6, 6, 1),
  (7, 3, 1),
  (8, 4, 2),
  (9, 2, 1),
  (10, 7, 1),
  (11, 5, 1),
  (12, 6, 1),
  (13, 3, 2),
  (14, 4, 1),
  (15, 7, 1),
  (16, 1, 1),
  (17, 5, 1),
  (18, 7, 1);

-- ---------------- Payments (WP1 and WP4) ----------------
INSERT INTO payment (order_id, purpose, amount, gateway_reference, status, created_at, paid_at) VALUES
  (1, 'order', 3.99, 'MG-100001', 'succeeded', NOW() - INTERVAL 115196 MINUTE, NOW() - INTERVAL 115195 MINUTE),
  (2, 'order', 14.82, 'MG-100002', 'succeeded', NOW() - INTERVAL 100796 MINUTE, NOW() - INTERVAL 100795 MINUTE),
  (3, 'order', 25.30, 'MG-100003', 'succeeded', NOW() - INTERVAL 79196 MINUTE, NOW() - INTERVAL 79195 MINUTE),
  (4, 'order', 11.09, 'MG-100004', 'succeeded', NOW() - INTERVAL 57596 MINUTE, NOW() - INTERVAL 57595 MINUTE),
  (5, 'order', 35.90, 'MG-100005', 'succeeded', NOW() - INTERVAL 28796 MINUTE, NOW() - INTERVAL 28795 MINUTE),
  (6, 'order', 15.57, 'MG-100006', 'succeeded', NOW() - INTERVAL 14396 MINUTE, NOW() - INTERVAL 14395 MINUTE),
  (7, 'order', 10.70, 'MG-100007', 'succeeded', NOW() - INTERVAL 476 MINUTE, NOW() - INTERVAL 475 MINUTE),
  (8, 'order', 13.42, 'MG-100008', 'succeeded', NOW() - INTERVAL 416 MINUTE, NOW() - INTERVAL 415 MINUTE),
  (9, 'order', 7.17, 'MG-100009', 'succeeded', NOW() - INTERVAL 176 MINUTE, NOW() - INTERVAL 175 MINUTE),
  (10, 'order', 8.50, 'MG-100010', 'succeeded', NOW() - INTERVAL 176 MINUTE, NOW() - INTERVAL 175 MINUTE),
  (11, 'order', 13.71, 'MG-100011', 'succeeded', NOW() - INTERVAL 86 MINUTE, NOW() - INTERVAL 85 MINUTE),
  (12, 'order', 13.18, 'MG-100012', 'succeeded', NOW() - INTERVAL 296 MINUTE, NOW() - INTERVAL 295 MINUTE),
  (13, 'order', 135.70, 'MG-100013', 'succeeded', NOW() - INTERVAL 6 MINUTE, NOW() - INTERVAL 5 MINUTE),
  (14, 'order', 7.70, 'MG-100014', 'succeeded', NOW() - INTERVAL 36 MINUTE, NOW() - INTERVAL 35 MINUTE),
  (18, 'order', 29.30, 'MG-100018', 'succeeded', NOW() - INTERVAL 8636 MINUTE, NOW() - INTERVAL 8635 MINUTE),
  (15, 'order', 16.15, 'MG-200015', 'failed', NOW() - INTERVAL 25 MINUTE, NULL),
  (3, 'rto_adjustment', 21.05, 'MG-300003', 'succeeded', NOW() - INTERVAL 79080 MINUTE, NOW() - INTERVAL 79050 MINUTE),
  (12, 'rto_adjustment', 5.28, NULL, 'pending', NOW() - INTERVAL 240 MINUTE, NULL),
  (18, 'rto_adjustment', 24.40, 'MG-300018', 'failed', NOW() - INTERVAL 7200 MINUTE, NULL);

-- ---------------- Routes (WP2: routes 8 and 9 carry two orders) ----------------
INSERT INTO route (route_id, courier_id, vehicle_id, status, accepted_at, started_at, completed_at) VALUES
  (1, 4, 1, 'completed', NOW() - INTERVAL 115140 MINUTE, NOW() - INTERVAL 115110 MINUTE, NOW() - INTERVAL 115050 MINUTE),
  (2, 5, 3, 'completed', NOW() - INTERVAL 100740 MINUTE, NOW() - INTERVAL 100720 MINUTE, NOW() - INTERVAL 100660 MINUTE),
  (3, 6, 4, 'completed', NOW() - INTERVAL 79140 MINUTE, NOW() - INTERVAL 79020 MINUTE, NOW() - INTERVAL 78900 MINUTE),
  (4, 4, 1, 'completed', NOW() - INTERVAL 57570 MINUTE, NOW() - INTERVAL 57560 MINUTE, NOW() - INTERVAL 57510 MINUTE),
  (5, 6, 4, 'completed', NOW() - INTERVAL 28740 MINUTE, NOW() - INTERVAL 28680 MINUTE, NOW() - INTERVAL 28560 MINUTE),
  (6, 6, 4, 'cancelled', NOW() - INTERVAL 14370 MINUTE, NULL, NULL),
  (7, 4, 2, 'completed', NOW() - INTERVAL 14280 MINUTE, NOW() - INTERVAL 14270 MINUTE, NOW() - INTERVAL 14200 MINUTE),
  (8, 4, 2, 'completed', NOW() - INTERVAL 360 MINUTE, NOW() - INTERVAL 330 MINUTE, NOW() - INTERVAL 240 MINUTE),
  (9, 4, 2, 'in_progress', NOW() - INTERVAL 150 MINUTE, NOW() - INTERVAL 120 MINUTE, NULL),
  (10, 5, 3, 'initiated', NOW() - INTERVAL 60 MINUTE, NULL, NULL),
  (11, 6, 4, 'in_progress', NOW() - INTERVAL 270 MINUTE, NOW() - INTERVAL 250 MINUTE, NULL),
  (12, 6, 4, 'completed', NOW() - INTERVAL 8580 MINUTE, NOW() - INTERVAL 8570 MINUTE, NOW() - INTERVAL 5760 MINUTE);

INSERT INTO route_stop (route_id, order_id, stop_sequence, attempt_no, delivered_at) VALUES
  (1, 1, 1, 1, NOW() - INTERVAL 115050 MINUTE),
  (2, 2, 1, 1, NOW() - INTERVAL 100660 MINUTE),
  (3, 3, 1, 1, NOW() - INTERVAL 78900 MINUTE),
  (4, 4, 1, 1, NOW() - INTERVAL 57510 MINUTE),
  (5, 5, 1, 1, NOW() - INTERVAL 28560 MINUTE),
  (6, 6, 1, 1, NULL),
  (7, 6, 1, 2, NOW() - INTERVAL 14200 MINUTE),
  (8, 7, 1, 1, NOW() - INTERVAL 260 MINUTE),
  (8, 8, 2, 1, NOW() - INTERVAL 240 MINUTE),
  (9, 9, 1, 1, NULL),
  (9, 10, 2, 1, NULL),
  (10, 11, 1, 1, NULL),
  (11, 12, 1, 1, NULL),
  (12, 18, 1, 1, NULL);

INSERT INTO proof_of_delivery (order_id, route_id, pod_type, file_path, submitted_at) VALUES
  (1, 1, 'signature', 'uploads/pod/order1.png', NOW() - INTERVAL 115050 MINUTE),
  (2, 2, 'photo', 'uploads/pod/order2.jpg', NOW() - INTERVAL 100660 MINUTE),
  (3, 3, 'signature', 'uploads/pod/order3.png', NOW() - INTERVAL 78900 MINUTE),
  (4, 4, 'photo', 'uploads/pod/order4.jpg', NOW() - INTERVAL 57510 MINUTE),
  (5, 5, 'signature', 'uploads/pod/order5.png', NOW() - INTERVAL 28560 MINUTE),
  (6, 7, 'photo', 'uploads/pod/order6.jpg', NOW() - INTERVAL 14200 MINUTE),
  (7, 8, 'signature', 'uploads/pod/order7.png', NOW() - INTERVAL 260 MINUTE),
  (8, 8, 'photo', 'uploads/pod/order8.jpg', NOW() - INTERVAL 240 MINUTE);

-- ---------------- Dispatch proposals (WP3); order 13 is waiting for an answer ----------------
INSERT INTO dispatch_proposal (order_id, courier_id, distance_km, offered_at, expires_at, response, responded_at) VALUES
  (9, 4, 3.40, NOW() - INTERVAL 152 MINUTE, NOW() - INTERVAL 151 MINUTE, 'accepted', NOW() - INTERVAL 151 MINUTE),
  (11, 5, 1.20, NOW() - INTERVAL 61 MINUTE, NOW() - INTERVAL 60 MINUTE, 'accepted', NOW() - INTERVAL 60 MINUTE),
  (14, 4, 2.10, NOW() - INTERVAL 38 MINUTE, NOW() - INTERVAL 37 MINUTE, 'declined', NOW() - INTERVAL 37 MINUTE),
  (14, 5, 4.60, NOW() - INTERVAL 37 MINUTE, NOW() - INTERVAL 36 MINUTE, 'expired', NULL),
  (13, 6, 5.80, NOW(), NOW() + INTERVAL 60 SECOND, 'pending', NULL);
