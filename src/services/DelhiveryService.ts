import axios from 'axios';

// Delhivery API Configuration
const DELHIVERY_CONFIG = {
  baseURL: 'https://staging-express.delhivery.com',
  expressBaseURL: 'https://express-dev-test.delhivery.com',
  trackBaseURL: 'https://track.delhivery.com',
  // TODO: Replace with your actual Delhivery API token
  token: 'xxxxxxxxxxxxxxxx',
  timeout: 10000,
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
   * Check if a pincode is serviceable
   */
  async checkPinCodeServiceability(pinCode: string): Promise<DelhiveryPinCodeData> {
    try {
      const response = await this.axiosInstance.get('/c/api/pin-codes/json/', {
        params: { filter_codes: pinCode }
      });
      return response.data;
    } catch (error) {
      console.error('Error checking pincode serviceability:', error);
      throw new Error('Failed to check pincode serviceability');
    }
  }

  /**
   * Get shipping rates for a shipment
   */
  async getShippingRates(rateData: ShippingRate): Promise<ShippingRateResponse> {
    try {
      const response = await this.axiosInstance.post('/c/api/shipments/rates/json/', rateData);
      return response.data;
    } catch (error) {
      console.error('Error getting shipping rates:', error);
      throw new Error('Failed to get shipping rates');
    }
  }

  /**
   * Create a new shipment using the new CMU API
   */
  async createShipment(shipmentData: CreateShipmentRequest): Promise<any> {
    try {
      const response = await this.axiosInstance.post('/api/cmu/create.json', {
        format: 'json',
        data: JSON.stringify(shipmentData)
      });
      return response.data;
    } catch (error) {
      console.error('Error creating shipment:', error);
      throw new Error('Failed to create shipment');
    }
  }

  /**
   * Track a shipment
   */
  async trackShipment(waybill: string): Promise<any> {
    try {
      const response = await this.axiosInstance.get(`/c/api/shipments/track/json/?waybill=${waybill}`);
      return response.data;
    } catch (error) {
      console.error('Error tracking shipment:', error);
      throw new Error('Failed to track shipment');
    }
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
    try {
      const response = await this.axiosInstance.post('/api/p/edit', {
        waybill,
        cancellation: true
      });
      return response.data;
    } catch (error) {
      console.error('Error canceling shipment via edit:', error);
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
    try {
      const response = await this.getWaybills({
        token: DELHIVERY_CONFIG.token,
        count: count.toString()
      });
      return response.waybills || [];
    } catch (error) {
      console.error('Error generating waybills:', error);
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
      const response = await this.axiosInstance.put('/api/backend/clientwarehouse/create/', warehouseData);
      return response.data;
    } catch (error) {
      console.error('Error creating warehouse:', error);
      throw new Error('Failed to create warehouse');
    }
  }

  /**
   * Edit warehouse details
   */
  async editWarehouse(warehouseData: EditWarehouseRequest): Promise<any> {
    try {
      const response = await this.axiosInstance.post('/api/backend/clientwarehouse/edit/', warehouseData);
      return response.data;
    } catch (error) {
      console.error('Error editing warehouse:', error);
      throw new Error('Failed to edit warehouse');
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
      if (!warehouseData.name || !warehouseData.phone || !warehouseData.address) {
        throw new Error('Name, phone, and address are required');
      }

      if (!warehouseData.pin || !/^\d{6}$/.test(warehouseData.pin)) {
        throw new Error('Valid 6-digit pin code is required');
      }

      if (!warehouseData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(warehouseData.email)) {
        throw new Error('Valid email address is required');
      }

      return await this.createWarehouse(warehouseData);
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
      if (!warehouseData.name || !warehouseData.phone || !warehouseData.address) {
        throw new Error('Name, phone, and address are required');
      }

      return await this.editWarehouse(warehouseData);
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
}

// Create and export a singleton instance
export const delhiveryService = new DelhiveryService();
export default delhiveryService;
