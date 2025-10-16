import axios from 'axios';
import { supabase } from './supabaseService';

// Delhivery API Configuration
const DELHIVERY_CONFIG = {
  baseURL: import.meta.env.VITE_DELHIVERY_BASE_URL || 'https://staging-express.delhivery.com',
  expressBaseURL: import.meta.env.VITE_DELHIVERY_EXPRESS_URL || 'https://express-dev-test.delhivery.com',
  trackBaseURL: import.meta.env.VITE_DELHIVERY_TRACK_URL || 'https://track.delhivery.com',
  token: import.meta.env.VITE_DELHIVERY_API_TOKEN || 'xxxxxxxxxxxxxxxx',
  timeout: parseInt(import.meta.env.VITE_DELHIVERY_TIMEOUT || '10000'),
  retryAttempts: parseInt(import.meta.env.VITE_DELHIVERY_RETRY_ATTEMPTS || '3'),
};

// Check if API is properly configured
const isApiConfigured = () => {
  const token = import.meta.env.VITE_DELHIVERY_API_TOKEN;
  return token && token !== 'your-delhivery-api-token' && token !== 'xxxxxxxxxxxxxxxx';
};

// Types for Delhivery API responses
export interface DelhiveryPinCodeData {
  delivery_codes: Array<{
    pin: string;
    postcode: string;
    city: string;
    state: string;
    country: string;
    delivery_status: string;
    pre_paid: string;
    cod: string;
    pickup: string;
    reverse: string;
    hub_code: string;
    hub_name: string;
    zone: string;
    serviceability: string;
  }>;
}

export interface ShippingRate {
  weight: number;
  length: number;
  width: number;
  height: number;
  cod_amount: number;
  pickup_pincode: string;
  delivery_pincode: string;
  product_code: string;
  sub_product_code: string;
}

export interface ShippingRateResponse {
  total_amount: number;
  freight: number;
  cod_fee: number;
  fuel_surcharge: number;
  service_tax: number;
  other_charges: number;
  discount: number;
  delivery_time: string;
  pickup_time: string;
}

export interface ShipmentData {
  name: string;
  add: string;
  phone: string;
  pin: string;
  city: string;
  state: string;
  country: string;
  return_name: string;
  return_add: string;
  return_phone: string;
  return_pin: string;
  return_city: string;
  return_state: string;
  return_country: string;
  products_desc: string;
  cod_amount: number;
  weight: number;
  length: number;
  width: number;
  height: number;
  pickup_date: string;
  payment_mode: string;
}

// Additional Types for New API Endpoints
export interface ExpectedTATRequest {
  origin_pin: string;
  destination_pin: string;
  mot: string; // Mode of Transport (S, A, R)
  pdt: string; // Product Type (B2C, B2B)
  expected_pickup_date: string;
}

export interface ExpectedTATResponse {
  expected_tat: string;
  origin_pin: string;
  destination_pin: string;
  mode_of_transport: string;
  product_type: string;
}

export interface WaybillRequest {
  token: string;
  count: string;
}

export interface WaybillResponse {
  waybills: string[];
  token: string;
  count: number;
}

export interface CreateShipmentRequest {
  shipments: Array<{
    name: string;
    add: string;
    pin: string;
    city: string;
    state: string;
    country: string;
    phone: string;
    order: string;
    payment_mode: string;
    return_pin?: string;
    return_city?: string;
    return_phone?: string;
    return_add?: string;
    return_state?: string;
    return_country?: string;
    products_desc?: string;
    hsn_code?: string;
    cod_amount?: string;
    order_date?: string;
    total_amount?: string;
    seller_add?: string;
    seller_name?: string;
    seller_inv?: string;
    quantity?: string;
    waybill?: string;
    shipment_width: string;
    shipment_height: string;
    weight?: string;
    shipping_mode: string;
    address_type?: string;
  }>;
  pickup_location: {
    name: string;
  };
}

export interface EditShipmentRequest {
  waybill: string;
  pt?: string; // Payment Type (COD/Pre-paid)
  cod?: number;
  shipment_height?: number;
  weight?: number;
  cancellation?: boolean;
}

export interface EWaybillRequest {
  dcn: string; // Invoice number
  ewbn: string; // E-waybill number
}

export interface PackageInfoRequest {
  waybill: string;
  ref_ids?: string;
}

export interface InvoiceChargesRequest {
  md: string; // Mode (E for Express, S for Surface)
  ss: string; // Shipment Status
  d_pin: string; // Destination Pin
  o_pin: string; // Origin Pin
  cgm: string; // Weight in CGM
  pt: string; // Payment Type
}

export interface PackingSlipRequest {
  wbns: string; // Waybill numbers
  pdf: boolean;
  pdf_size: string; // 4R, A4, etc.
}

export interface PickupRequest {
  pickup_time: string;
  pickup_date: string;
  pickup_location: string;
  expected_package_count: number;
}

// Warehouse Management Types
export interface CreateWarehouseRequest {
  phone: string;
  city: string;
  name: string;
  pin: string;
  address: string;
  country: string;
  email: string;
  registered_name: string;
  return_address: string;
  return_pin: string;
  return_city: string;
  return_state: string;
  return_country: string;
}

export interface EditWarehouseRequest {
  name: string;
  phone: string;
  address: string;
}

// Advanced Shipment Creation with Custom QC
export interface CustomQCQuestion {
  questions_id: string;
  options: string[];
  value: string[];
  required: boolean;
  type: string;
  ques_images: string[];
}

export interface CustomQCItem {
  item: string;
  description: string;
  images: string[];
  return_reason: string;
  quantity: number;
  brand: string;
  product_category: string;
  questions: CustomQCQuestion[];
}

