-- Shipping Management Queries - Fixed Version
-- Direct SQL queries without parameter placeholders

-- 1. Get all shipments with status filter
-- Example: Get pending shipments
SELECT 
    s.id,
    s.waybill,
    s.customer_name,
    s.customer_phone,
    s.delivery_address,
    s.delivery_pincode,
    s.delivery_city,
    s.delivery_state,
    s.status,
    s.cod_amount,
    s.weight,
    s.created_at,
    s.estimated_delivery,
    s.tracking_url
FROM shipments s
WHERE s.status = 'pending' -- Change to 'in_transit', 'delivered', etc.
ORDER BY s.created_at DESC;

-- 2. Search shipments by customer name, waybill, or pincode
-- Example: Search for 'John'
SELECT 
    s.id,
    s.waybill,
    s.customer_name,
    s.customer_phone,
    s.delivery_address,
    s.delivery_pincode,
    s.status,
    s.cod_amount,
    s.created_at
FROM shipments s
WHERE 
    s.customer_name ILIKE '%John%' OR
    s.waybill ILIKE '%John%' OR
    s.delivery_pincode ILIKE '%John%'
ORDER BY s.created_at DESC;

-- 3. Get shipment statistics
SELECT 
    status,
    COUNT(*) as count,
    SUM(cod_amount) as total_cod_amount,
    AVG(weight) as avg_weight
FROM shipments
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY status
ORDER BY count DESC;

-- 4. Get recent pin code checks
SELECT 
    pin_code,
    city,
    state,
    serviceable,
    hub_name,
    zone,
    checked_at
FROM pin_code_checks
WHERE checked_at >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY checked_at DESC
LIMIT 50;

-- 5. Get cached shipping rates
-- Example: Get rates for Mumbai to Delhi, 0.5kg, COD 1500
SELECT 
    pickup_pincode,
    delivery_pincode,
    weight,
    cod_amount,
    total_amount,
    base_amount,
    fuel_surcharge,
    cod_charges,
    created_at
FROM shipping_rates
WHERE 
    pickup_pincode = '400001' AND
    delivery_pincode = '110001' AND
    weight = 0.5 AND
    cod_amount = 1500 AND
    expires_at > CURRENT_TIMESTAMP
ORDER BY created_at DESC
LIMIT 1;

-- 6. Get warehouse list
SELECT 
    id,
    name,
    city,
    pin,
    phone,
    email,
    is_active
FROM warehouses
WHERE is_active = true
ORDER BY name;

-- 7. Get pickup requests for a date range
-- Example: Get pickup requests for current week
SELECT 
    pr.id,
    pr.pickup_location,
    pr.pickup_date,
    pr.pickup_time,
    pr.expected_package_count,
    pr.status,
    pr.created_at
FROM pickup_requests pr
WHERE pr.pickup_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
ORDER BY pr.pickup_date, pr.pickup_time;

-- 8. Get shipment tracking events
-- Example: Get tracking for waybill DL123456789
SELECT 
    ste.event_type,
    ste.event_description,
    ste.event_location,
    ste.event_timestamp,
    ste.event_data
FROM shipment_tracking_events ste
WHERE ste.waybill = 'DL123456789'
ORDER BY ste.event_timestamp DESC;

-- 9. Get expected TAT from cache
-- Example: Get TAT for Mumbai to Delhi, Air, B2C
SELECT 
    origin_pin,
    destination_pin,
    mode_of_transport,
    product_type,
    expected_delivery_date,
    tat_days,
    tat_data
FROM expected_tat
WHERE 
    origin_pin = '400001' AND
    destination_pin = '110001' AND
    mode_of_transport = 'A' AND
    product_type = 'B2C' AND
    expected_pickup_date = CURRENT_DATE AND
    expires_at > CURRENT_TIMESTAMP
ORDER BY created_at DESC
LIMIT 1;

-- 10. Get waybill generation history
SELECT 
    wgl.count_requested,
    wgl.waybills_generated,
    wgl.generated_at
FROM waybill_generation_log wgl
WHERE generated_at >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY generated_at DESC;

