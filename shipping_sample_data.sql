-- Shipping Sample Data and Test Scripts
-- Sample data for testing the shipping management system

-- 1. Insert sample warehouses
INSERT INTO warehouses (name, phone, email, city, pin, address, registered_name, return_address, return_pin, return_city, return_state) VALUES
('Lurevi Main Warehouse', '+91 555 123 4567', 'warehouse@lurevi.com', 'Mumbai', '400001', '123 Art Street, Mumbai, Maharashtra', 'Lurevi Store', '123 Art Street, Mumbai', '400001', 'Mumbai', 'Maharashtra'),
('Lurevi Delhi Warehouse', '+91 555 123 4568', 'delhi@lurevi.com', 'New Delhi', '110001', '456 Business Park, New Delhi', 'Lurevi Store', '456 Business Park, New Delhi', '110001', 'New Delhi', 'Delhi'),
('Lurevi Bangalore Warehouse', '+91 555 123 4569', 'bangalore@lurevi.com', 'Bangalore', '560001', '789 Tech Park, Bangalore', 'Lurevi Store', '789 Tech Park, Bangalore', '560001', 'Bangalore', 'Karnataka');

-- 2. Insert sample shipments
INSERT INTO shipments (waybill, customer_name, customer_phone, customer_email, delivery_address, delivery_pincode, delivery_city, delivery_state, cod_amount, weight, length, width, height, products_desc, status, payment_mode, shipping_mode, tracking_url, estimated_delivery, warehouse_id) VALUES
('DL123456789', 'John Doe', '+91 9876543210', 'john.doe@email.com', '123 Main Street, Andheri West', '400058', 'Mumbai', 'Maharashtra', 1500.00, 0.5, 30.0, 20.0, 15.0, 'Wireless Headphones - Black', 'in_transit', 'COD', 'Express', 'https://track.delhivery.com/DL123456789', CURRENT_DATE + INTERVAL '3 days', (SELECT id FROM warehouses WHERE name = 'Lurevi Main Warehouse')),

('DL987654321', 'Jane Smith', '+91 8765432109', 'jane.smith@email.com', '456 Park Avenue, Connaught Place', '110001', 'New Delhi', 'Delhi', 2500.00, 0.8, 35.0, 25.0, 20.0, 'Smart Watch - Silver', 'delivered', 'COD', 'Express', 'https://track.delhivery.com/DL987654321', CURRENT_DATE - INTERVAL '2 days', (SELECT id FROM warehouses WHERE name = 'Lurevi Delhi Warehouse')),

('DL456789123', 'Mike Johnson', '+91 7654321098', 'mike.johnson@email.com', '789 Tech Park, Electronic City', '560100', 'Bangalore', 'Karnataka', 3200.00, 1.2, 40.0, 30.0, 25.0, 'Laptop Stand + Wireless Mouse', 'pending', 'Prepaid', 'Surface', NULL, CURRENT_DATE + INTERVAL '5 days', (SELECT id FROM warehouses WHERE name = 'Lurevi Bangalore Warehouse')),

('DL789123456', 'Sarah Wilson', '+91 6543210987', 'sarah.wilson@email.com', '321 Garden Street, Salt Lake', '700064', 'Kolkata', 'West Bengal', 1800.00, 0.6, 25.0, 18.0, 12.0, 'Bluetooth Speaker - Blue', 'picked_up', 'COD', 'Express', 'https://track.delhivery.com/DL789123456', CURRENT_DATE + INTERVAL '2 days', (SELECT id FROM warehouses WHERE name = 'Lurevi Main Warehouse')),

('DL321654987', 'David Brown', '+91 5432109876', 'david.brown@email.com', '654 Lake View, Banjara Hills', '500034', 'Hyderabad', 'Telangana', 4200.00, 1.5, 45.0, 35.0, 30.0, 'Gaming Keyboard + Mouse Combo', 'cancelled', 'Prepaid', 'Air', NULL, NULL, (SELECT id FROM warehouses WHERE name = 'Lurevi Bangalore Warehouse'));