export interface AdvancedShipmentItem {
  client: string;
  return_name: string;
  order: string;
  return_country: string;
  weight: string;
  city: string;
  pin: string;
  return_state: string;
  products_desc: string;
  shipping_mode: string;
  state: string;
  quantity: number;
  waybill?: string;
  phone: string;
  add: string;
  payment_mode: string;
  order_date: string;
  seller_gst_tin?: string;
  name: string;
  return_add: string;
  total_amount: number;
  seller_name: string;
  return_city: string;
  country: string;
  return_pin: string;
  return_phone: string;
  qc_type: string;
  custom_qc?: CustomQCItem[];
}

export interface AdvancedCreateShipmentRequest {
  shipments: AdvancedShipmentItem[];
  pickup_location: {
    name: string;
  };
}

// Return-specific interfaces
export interface ReturnPickupRequest {
  order_id: string;
  return_request_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
  customer_state: string;
  customer_pincode: string;
  product_name: string;
  product_description: string;
  quantity: number;
  weight: number;
  return_reason: string;
  pickup_date: string;
  pickup_time_slot: string;
  special_instructions?: string;
}

export interface ReturnPickupResponse {
  success: boolean;
  pickup_id?: string;
  tracking_number?: string;
  estimated_pickup_date?: string;
  pickup_time_slot?: string;
  error?: string;
}

export interface ReturnTrackingInfo {
  return_id: string;
  status: 'pickup_scheduled' | 'picked_up' | 'in_transit' | 'delivered_to_warehouse' | 'processed';
  current_location: string;
  estimated_delivery_date?: string;
  tracking_history: Array<{
    status: string;
    location: string;
    timestamp: string;
    description: string;
  }>;
}