-- 11. Update shipment status
-- Example: Update waybill DL123456789 to delivered
UPDATE shipments 
SET 
    status = 'delivered',
    updated_at = CURRENT_TIMESTAMP,
    actual_delivery_date = CURRENT_DATE
WHERE waybill = 'DL123456789';

-- 12. Insert tracking event
-- Example: Add tracking event for waybill DL123456789
INSERT INTO shipment_tracking_events (
    shipment_id,
    waybill,
    event_type,
    event_description,
    event_location,
    event_timestamp,
    event_data
) VALUES (
    (SELECT id FROM shipments WHERE waybill = 'DL123456789'),
    'DL123456789',
    'delivered',
    'Package delivered successfully',
    'Mumbai',
    CURRENT_TIMESTAMP,
    '{"status": "delivered", "delivered_to": "John Doe"}'
);

-- 13. Get shipments by order ID
-- Example: Get shipments for a specific order
SELECT 
    s.id,
    s.waybill,
    s.customer_name,
    s.customer_phone,
    s.delivery_address,
    s.delivery_pincode,
    s.status,
    s.cod_amount,
    s.weight,
    s.created_at
FROM shipments s
WHERE s.order_id = '123e4567-e89b-12d3-a456-426614174000' -- Replace with actual order ID
ORDER BY s.created_at DESC;

-- 14. Get delivery performance metrics
SELECT 
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as total_shipments,
    COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
    ROUND(
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) * 100.0 / COUNT(*), 
        2
    ) as delivery_rate
FROM shipments
WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- 15. Get top delivery cities
SELECT 
    delivery_city,
    delivery_state,
    COUNT(*) as shipment_count,
    SUM(cod_amount) as total_cod_amount
FROM shipments
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY delivery_city, delivery_state
ORDER BY shipment_count DESC
LIMIT 20;

-- 16. Clean up expired cache data
DELETE FROM shipping_rates WHERE expires_at < CURRENT_TIMESTAMP;
DELETE FROM expected_tat WHERE expires_at < CURRENT_TIMESTAMP;
DELETE FROM pin_code_checks WHERE checked_at < CURRENT_DATE - INTERVAL '90 days';

-- 17. Get shipment details for tracking
-- Example: Get details for waybill DL123456789
SELECT 
    s.waybill,
    s.customer_name,
    s.delivery_address,
    s.delivery_city,
    s.delivery_state,
    s.delivery_pincode,
    s.status,
    s.cod_amount,
    s.weight,
    s.created_at,
    s.estimated_delivery,
    s.tracking_url,
    w.name as warehouse_name,
    w.phone as warehouse_phone
FROM shipments s
LEFT JOIN warehouses w ON s.warehouse_id = w.id
WHERE s.waybill = 'DL123456789';

-- 18. Get pending shipments for pickup
SELECT 
    s.id,
    s.waybill,
    s.customer_name,
    s.delivery_address,
    s.delivery_pincode,
    s.weight,
    s.cod_amount,
    s.created_at
FROM shipments s
WHERE s.status = 'pending'
    AND s.pickup_date = CURRENT_DATE
ORDER BY s.created_at;

-- 19. Update shipment with Delhivery data
-- Example: Update waybill DL123456789 with Delhivery data
UPDATE shipments 
SET 
    delhivery_waybill = 'DL123456789',
    delhivery_status = 'In Transit',
    delhivery_tracking_data = '{"status": "In Transit", "location": "Mumbai Hub"}',
    tracking_url = 'https://track.delhivery.com/DL123456789',
    updated_at = CURRENT_TIMESTAMP
WHERE waybill = 'DL123456789';

-- 20. Get shipment analytics dashboard data
SELECT 
    'Total Shipments' as metric,
    COUNT(*) as value
FROM shipments
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'

UNION ALL

SELECT 
    'Pending Shipments' as metric,
    COUNT(*) as value
FROM shipments
WHERE status = 'pending'

UNION ALL

SELECT 
    'In Transit' as metric,
    COUNT(*) as value
FROM shipments
WHERE status = 'in_transit'

UNION ALL

