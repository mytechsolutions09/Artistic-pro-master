import axios from 'axios';
import { supabase } from './supabaseService';
import { diagnose401Error, analyzeWarehouseName, generateTroubleshootingGuide } from '../utils/delhiveryDiagnostics';

// Use Supabase Edge Function for Delhivery API calls (avoids CORS)
const USE_SUPABASE_PROXY = import.meta.env.VITE_USE_SUPABASE_DELHIVERY_PROXY !== 'false'; // Default to true

// Delhivery API Configuration
const DELHIVERY_CONFIG = {
  baseURL: import.meta.env.VITE_DELHIVERY_BASE_URL || 'https://staging-express.delhivery.com',
  expressBaseURL: import.meta.env.VITE_DELHIVERY_EXPRESS_URL || 'https://express-dev-test.delhivery.com',
  trackBaseURL: import.meta.env.VITE_DELHIVERY_TRACK_URL || 'https://track.delhivery.com',
  token: import.meta.env.VITE_DELHIVERY_API_TOKEN || 'xxxxxxxxxxxxxxxx',
  clientName: import.meta.env.VITE_DELHIVERY_CLIENT_NAME || '', // Required for B2B pickup requests
  timeout: parseInt(import.meta.env.VITE_DELHIVERY_TIMEOUT || '10000'),
  retryAttempts: parseInt(import.meta.env.VITE_DELHIVERY_RETRY_ATTEMPTS || '3'),
};

// Check if API is properly configured
const isApiConfigured = () => {
  // When using Supabase proxy, we don't need the frontend token
  if (USE_SUPABASE_PROXY) {
    return true; // Assume Edge Function has the token
  }
  const token = import.meta.env.VITE_DELHIVERY_API_TOKEN;
  return token && token !== 'your-delhivery-api-token' && token !== 'xxxxxxxxxxxxxxxx';
};

// Helper to call Supabase Edge Function for Delhivery API
async function callDelhiveryViaSupabase(action: string, data: any, endpoint: 'staging' | 'express' | 'track' = 'staging', method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'POST') {
  try {
    console.log(`📡 Calling Delhivery via Supabase Edge Function: ${action}`);
    console.log('📝 Request payload:', { action, data, endpoint, method });
    
    const { data: result, error } = await supabase.functions.invoke('delhivery-api', {
      body: {
        action,
        data,
        endpoint,
        method
      }
    });

    if (error) {
      console.error('❌ Supabase Edge Function error:', error);
      
      // Provide more helpful error message
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        console.error('💡 This might be because:');
        console.error('   1. DELHIVERY_API_TOKEN secret is not set in Supabase');
        console.error('   2. Delhivery token is invalid or expired');
        console.error('   → Go to Supabase Dashboard → Project Settings → Edge Functions → Secrets');
      }
      
      throw new Error(`Edge Function error: ${error.message}`);
    }

    if (!result) {
      console.error('❌ No result from Edge Function');
      throw new Error('Edge Function returned no data');
    }

    console.log('📊 Edge Function response:', result);

    if (!result.success) {
      console.error('❌ Delhivery API error via Edge Function:', result);
      throw new Error(result.data?.message || result.data?.error || `Delhivery API error: ${result.statusText}`);
    }

    console.log('✅ Delhivery API call successful via Edge Function');
    return result.data;
  } catch (error: any) {
    console.error('❌ Error calling Delhivery via Supabase:', error);
    throw error;
  }
}

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
  token?: string; // Optional when using Edge Function (handled via Authorization header)
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

export interface ManifestRequest {
  lrn?: string;
  pickup_location_name: string;  // Registered warehouse name
  payment_mode: 'cod' | 'prepaid';
  cod_amount?: string;
  weight: string;
  dropoff_location: {
    consignee_name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    email?: string;
  };
  rov_insurance?: boolean;
  invoices?: Array<{
    ewaybill?: string;
    inv_num: string;
    inv_amt: number | string;
    inv_qr_code?: string;
  }>;
  shipment_details: Array<{
    order_id: string;
    box_count: number;
    description: string;
    weight: number;
    waybills?: string[];
    master?: boolean;
  }>;
  doc_data?: Array<{
    doc_type: string;
    doc_meta?: any;
  }>;
  doc_file?: File | Blob;
  fm_pickup?: boolean;
  freight_mode?: string;
  billing_address?: {
    name: string;
    company: string;
    consignor: string;
    address: string;
    city: string;
    state: string;
    pin: string;
    phone: string;
    pan_number?: string;
    gst_number?: string;
  };
}

export interface UpdateLRNRequest {
  invoices?: Array<{
    inv_number: string;
    inv_amount: number | string;
    qr_code?: string;
    ewaybill?: string;
  }>;
  cod_amount?: string;
  consignee_name?: string;
  consignee_address?: string;
  consignee_pincode?: string;
  consignee_phone?: string;
  weight_g?: string;
  cb?: {
    uri: string;
    method: string;
    authorization: string;
  };
  dimensions?: Array<{
    width_cm: number;
    height_cm: number;
    length_cm: number;
    box_count: number;
  }>;
  invoice_files_meta?: Array<{
    invoices: string[];
  }>;
  invoice_file?: File | Blob;
}

export interface AppointmentRequest {
  lrn: string;
  date: string;  // Format: DD/MM/YYYY
  start_time: string;  // Format: HH:MM
  end_time: string;  // Format: HH:MM
  po_number?: string[];
  appointment_id?: string;
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
  pickup_location: string;  // UI field name
  expected_package_count: number;  // UI field name
}

// Delhivery API expects different parameter names
interface DelhiveryPickupRequest {
  pickup_time: string;
  pickup_date: string;
  warehouse_name: string;
  quantity: number;
  client_name?: string; // Required for B2B pickup requests
  pickup_location?: {  // Alternative format for B2B (object instead of string)
    name: string;
  };
}