class DelhiveryService {
  private axiosInstance;
  private expressAxiosInstance;
  private trackAxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: DELHIVERY_CONFIG.baseURL,
      timeout: DELHIVERY_CONFIG.timeout,
      headers: {
        'Authorization': `Token ${DELHIVERY_CONFIG.token}`,
        'Content-Type': 'application/json',
      },
    });

    this.expressAxiosInstance = axios.create({
      baseURL: DELHIVERY_CONFIG.expressBaseURL,
      timeout: DELHIVERY_CONFIG.timeout,
      headers: {
        'Authorization': `Token ${DELHIVERY_CONFIG.token}`,
        'Content-Type': 'application/json',
      },
    });

    this.trackAxiosInstance = axios.create({
      baseURL: DELHIVERY_CONFIG.trackBaseURL,
      timeout: DELHIVERY_CONFIG.timeout,
      headers: {
        'Authorization': `Token ${DELHIVERY_CONFIG.token}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Make API call through Supabase Edge Function to avoid CORS issues
   */
  private async makeApiCall(action: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', data?: any, endpoint: 'main' | 'express' | 'track' = 'main') {
    try {
      const { data: response, error } = await supabase.functions.invoke('delhivery-api', {
        body: {
          action,
          method,
          data,
          endpoint
        }
      });

      if (error) {
        throw new Error(`Edge Function error: ${error.message}`);
      }

      if (!response.success) {
        throw new Error(`API error: ${response.statusText || 'Unknown error'}`);
      }

      return response.data;
    } catch (error: any) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  /**
   * Check if a pincode is serviceable
   */
  async checkPinCodeServiceability(pinCode: string): Promise<DelhiveryPinCodeData> {
    // Check if API is properly configured
    if (!isApiConfigured()) {
      console.warn('Delhivery API not configured, returning mock data');
      return this.getMockPinCodeData(pinCode);
    }

    try {
      const response = await this.axiosInstance.get('/c/api/pin-codes/json/', {
        params: { filter_codes: pinCode }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error checking pincode serviceability:', error);
      
      // If it's a network error or API is not accessible, return mock data
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        console.warn('Network error, returning mock data for pincode:', pinCode);
        return this.getMockPinCodeData(pinCode);
      }
      
      throw new Error(`Failed to check pincode serviceability: ${error.message}`);
    }
  }

  /**
   * Get mock pincode data for testing/fallback
   */
  private getMockPinCodeData(pinCode: string): DelhiveryPinCodeData {
    // Get location info based on pin code
    const locationInfo = this.getLocationFromPinCode(pinCode);
    
    return {
      delivery_codes: [{
        pin: pinCode,
        postcode: pinCode,
        city: locationInfo.city,
        state: locationInfo.state,
        country: 'India',
        delivery_status: locationInfo.serviceable ? 'Serviceable' : 'Not Serviceable',
        pre_paid: locationInfo.serviceable ? 'Y' : 'N',
        cod: locationInfo.serviceable ? 'Y' : 'N',
        pickup: locationInfo.serviceable ? 'Y' : 'N',
        reverse: locationInfo.serviceable ? 'Y' : 'N',
        hub_code: locationInfo.hubCode,
        hub_name: locationInfo.hubName,
        zone: locationInfo.zone,
        serviceability: locationInfo.serviceable ? 'Serviceable' : 'Not Serviceable'
      }]
    };
  }

  /**
   * Get location information based on pin code
   */
  private getLocationFromPinCode(pinCode: string): {
    city: string;
    state: string;
    serviceable: boolean;
    hubCode: string;
    hubName: string;
    zone: string;
  } {
    const pin = parseInt(pinCode);
    
    // Delhi (110xxx)
    if (pin >= 110000 && pin <= 110099) {
      return {
        city: 'New Delhi',
        state: 'Delhi',
        serviceable: true,
        hubCode: 'DEL001',
        hubName: 'Delhi Hub',
        zone: 'Zone 1'
      };
    }
    
    // Mumbai (400xxx)
    if (pin >= 400000 && pin <= 400099) {
      return {
        city: 'Mumbai',
        state: 'Maharashtra',
        serviceable: true,
        hubCode: 'MUM001',
        hubName: 'Mumbai Hub',
        zone: 'Zone 1'
      };
    }
    
    // Bangalore (560xxx)
    if (pin >= 560000 && pin <= 560099) {
      return {
        city: 'Bangalore',
        state: 'Karnataka',
        serviceable: true,
        hubCode: 'BLR001',
        hubName: 'Bangalore Hub',
        zone: 'Zone 2'
      };
    }
    
    // Chennai (600xxx)
    if (pin >= 600000 && pin <= 600099) {
      return {
        city: 'Chennai',
        state: 'Tamil Nadu',
        serviceable: true,
        hubCode: 'CHN001',
        hubName: 'Chennai Hub',
        zone: 'Zone 2'
      };
    }
    
    // Kolkata (700xxx)
    if (pin >= 700000 && pin <= 700099) {
      return {
        city: 'Kolkata',
        state: 'West Bengal',
        serviceable: true,
        hubCode: 'KOL001',
        hubName: 'Kolkata Hub',
        zone: 'Zone 3'
      };
    }
    
    // Hyderabad (500xxx)
    if (pin >= 500000 && pin <= 500099) {
      return {
        city: 'Hyderabad',
        state: 'Telangana',
        serviceable: true,
        hubCode: 'HYD001',
        hubName: 'Hyderabad Hub',
        zone: 'Zone 2'
      };
    }
    
    // Pune (411xxx)
    if (pin >= 411000 && pin <= 411099) {
      return {
        city: 'Pune',
        state: 'Maharashtra',
        serviceable: true,
        hubCode: 'PUN001',
        hubName: 'Pune Hub',
        zone: 'Zone 1'
      };
    }
    
    // Ahmedabad (380xxx)
    if (pin >= 380000 && pin <= 380099) {
      return {
        city: 'Ahmedabad',
        state: 'Gujarat',
        serviceable: true,
        hubCode: 'AMD001',
        hubName: 'Ahmedabad Hub',
        zone: 'Zone 1'
      };
    }
    
    // Jaipur (302xxx)
    if (pin >= 302000 && pin <= 302099) {
      return {
        city: 'Jaipur',
        state: 'Rajasthan',
        serviceable: true,
        hubCode: 'JAI001',
        hubName: 'Jaipur Hub',
        zone: 'Zone 1'
      };
    }
    
    // Lucknow (226xxx)
    if (pin >= 226000 && pin <= 226099) {
      return {
        city: 'Lucknow',
        state: 'Uttar Pradesh',
        serviceable: true,
        hubCode: 'LKO001',
        hubName: 'Lucknow Hub',
        zone: 'Zone 3'
      };
    }
    
    // For other pin codes, determine state and city based on first 2-3 digits
    const firstTwoDigits = Math.floor(pin / 10000);
    
    // State-wise mapping based on pin code ranges
    if (firstTwoDigits >= 10 && firstTwoDigits <= 19) {
      return {
        city: 'Delhi NCR',
        state: 'Delhi/Haryana',
        serviceable: true,
        hubCode: 'DEL002',
        hubName: 'Delhi NCR Hub',
        zone: 'Zone 1'
      };
    }
    
    if (firstTwoDigits >= 20 && firstTwoDigits <= 29) {
      return {
        city: 'Uttar Pradesh',
        state: 'Uttar Pradesh',
        serviceable: true,
        hubCode: 'UP001',
        hubName: 'UP Hub',
        zone: 'Zone 3'
      };
    }
    
    if (firstTwoDigits >= 30 && firstTwoDigits <= 39) {
      return {
        city: 'Rajasthan',
        state: 'Rajasthan',
        serviceable: true,
        hubCode: 'RJ001',
        hubName: 'Rajasthan Hub',
        zone: 'Zone 1'
      };
    }
    
    if (firstTwoDigits >= 40 && firstTwoDigits <= 49) {
      return {
        city: 'Maharashtra',
        state: 'Maharashtra',
        serviceable: true,
        hubCode: 'MH001',
        hubName: 'Maharashtra Hub',
        zone: 'Zone 1'
      };
    }
    
    if (firstTwoDigits >= 50 && firstTwoDigits <= 59) {
      return {
        city: 'Telangana/Andhra Pradesh',
        state: 'Telangana/Andhra Pradesh',
        serviceable: true,
        hubCode: 'TS001',
        hubName: 'Telangana Hub',
        zone: 'Zone 2'
      };
    }
    
    if (firstTwoDigits >= 60 && firstTwoDigits <= 69) {
      return {
        city: 'Tamil Nadu',
        state: 'Tamil Nadu',
        serviceable: true,
        hubCode: 'TN001',
        hubName: 'Tamil Nadu Hub',
        zone: 'Zone 2'
      };
    }
    
    if (firstTwoDigits >= 70 && firstTwoDigits <= 79) {
      return {
        city: 'West Bengal',
        state: 'West Bengal',
        serviceable: true,
        hubCode: 'WB001',
        hubName: 'West Bengal Hub',
        zone: 'Zone 3'
      };
    }
    
    if (firstTwoDigits >= 80 && firstTwoDigits <= 89) {
      return {
        city: 'Bihar/Jharkhand',
        state: 'Bihar/Jharkhand',
        serviceable: true,
        hubCode: 'BH001',
        hubName: 'Bihar Hub',
        zone: 'Zone 3'
      };
    }
    
    // For very remote areas or invalid pin codes
    return {
      city: 'Remote Area',
      state: 'Various',
      serviceable: false,
      hubCode: 'REM001',
      hubName: 'Remote Hub',
      zone: 'Zone 4'
    };
  }

  /**
   * Get shipping rates for a shipment
   */
  async getShippingRates(rateData: ShippingRate): Promise<ShippingRateResponse> {
    // Check if API is properly configured
    if (!isApiConfigured()) {
      console.warn('Delhivery API not configured, returning mock rates');
      return this.getMockShippingRates(rateData);
    }

    try {
      const response = await this.axiosInstance.post('/c/api/shipments/rates/json/', rateData);
      return response.data;
    } catch (error: any) {
      console.error('Error getting shipping rates:', error);
      
      // If it's a network error or API is not accessible, return mock data
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        console.warn('Network error, returning mock rates');
        return this.getMockShippingRates(rateData);
      }
      
      throw new Error(`Failed to get shipping rates: ${error.message}`);
    }
  }

  /**
   * Get mock shipping rates for testing/fallback
   */
  private getMockShippingRates(rateData: ShippingRate): ShippingRateResponse {
    const baseRate = 50; // Base rate in INR
    const weightMultiplier = rateData.weight * 10; // 10 INR per kg
    const codFee = rateData.cod_amount > 0 ? rateData.cod_amount * 0.02 : 0; // 2% COD fee
    
    return {
      total_amount: baseRate + weightMultiplier + codFee,
      freight: baseRate + weightMultiplier,
      cod_fee: codFee,
      fuel_surcharge: 5,
      service_tax: (baseRate + weightMultiplier) * 0.18, // 18% GST
      other_charges: 0,
      discount: 0,
      delivery_time: '2-3 business days',
      pickup_time: 'Next business day'
    };
  }

  /**
   * Get mock shipment response for testing/fallback
   */
  private getMockShipmentResponse(shipmentData: CreateShipmentRequest): any {
    const waybills = shipmentData.shipments.map((_, index) => `MOCK${Date.now()}${index + 1}`);
    
    return {
      success: true,
      data: {
        shipments: shipmentData.shipments.map((shipment, index) => ({
          ...shipment,
          waybill: waybills[index],
          status: 'Created',
          created_at: new Date().toISOString(),
          tracking_url: `https://track.delhivery.com/track/${waybills[index]}`
        })),
        pickup_location: shipmentData.pickup_location,
        total_shipments: shipmentData.shipments.length,
        message: 'Shipment created successfully (Mock)'
      }
    };
  }

  /**
   * Create a new shipment using the new CMU API
   */
  async createShipment(shipmentData: CreateShipmentRequest): Promise<any> {
    // Check if API is properly configured
    if (!isApiConfigured()) {
      console.warn('Delhivery API not configured, returning mock data');
      return this.getMockShipmentResponse(shipmentData);
    }

    try {
      // Try Edge Function first (if available)
      try {
        const response = await this.makeApiCall('/api/cmu/create.json', 'POST', {
          format: 'json',
          data: JSON.stringify(shipmentData)
        }, 'main');
        
        return response;
      } catch (edgeFunctionError) {
        console.warn('Edge Function not available, falling back to direct API call');
        
        // Fallback to direct API call (will likely fail due to CORS)
        const response = await this.axiosInstance.post('/api/cmu/create.json', {
          format: 'json',
          data: JSON.stringify(shipmentData)
        });
        return response.data;
      }
    } catch (error: any) {
      console.error('Error creating shipment:', error);
      
      // If it's a network error or CORS error, return mock data
      if (error.code === 'ERR_NETWORK' || 
          error.message === 'Network Error' || 
          error.message?.includes('CORS') ||
          error.message?.includes('Edge Function error') || 
          error.message?.includes('API error')) {
        console.warn('Network/CORS error, returning mock shipment data');
        return this.getMockShipmentResponse(shipmentData);
      }
      
      throw new Error(`Failed to create shipment: ${error.message}`);
    }
  }

  /**
   * Track a shipment
   */
  async trackShipment(waybill: string): Promise<any> {
    // Check if API is properly configured
    if (!isApiConfigured()) {
      console.warn('Delhivery API not configured, returning mock tracking data');
      return this.getMockTrackingData(waybill);
    }

    try {
      const response = await this.axiosInstance.get(`/c/api/shipments/track/json/?waybill=${waybill}`);
      return response.data;
    } catch (error: any) {
      console.error('Error tracking shipment:', error);
      
      // If it's a network error or API is not accessible, return mock data
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        console.warn('Network error, returning mock tracking data for waybill:', waybill);
        return this.getMockTrackingData(waybill);
      }
      
      throw new Error(`Failed to track shipment: ${error.message}`);
    }
  }

  /**
   * Get mock tracking data for testing/fallback
   */
  private getMockTrackingData(waybill: string): any {
    return {
      waybill,
      status: 'In Transit',
      status_code: 'IT',
      status_description: 'Your shipment is in transit',
      current_location: 'Mumbai Hub',
      destination: 'Delhi',
      estimated_delivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
      tracking_events: [
        {
          status: 'Picked Up',
          status_code: 'PU',
          status_description: 'Shipment picked up from origin',
          location: 'Mumbai',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          remarks: 'Picked up from sender'
        },
        {
          status: 'In Transit',
          status_code: 'IT',
          status_description: 'Shipment is in transit',
          location: 'Mumbai Hub',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
          remarks: 'Departed from origin hub'
        }
      ]
    };
  }

  /**
   * Cancel a shipment
   */
  async cancelShipment(waybill: string, reason: string): Promise<any> {
    try {
      const response = await this.axiosInstance.post('/c/api/shipments/cancel/json/', {
        waybill,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Error canceling shipment:', error);
      throw new Error('Failed to cancel shipment');
    }
  }

  /**
   * Get pickup locations
   */
  async getPickupLocations(): Promise<any> {
    try {
      const response = await this.axiosInstance.get('/pickup/locations/json/');
      return response.data;
    } catch (error) {
      console.error('Error getting pickup locations:', error);
      throw new Error('Failed to get pickup locations');
    }
  }

  /**
   * Schedule a pickup
   */
  async schedulePickup(pickupData: {
    waybill: string;
    pickup_date: string;
    pickup_time: string;
    location: string;
  }): Promise<any> {
    try {
      const response = await this.axiosInstance.post('/pickup/schedule/json/', pickupData);
      return response.data;
    } catch (error) {
      console.error('Error scheduling pickup:', error);
      throw new Error('Failed to schedule pickup');
    }
  }

  /**
   * Get delivery estimates
   */
  async getDeliveryEstimates(pickupPincode: string, deliveryPincode: string): Promise<any> {
    try {
      const response = await this.axiosInstance.get('/delivery/estimates/json/', {
        params: {
          pickup_pincode: pickupPincode,
          delivery_pincode: deliveryPincode
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting delivery estimates:', error);
      throw new Error('Failed to get delivery estimates');
    }
  }

  /**
   * Validate address
   */
  async validateAddress(addressData: {
    pin: string;
    address: string;
    city: string;
    state: string;
  }): Promise<any> {
    try {
      const response = await this.axiosInstance.post('/address/validate/json/', addressData);
      return response.data;
    } catch (error) {
      console.error('Error validating address:', error);
      throw new Error('Failed to validate address');
    }
  }

  /**
   * Get serviceable pincodes in bulk
   */
  async getBulkServiceability(pincodes: string[]): Promise<any> {
    try {
      const response = await this.axiosInstance.post('/c/api/pin-codes/bulk/json/', {
        pincodes: pincodes.join(',')
      });
      return response.data;
    } catch (error) {
      console.error('Error getting bulk serviceability:', error);
      throw new Error('Failed to get bulk serviceability');
    }
  }

  // ============ NEW API ENDPOINTS ============

  /**
   * Get Expected TAT (Turn Around Time)
   */
  async getExpectedTAT(request: ExpectedTATRequest): Promise<ExpectedTATResponse> {
    try {
      const response = await this.expressAxiosInstance.get('/api/dc/expected_tat', {
        params: request
      });
      return response.data;
    } catch (error) {
      console.error('Error getting expected TAT:', error);
      throw new Error('Failed to get expected TAT');
    }
  }

  /**
   * Get waybill numbers in bulk
   */
  async getWaybills(request: WaybillRequest): Promise<WaybillResponse> {
    try {
      const response = await this.axiosInstance.get('/waybill/api/bulk/json/', {
        params: request
      });
      return response.data;
    } catch (error) {
      console.error('Error getting waybills:', error);
      throw new Error('Failed to get waybills');
    }
  }

  /**
   * Edit shipment details
   */
  async editShipment(request: EditShipmentRequest): Promise<any> {
    try {
      const response = await this.axiosInstance.post('/api/p/edit', request);
      return response.data;
    } catch (error) {
      console.error('Error editing shipment:', error);
      throw new Error('Failed to edit shipment');
    }
  }

  /**
   * Cancel shipment using edit API
   */
  async cancelShipmentViaEdit(waybill: string): Promise<any> {
    // Check if API is configured
    if (!isApiConfigured()) {
      console.log('🔧 Using mock cancellation (API not configured)');
      // Return mock success response
      return {
        success: true,
        message: 'Shipment cancelled successfully (mock)',
        waybill: waybill,
        status: 'cancelled'
      };
    }

    try {
      const response = await this.axiosInstance.post('/api/p/edit', {
        waybill,
        cancellation: true
      });
      return response.data;
    } catch (error: any) {
      console.error('Error canceling shipment via edit:', error);
      
      // If network error, return mock response instead of throwing
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        console.log('🔧 Network error - using mock cancellation instead');
        return {
          success: true,
          message: 'Shipment cancelled successfully (mock - API unavailable)',
          waybill: waybill,
          status: 'cancelled'
        };
      }
      
      throw new Error('Failed to cancel shipment');
    }
  }

  /**
   * Update E-waybill information
   */
  async updateEWaybill(waybill: string, eWaybillData: EWaybillRequest[]): Promise<any> {
    try {
      const response = await this.trackAxiosInstance.put(`/api/rest/ewaybill/${waybill}/`, {
        data: eWaybillData
      });
      return response.data;
    } catch (error) {
      console.error('Error updating E-waybill:', error);
      throw new Error('Failed to update E-waybill');
    }
  }

  /**
   * Get package information
   */
  async getPackageInfo(request: PackageInfoRequest): Promise<any> {
    try {
      const response = await this.axiosInstance.get('/api/v1/packages/json/', {
        params: request
      });
      return response.data;
    } catch (error) {
      console.error('Error getting package info:', error);
      throw new Error('Failed to get package info');
    }
  }

  /**
   * Get invoice charges
   */
  async getInvoiceCharges(request: InvoiceChargesRequest): Promise<any> {
    try {
      const response = await this.axiosInstance.get('/api/kinko/v1/invoice/charges/.json', {
        params: request
      });
      return response.data;
    } catch (error) {
      console.error('Error getting invoice charges:', error);
      throw new Error('Failed to get invoice charges');
    }
  }

  /**
   * Get packing slip
   */
  async getPackingSlip(request: PackingSlipRequest): Promise<any> {
    try {
      const response = await this.axiosInstance.get('/api/p/packing_slip', {
        params: request
      });
      return response.data;
    } catch (error) {
      console.error('Error getting packing slip:', error);
      throw new Error('Failed to get packing slip');
    }
  }

  /**
   * Request pickup
   */
  async requestPickup(request: PickupRequest): Promise<any> {
    try {
      const response = await this.axiosInstance.post('/fm/request/new/', request);
      return response.data;
    } catch (error) {
      console.error('Error requesting pickup:', error);
      throw new Error('Failed to request pickup');
    }
  }

  // ============ UTILITY METHODS ============

  /**
   * Generate waybill numbers
   */
  async generateWaybills(count: number = 5): Promise<string[]> {
    // Check if API is configured
    if (!isApiConfigured()) {
      console.log('🔧 Generating mock waybills (API not configured)');
      // Generate mock waybills
      const mockWaybills: string[] = [];
      const prefix = 'DL';
      for (let i = 0; i < count; i++) {
        const randomNum = Math.floor(Math.random() * 900000000) + 100000000;
        mockWaybills.push(`${prefix}${randomNum}`);
      }
      return mockWaybills;
    }

    try {
      const response = await this.getWaybills({
        token: DELHIVERY_CONFIG.token,
        count: count.toString()
      });
      return response.waybills || [];
    } catch (error: any) {
      console.error('Error generating waybills:', error);
      
      // If network error, return mock waybills instead of throwing
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        console.log('🔧 Network error - generating mock waybills instead');
        const mockWaybills: string[] = [];
        const prefix = 'DL';
        for (let i = 0; i < count; i++) {
          const randomNum = Math.floor(Math.random() * 900000000) + 100000000;
          mockWaybills.push(`${prefix}${randomNum}`);
        }
        return mockWaybills;
      }
      
      throw new Error('Failed to generate waybills');
    }
  }

  /**
   * Calculate expected delivery date
   */
  async calculateExpectedDelivery(
    originPin: string, 
    destinationPin: string, 
    modeOfTransport: 'S' | 'A' | 'R' = 'S',
    productType: 'B2C' | 'B2B' = 'B2C',
    expectedPickupDate?: string
  ): Promise<string> {
    try {
      const pickupDate = expectedPickupDate || new Date().toISOString().split('T')[0];
      const response = await this.getExpectedTAT({
        origin_pin: originPin,
        destination_pin: destinationPin,
        mot: modeOfTransport,
        pdt: productType,
        expected_pickup_date: pickupDate
      });
      return response.expected_tat;
    } catch (error) {
      console.error('Error calculating expected delivery:', error);
      throw new Error('Failed to calculate expected delivery');
    }
  }

  /**
   * Create shipment with auto-generated waybill
   */
  async createShipmentWithWaybill(shipmentData: CreateShipmentRequest): Promise<any> {
    try {
      // First generate waybills if not provided
      if (shipmentData.shipments.some(s => !s.waybill)) {
        const waybills = await this.generateWaybills(shipmentData.shipments.length);
        
        // Assign waybills to shipments that don't have them
        shipmentData.shipments.forEach((shipment, index) => {
          if (!shipment.waybill && waybills[index]) {
            shipment.waybill = waybills[index];
          }
        });
      }

      // Create the shipment
      return await this.createShipment(shipmentData);
    } catch (error) {
      console.error('Error creating shipment with waybill:', error);
      throw new Error('Failed to create shipment with waybill');
    }
  }

  /**
   * Get comprehensive shipment details
   */
  async getShipmentDetails(waybill: string): Promise<any> {
    try {
      const [trackingInfo, packageInfo] = await Promise.all([
        this.trackShipment(waybill),
        this.getPackageInfo({ waybill })
      ]);

      return {
        waybill,
        tracking: trackingInfo,
        package: packageInfo,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting shipment details:', error);
      throw new Error('Failed to get shipment details');
    }
  }

  // ============ WAREHOUSE MANAGEMENT ============

  /**
   * Create a new warehouse
   */
  async createWarehouse(warehouseData: CreateWarehouseRequest): Promise<any> {
    try {
      // Check if API is configured
      if (!isApiConfigured()) {
        console.warn('Delhivery API not configured, returning mock response');
        return {
          success: true,
          message: 'Warehouse created successfully (Mock)',
          warehouse_id: `WH_${Date.now()}`,
          data: warehouseData
        };
      }

      // Prepare the request data with proper format
      const requestData = {
        ...warehouseData,
        // Ensure required fields are present
        registered_name: warehouseData.registered_name || warehouseData.name,
        return_pin: warehouseData.return_pin || warehouseData.pin,
        return_city: warehouseData.return_city || warehouseData.city,
        return_state: warehouseData.return_state || 'Maharashtra',
        return_country: warehouseData.return_country || 'India'
      };

      const response = await this.axiosInstance.put('/api/backend/clientwarehouse/create/', requestData);
      
      return {
        success: true,
        message: 'Warehouse created successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error creating warehouse:', error);
      
      // Provide more specific error messages
      if (error.response?.status === 401) {
        throw new Error('Invalid API token. Please check your Delhivery API configuration.');
      } else if (error.response?.status === 400) {
        throw new Error(`Invalid warehouse data: ${error.response?.data?.message || 'Please check all required fields'}`);
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. Please check your API permissions.');
      } else if (error.code === 'ERR_NETWORK') {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(`Failed to create warehouse: ${error.message || 'Unknown error'}`);
      }
    }
  }

  /**
   * Edit warehouse details
   */
  async editWarehouse(warehouseData: EditWarehouseRequest): Promise<any> {
    try {
      // Check if API is configured
      if (!isApiConfigured()) {
        console.warn('Delhivery API not configured, returning mock response');
        return {
          success: true,
          message: 'Warehouse updated successfully (Mock)',
          data: warehouseData
        };
      }

      const response = await this.axiosInstance.post('/api/backend/clientwarehouse/edit/', warehouseData);
      
      return {
        success: true,
        message: 'Warehouse updated successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error editing warehouse:', error);
      
      // Provide more specific error messages
      if (error.response?.status === 401) {
        throw new Error('Invalid API token. Please check your Delhivery API configuration.');
      } else if (error.response?.status === 400) {
        throw new Error(`Invalid warehouse data: ${error.response?.data?.message || 'Please check all required fields'}`);
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. Please check your API permissions.');
      } else if (error.response?.status === 404) {
        throw new Error('Warehouse not found. Please check the warehouse name.');
      } else if (error.code === 'ERR_NETWORK') {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(`Failed to update warehouse: ${error.message || 'Unknown error'}`);
      }
    }
  }

  // ============ ADVANCED SHIPMENT CREATION ============

  /**
   * Create advanced shipment with custom QC
   */
  async createAdvancedShipment(shipmentData: AdvancedCreateShipmentRequest): Promise<any> {
    try {
      const response = await this.axiosInstance.post('/api/cmu/create.json', {
        format: 'json',
        data: JSON.stringify(shipmentData)
      });
      return response.data;
    } catch (error) {
      console.error('Error creating advanced shipment:', error);
      throw new Error('Failed to create advanced shipment');
    }
  }

  // ============ UTILITY METHODS FOR WAREHOUSE ============

  /**
   * Create warehouse with validation
   */
  async createWarehouseWithValidation(warehouseData: CreateWarehouseRequest): Promise<any> {
    try {
      // Validate required fields
      const errors: string[] = [];
      
      if (!warehouseData.name || warehouseData.name.trim().length === 0) {
        errors.push('Warehouse name is required');
      }
      
      if (!warehouseData.phone || warehouseData.phone.trim().length === 0) {
        errors.push('Phone number is required');
      } else if (!/^[6-9]\d{9}$/.test(warehouseData.phone.replace(/\D/g, ''))) {
        errors.push('Please enter a valid 10-digit Indian phone number');
      }
      
      if (!warehouseData.address || warehouseData.address.trim().length === 0) {
        errors.push('Address is required');
      }
      
      if (!warehouseData.city || warehouseData.city.trim().length === 0) {
        errors.push('City is required');
      }
      
      if (!warehouseData.pin || !/^\d{6}$/.test(warehouseData.pin)) {
        errors.push('Valid 6-digit pin code is required');
      }
      
      if (!warehouseData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(warehouseData.email)) {
        errors.push('Valid email address is required');
      }

      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join(', ')}`);
      }

      // Clean and format the data
      const cleanedData = {
        ...warehouseData,
        phone: warehouseData.phone.replace(/\D/g, ''), // Remove non-digits
        name: warehouseData.name.trim(),
        address: warehouseData.address.trim(),
        city: warehouseData.city.trim(),
        email: warehouseData.email.toLowerCase().trim(),
        pin: warehouseData.pin.trim()
      };

      return await this.createWarehouse(cleanedData);
    } catch (error) {
      console.error('Error creating warehouse with validation:', error);
      throw error;
    }
  }

  /**
   * Edit warehouse with validation
   */
  async editWarehouseWithValidation(warehouseData: EditWarehouseRequest): Promise<any> {
    try {
      // Validate required fields
      const errors: string[] = [];
      
      if (!warehouseData.name || warehouseData.name.trim().length === 0) {
        errors.push('Warehouse name is required');
      }
      
      if (!warehouseData.phone || warehouseData.phone.trim().length === 0) {
        errors.push('Phone number is required');
      } else if (!/^[6-9]\d{9}$/.test(warehouseData.phone.replace(/\D/g, ''))) {
        errors.push('Please enter a valid 10-digit Indian phone number');
      }
      
      if (!warehouseData.address || warehouseData.address.trim().length === 0) {
        errors.push('Address is required');
      }

      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join(', ')}`);
      }

      // Clean and format the data
      const cleanedData = {
        ...warehouseData,
        phone: warehouseData.phone.replace(/\D/g, ''), // Remove non-digits
        name: warehouseData.name.trim(),
        address: warehouseData.address.trim()
      };

      return await this.editWarehouse(cleanedData);
    } catch (error) {
      console.error('Error editing warehouse with validation:', error);
      throw error;
    }
  }

  /**
   * Create advanced shipment with auto waybill assignment
   */
  async createAdvancedShipmentWithWaybill(shipmentData: AdvancedCreateShipmentRequest): Promise<any> {
    try {
      // Generate waybills for shipments that don't have them
      const shipmentsWithoutWaybill = shipmentData.shipments.filter(s => !s.waybill);
      
      if (shipmentsWithoutWaybill.length > 0) {
        const waybills = await this.generateWaybills(shipmentsWithoutWaybill.length);
        
        // Assign waybills to shipments
        shipmentsWithoutWaybill.forEach((shipment, index) => {
          if (waybills[index]) {
            shipment.waybill = waybills[index];
          }
        });
      }

      return await this.createAdvancedShipment(shipmentData);
    } catch (error) {
      console.error('Error creating advanced shipment with waybill:', error);
      throw new Error('Failed to create advanced shipment with waybill');
    }
  }

  // ===== RETURN MANAGEMENT METHODS =====

  /**
   * Schedule a return pickup
   */
  async scheduleReturnPickup(returnRequest: ReturnPickupRequest): Promise<ReturnPickupResponse> {
    try {
      if (!isApiConfigured()) {
        console.warn('Delhivery API not configured, returning mock return pickup data');
        return this.getMockReturnPickupResponse(returnRequest);
      }

      const pickupData = {
        order_id: returnRequest.order_id,
        return_request_id: returnRequest.return_request_id,
        customer_name: returnRequest.customer_name,
        customer_phone: returnRequest.customer_phone,
        customer_address: returnRequest.customer_address,
        customer_city: returnRequest.customer_city,
        customer_state: returnRequest.customer_state,
        customer_pincode: returnRequest.customer_pincode,
        product_name: returnRequest.product_name,
        product_description: returnRequest.product_description,
        quantity: returnRequest.quantity,
        weight: returnRequest.weight,
        return_reason: returnRequest.return_reason,
        pickup_date: returnRequest.pickup_date,
        pickup_time_slot: returnRequest.pickup_time_slot,
        special_instructions: returnRequest.special_instructions || '',
        payment_mode: 'prepaid',
        service_type: 'reverse'
      };

      const response = await this.axiosInstance.post('/pickup/schedule/return/', pickupData);
      
      return {
        success: true,
        pickup_id: response.data.pickup_id,
        tracking_number: response.data.tracking_number,
        estimated_pickup_date: response.data.estimated_pickup_date,
        pickup_time_slot: response.data.pickup_time_slot
      };
    } catch (error) {
      console.error('Error scheduling return pickup:', error);
      
      // If it's a network error, return mock data
      if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
        console.warn('Network error, returning mock return pickup data');
        return this.getMockReturnPickupResponse(returnRequest);
      }

      return {
        success: false,
        error: error.response?.data?.message || 'Failed to schedule return pickup'
      };
    }
  }

  /**
   * Track return pickup status
   */
  async trackReturnPickup(trackingNumber: string): Promise<ReturnTrackingInfo> {
    try {
      if (!isApiConfigured()) {
        console.warn('Delhivery API not configured, returning mock return tracking data');
        return this.getMockReturnTrackingInfo(trackingNumber);
      }

      const response = await this.trackAxiosInstance.get(`/api/packages/json/?tracking_number=${trackingNumber}&service=reverse`);
      
      const trackingData = response.data[0];
      
      return {
        return_id: trackingNumber,
        status: this.mapDelhiveryStatusToReturnStatus(trackingData.status),
        current_location: trackingData.current_location || 'Unknown',
        estimated_delivery_date: trackingData.estimated_delivery_date,
        tracking_history: trackingData.tracking_history || []
      };
    } catch (error) {
      console.error('Error tracking return pickup:', error);
      
      // If it's a network error, return mock data
      if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
        console.warn('Network error, returning mock return tracking data');
        return this.getMockReturnTrackingInfo(trackingNumber);
      }

      throw new Error('Failed to track return pickup');
    }
  }

  /**
   * Cancel return pickup
   */
  async cancelReturnPickup(pickupId: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!isApiConfigured()) {
        console.warn('Delhivery API not configured, returning mock cancellation');
        return { success: true };
      }

      await this.axiosInstance.post(`/pickup/cancel/return/${pickupId}/`);
      
      return { success: true };
    } catch (error) {
      console.error('Error cancelling return pickup:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to cancel return pickup'
      };
    }
  }

  /**
   * Get available pickup time slots for returns
   */
  async getReturnPickupTimeSlots(pincode: string, date: string): Promise<string[]> {
    try {
      if (!isApiConfigured()) {
        console.warn('Delhivery API not configured, returning mock time slots');
        return this.getMockPickupTimeSlots();
      }

      const response = await this.axiosInstance.get(`/pickup/slots/return/?pincode=${pincode}&date=${date}`);
      
      return response.data.available_slots || [];
    } catch (error) {
      console.error('Error getting return pickup time slots:', error);
      return this.getMockPickupTimeSlots();
    }
  }

  /**
   * Map Delhivery status to return status
   */
  private mapDelhiveryStatusToReturnStatus(delhiveryStatus: string): ReturnTrackingInfo['status'] {
    const statusMap: Record<string, ReturnTrackingInfo['status']> = {
      'Pickup Scheduled': 'pickup_scheduled',
      'Pickup Attempted': 'pickup_scheduled',
      'Picked Up': 'picked_up',
      'In Transit': 'in_transit',
      'Out for Delivery': 'in_transit',
      'Delivered': 'delivered_to_warehouse',
      'Processed': 'processed',
      'Return Completed': 'processed'
    };

    return statusMap[delhiveryStatus] || 'pickup_scheduled';
  }

  /**
   * Mock return pickup response for testing
   */
  private getMockReturnPickupResponse(returnRequest: ReturnPickupRequest): ReturnPickupResponse {
    return {
      success: true,
      pickup_id: `RET${Date.now()}`,
      tracking_number: `RTN${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      estimated_pickup_date: returnRequest.pickup_date,
      pickup_time_slot: returnRequest.pickup_time_slot
    };
  }

  /**
   * Mock return tracking info for testing
   */
  private getMockReturnTrackingInfo(trackingNumber: string): ReturnTrackingInfo {
    return {
      return_id: trackingNumber,
      status: 'pickup_scheduled',
      current_location: 'Customer Location',
      estimated_delivery_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tracking_history: [
        {
          status: 'Pickup Scheduled',
          location: 'Customer Location',
          timestamp: new Date().toISOString(),
          description: 'Return pickup has been scheduled'
        }
      ]
    };
  }

  /**
   * Mock pickup time slots
   */
  private getMockPickupTimeSlots(): string[] {
    return [
      '9:00 AM - 12:00 PM',
      '12:00 PM - 3:00 PM',
      '3:00 PM - 6:00 PM',
      '6:00 PM - 9:00 PM'
    ];
  }
}

// Create and export a singleton instance
export const delhiveryService = new DelhiveryService();
export default delhiveryService;