-- 3. Insert sample pin code checks
INSERT INTO pin_code_checks (pin_code, city, state, serviceable, hub_code, hub_name, zone, services, check_result, checked_at) VALUES
('400058', 'Mumbai', 'Maharashtra', true, 'MUM001', 'Mumbai Hub', 'Zone 1', '{"pre_paid": "Y", "cod": "Y", "pickup": "Y", "reverse": "Y"}', '{"delivery_codes": [{"pin": "400058", "city": "Mumbai", "state": "Maharashtra", "serviceability": "Serviceable"}]}', CURRENT_TIMESTAMP - INTERVAL '1 hour'),

('110001', 'New Delhi', 'Delhi', true, 'DEL001', 'Delhi Hub', 'Zone 1', '{"pre_paid": "Y", "cod": "Y", "pickup": "Y", "reverse": "Y"}', '{"delivery_codes": [{"pin": "110001", "city": "New Delhi", "state": "Delhi", "serviceability": "Serviceable"}]}', CURRENT_TIMESTAMP - INTERVAL '2 hours'),

('560100', 'Bangalore', 'Karnataka', true, 'BLR001', 'Bangalore Hub', 'Zone 2', '{"pre_paid": "Y", "cod": "Y", "pickup": "Y", "reverse": "N"}', '{"delivery_codes": [{"pin": "560100", "city": "Bangalore", "state": "Karnataka", "serviceability": "Serviceable"}]}', CURRENT_TIMESTAMP - INTERVAL '30 minutes'),

('700064', 'Kolkata', 'West Bengal', true, 'KOL001', 'Kolkata Hub', 'Zone 3', '{"pre_paid": "Y", "cod": "Y", "pickup": "Y", "reverse": "Y"}', '{"delivery_codes": [{"pin": "700064", "city": "Kolkata", "state": "West Bengal", "serviceability": "Serviceable"}]}', CURRENT_TIMESTAMP - INTERVAL '45 minutes'),

('500034', 'Hyderabad', 'Telangana', true, 'HYD001', 'Hyderabad Hub', 'Zone 2', '{"pre_paid": "Y", "cod": "Y", "pickup": "Y", "reverse": "Y"}', '{"delivery_codes": [{"pin": "500034", "city": "Hyderabad", "state": "Telangana", "serviceability": "Serviceable"}]}', CURRENT_TIMESTAMP - INTERVAL '1 hour');

-- 4. Insert sample shipping rates
INSERT INTO shipping_rates (pickup_pincode, delivery_pincode, weight, cod_amount, total_amount, base_amount, fuel_surcharge, cod_charges, other_charges, rate_data, expires_at) VALUES
('400001', '110001', 0.5, 1500.00, 120.00, 100.00, 15.00, 5.00, 0.00, '{"total_amount": 120.00, "base_amount": 100.00, "fuel_surcharge": 15.00, "cod_charges": 5.00}', CURRENT_TIMESTAMP + INTERVAL '24 hours'),

('400001', '560100', 0.8, 2500.00, 150.00, 120.00, 20.00, 10.00, 0.00, '{"total_amount": 150.00, "base_amount": 120.00, "fuel_surcharge": 20.00, "cod_charges": 10.00}', CURRENT_TIMESTAMP + INTERVAL '24 hours'),

('400001', '700064', 1.2, 3200.00, 180.00, 140.00, 25.00, 15.00, 0.00, '{"total_amount": 180.00, "base_amount": 140.00, "fuel_surcharge": 25.00, "cod_charges": 15.00}', CURRENT_TIMESTAMP + INTERVAL '24 hours'),

('110001', '560100', 0.6, 1800.00, 130.00, 110.00, 15.00, 5.00, 0.00, '{"total_amount": 130.00, "base_amount": 110.00, "fuel_surcharge": 15.00, "cod_charges": 5.00}', CURRENT_TIMESTAMP + INTERVAL '24 hours');

-- 5. Insert sample pickup requests
INSERT INTO pickup_requests (pickup_location, pickup_date, pickup_time, expected_package_count, status, request_id, request_data, response_data) VALUES
('Lurevi Main Warehouse', CURRENT_DATE, '10:00:00', 5, 'confirmed', 'REQ001', '{"pickup_location": "Lurevi Main Warehouse", "pickup_date": "2024-01-15"}', '{"request_id": "REQ001", "status": "confirmed"}'),

('Lurevi Delhi Warehouse', CURRENT_DATE + INTERVAL '1 day', '14:00:00', 3, 'pending', 'REQ002', '{"pickup_location": "Lurevi Delhi Warehouse", "pickup_date": "2024-01-16"}', NULL),