// Warehouse Management Types
export interface CreateWarehouseRequest {
  phone: string;
  city: string;
  name: string;
  pin: string;
  address: string;
  state?: string; // Optional, will default to 'Maharashtra' if not provided
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
  private async makeApiCall(action: string, method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET', data?: any, endpoint: 'main' | 'express' | 'track' | 'ltl' | 'ltl-prod' = 'main') {
    try {
      console.log('🔄 Making API call:', { action, method, endpoint });
      
      const { data: response, error } = await supabase.functions.invoke('delhivery-api', {
        body: {
          action,
          method,
          data,
          endpoint
        }
      });

      console.log('📥 Edge Function response:', { response, error });

      if (error) {
        console.error('❌ Edge Function error:', error);
        // Check if error has status code
        if (error.status || error.statusCode) {
          const status = error.status || error.statusCode;
          const message = error.message || 'Unknown error';
          throw new Error(`Edge Function error (${status}): ${message}`);
        }
        throw new Error(`Edge Function error: ${error.message}`);
      }

      if (!response) {
        console.error('❌ No response from Edge Function');
        throw new Error('No response from Edge Function');
      }

      // Check if response indicates failure (Edge Function now always returns 200, but sets success=false on errors)
      if (!response.success) {
        console.error('❌ API call unsuccessful:', response);
        console.error('📄 Full response data:', JSON.stringify(response.data, null, 2));
        console.error('📊 Response status:', response.status, response.statusText);
        
        // Extract error message from various possible locations
        let errorMsg = 'Unknown error';
        if (response.error) {
          errorMsg = typeof response.error === 'string' ? response.error : JSON.stringify(response.error);
        } else if (response.data?.error) {
          errorMsg = typeof response.data.error === 'string' ? response.data.error : JSON.stringify(response.data.error);
        } else if (response.data?.message) {
          errorMsg = response.data.message;
        } else if (response.statusText) {
          errorMsg = response.statusText;
        } else if (response.data && typeof response.data === 'string') {
          errorMsg = response.data;
        } else if (response.data && typeof response.data === 'object') {
          // Try to extract meaningful error message from object
          if (response.data.raw) {
            errorMsg = response.data.raw;
          } else {
            errorMsg = JSON.stringify(response.data);
          }
        }
        
        const status = response.status || 'unknown';
        // Include full response in error for debugging
        const error = new Error(`Delhivery API error (${status}): ${errorMsg}`);
        (error as any).response = response;
        (error as any).status = status;
        throw error;
      }

      return response.data;
    } catch (error: any) {
      console.error('❌ API call failed:', error);
      // Re-throw with more context if it's a status code error
      if (error.message?.includes('non-2xx')) {
        throw new Error(`Delhivery API returned an error. Check Edge Function logs for details. Original error: ${error.message}`);
      }
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
      // Use Edge Function to avoid CORS issues
      const response = await this.makeApiCall(`/c/api/pin-codes/json/?filter_codes=${pinCode}`, 'GET', undefined, 'main');
      return response;
    } catch (error: any) {
      console.error('Error checking pincode serviceability:', error);
      
      // If it's a network error or API is not accessible, return mock data
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || error.message?.includes('Edge Function error')) {
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
      // Use Edge Function to avoid CORS issues
      const response = await this.makeApiCall('/c/api/shipments/rates/json/', 'POST', rateData, 'main');
      return response;
    } catch (error: any) {
      console.error('Error getting shipping rates:', error);
      
      // If it's a network error or API is not accessible, return mock data
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || error.message?.includes('Edge Function error')) {
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
      // Use Edge Function to avoid CORS issues
      const response = await this.makeApiCall('/api/cmu/create.json', 'POST', {
        format: 'json',
        data: JSON.stringify(shipmentData)
      }, 'main');
      
      // Delhivery CMU API returns response in different formats
      // Handle both direct response and wrapped response
      if (response && typeof response === 'object') {
        // If response has shipments array, return as-is
        if (response.shipments && Array.isArray(response.shipments)) {
          return {
            success: true,
            data: response
          };
        }
        // If response is already in expected format
        if (response.data) {
          return response;
        }
        // If response has waybill directly
        if (response.waybill) {
          return {
            success: true,
            data: {
              shipments: [{
                ...shipmentData.shipments[0],
                waybill: response.waybill,
                status: 'Created'
              }]
            }
          };
        }
      }
      
      return {
        success: true,
        data: response
      };
    } catch (error: any) {
      console.error('Error creating shipment:', error);
      
      // Only return mock data for actual network/CORS errors, not API errors
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || error.message?.includes('CORS')) {
        console.warn('Network/CORS error, returning mock shipment data');
        return this.getMockShipmentResponse(shipmentData);
      }
      
      // For Edge Function errors or API errors, throw to let caller handle
      // This allows the admin page to show proper error messages
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
      // Use Edge Function to avoid CORS issues
      const response = await this.makeApiCall(`/c/api/shipments/track/json/?waybill=${waybill}`, 'GET', undefined, 'main');
      return response;
    } catch (error: any) {
      console.error('Error tracking shipment:', error);
      
      // If it's a network error or API is not accessible, return mock data
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || error.message?.includes('Edge Function error')) {
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
      // Use Edge Function to avoid CORS issues
      const response = await this.makeApiCall('/c/api/shipments/cancel/json/', 'POST', {
        waybill,
        reason
      }, 'main');
      return response;
    } catch (error: any) {
      console.error('Error canceling shipment:', error);
      
      // If network error, return mock response
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || error.message?.includes('Edge Function error')) {
        console.warn('Network error, returning mock cancellation response');
        return {
          success: true,
          message: 'Shipment cancelled successfully (mock)',
          waybill: waybill
        };
      }
      
