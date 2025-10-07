-- Shipping Management Database Setup
-- This script creates all necessary tables for the shipping management system

-- 1. Shipments Table
CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    waybill VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255),
    delivery_address TEXT NOT NULL,
    delivery_pincode VARCHAR(10) NOT NULL,
    delivery_city VARCHAR(100) NOT NULL,
    delivery_state VARCHAR(100) NOT NULL,
    delivery_country VARCHAR(100) DEFAULT 'India',
    
    -- Return address
    return_name VARCHAR(255) DEFAULT 'Lurevi Store',
    return_address TEXT,
    return_phone VARCHAR(20),
    return_pincode VARCHAR(10),
    return_city VARCHAR(100),
    return_state VARCHAR(100),
    return_country VARCHAR(100) DEFAULT 'India',
    
    -- Shipment details
    products_desc TEXT,
    cod_amount DECIMAL(10,2) DEFAULT 0,
    weight DECIMAL(8,3) NOT NULL,
    length DECIMAL(8,2),
    width DECIMAL(8,2),
    height DECIMAL(8,2),
    
    -- Status and tracking
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'picked_up', 'in_transit', 'delivered', 'cancelled', 'returned')),
    payment_mode VARCHAR(20) DEFAULT 'Prepaid' CHECK (payment_mode IN ('Prepaid', 'COD', 'Pickup')),
    shipping_mode VARCHAR(20) DEFAULT 'Express' CHECK (shipping_mode IN ('Express', 'Surface', 'Air')),
    
    -- Tracking
    tracking_url TEXT,
    estimated_delivery DATE,
    actual_delivery_date DATE,
    
    -- Delhivery specific
    delhivery_waybill VARCHAR(50),
    delhivery_status VARCHAR(50),
    delhivery_tracking_data JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    pickup_date DATE,
    
    -- Additional fields
    order_id UUID REFERENCES orders(id),
    warehouse_id UUID,
    notes TEXT
);

-- 2. Warehouses Table
CREATE TABLE IF NOT EXISTS warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    pin VARCHAR(10) NOT NULL,
    address TEXT NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    
    -- Return address
    registered_name VARCHAR(255),
    return_address TEXT,
    return_pin VARCHAR(10),
    return_city VARCHAR(100),
    return_state VARCHAR(100),
    return_country VARCHAR(100) DEFAULT 'India',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Pin Code Serviceability History
CREATE TABLE IF NOT EXISTS pin_code_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pin_code VARCHAR(10) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    serviceable BOOLEAN NOT NULL,
    hub_code VARCHAR(50),
    hub_name VARCHAR(255),
    zone VARCHAR(50),
    services JSONB, -- Store pre_paid, cod, pickup, reverse flags
    check_result JSONB, -- Store full API response
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    checked_by UUID -- Reference to admin user
);

-- 4. Shipping Rates Cache
CREATE TABLE IF NOT EXISTS shipping_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pickup_pincode VARCHAR(10) NOT NULL,
    delivery_pincode VARCHAR(10) NOT NULL,
    weight DECIMAL(8,3) NOT NULL,
    cod_amount DECIMAL(10,2) DEFAULT 0,
    product_code VARCHAR(50) DEFAULT 'DEXPRESS',
    sub_product_code VARCHAR(50) DEFAULT 'DEXPRESS',
    
    -- Rate details
    total_amount DECIMAL(10,2),
    base_amount DECIMAL(10,2),
    fuel_surcharge DECIMAL(10,2),
    cod_charges DECIMAL(10,2),
    other_charges DECIMAL(10,2),
    
    -- Cache metadata
    rate_data JSONB, -- Store full API response
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Pickup Requests
CREATE TABLE IF NOT EXISTS pickup_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pickup_location VARCHAR(255) NOT NULL,
    pickup_date DATE NOT NULL,
    pickup_time TIME,
    expected_package_count INTEGER DEFAULT 1,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'picked_up', 'cancelled')),
    
    -- Delhivery response
    request_id VARCHAR(100),
    request_data JSONB,
    response_data JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    requested_by UUID -- Reference to admin user
);

-- 6. Expected TAT Cache
CREATE TABLE IF NOT EXISTS expected_tat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    origin_pin VARCHAR(10) NOT NULL,
    destination_pin VARCHAR(10) NOT NULL,
    mode_of_transport VARCHAR(10) NOT NULL CHECK (mode_of_transport IN ('S', 'A', 'R')),
    product_type VARCHAR(10) NOT NULL CHECK (product_type IN ('B2C', 'B2B')),
    expected_pickup_date DATE NOT NULL,
    
    -- TAT details
    expected_delivery_date DATE,
    tat_days INTEGER,
    tat_data JSONB, -- Store full API response
    
    -- Cache metadata
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Waybill Generation Log
CREATE TABLE IF NOT EXISTS waybill_generation_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    count_requested INTEGER NOT NULL,
    waybills_generated TEXT[] NOT NULL, -- Array of generated waybills
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    generated_by UUID -- Reference to admin user
);