('Lurevi Bangalore Warehouse', CURRENT_DATE + INTERVAL '2 days', '11:30:00', 7, 'pending', 'REQ003', '{"pickup_location": "Lurevi Bangalore Warehouse", "pickup_date": "2024-01-17"}', NULL);

-- 6. Insert sample expected TAT data
INSERT INTO expected_tat (origin_pin, destination_pin, mode_of_transport, product_type, expected_pickup_date, expected_delivery_date, tat_days, tat_data, expires_at) VALUES
('400001', '110001', 'A', 'B2C', CURRENT_DATE, CURRENT_DATE + INTERVAL '2 days', 2, '{"expected_delivery": "2024-01-17", "tat_days": 2}', CURRENT_TIMESTAMP + INTERVAL '24 hours'),

('400001', '560100', 'S', 'B2C', CURRENT_DATE, CURRENT_DATE + INTERVAL '4 days', 4, '{"expected_delivery": "2024-01-19", "tat_days": 4}', CURRENT_TIMESTAMP + INTERVAL '24 hours'),

('110001', '700064', 'A', 'B2C', CURRENT_DATE, CURRENT_DATE + INTERVAL '3 days', 3, '{"expected_delivery": "2024-01-18", "tat_days": 3}', CURRENT_TIMESTAMP + INTERVAL '24 hours');

-- 7. Insert sample waybill generation log
INSERT INTO waybill_generation_log (count_requested, waybills_generated, generated_at) VALUES
(5, ARRAY['DL111111111', 'DL222222222', 'DL333333333', 'DL444444444', 'DL555555555'], CURRENT_TIMESTAMP - INTERVAL '2 hours'),

(3, ARRAY['DL666666666', 'DL777777777', 'DL888888888'], CURRENT_TIMESTAMP - INTERVAL '1 hour'),

(10, ARRAY['DL999999999', 'DL000000000', 'DL111111112', 'DL222222223', 'DL333333334', 'DL444444445', 'DL555555556', 'DL666666667', 'DL777777778', 'DL888888889'], CURRENT_TIMESTAMP - INTERVAL '30 minutes');

-- 8. Insert sample tracking events
INSERT INTO shipment_tracking_events (shipment_id, waybill, event_type, event_description, event_location, event_timestamp, event_data) VALUES
((SELECT id FROM shipments WHERE waybill = 'DL123456789'), 'DL123456789', 'pickup', 'Package picked up from warehouse', 'Mumbai Hub', CURRENT_TIMESTAMP - INTERVAL '2 days', '{"status": "picked_up", "location": "Mumbai Hub"}'),

((SELECT id FROM shipments WHERE waybill = 'DL123456789'), 'DL123456789', 'in_transit', 'Package in transit to destination', 'Mumbai Hub', CURRENT_TIMESTAMP - INTERVAL '1 day', '{"status": "in_transit", "location": "Mumbai Hub"}'),

((SELECT id FROM shipments WHERE waybill = 'DL987654321'), 'DL987654321', 'pickup', 'Package picked up from warehouse', 'Delhi Hub', CURRENT_TIMESTAMP - INTERVAL '3 days', '{"status": "picked_up", "location": "Delhi Hub"}'),

((SELECT id FROM shipments WHERE waybill = 'DL987654321'), 'DL987654321', 'in_transit', 'Package in transit to destination', 'Delhi Hub', CURRENT_TIMESTAMP - INTERVAL '2 days', '{"status": "in_transit", "location": "Delhi Hub"}'),

((SELECT id FROM shipments WHERE waybill = 'DL987654321'), 'DL987654321', 'out_for_delivery', 'Package out for delivery', 'New Delhi', CURRENT_TIMESTAMP - INTERVAL '1 day', '{"status": "out_for_delivery", "location": "New Delhi"}'),

((SELECT id FROM shipments WHERE waybill = 'DL987654321'), 'DL987654321', 'delivered', 'Package delivered successfully', 'New Delhi', CURRENT_TIMESTAMP - INTERVAL '12 hours', '{"status": "delivered", "location": "New Delhi", "delivered_to": "Jane Smith"}'),

