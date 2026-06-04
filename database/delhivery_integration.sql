-- Delhivery Integration SQL Scripts
-- Helper functions and procedures for Delhivery API integration

-- 1. Function to create shipment with validation
CREATE OR REPLACE FUNCTION create_shipment_with_validation(
    p_waybill VARCHAR(50),
    p_customer_name VARCHAR(255),
    p_customer_phone VARCHAR(20),
    p_delivery_address TEXT,
    p_delivery_pincode VARCHAR(10),
    p_delivery_city VARCHAR(100),
    p_delivery_state VARCHAR(100),
    p_cod_amount DECIMAL(10,2),
    p_weight DECIMAL(8,3),
    p_products_desc TEXT,
    p_payment_mode VARCHAR(20),
    p_order_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    shipment_id UUID;
BEGIN
    -- Validate required fields
    IF p_customer_name IS NULL OR p_customer_name = '' THEN
        RAISE EXCEPTION 'Customer name is required';
    END IF;
    
    IF p_customer_phone IS NULL OR p_customer_phone = '' THEN
        RAISE EXCEPTION 'Customer phone is required';
    END IF;
    
    IF p_delivery_address IS NULL OR p_delivery_address = '' THEN
        RAISE EXCEPTION 'Delivery address is required';
    END IF;
    
    IF p_weight IS NULL OR p_weight <= 0 THEN
        RAISE EXCEPTION 'Valid weight is required';
    END IF;
    
    -- Generate waybill if not provided
    IF p_waybill IS NULL OR p_waybill = '' THEN
        p_waybill := 'DL' || EXTRACT(EPOCH FROM NOW())::BIGINT;
    END IF;
    
    -- Insert shipment
    INSERT INTO shipments (
        waybill,
        customer_name,
        customer_phone,
        delivery_address,
        delivery_pincode,
        delivery_city,
        delivery_state,
        cod_amount,
        weight,
        products_desc,
        payment_mode,
        order_id,
        status,
        created_at
    ) VALUES (
        p_waybill,
        p_customer_name,
        p_customer_phone,
        p_delivery_address,
        p_delivery_pincode,
        p_delivery_city,
        p_delivery_state,
        COALESCE(p_cod_amount, 0),
        p_weight,
        p_products_desc,
        COALESCE(p_payment_mode, 'Prepaid'),
        p_order_id,
        'pending',
        CURRENT_TIMESTAMP
    ) RETURNING id INTO shipment_id;
    
    RETURN shipment_id;
END;
$$ LANGUAGE plpgsql;

-- 2. Function to update shipment status
CREATE OR REPLACE FUNCTION update_shipment_status(
    p_waybill VARCHAR(50),
    p_status VARCHAR(20),
    p_delhivery_data JSONB DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    updated_rows INTEGER;
BEGIN
    UPDATE shipments 
    SET 
        status = p_status,
        updated_at = CURRENT_TIMESTAMP,
        actual_delivery_date = CASE WHEN p_status = 'delivered' THEN CURRENT_DATE ELSE actual_delivery_date END,
        delhivery_tracking_data = COALESCE(p_delhivery_data, delhivery_tracking_data)
    WHERE waybill = p_waybill;
    
    GET DIAGNOSTICS updated_rows = ROW_COUNT;
    
    RETURN updated_rows > 0;
END;
$$ LANGUAGE plpgsql;

-- 3. Function to cache pin code check result
CREATE OR REPLACE FUNCTION cache_pin_code_check(
    p_pin_code VARCHAR(10),
    p_city VARCHAR(100),
    p_state VARCHAR(100),
    p_serviceable BOOLEAN,
    p_hub_code VARCHAR(50),
    p_hub_name VARCHAR(255),
    p_zone VARCHAR(50),
    p_services JSONB,
    p_check_result JSONB,
    p_checked_by UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    check_id UUID;
BEGIN
    INSERT INTO pin_code_checks (
        pin_code,
        city,
        state,
        serviceable,
        hub_code,
        hub_name,
        zone,
        services,
        check_result,
        checked_by,
        checked_at
    ) VALUES (
        p_pin_code,
        p_city,
        p_state,
        p_serviceable,
        p_hub_code,
        p_hub_name,
        p_zone,
        p_services,
        p_check_result,
        p_checked_by,
        CURRENT_TIMESTAMP
    ) RETURNING id INTO check_id;
    
    RETURN check_id;
END;
$$ LANGUAGE plpgsql;

-- 4. Function to cache shipping rates
CREATE OR REPLACE FUNCTION cache_shipping_rates(
    p_pickup_pincode VARCHAR(10),
    p_delivery_pincode VARCHAR(10),
    p_weight DECIMAL(8,3),
    p_cod_amount DECIMAL(10,2),
    p_total_amount DECIMAL(10,2),
    p_base_amount DECIMAL(10,2),
    p_fuel_surcharge DECIMAL(10,2),
    p_cod_charges DECIMAL(10,2),
    p_other_charges DECIMAL(10,2),
    p_rate_data JSONB,
    p_expires_hours INTEGER DEFAULT 24
) RETURNS UUID AS $$
DECLARE
    rate_id UUID;
BEGIN
    INSERT INTO shipping_rates (
        pickup_pincode,
        delivery_pincode,
        weight,
        cod_amount,
        total_amount,
        base_amount,
        fuel_surcharge,
        cod_charges,
        other_charges,
        rate_data,
        expires_at,
        created_at
    ) VALUES (
        p_pickup_pincode,
        p_delivery_pincode,
        p_weight,
        p_cod_amount,
        p_total_amount,
        p_base_amount,
        p_fuel_surcharge,
        p_cod_charges,
        p_other_charges,
        p_rate_data,
        CURRENT_TIMESTAMP + (p_expires_hours || ' hours')::INTERVAL,
        CURRENT_TIMESTAMP
    ) RETURNING id INTO rate_id;
    
    RETURN rate_id;
END;
$$ LANGUAGE plpgsql;

-- 5. Function to get cached shipping rates
CREATE OR REPLACE FUNCTION get_cached_shipping_rates(
    p_pickup_pincode VARCHAR(10),
    p_delivery_pincode VARCHAR(10),
    p_weight DECIMAL(8,3),
    p_cod_amount DECIMAL(10,2) DEFAULT 0
) RETURNS TABLE (
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

-- 6. Function to add tracking event
CREATE OR REPLACE FUNCTION add_tracking_event(
    p_waybill VARCHAR(50),
    p_event_type VARCHAR(50),
    p_event_description TEXT,
    p_event_location VARCHAR(255),
    p_event_timestamp TIMESTAMP WITH TIME ZONE,
    p_event_data JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    event_id UUID;
    shipment_id UUID;
BEGIN
    -- Get shipment ID
    SELECT id INTO shipment_id FROM shipments WHERE waybill = p_waybill;
    
    IF shipment_id IS NULL THEN
        RAISE EXCEPTION 'Shipment with waybill % not found', p_waybill;
    END IF;
    
    -- Insert tracking event
    INSERT INTO shipment_tracking_events (
        shipment_id,
        waybill,
        event_type,
        event_description,
        event_location,
        event_timestamp,
        event_data
    ) VALUES (
        shipment_id,
        p_waybill,
        p_event_type,
        p_event_description,
        p_event_location,
        p_event_timestamp,
        p_event_data
    ) RETURNING id INTO event_id;
    
    RETURN event_id;
END;
$$ LANGUAGE plpgsql;

-- 7. Function to get shipment tracking history
CREATE OR REPLACE FUNCTION get_shipment_tracking(
    p_waybill VARCHAR(50)
) RETURNS TABLE (
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

-- 8. Function to create warehouse with validation
CREATE OR REPLACE FUNCTION create_warehouse_with_validation(
    p_name VARCHAR(255),
    p_phone VARCHAR(20),
    p_email VARCHAR(255),
    p_city VARCHAR(100),
    p_pin VARCHAR(10),
    p_address TEXT,
    p_country VARCHAR(100) DEFAULT 'India',
    p_registered_name VARCHAR(255) DEFAULT NULL,
    p_return_address TEXT DEFAULT NULL,
    p_return_pin VARCHAR(10) DEFAULT NULL,
    p_return_city VARCHAR(100) DEFAULT NULL,
    p_return_state VARCHAR(100) DEFAULT NULL,
    p_return_country VARCHAR(100) DEFAULT 'India'
) RETURNS UUID AS $$
DECLARE
    warehouse_id UUID;
BEGIN
    -- Validate required fields
    IF p_name IS NULL OR p_name = '' THEN
        RAISE EXCEPTION 'Warehouse name is required';
    END IF;
    
    IF p_phone IS NULL OR p_phone = '' THEN
        RAISE EXCEPTION 'Phone number is required';
    END IF;
    
    IF p_email IS NULL OR p_email = '' THEN
        RAISE EXCEPTION 'Email is required';
    END IF;
    
    IF p_city IS NULL OR p_city = '' THEN
        RAISE EXCEPTION 'City is required';
    END IF;
    
    IF p_pin IS NULL OR p_pin = '' THEN
        RAISE EXCEPTION 'Pin code is required';
    END IF;
    
    IF p_address IS NULL OR p_address = '' THEN
        RAISE EXCEPTION 'Address is required';
    END IF;
    
    -- Insert warehouse
    INSERT INTO warehouses (
        name,
        phone,
        email,
        city,
        pin,
        address,
        country,
        registered_name,
        return_address,
        return_pin,
        return_city,
        return_state,
        return_country,
        is_active,
        created_at
    ) VALUES (
        p_name,
        p_phone,
        p_email,
        p_city,
        p_pin,
        p_address,
        p_country,
        p_registered_name,
        p_return_address,
        p_return_pin,
        p_return_city,
        p_return_state,
        p_return_country,
        true,
        CURRENT_TIMESTAMP
    ) RETURNING id INTO warehouse_id;
    
    RETURN warehouse_id;
END;
$$ LANGUAGE plpgsql;

-- 9. Function to clean up expired cache
CREATE OR REPLACE FUNCTION cleanup_expired_cache() RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
    temp_count INTEGER;
BEGIN
    -- Clean up expired shipping rates
    DELETE FROM shipping_rates WHERE expires_at < CURRENT_TIMESTAMP;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;
    
    -- Clean up expired TAT cache
    DELETE FROM expected_tat WHERE expires_at < CURRENT_TIMESTAMP;
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;
    
    -- Clean up old pin code checks (older than 90 days)
    DELETE FROM pin_code_checks WHERE checked_at < CURRENT_DATE - INTERVAL '90 days';
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 10. Function to get shipment analytics
CREATE OR REPLACE FUNCTION get_shipment_analytics(
    p_days INTEGER DEFAULT 30
) RETURNS TABLE (
    metric VARCHAR(50),
    value BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'Total Shipments'::VARCHAR(50) as metric,
        COUNT(*)::BIGINT as value
    FROM shipments
    WHERE created_at >= CURRENT_DATE - (p_days || ' days')::INTERVAL
    
    UNION ALL
    
    SELECT 
        'Pending Shipments'::VARCHAR(50) as metric,
        COUNT(*)::BIGINT as value
    FROM shipments
    WHERE status = 'pending'
    
    UNION ALL
    
    SELECT 
        'In Transit'::VARCHAR(50) as metric,
        COUNT(*)::BIGINT as value
    FROM shipments
    WHERE status = 'in_transit'
    
    UNION ALL
    
    SELECT 
        'Delivered'::VARCHAR(50) as metric,
        COUNT(*)::BIGINT as value
    FROM shipments
    WHERE status = 'delivered' 
        AND created_at >= CURRENT_DATE - (p_days || ' days')::INTERVAL
    
    UNION ALL
    
    SELECT 
        'Cancelled'::VARCHAR(50) as metric,
        COUNT(*)::BIGINT as value
    FROM shipments
    WHERE status = 'cancelled' 
        AND created_at >= CURRENT_DATE - (p_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- 11. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shipments_waybill_status ON shipments(waybill, status);
CREATE INDEX IF NOT EXISTS idx_shipments_created_at_status ON shipments(created_at, status);
CREATE INDEX IF NOT EXISTS idx_tracking_events_waybill_timestamp ON shipment_tracking_events(waybill, event_timestamp);

-- 12. Create a view for shipment summary
CREATE OR REPLACE VIEW shipment_summary AS
SELECT 
    s.id,
    s.waybill,
    s.customer_name,
    s.customer_phone,
    s.delivery_city,
    s.delivery_state,
    s.delivery_pincode,
    s.status,
    s.cod_amount,
    s.weight,
    s.created_at,
    s.estimated_delivery,
    s.actual_delivery_date,
    w.name as warehouse_name,
    CASE 
        WHEN s.actual_delivery_date IS NOT NULL THEN 
            s.actual_delivery_date - s.created_at::DATE
        WHEN s.estimated_delivery IS NOT NULL THEN 
            s.estimated_delivery - s.created_at::DATE
        ELSE NULL
    END as delivery_days
FROM shipments s
LEFT JOIN warehouses w ON s.warehouse_id = w.id;

-- 13. Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO your_app_user;