SELECT 
    'Delivered Today' as metric,
    COUNT(*) as value
FROM shipments
WHERE status = 'delivered' 
    AND actual_delivery_date = CURRENT_DATE

UNION ALL

SELECT 
    'Total COD Amount' as metric,
    COALESCE(SUM(cod_amount), 0) as value
FROM shipments
WHERE status = 'delivered' 
    AND created_at >= CURRENT_DATE - INTERVAL '30 days';

-- 21. Get all shipments (no filter)
SELECT 
    s.id,
    s.waybill,
    s.customer_name,
    s.customer_phone,
    s.delivery_address,
    s.delivery_pincode,
    s.delivery_city,
    s.delivery_state,
    s.status,
    s.cod_amount,
    s.weight,
    s.created_at,
    s.estimated_delivery,
    s.tracking_url
FROM shipments s
ORDER BY s.created_at DESC;

-- 22. Get shipments by status (replace 'pending' with desired status)
SELECT 
    s.id,
    s.waybill,
    s.customer_name,
    s.customer_phone,
    s.delivery_address,
    s.delivery_pincode,
    s.status,
    s.cod_amount,
    s.created_at
FROM shipments s
WHERE s.status = 'pending' -- Change to: 'picked_up', 'in_transit', 'delivered', 'cancelled'
ORDER BY s.created_at DESC;

-- 23. Search shipments (replace 'search_term' with actual search term)
SELECT 
    s.id,
    s.waybill,
    s.customer_name,
    s.customer_phone,
    s.delivery_address,
    s.delivery_pincode,
    s.status,
    s.cod_amount,
    s.created_at
FROM shipments s
WHERE 
    s.customer_name ILIKE '%search_term%' OR
    s.waybill ILIKE '%search_term%' OR
    s.delivery_pincode ILIKE '%search_term%'
ORDER BY s.created_at DESC;

-- 24. Get shipments created today
SELECT 
    s.id,
    s.waybill,
    s.customer_name,
    s.delivery_city,
    s.status,
    s.cod_amount,
    s.created_at
FROM shipments s
WHERE DATE(s.created_at) = CURRENT_DATE
ORDER BY s.created_at DESC;

-- 25. Get shipments by date range
-- Example: Get shipments from last 7 days
SELECT 
    s.id,
    s.waybill,
    s.customer_name,
    s.delivery_city,
    s.status,
    s.cod_amount,
    s.created_at
FROM shipments s
WHERE s.created_at >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY s.created_at DESC;

-- 26. Get warehouse performance
SELECT 
    w.name as warehouse_name,
    COUNT(s.id) as total_shipments,
    COUNT(CASE WHEN s.status = 'delivered' THEN 1 END) as delivered_shipments,
    ROUND(
        COUNT(CASE WHEN s.status = 'delivered' THEN 1 END) * 100.0 / COUNT(s.id), 
        2
    ) as delivery_rate
FROM warehouses w
LEFT JOIN shipments s ON w.id = s.warehouse_id
WHERE s.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY w.id, w.name
ORDER BY total_shipments DESC;

-- 27. Get COD vs Prepaid statistics
SELECT 
    payment_mode,
    COUNT(*) as count,
    SUM(cod_amount) as total_amount,
    AVG(cod_amount) as avg_amount
FROM shipments
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY payment_mode
ORDER BY count DESC;

-- 28. Get shipping mode statistics
SELECT 
    shipping_mode,
    COUNT(*) as count,
    AVG(weight) as avg_weight,
    SUM(cod_amount) as total_cod_amount
FROM shipments
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY shipping_mode
ORDER BY count DESC;

-- 29. Get daily shipment counts
SELECT 
    DATE(created_at) as date,
    COUNT(*) as shipment_count,
    COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_count
FROM shipments
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- 30. Get top customers by shipment count
SELECT 
    customer_name,
    customer_phone,
    COUNT(*) as shipment_count,
    SUM(cod_amount) as total_cod_amount,
    MAX(created_at) as last_shipment_date
FROM shipments
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY customer_name, customer_phone
ORDER BY shipment_count DESC
LIMIT 20;
