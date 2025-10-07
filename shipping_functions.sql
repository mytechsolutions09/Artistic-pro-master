-- Shipping Management Functions
-- PostgreSQL functions that accept parameters for dynamic queries

-- 1. Function to get shipments by status
CREATE OR REPLACE FUNCTION get_shipments_by_status(p_status VARCHAR(20))
RETURNS TABLE (
    id UUID,
    waybill VARCHAR(50),
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    delivery_address TEXT,
    delivery_pincode VARCHAR(10),
    delivery_city VARCHAR(100),
    delivery_state VARCHAR(100),
    status VARCHAR(20),
    cod_amount DECIMAL(10,2),
    weight DECIMAL(8,3),
    created_at TIMESTAMP WITH TIME ZONE,
    estimated_delivery DATE,
    tracking_url TEXT
) AS $$
BEGIN
    RETURN QUERY
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
    WHERE s.status = p_status
    ORDER BY s.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 2. Function to search shipments
CREATE OR REPLACE FUNCTION search_shipments(p_search_term VARCHAR(255))
RETURNS TABLE (
    id UUID,
    waybill VARCHAR(50),
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    delivery_address TEXT,
    delivery_pincode VARCHAR(10),
    status VARCHAR(20),
    cod_amount DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
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
        s.customer_name ILIKE '%' || p_search_term || '%' OR
        s.waybill ILIKE '%' || p_search_term || '%' OR
        s.delivery_pincode ILIKE '%' || p_search_term || '%'
    ORDER BY s.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 3. Function to get cached shipping rates
CREATE OR REPLACE FUNCTION get_cached_shipping_rates(
    p_pickup_pincode VARCHAR(10),
    p_delivery_pincode VARCHAR(10),
    p_weight DECIMAL(8,3),
    p_cod_amount DECIMAL(10,2) DEFAULT 0
)
RETURNS TABLE (
    total_amount DECIMAL(10,2),
    base_amount DECIMAL(10,2),
    fuel_surcharge DECIMAL(10,2),
    cod_charges DECIMAL(10,2),
    other_charges DECIMAL(10,2),
    rate_data JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sr.total_amount,
        sr.base_amount,
        sr.fuel_surcharge,
        sr.cod_charges,
        sr.other_charges,
        sr.rate_data
    FROM shipping_rates sr
    WHERE 
        sr.pickup_pincode = p_pickup_pincode AND
        sr.delivery_pincode = p_delivery_pincode AND
        sr.weight = p_weight AND
        sr.cod_amount = p_cod_amount AND
        sr.expires_at > CURRENT_TIMESTAMP
    ORDER BY sr.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- 4. Function to get shipment tracking
CREATE OR REPLACE FUNCTION get_shipment_tracking(p_waybill VARCHAR(50))
RETURNS TABLE (
    event_type VARCHAR(50),
    event_description TEXT,
    event_location VARCHAR(255),
    event_timestamp TIMESTAMP WITH TIME ZONE,
    event_data JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ste.event_type,
        ste.event_description,
        ste.event_location,
        ste.event_timestamp,
        ste.event_data
    FROM shipment_tracking_events ste
    WHERE ste.waybill = p_waybill
    ORDER BY ste.event_timestamp ASC;
END;
$$ LANGUAGE plpgsql;

-- 5. Function to get expected TAT
CREATE OR REPLACE FUNCTION get_expected_tat(
    p_origin_pin VARCHAR(10),
    p_destination_pin VARCHAR(10),
    p_mode_of_transport VARCHAR(10),
    p_product_type VARCHAR(10),
    p_expected_pickup_date DATE
)
RETURNS TABLE (
    expected_delivery_date DATE,
    tat_days INTEGER,
    tat_data JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        et.expected_delivery_date,
        et.tat_days,
        et.tat_data
    FROM expected_tat et
    WHERE 
        et.origin_pin = p_origin_pin AND
        et.destination_pin = p_destination_pin AND
        et.mode_of_transport = p_mode_of_transport AND
        et.product_type = p_product_type AND
        et.expected_pickup_date = p_expected_pickup_date AND
        et.expires_at > CURRENT_TIMESTAMP
    ORDER BY et.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- 6. Function to get shipments by date range
CREATE OR REPLACE FUNCTION get_shipments_by_date_range(
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    id UUID,
    waybill VARCHAR(50),
    customer_name VARCHAR(255),
    delivery_city VARCHAR(100),
    status VARCHAR(20),
    cod_amount DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.waybill,
        s.customer_name,
        s.delivery_city,
        s.status,
        s.cod_amount,
        s.created_at
    FROM shipments s
    WHERE DATE(s.created_at) BETWEEN p_start_date AND p_end_date
    ORDER BY s.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 7. Function to get shipment statistics
CREATE OR REPLACE FUNCTION get_shipment_statistics(p_days INTEGER DEFAULT 30)
RETURNS TABLE (
    status VARCHAR(20),
    count BIGINT,
    total_cod_amount DECIMAL(12,2),
    avg_weight DECIMAL(8,3)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.status,
        COUNT(*) as count,
        SUM(s.cod_amount) as total_cod_amount,
        AVG(s.weight) as avg_weight
    FROM shipments s
    WHERE s.created_at >= CURRENT_DATE - (p_days || ' days')::INTERVAL
    GROUP BY s.status
    ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

-- 8. Function to get top delivery cities
CREATE OR REPLACE FUNCTION get_top_delivery_cities(p_days INTEGER DEFAULT 30, p_limit INTEGER DEFAULT 20)
RETURNS TABLE (
    delivery_city VARCHAR(100),
    delivery_state VARCHAR(100),
    shipment_count BIGINT,
    total_cod_amount DECIMAL(12,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.delivery_city,
        s.delivery_state,
        COUNT(*) as shipment_count,
        SUM(s.cod_amount) as total_cod_amount
    FROM shipments s
    WHERE s.created_at >= CURRENT_DATE - (p_days || ' days')::INTERVAL
    GROUP BY s.delivery_city, s.delivery_state
    ORDER BY shipment_count DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- 9. Function to get warehouse performance
CREATE OR REPLACE FUNCTION get_warehouse_performance(p_days INTEGER DEFAULT 30)
RETURNS TABLE (
    warehouse_name VARCHAR(255),
    total_shipments BIGINT,
    delivered_shipments BIGINT,
    delivery_rate DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        w.name as warehouse_name,
        COUNT(s.id) as total_shipments,
        COUNT(CASE WHEN s.status = 'delivered' THEN 1 END) as delivered_shipments,
        ROUND(
            COUNT(CASE WHEN s.status = 'delivered' THEN 1 END) * 100.0 / NULLIF(COUNT(s.id), 0), 
            2
        ) as delivery_rate
    FROM warehouses w
    LEFT JOIN shipments s ON w.id = s.warehouse_id
    WHERE s.created_at >= CURRENT_DATE - (p_days || ' days')::INTERVAL
    GROUP BY w.id, w.name
    ORDER BY total_shipments DESC;
END;
$$ LANGUAGE plpgsql;

-- 10. Function to get daily shipment counts
CREATE OR REPLACE FUNCTION get_daily_shipment_counts(p_days INTEGER DEFAULT 30)
RETURNS TABLE (
    date DATE,
    shipment_count BIGINT,
    delivered_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(s.created_at) as date,
        COUNT(*) as shipment_count,
        COUNT(CASE WHEN s.status = 'delivered' THEN 1 END) as delivered_count
    FROM shipments s
    WHERE s.created_at >= CURRENT_DATE - (p_days || ' days')::INTERVAL
    GROUP BY DATE(s.created_at)
    ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql;

-- 11. Function to get top customers
CREATE OR REPLACE FUNCTION get_top_customers(p_days INTEGER DEFAULT 90, p_limit INTEGER DEFAULT 20)
RETURNS TABLE (
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    shipment_count BIGINT,
    total_cod_amount DECIMAL(12,2),
    last_shipment_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.customer_name,
        s.customer_phone,
        COUNT(*) as shipment_count,
        SUM(s.cod_amount) as total_cod_amount,
        MAX(s.created_at) as last_shipment_date
    FROM shipments s
    WHERE s.created_at >= CURRENT_DATE - (p_days || ' days')::INTERVAL
    GROUP BY s.customer_name, s.customer_phone
    ORDER BY shipment_count DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- 12. Function to get payment mode statistics
CREATE OR REPLACE FUNCTION get_payment_mode_statistics(p_days INTEGER DEFAULT 30)
RETURNS TABLE (
    payment_mode VARCHAR(20),
    count BIGINT,
    total_amount DECIMAL(12,2),
    avg_amount DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.payment_mode,
        COUNT(*) as count,
        SUM(s.cod_amount) as total_amount,
        AVG(s.cod_amount) as avg_amount
    FROM shipments s
    WHERE s.created_at >= CURRENT_DATE - (p_days || ' days')::INTERVAL
    GROUP BY s.payment_mode
    ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

-- 13. Function to get shipping mode statistics
CREATE OR REPLACE FUNCTION get_shipping_mode_statistics(p_days INTEGER DEFAULT 30)
RETURNS TABLE (
    shipping_mode VARCHAR(20),
    count BIGINT,
    avg_weight DECIMAL(8,3),
    total_cod_amount DECIMAL(12,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.shipping_mode,
        COUNT(*) as count,
        AVG(s.weight) as avg_weight,
        SUM(s.cod_amount) as total_cod_amount
    FROM shipments s
    WHERE s.created_at >= CURRENT_DATE - (p_days || ' days')::INTERVAL
    GROUP BY s.shipping_mode
    ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

-- 14. Function to get recent pin code checks
CREATE OR REPLACE FUNCTION get_recent_pin_code_checks(p_days INTEGER DEFAULT 7, p_limit INTEGER DEFAULT 50)
RETURNS TABLE (
    pin_code VARCHAR(10),
    city VARCHAR(100),
    state VARCHAR(100),
    serviceable BOOLEAN,
    hub_name VARCHAR(255),
    zone VARCHAR(50),
    checked_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pcc.pin_code,
        pcc.city,
        pcc.state,
        pcc.serviceable,
        pcc.hub_name,
        pcc.zone,
        pcc.checked_at
    FROM pin_code_checks pcc
    WHERE pcc.checked_at >= CURRENT_DATE - (p_days || ' days')::INTERVAL
    ORDER BY pcc.checked_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- 15. Function to get pickup requests by date range
CREATE OR REPLACE FUNCTION get_pickup_requests_by_date_range(
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    id UUID,
    pickup_location VARCHAR(255),
    pickup_date DATE,
    pickup_time TIME,
    expected_package_count INTEGER,
    status VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pr.id,
        pr.pickup_location,
        pr.pickup_date,
        pr.pickup_time,
        pr.expected_package_count,
        pr.status,
        pr.created_at
    FROM pickup_requests pr
    WHERE pr.pickup_date BETWEEN p_start_date AND p_end_date
    ORDER BY pr.pickup_date, pr.pickup_time;
END;
$$ LANGUAGE plpgsql;

-- Example usage of the functions:

-- Get all pending shipments
-- SELECT * FROM get_shipments_by_status('pending');

-- Search for shipments containing 'John'
-- SELECT * FROM search_shipments('John');

-- Get cached shipping rates
-- SELECT * FROM get_cached_shipping_rates('400001', '110001', 0.5, 1500);

-- Get tracking for a specific waybill
-- SELECT * FROM get_shipment_tracking('DL123456789');

-- Get expected TAT
-- SELECT * FROM get_expected_tat('400001', '110001', 'A', 'B2C', CURRENT_DATE);

-- Get shipments from last 7 days
-- SELECT * FROM get_shipments_by_date_range(CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE);

-- Get shipment statistics for last 30 days
-- SELECT * FROM get_shipment_statistics(30);

-- Get top delivery cities
-- SELECT * FROM get_top_delivery_cities(30, 10);

-- Get warehouse performance
-- SELECT * FROM get_warehouse_performance(30);

-- Get daily shipment counts
-- SELECT * FROM get_daily_shipment_counts(30);

-- Get top customers
-- SELECT * FROM get_top_customers(90, 10);

-- Get payment mode statistics
-- SELECT * FROM get_payment_mode_statistics(30);

-- Get shipping mode statistics
-- SELECT * FROM get_shipping_mode_statistics(30);

-- Get recent pin code checks
-- SELECT * FROM get_recent_pin_code_checks(7, 20);

-- Get pickup requests for current week
-- SELECT * FROM get_pickup_requests_by_date_range(CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days');