((SELECT id FROM shipments WHERE waybill = 'DL789123456'), 'DL789123456', 'pickup', 'Package picked up from warehouse', 'Mumbai Hub', CURRENT_TIMESTAMP - INTERVAL '1 day', '{"status": "picked_up", "location": "Mumbai Hub"}');

-- 9. Test queries to verify data
-- Get all shipments
SELECT 
    waybill,
    customer_name,
    delivery_city,
    status,
    cod_amount,
    created_at
FROM shipments
ORDER BY created_at DESC;

-- Get shipment statistics
SELECT 
    status,
    COUNT(*) as count,
    SUM(cod_amount) as total_cod_amount
FROM shipments
GROUP BY status
ORDER BY count DESC;

-- Get recent pin code checks
SELECT 
    pin_code,
    city,
    state,
    serviceable,
    checked_at
FROM pin_code_checks
ORDER BY checked_at DESC
LIMIT 10;

-- Get tracking events for a specific shipment
SELECT 
    event_type,
    event_description,
    event_location,
    event_timestamp
FROM shipment_tracking_events
WHERE waybill = 'DL123456789'
ORDER BY event_timestamp ASC;

-- Get warehouse list
SELECT 
    name,
    city,
    pin,
    phone,
    is_active
FROM warehouses
WHERE is_active = true
ORDER BY name;

-- 10. Performance test queries
-- Test shipment search
EXPLAIN ANALYZE
SELECT * FROM shipments 
WHERE customer_name ILIKE '%John%' 
   OR waybill ILIKE '%123%'
   OR delivery_pincode ILIKE '%400%';

-- Test status filtering
EXPLAIN ANALYZE
SELECT * FROM shipments 
WHERE status = 'in_transit'
ORDER BY created_at DESC;

-- Test tracking events query
EXPLAIN ANALYZE
SELECT * FROM shipment_tracking_events 
WHERE waybill = 'DL123456789'
ORDER BY event_timestamp DESC;

-- 11. Cleanup function test
SELECT cleanup_expired_cache();

-- 12. Analytics function test
SELECT * FROM get_shipment_analytics(30);

-- 13. Sample function calls for testing
-- Test creating a shipment
SELECT create_shipment_with_validation(
    'DL999999999',
    'Test Customer',
    '+91 9999999999',
    'Test Address, Test City',
    '123456',
    'Test City',
    'Test State',
    1000.00,
    1.0,
    'Test Product',
    'COD',
    NULL
);

-- Test updating shipment status
SELECT update_shipment_status('DL999999999', 'in_transit', '{"delhivery_status": "In Transit"}');

-- Test adding tracking event
SELECT add_tracking_event(
    'DL999999999',
    'in_transit',
    'Package is in transit',
    'Mumbai Hub',
    CURRENT_TIMESTAMP,
    '{"status": "in_transit"}'
);

-- Test getting tracking history
SELECT * FROM get_shipment_tracking('DL999999999');

-- 14. Create some sample orders for testing order import
-- (This assumes you have an orders table)
-- INSERT INTO orders (id, customer_name, customer_phone, shipping_address, total_amount, status, created_at) VALUES
-- (gen_random_uuid(), 'John Doe', '+91 9876543210', '{"address": "123 Main Street", "city": "Mumbai", "state": "Maharashtra", "pincode": "400001"}', 1500.00, 'pending', CURRENT_TIMESTAMP),
-- (gen_random_uuid(), 'Jane Smith', '+91 8765432109', '{"address": "456 Park Avenue", "city": "Delhi", "state": "Delhi", "pincode": "110001"}', 2500.00, 'pending', CURRENT_TIMESTAMP);

-- 15. Final verification queries
SELECT 'Shipments' as table_name, COUNT(*) as record_count FROM shipments
UNION ALL
SELECT 'Warehouses', COUNT(*) FROM warehouses
UNION ALL
SELECT 'Pin Code Checks', COUNT(*) FROM pin_code_checks
UNION ALL
SELECT 'Shipping Rates', COUNT(*) FROM shipping_rates
UNION ALL
SELECT 'Pickup Requests', COUNT(*) FROM pickup_requests
UNION ALL
SELECT 'Expected TAT', COUNT(*) FROM expected_tat
UNION ALL
SELECT 'Waybill Generation Log', COUNT(*) FROM waybill_generation_log
UNION ALL
SELECT 'Tracking Events', COUNT(*) FROM shipment_tracking_events;