-- 8. Shipment Tracking Events
CREATE TABLE IF NOT EXISTS shipment_tracking_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    waybill VARCHAR(50) NOT NULL,
    
    -- Event details
    event_type VARCHAR(50) NOT NULL, -- 'pickup', 'in_transit', 'out_for_delivery', 'delivered', etc.
    event_description TEXT,
    event_location VARCHAR(255),
    event_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Additional data
    event_data JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shipments_waybill ON shipments(waybill);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_customer_name ON shipments(customer_name);
CREATE INDEX IF NOT EXISTS idx_shipments_delivery_pincode ON shipments(delivery_pincode);
CREATE INDEX IF NOT EXISTS idx_shipments_created_at ON shipments(created_at);
CREATE INDEX IF NOT EXISTS idx_shipments_order_id ON shipments(order_id);

CREATE INDEX IF NOT EXISTS idx_warehouses_city ON warehouses(city);
CREATE INDEX IF NOT EXISTS idx_warehouses_pin ON warehouses(pin);
CREATE INDEX IF NOT EXISTS idx_warehouses_is_active ON warehouses(is_active);

CREATE INDEX IF NOT EXISTS idx_pin_code_checks_pin_code ON pin_code_checks(pin_code);
CREATE INDEX IF NOT EXISTS idx_pin_code_checks_checked_at ON pin_code_checks(checked_at);

CREATE INDEX IF NOT EXISTS idx_shipping_rates_lookup ON shipping_rates(pickup_pincode, delivery_pincode, weight);
CREATE INDEX IF NOT EXISTS idx_shipping_rates_expires_at ON shipping_rates(expires_at);

CREATE INDEX IF NOT EXISTS idx_pickup_requests_pickup_date ON pickup_requests(pickup_date);
CREATE INDEX IF NOT EXISTS idx_pickup_requests_status ON pickup_requests(status);

CREATE INDEX IF NOT EXISTS idx_expected_tat_lookup ON expected_tat(origin_pin, destination_pin, mode_of_transport, product_type);
CREATE INDEX IF NOT EXISTS idx_expected_tat_expires_at ON expected_tat(expires_at);

CREATE INDEX IF NOT EXISTS idx_tracking_events_shipment_id ON shipment_tracking_events(shipment_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_waybill ON shipment_tracking_events(waybill);
CREATE INDEX IF NOT EXISTS idx_tracking_events_event_timestamp ON shipment_tracking_events(event_timestamp);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON shipments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON warehouses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pickup_requests_updated_at BEFORE UPDATE ON pickup_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data insertion
INSERT INTO warehouses (name, phone, email, city, pin, address, registered_name, return_address, return_pin, return_city, return_state) VALUES
('Lurevi Main Warehouse', '+91 555 123 4567', 'warehouse@lurevi.com', 'Mumbai', '400001', '123 Art Street, Mumbai, Maharashtra', 'Lurevi Store', '123 Art Street, Mumbai', '400001', 'Mumbai', 'Maharashtra'),
('Lurevi Delhi Warehouse', '+91 555 123 4568', 'delhi@lurevi.com', 'New Delhi', '110001', '456 Business Park, New Delhi', 'Lurevi Store', '456 Business Park, New Delhi', '110001', 'New Delhi', 'Delhi');

-- Sample shipment data
INSERT INTO shipments (waybill, customer_name, customer_phone, delivery_address, delivery_pincode, delivery_city, delivery_state, cod_amount, weight, status, payment_mode) VALUES
('DL123456789', 'John Doe', '+91 9876543210', '123 Main St, Mumbai', '400001', 'Mumbai', 'Maharashtra', 1500.00, 0.5, 'in_transit', 'COD'),
('DL987654321', 'Jane Smith', '+91 8765432109', '456 Park Ave, Delhi', '110001', 'New Delhi', 'Delhi', 2500.00, 0.8, 'delivered', 'COD');

-- Comments for documentation
COMMENT ON TABLE shipments IS 'Main shipments table storing all shipment information';
COMMENT ON TABLE warehouses IS 'Warehouse information for pickup and return addresses';
COMMENT ON TABLE pin_code_checks IS 'Cache for pin code serviceability checks';
COMMENT ON TABLE shipping_rates IS 'Cache for shipping rate calculations';
COMMENT ON TABLE pickup_requests IS 'Pickup request management';
COMMENT ON TABLE expected_tat IS 'Cache for expected delivery time calculations';
COMMENT ON TABLE waybill_generation_log IS 'Log of waybill generation requests';
COMMENT ON TABLE shipment_tracking_events IS 'Tracking events for shipments';