      throw new Error(`Failed to cancel shipment: ${error.message}`);
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
      // Use Edge Function to avoid CORS issues
      const response = await this.makeApiCall('/c/api/pin-codes/bulk/json/', 'POST', {
        pincodes: pincodes.join(',')
      }, 'main');
      return response;
    } catch (error: any) {
      console.error('Error getting bulk serviceability:', error);
      
      // Return mock data on network errors
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || error.message?.includes('Edge Function error')) {
        console.warn('Network error, returning mock bulk serviceability');
        return {
          delivery_codes: pincodes.map(pin => this.getMockPinCodeData(pin).delivery_codes[0])
        };
      }
      
      throw new Error(`Failed to get bulk serviceability: ${error.message}`);
    }
  }

  // ============ NEW API ENDPOINTS ============

  /**
   * Get Expected TAT (Turn Around Time)
   */
  async getExpectedTAT(request: ExpectedTATRequest): Promise<ExpectedTATResponse> {
    try {
      // Build query string from params
      const params = new URLSearchParams(request as any).toString();
      // Use Edge Function to avoid CORS issues
      const response = await this.makeApiCall(`/api/dc/expected_tat?${params}`, 'GET', undefined, 'express');
      return response;
    } catch (error: any) {
      console.error('Error getting expected TAT:', error);
      
      // Return mock data on network errors
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || error.message?.includes('Edge Function error')) {
        console.warn('Network error, returning mock TAT data');
        return {
          expected_tat: '3-5 days',
          origin_pin: request.origin_pin,
          destination_pin: request.destination_pin,
          mode_of_transport: request.mot,
          product_type: request.pdt
        };
      }
      
      throw new Error(`Failed to get expected TAT: ${error.message}`);
    }
  }

  /**
   * Get waybill numbers in bulk
   * According to Delhivery API docs: https://one.delhivery.com/developer-portal/document/b2c/detail/fetch-waybill
   * Endpoint: https://track.delhivery.com/waybill/api/fetch/json/?cl=client_name
   * OR: https://track.delhivery.com/waybill/api/bulk/json/?count=N (for bulk generation)
   * Authentication via Authorization header (Token format), NOT query string
   */
  async getWaybills(request: WaybillRequest): Promise<WaybillResponse> {
    try {
      // Try bulk endpoint first (for generating waybills)
      // If that doesn't work, we'll try fetch endpoint
      // Token is handled via Authorization header by Edge Function (NOT in query string)
      const params = new URLSearchParams({
        count: request.count
      }).toString();
      // Use track endpoint (track.delhivery.com) - waybill API is on track domain
      const response = await this.makeApiCall(`/waybill/api/bulk/json/?${params}`, 'GET', undefined, 'track');
      
      console.log('🔍 Raw waybill API response type:', typeof response, 'value:', response);
      
      // Delhivery API can return waybills in different formats:
      // 1. Array format: { waybills: ["DL123", "DL456"] }
      // 2. String format: "44334310000011" (single waybill as string)
      // 3. Array of strings: ["44334310000011", "44334310000012"]
      
      // FIRST: Check if response is a string (single waybill) - most common format
      if (typeof response === 'string' && response.trim().length > 0) {
        console.log('✅ Received single waybill as string:', response);
        return {
          waybills: [response.trim()],
          count: 1
        };
      }
      
      // SECOND: Check if response is an array of waybills
      if (Array.isArray(response)) {
        console.log('✅ Received waybills as array:', response);
        return {
          waybills: response,
          count: response.length
        };
      }
      
      // THIRD: Check if response has waybills array
      if (response && typeof response === 'object' && response.waybills && Array.isArray(response.waybills)) {
        return response;
      }
      
      // FOURTH: Check if response has waybill property that's a string
      if (response && typeof response === 'object' && typeof response.waybill === 'string') {
        console.log('✅ Received waybill property:', response.waybill);
        return {
          waybills: [response.waybill],
          count: 1
        };
      }
      
      // If response doesn't have waybills, check for error
      if (response && response.error) {
        const errorMsg = typeof response.error === 'string' ? response.error : JSON.stringify(response.error);
        console.error('❌ Delhivery waybill API error:', errorMsg);
        throw new Error(`Delhivery API error: ${errorMsg}`);
      }
      
      // Log full response for debugging if no waybills found
      console.warn('⚠️ Unexpected waybill API response format:', JSON.stringify(response, null, 2));
      
      return response;
    } catch (error: any) {
      console.error('❌ Error getting waybills from Delhivery:', error);
      
      // Check if it's an Edge Function deployment issue
      if (error.message?.includes('Edge Function error') || 
          error.message?.includes('No response from Edge Function') ||
          error.message?.includes('function not found')) {
        console.error('💡 Edge Function may not be deployed or DELHIVERY_API_TOKEN not set');
        console.error('   Run: supabase functions deploy delhivery-api');
        console.error('   Set secret: supabase secrets set DELHIVERY_API_TOKEN=your-token');
        throw new Error(`Edge Function error: ${error.message}. Please deploy the Edge Function and set DELHIVERY_API_TOKEN secret.`);
      }
      
      // Only return mock data for actual network errors (not API/Edge Function errors)
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        console.warn('⚠️ Network error, returning mock waybills');
        const mockWaybills: string[] = [];
        for (let i = 0; i < parseInt(request.count); i++) {
          mockWaybills.push(`MOCK${Date.now()}${i + 1}`);
        }
        return {
          waybills: mockWaybills,
          token: request.token,
          count: parseInt(request.count)
        };
      }
      
      throw new Error(`Failed to get waybills: ${error.message}`);
    }
  }

  /**
   * Edit shipment details
   */
  async editShipment(request: EditShipmentRequest): Promise<any> {
    try {
      // Use Edge Function to avoid CORS issues
      const response = await this.makeApiCall('/api/p/edit', 'POST', request, 'main');
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
      // Use Edge Function to avoid CORS issues
      const response = await this.makeApiCall('/api/p/edit', 'POST', {
        waybill,
        cancellation: true
      }, 'main');
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
      // Use Edge Function to avoid CORS issues
      const response = await this.makeApiCall(`/api/rest/ewaybill/${waybill}/`, 'PUT', {
        data: eWaybillData
      }, 'track');
      return response;
    } catch (error: any) {
      console.error('Error updating E-waybill:', error);
      
      // Return mock data on network errors
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || error.message?.includes('Edge Function error')) {
        console.warn('Network error, returning mock E-waybill update');
        return {
          success: true,
          message: 'E-waybill updated successfully (mock)',
          waybill: waybill
        };
      }
      
      throw new Error(`Failed to update E-waybill: ${error.message}`);
    }
  }

  /**
   * Get package information
   */
  async getPackageInfo(request: PackageInfoRequest): Promise<any> {
    try {
      // Build query string from params
      const params = new URLSearchParams(request as any).toString();
      // Use Edge Function to avoid CORS issues
      const response = await this.makeApiCall(`/api/v1/packages/json/?${params}`, 'GET', undefined, 'main');
      return response;
    } catch (error: any) {
      console.error('Error getting package info:', error);
      
      // Return mock data on network errors
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || error.message?.includes('Edge Function error')) {
        console.warn('Network error, returning mock package info');
        return {
          waybill: request.waybill,
          status: 'In Transit',
          current_location: 'Hub',
          estimated_delivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
        };
      }
      
      throw new Error(`Failed to get package info: ${error.message}`);
    }
  }

  /**
   * Get invoice charges
   */
  async getInvoiceCharges(request: InvoiceChargesRequest): Promise<any> {
    try {
      // Build query string from params
      const params = new URLSearchParams(request as any).toString();
      // Use Edge Function to avoid CORS issues
      const response = await this.makeApiCall(`/api/kinko/v1/invoice/charges/.json?${params}`, 'GET', undefined, 'main');
      return response;
    } catch (error: any) {
      console.error('Error getting invoice charges:', error);
      
      // Return mock data on network errors
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || error.message?.includes('Edge Function error')) {
        console.warn('Network error, returning mock invoice charges');
        return {
          total_charges: 100,
          base_freight: 80,
          cod_charges: 10,
          fuel_surcharge: 5,
          service_tax: 5
        };
      }
      
      throw new Error(`Failed to get invoice charges: ${error.message}`);
    }
  }

  /**
   * Get packing slip
   */
  async getPackingSlip(request: PackingSlipRequest): Promise<any> {
    try {
      // Build query string from params
      const params = new URLSearchParams(request as any).toString();
      // Use Edge Function to avoid CORS issues
      const response = await this.makeApiCall(`/api/p/packing_slip?${params}`, 'GET', undefined, 'main');
      return response;
    } catch (error: any) {
      console.error('Error getting packing slip:', error);
      
      // Return mock data on network errors
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || error.message?.includes('Edge Function error')) {
        console.warn('Network error, returning mock packing slip');
        return {
          waybills: request.wbns.split(','),
          pdf_url: 'https://example.com/packing-slip.pdf',
          status: 'generated'
        };
      }
      
      throw new Error(`Failed to get packing slip: ${error.message}`);
    }
  }

  /**
   * Request pickup (Express API)
   * Uses standard Delhivery Express API for parcel pickups
   */
  async requestPickup(request: PickupRequest): Promise<any> {
    console.log('🚀 Starting pickup request with:', request);
    
    // Validate warehouse name
    if (!request.pickup_location || request.pickup_location.trim() === '') {
      console.error('❌ Pickup location (warehouse name) is required');
      return {
        success: false,
        message: 'Pickup location (warehouse name) is required. Please select a warehouse.',
        error: 'VALIDATION_ERROR'
      };
    }

    // Check if API is configured
    if (!isApiConfigured()) {
      console.log('⚠️ Delhivery API not configured - using proxy mode');
      // When using Supabase proxy, we still proceed (Edge Function has the token)
    }

    // Prepare pickup request data (declare outside try block for error handling)
    let expressPickupRequest: any = null;
    
    try {
      // Ensure time is in HH:MM:SS format
      let pickupTime = request.pickup_time || '10:00:00';
      if (pickupTime.length === 5) {
        // If time is HH:MM, convert to HH:MM:SS
        pickupTime = `${pickupTime}:00`;
      }
      
      // Transform to Express API format (standard pickup API)
      // According to Delhivery documentation: 
      // - B2C: https://one.delhivery.com/developer-portal/document/b2c/detail/pickup-scheduling
      // - B2B: https://one.delhivery.com/developer-portal/document/b2b/detail/pickup-request
      expressPickupRequest = {
        pickup_time: pickupTime,
        pickup_date: request.pickup_date,
        warehouse_name: request.pickup_location, // Must match exactly with Delhivery warehouse name
        quantity: request.expected_package_count || 1
      };
      
      // Add client_name for B2B pickup requests (if configured)
      // According to B2B documentation, client_name is required
      if (DELHIVERY_CONFIG.clientName && DELHIVERY_CONFIG.clientName.trim() !== '') {
        expressPickupRequest.client_name = DELHIVERY_CONFIG.clientName.trim();
        console.log(`📋 B2B Pickup Request: client_name="${expressPickupRequest.client_name}"`);
      } else {
        console.log('⚠️ client_name not configured - using B2C format');
        console.log('💡 To use B2B format, set VITE_DELHIVERY_CLIENT_NAME in .env file');
      }

      console.log('📦 Requesting pickup from Delhivery Express API');
      console.log('🔗 Endpoint: https://staging-express.delhivery.com/fm/request/new/');
      console.log('📋 Payload:', JSON.stringify(expressPickupRequest, null, 2));
      console.log('⚠️ IMPORTANT: Warehouse name must match exactly (case-sensitive) with Delhivery dashboard');
      console.log(`🔤 Warehouse name being sent: "${expressPickupRequest.warehouse_name}"`);
      console.log(`📏 Warehouse name length: ${expressPickupRequest.warehouse_name.length} characters`);
      console.log(`🔍 Warehouse name characters: [${expressPickupRequest.warehouse_name.split('').map(c => c === ' ' ? 'SPACE' : c === '-' ? 'HYPHEN' : c).join(', ')}]`);
      
      // Use Edge Function with Express API endpoint (simpler, standard token)
      const responseData = await this.makeApiCall('/fm/request/new/', 'POST', expressPickupRequest, 'main');
      
      console.log('✅ Delhivery pickup request successful!');
      console.log('📄 Response data:', JSON.stringify(responseData, null, 2));
      
      return {
        success: true,
        message: 'Pickup requested successfully',
        pickup_id: responseData.pickup_id || responseData.id,
        ...responseData
      };
    } catch (error: any) {
      console.error('❌ Error requesting pickup from Delhivery');
      console.error('Error details:', error);
      
      // Parse error message for better user feedback
      let errorMessage = 'Failed to request pickup from Delhivery';
      let errorDetails = '';
      
      // Check if it's an Edge Function error response
      if (error.message) {
        const msg = error.message.toLowerCase();
        const errorStatus = (error as any).status || (error as any).response?.status;
        
        // Log the actual error response for debugging
        console.error('🔍 Error status:', errorStatus);
        console.error('🔍 Error response:', (error as any).response);
        
        if (msg.includes('warehouse') || msg.includes('client_warehouse')) {
          errorMessage = 'Warehouse not found in Delhivery';
          errorDetails = 'The warehouse name does not exist in Delhivery system. Please ensure the warehouse is registered with Delhivery first.';
        } else if (errorStatus === 401 || msg.includes('401') || msg.includes('unauthorized')) {
          errorMessage = 'Authentication failed';
          const actualError = (error as any).response?.data?.error || (error as any).response?.data?.message || error.message;
          const warehouseName = expressPickupRequest?.warehouse_name || request.pickup_location || 'Unknown';
          
          // Use diagnostic utility to analyze the error
          const diagnostic = diagnose401Error(warehouseName, actualError);
          const warehouseAnalysis = analyzeWarehouseName(warehouseName);
          
          // Build detailed error message with diagnostics
          let detailedError = `Delhivery API returned 401 Unauthorized.\n\n`;
          detailedError += `📦 Warehouse Name Analysis:\n`;
          detailedError += `   • Name being sent: "${warehouseName}"\n`;
          detailedError += `   • Length: ${warehouseName.length} characters\n`;
          
          if (warehouseAnalysis && warehouseAnalysis.potentialIssues.length > 0) {
            detailedError += `\n⚠️ Warehouse Name Issues Detected:\n`;
            warehouseAnalysis.potentialIssues.forEach(issue => {
              detailedError += `   • ${issue}\n`;
            });
          }
          
          if (warehouseAnalysis) {
            detailedError += `\n🔍 Character Breakdown:\n`;
            warehouseAnalysis.characterBreakdown.slice(0, 50).forEach((char, idx) => {
              const displayChar = char.char === ' ' ? '[SPACE]' : char.char === '-' ? '[HYPHEN]' : char.char;
              detailedError += `   ${idx + 1}. "${displayChar}" (${char.description})\n`;
            });
            if (warehouseAnalysis.characterBreakdown.length > 50) {
              detailedError += `   ... and ${warehouseAnalysis.characterBreakdown.length - 50} more characters\n`;
            }
          }
          
          detailedError += `\n💡 Most Likely Causes:\n`;
          detailedError += `   1. API token doesn't have pickup permissions (MOST COMMON)\n`;
          detailedError += `      → Contact Delhivery support to enable pickup permissions\n`;
          detailedError += `      → Mention: Token works for waybills but not pickups\n`;
          detailedError += `\n   2. Warehouse name doesn't match exactly in Delhivery\n`;
          detailedError += `      → Check Delhivery dashboard for exact warehouse name\n`;
          detailedError += `      → Compare character-by-character (case-sensitive)\n`;
          detailedError += `      → Pay attention to spaces, hyphens, and special characters\n`;
          detailedError += `\n   3. Warehouse not registered/active in Delhivery\n`;
          detailedError += `      → Verify warehouse exists in Delhivery dashboard\n`;
          detailedError += `      → Ensure warehouse is active (not disabled)\n`;
          
          detailedError += `\n📋 Next Steps:\n`;
          detailedError += `   1. Check Edge Function logs for detailed error:\n`;
          detailedError += `      → Supabase Dashboard → Functions → delhivery-api → Logs\n`;
          detailedError += `   2. Verify warehouse name in Delhivery dashboard\n`;
          detailedError += `   3. Contact Delhivery support with:\n`;
          detailedError += `      • Your API token (mention it works for waybills)\n`;
          detailedError += `      • Warehouse name: "${warehouseName}"\n`;
          detailedError += `      • Error: 401 Unauthorized on /fm/request/new/\n`;
          detailedError += `      • Request: Enable pickup scheduling permissions\n`;
          
          errorDetails = detailedError;
          
          // Log diagnostic information to console
          console.error('🔍 401 Error Diagnostics:');
          console.error(generateTroubleshootingGuide(warehouseName, { message: actualError }));
        } else if (errorStatus === 403 || msg.includes('403') || msg.includes('forbidden')) {
          errorMessage = 'Access denied';
          errorDetails = 'Your Delhivery API token does not have permission to create pickups. Please check your API token permissions with Delhivery.';
        } else if (errorStatus === 400 || msg.includes('400') || msg.includes('bad request')) {
          errorMessage = 'Invalid request data';
          const actualError = (error as any).response?.data?.error || (error as any).response?.data?.message || error.message;
          errorDetails = `The pickup request data is invalid: ${actualError}. Please check all required fields match Delhivery's requirements.`;
        } else if (msg.includes('edge function error')) {
          errorMessage = 'Edge Function error';
          errorDetails = 'The Supabase Edge Function encountered an error. Please check the deployment and logs.';
        } else if (msg.includes('network') || msg.includes('cors')) {
          errorMessage = 'Network/CORS error';
          errorDetails = 'Unable to reach Delhivery API through Edge Function. Please check network connectivity and Edge Function deployment.';
        }
      }
      
      console.error(`❌ ${errorMessage}: ${errorDetails}`);
      console.error('💡 Troubleshooting steps:');
      console.error('   1. Verify warehouse is registered in Delhivery (same exact name)');
      console.error('   2. Check DELHIVERY_API_TOKEN secret in Supabase');
      console.error('   3. Ensure Edge Function is deployed: supabase functions deploy delhivery-api');
      console.error('   4. Check Edge Function logs: supabase functions logs delhivery-api');
      
      // Include diagnostic information for 401 errors
      const warehouseName = expressPickupRequest?.warehouse_name || request.pickup_location || 'Unknown';
      const errorStatus = (error as any).status || (error as any).response?.status;
      const is401Error = errorStatus === 401 || error.message?.toLowerCase().includes('401') || error.message?.toLowerCase().includes('unauthorized');
      
      const troubleshooting = is401Error 
        ? [
            'Verify the warehouse name matches exactly what is registered in Delhivery (character-by-character, case-sensitive)',
            'Check that DELHIVERY_API_TOKEN is set in Supabase Edge Function secrets',
            'Verify API token has pickup permissions (contact Delhivery support if needed)',
            'Ensure the Edge Function is deployed',
            'Check Edge Function logs for detailed error information',
            'Contact Delhivery support to enable pickup permissions for your API token'
          ]
        : [
            'Verify the warehouse name matches exactly what is registered in Delhivery',
            'Check that DELHIVERY_API_TOKEN is set in Supabase Edge Function secrets',
            'Ensure the Edge Function is deployed',
            'Check Edge Function logs for detailed error information'
          ];
      
      const result: any = {
        success: false,
        message: errorMessage,
        error: errorDetails || error.message,
        troubleshooting
      };
      
      // Add diagnostic data for 401 errors
      if (is401Error) {
        const diagnostic = diagnose401Error(warehouseName, errorDetails || error.message);
        result.diagnostic = {
          warehouseNameAnalysis: diagnostic.warehouseNameAnalysis,
          issues: diagnostic.issues,
          recommendations: diagnostic.recommendations
        };
        result.status = 401;
      }
      
      return result;
    }
  }

  // ============ LRN (Load Receipt Number) OPERATIONS ============

  /**
   * Update LRN details with FormData support
   */
  async updateLRN(lrn: string, updateData: UpdateLRNRequest): Promise<any> {
    try {
      // Check if API is configured
      if (!isApiConfigured()) {
        console.warn('Delhivery API not configured, returning mock response');
        return {
          success: true,
          message: 'LRN updated successfully (Mock)',
          lrn: lrn
        };
      }

      // Create FormData for multipart request
      const formData = new FormData();
      
      // Add fields
      if (updateData.invoices) {
        formData.append('invoices', JSON.stringify(updateData.invoices));
      }
      if (updateData.cod_amount) {
        formData.append('cod_amount', updateData.cod_amount);
      }
      if (updateData.consignee_name) {
        formData.append('consignee_name', updateData.consignee_name);
      }
      if (updateData.consignee_address) {
        formData.append('consignee_address', updateData.consignee_address);
      }
      if (updateData.consignee_pincode) {
        formData.append('consignee_pincode', updateData.consignee_pincode);
      }
      if (updateData.consignee_phone) {
        formData.append('consignee_phone', updateData.consignee_phone);
      }
      if (updateData.weight_g) {
        formData.append('weight_g', updateData.weight_g);
      }
      if (updateData.cb) {
        formData.append('cb', JSON.stringify(updateData.cb));
      }
      if (updateData.dimensions) {
        formData.append('dimensions', JSON.stringify(updateData.dimensions));
      }
      if (updateData.invoice_files_meta) {
        formData.append('invoice_files_meta', JSON.stringify(updateData.invoice_files_meta));
      }
      if (updateData.invoice_file) {
        formData.append('invoice_file', updateData.invoice_file);
      }

      // Add metadata for Edge Function
      formData.append('action', `/lrn/update/${lrn}`);
      formData.append('endpoint', 'ltl');
      formData.append('method', 'PUT');

      console.log(`📦 Updating LRN ${lrn} via LTL API`);
      
      // Call Edge Function with FormData
      const { data: response, error } = await supabase.functions.invoke('delhivery-api', {
        body: formData
      });

      if (error) {
        throw new Error(`Edge Function error: ${error.message}`);
      }

      if (!response.success) {
        throw new Error(`API error: ${response.statusText || 'Unknown error'}`);
      }

      return {
        success: true,
        message: 'LRN updated successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error updating LRN:', error);
      throw new Error(`Failed to update LRN: ${error.message}`);
    }
  }

  /**
   * Cancel LRN
   */
  async cancelLRN(lrn: string): Promise<any> {
    try {
      // Check if API is configured
      if (!isApiConfigured()) {
        console.log('🔧 Skipping LRN cancellation (API not configured)');
        return {
          success: true,
          message: 'LRN cancelled (Mock)',
          lrn: lrn
        };
      }

      console.log(`📦 Cancelling LRN ${lrn} via LTL API`);
      
      // Use Edge Function with LTL API endpoint
      const response = await this.makeApiCall(`/lrn/cancel/${lrn}`, 'DELETE', undefined, 'ltl');
      
      return {
        success: true,
        message: 'LRN cancelled successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error cancelling LRN:', error);
      throw new Error(`Failed to cancel LRN: ${error.message}`);
    }
  }

  /**
   * Track LRN
   */
  async trackLRN(lrn: string): Promise<any> {
    try {
      // Check if API is configured
      if (!isApiConfigured()) {
        console.log('🔧 Returning mock tracking data (API not configured)');
        return {
          success: true,
          lrn: lrn,
          status: 'in_transit',
          message: 'Mock tracking data'
        };
      }

      console.log(`📦 Tracking LRN ${lrn} via LTL API`);
      
      // Use Edge Function with query parameter
      const response = await this.makeApiCall(`/lrn/track?lrnum=${lrn}`, 'GET', undefined, 'ltl');
      
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('Error tracking LRN:', error);
      throw new Error(`Failed to track LRN: ${error.message}`);
    }
  }

  /**
   * Create appointment for last-mile delivery
   */
  async createAppointment(appointmentData: AppointmentRequest): Promise<any> {
    try {
      // Check if API is configured
      if (!isApiConfigured()) {
        console.warn('Delhivery API not configured, returning mock response');
        return {
          success: true,
          message: 'Appointment created successfully (Mock)',
          appointment_id: appointmentData.appointment_id || `APT_${Date.now()}`
        };
      }

      console.log('📦 Creating appointment via LTL API');
      
      // Use Edge Function with LTL API endpoint
      const response = await this.makeApiCall('/appointments/lm', 'POST', appointmentData, 'ltl');
      
      return {
        success: true,
        message: 'Appointment created successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      throw new Error(`Failed to create appointment: ${error.message}`);
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
      // When using Edge Function, token is handled via Authorization header (no need to pass token)
      const response = await this.getWaybills({
        count: count.toString()
      });
      
      const waybills = response.waybills || [];
      
      // Validate waybills are not mock
      if (waybills.length > 0 && waybills[0].startsWith('MOCK')) {
        console.warn('⚠️ Received mock waybills from API - Edge Function may not be configured correctly');
        throw new Error('Received mock waybills. Please check Edge Function deployment and DELHIVERY_API_TOKEN secret.');
      }
      
      return waybills;
    } catch (error: any) {
      console.error('❌ Error generating waybills:', error);
      
      // Only return mock waybills for actual network errors, not Edge Function/API errors
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        console.warn('⚠️ Network error - generating mock waybills as fallback');
        const mockWaybills: string[] = [];
        const prefix = 'DL';
        for (let i = 0; i < count; i++) {
          const randomNum = Math.floor(Math.random() * 900000000) + 100000000;
          mockWaybills.push(`${prefix}${randomNum}`);
        }
        return mockWaybills;
      }
      
      // For Edge Function errors, throw to show proper error message
      throw error;
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

      // Try Express API first (works with simple API key token)
      // If that fails, we'll try LTL API
      let response: any;
      let expressApiError: any = null;
      
      try {
        // Express API format (old endpoint that works with Express API token)
        const expressRequestData = {
          name: warehouseData.name,
          pin: warehouseData.pin,
          city: warehouseData.city,
          state: warehouseData.state || 'Delhi',
          country: warehouseData.country || 'India',
          address: warehouseData.address,
          phone: warehouseData.phone,
          email: warehouseData.email,
          registered_name: warehouseData.registered_name || warehouseData.name
        };
        
        console.log('🔄 Trying Express API for warehouse creation...');
        response = await this.makeApiCall('/api/backend/clientwarehouse/create/', 'PUT', expressRequestData, 'main');
        
        // Check if response indicates success
        if (response && response.success !== false) {
          console.log('✅ Express API warehouse creation successful');
          return {
            success: true,
            message: 'Warehouse created successfully',
            data: response.data
          };
        }
      } catch (expressError: any) {
        expressApiError = expressError;
        console.warn('⚠️ Express API failed:', expressError.message);
        
        // If Express API returns 404 (endpoint doesn't exist), don't try LTL API
        const expressStatus = expressError.status || expressError.response?.status || expressError.data?.status;
        if (expressStatus === 404) {
          throw new Error('Warehouse creation endpoint not available. Express API endpoint not found. Please contact Delhivery support or use Delhivery dashboard to register warehouses.');
        }
        
        // If Express API fails with authentication error, don't try LTL API (same token issue)
        if (expressStatus === 401) {
          throw new Error('Authentication failed for Express API. Please check your DELHIVERY_API_TOKEN in Supabase Edge Function secrets.');
        }
      }
      
      // Fallback to LTL API format (only if Express API didn't fail with 404/401)
      try {
        console.log('🔄 Trying LTL API for warehouse creation...');
        const ltlRequestData = {
          name: warehouseData.name,
          pin_code: warehouseData.pin,
          city: warehouseData.city,
          state: warehouseData.state || 'Maharashtra',
          country: warehouseData.country || 'India',
          address_details: {
            address: warehouseData.address,
            contact_person: warehouseData.registered_name || 'Manager',
            phone_number: warehouseData.phone,
            email: warehouseData.email || 'info@example.com'
          },
          business_hours: {
            MON: { start_time: '09:00', close_time: '18:00' },
            TUE: { start_time: '09:00', close_time: '18:00' },
            WED: { start_time: '09:00', close_time: '18:00' },
            THU: { start_time: '09:00', close_time: '18:00' },
            FRI: { start_time: '09:00', close_time: '18:00' },
            SAT: { start_time: '09:00', close_time: '14:00' }
          },
          pick_up_hours: {
            MON: { start_time: '10:00', close_time: '17:00' },
            TUE: { start_time: '10:00', close_time: '17:00' },
            WED: { start_time: '10:00', close_time: '17:00' },
            THU: { start_time: '10:00', close_time: '17:00' },
            FRI: { start_time: '10:00', close_time: '17:00' },
            SAT: { start_time: '10:00', close_time: '13:00' }
          },
          pick_up_days: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
          business_days: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
          ret_address: {
            pin: warehouseData.return_pin || warehouseData.pin,
            address: warehouseData.return_address || warehouseData.address,
            city: warehouseData.return_city || warehouseData.city,
            state: warehouseData.return_state || warehouseData.state || 'Maharashtra',
            country: warehouseData.return_country || 'India'
          }
        };

        // Use Edge Function with new LTL API endpoint
        response = await this.makeApiCall('/client-warehouse/create/', 'POST', ltlRequestData, 'ltl');
      } catch (ltlError: any) {
        // Check if LTL API failed with token decode error
        const ltlErrorData = ltlError.data || ltlError.response?.data || {};
        const ltlErrorMessage = ltlErrorData.error?.message || ltlErrorData.message || ltlError.message || '';
        
        if (ltlErrorMessage.includes('Token Decode Error') || ltlErrorMessage.includes('Not enough segments')) {
          throw new Error('LTL API requires a JWT token, but your current token is a simple API key. Warehouse registration via API is not available with your current token type. Please register warehouses manually through the Delhivery dashboard, or contact Delhivery support to get an LTL API JWT token.');
        }
        
        // Re-throw the LTL error if it's not a token issue
        throw ltlError;
      }
      
      return {
        success: true,
        message: 'Warehouse created successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error creating warehouse:', error);
      
      // Extract error details from Edge Function response format
      const errorStatus = error.status || error.response?.status;
      const errorResponse = error.response || {};
      const errorData = errorResponse.data || error.data || {};
      
      // Provide more specific error messages
      if (errorStatus === 401) {
        throw new Error('Invalid API token. Please check your Delhivery API configuration.');
      } else if (errorStatus === 400) {
        // Check if it's a token decode error (LTL API requires JWT)
        const errorMessageText = errorData.error?.message || errorData.message || errorData.raw || error.message || '';
        
        if (errorMessageText.includes('Token Decode Error') || errorMessageText.includes('Not enough segments')) {
          throw new Error('LTL API requires a JWT token, but your current token is a simple API key. Warehouse registration via API is not available with your current token type. Please register warehouses manually through the Delhivery dashboard, or contact Delhivery support to get an LTL API JWT token.');
        }
        
        // Try to extract more details from the error response
        let errorMessage = 'Invalid warehouse data: Please check all required fields';
        
        // Check various possible locations for error message
        if (errorData.raw && typeof errorData.raw === 'string') {
          errorMessage = `Invalid warehouse data: ${errorData.raw}`;
        } else if (errorData.message && typeof errorData.message === 'string') {
          errorMessage = `Invalid warehouse data: ${errorData.message}`;
        } else if (errorData.error) {
          if (typeof errorData.error === 'string') {
            errorMessage = `Invalid warehouse data: ${errorData.error}`;
          } else if (typeof errorData.error === 'object') {
            // Try to extract message from error object
            errorMessage = `Invalid warehouse data: ${errorData.error.message || JSON.stringify(errorData.error)}`;
          }
        } else if (errorData.detail && typeof errorData.detail === 'string') {
          errorMessage = `Invalid warehouse data: ${errorData.detail}`;
        } else if (typeof errorData === 'string') {
          errorMessage = `Invalid warehouse data: ${errorData}`;
        } else if (error.message && error.message.includes('Delhivery API error')) {
          // Use the error message from makeApiCall
          errorMessage = error.message.replace('Delhivery API error (400): ', 'Invalid warehouse data: ');
        }
        
        // Log the full error for debugging
        console.error('Delhivery API 400 error details:', {
          status: errorStatus,
          errorResponse: errorResponse,
          errorData: errorData,
          requestData: warehouseData
        });
        
        throw new Error(errorMessage);
      } else if (errorStatus === 403) {
        throw new Error('Access denied. Please check your API permissions.');
      } else if (error.code === 'ERR_NETWORK') {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        // Use the error message from makeApiCall if available
        const finalMessage = error.message || 'Unknown error';
        throw new Error(`Failed to create warehouse: ${finalMessage}`);
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

      // Transform to new LTL API format
      const ltlUpdateData = {
        cl_warehouse_name: warehouseData.name,
        update_dict: {
          city: warehouseData.city,
          state: warehouseData.state || 'Maharashtra',
          country: warehouseData.country || 'India',
          address_details: {
            address: warehouseData.address,
            contact_person: warehouseData.registered_name || 'Manager',
            phone_number: warehouseData.phone,
            email: warehouseData.email || 'info@example.com'
          },
          ret_address: {
            address: warehouseData.return_address || warehouseData.address,
            city: warehouseData.return_city || warehouseData.city,
            state: warehouseData.return_state || warehouseData.state || 'Maharashtra',
            pin: warehouseData.return_pin || warehouseData.pin,
            country: warehouseData.return_country || 'India'
          }
        }
      };

      // Use Edge Function with new LTL API endpoint (PATCH method)
      const response = await this.makeApiCall('/client-warehouses/update', 'PATCH', ltlUpdateData, 'ltl');
      
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
      // Use Edge Function to avoid CORS issues
      const response = await this.makeApiCall('/api/cmu/create.json', 'POST', {
        format: 'json',
        data: JSON.stringify(shipmentData)
      }, 'main');
      return response;
    } catch (error: any) {
      console.error('Error creating advanced shipment:', error);
      
      // Return mock data on network errors
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || error.message?.includes('Edge Function error')) {
        console.warn('Network error, returning mock advanced shipment data');
        const waybills = shipmentData.shipments.map((_, index) => `ADV${Date.now()}${index + 1}`);
        return {
          success: true,
          data: {
            shipments: shipmentData.shipments.map((shipment, index) => ({
              ...shipment,
              waybill: waybills[index],
              status: 'Created'
            }))
          }
        };
      }
      
      throw new Error(`Failed to create advanced shipment: ${error.message}`);
    }
  }

  // ============ UTILITY METHODS FOR WAREHOUSE ============

  /**
   * Create warehouse with validation
   */
  async createWarehouseWithValidation(warehouseData: CreateWarehouseRequest): Promise<any> {
    try {
      // Validate required fields with field-level errors
      const fieldErrors: Record<string, string> = {};
      
      if (!warehouseData.name || warehouseData.name.trim().length === 0) {
        fieldErrors.name = 'Warehouse name is required';
      }
      
      if (!warehouseData.phone || warehouseData.phone.trim().length === 0) {
        fieldErrors.phone = 'Phone number is required';
      } else {
        const cleanedPhone = warehouseData.phone.replace(/\D/g, '');
        if (!/^[6-9]\d{9}$/.test(cleanedPhone)) {
          fieldErrors.phone = 'Please enter a valid 10-digit Indian phone number';
        }
      }
      
      if (!warehouseData.address || warehouseData.address.trim().length === 0) {
        fieldErrors.address = 'Address is required';
      }
      
      if (!warehouseData.city || warehouseData.city.trim().length === 0) {
        fieldErrors.city = 'City is required';
      }
      
      if (!warehouseData.pin || !/^\d{6}$/.test(warehouseData.pin.trim())) {
        fieldErrors.pin = 'Valid 6-digit pin code is required';
      }
      
      if (!warehouseData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(warehouseData.email.trim())) {
        fieldErrors.email = 'Valid email address is required';
      }

      if (Object.keys(fieldErrors).length > 0) {
        const error = new Error('Validation failed') as any;
        error.fieldErrors = fieldErrors;
        error.errors = Object.values(fieldErrors);
        throw error;
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
      // Validate required fields with field-level errors
      const fieldErrors: Record<string, string> = {};
      
      if (!warehouseData.name || warehouseData.name.trim().length === 0) {
        fieldErrors.name = 'Warehouse name is required';
      }
      
      if (!warehouseData.phone || warehouseData.phone.trim().length === 0) {
        fieldErrors.phone = 'Phone number is required';
      } else {
        const cleanedPhone = warehouseData.phone.replace(/\D/g, '');
        if (!/^[6-9]\d{9}$/.test(cleanedPhone)) {
          fieldErrors.phone = 'Please enter a valid 10-digit Indian phone number';
        }
      }
      
      if (!warehouseData.address || warehouseData.address.trim().length === 0) {
        fieldErrors.address = 'Address is required';
      }

      if (Object.keys(fieldErrors).length > 0) {
        const error = new Error('Validation failed') as any;
        error.fieldErrors = fieldErrors;
        error.errors = Object.values(fieldErrors);
        throw error;
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
