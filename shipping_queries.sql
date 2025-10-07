-- Shipping Management Queries
-- Common queries for the shipping management system

-- 1. Get all shipments with status filter
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
WHERE s.status = $1 -- 'pending', 'in_transit', etc.
ORDER BY s.created_at DESC;

-- 2. Search shipments by customer name, waybill, or pincode
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
    s.customer_name ILIKE '%' || $1 || '%' OR
    s.waybill ILIKE '%' || $1 || '%' OR
    s.delivery_pincode ILIKE '%' || $1 || '%'
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
    pickup_pincode = $1 AND
    delivery_pincode = $2 AND
    weight = $3 AND
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
SELECT 
    pr.id,
    pr.pickup_location,
    pr.pickup_date,
    pr.pickup_time,
    pr.expected_package_count,
    pr.status,
    pr.created_at
FROM pickup_requests pr
WHERE pr.pickup_date BETWEEN $1 AND $2
ORDER BY pr.pickup_date, pr.pickup_time;

-- 8. Get shipment tracking events
SELECT 
    ste.event_type,
    ste.event_description,
    ste.event_location,
    ste.event_timestamp,
    ste.event_data
FROM shipment_tracking_events ste
WHERE ste.waybill = $1
ORDER BY ste.event_timestamp DESC;

-- 9. Get expected TAT from cache
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
    origin_pin = $1 AND
    destination_pin = $2 AND
    mode_of_transport = $3 AND
    product_type = $4 AND
    expected_pickup_date = $5 AND
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
UPDATE shipments 
SET 
    status = $2,
    updated_at = CURRENT_TIMESTAMP,
    actual_delivery_date = CASE WHEN $2 = 'delivered' THEN CURRENT_DATE ELSE actual_delivery_date END
WHERE waybill = $1;

-- 12. Insert tracking event
INSERT INTO shipment_tracking_events (
    shipment_id,
    waybill,
    event_type,
    event_description,
    event_location,
    event_timestamp,
    event_data
) VALUES (
    (SELECT id FROM shipments WHERE waybill = $1),
    $1,
    $2,
    $3,
    $4,
    $5,
    $6
);

-- 13. Get shipments by order ID
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
WHERE s.order_id = $1
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
WHERE s.waybill = $1;

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
UPDATE shipments 
SET 
    delhivery_waybill = $2,
    delhivery_status = $3,
    delhivery_tracking_data = $4,
    tracking_url = $5,
    updated_at = CURRENT_TIMESTAMP
WHERE waybill = $1;

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
