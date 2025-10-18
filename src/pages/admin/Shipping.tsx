import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import ShippingSecondaryNav from '../../components/admin/ShippingSecondaryNav';
import { NotificationManager } from '../../components/Notification';
import { 
  Truck, 
  MapPin, 
  Clock, 
  Package, 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Download,
  Upload,
  X
} from 'lucide-react';
import { 
  delhiveryService, 
  DelhiveryPinCodeData,
  CreateShipmentRequest,
  EditShipmentRequest,
  ExpectedTATRequest,
  PickupRequest,
  CreateWarehouseRequest,
  EditWarehouseRequest,
  AdvancedCreateShipmentRequest,
  CustomQCItem
} from '../../services/DelhiveryService';
import { orderService } from '../../services/orderService';
import { shippingService } from '../../services/shippingService';

interface Shipment {
  id: string;
  waybill: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  delivery_pincode: string;
  status: 'pending' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  created_at: string;
  estimated_delivery: string;
  cod_amount: number;
  weight: number;
  tracking_url: string;
  // Pickup information
  pickup_id?: string;
  pickup_date?: string;
  pickup_time?: string;
  pickup_status?: 'scheduled' | 'picked_up' | 'failed' | 'cancelled';
  pickup_location?: string;
  pickup_attempts?: number;
  last_pickup_attempt?: string;
}

const Shipping: React.FC = () => {
  const [activeTab, setActiveTab] = useState('shipments');
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  
  // Warehouses list
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);
  const [showWarehouseEdit, setShowWarehouseEdit] = useState(false);

  // Pin code serviceability check
  const [pinCodeCheck, setPinCodeCheck] = useState({
    pinCode: '',
    result: null as DelhiveryPinCodeData | null,
    loading: false
  });

  // Search history
  const [searchHistory, setSearchHistory] = useState<Array<{
    pinCode: string;
    result: DelhiveryPinCodeData;
    timestamp: string;
    city: string;
    state: string;
    serviceable: boolean;
  }>>([]);

  // Shipping rate calculation
  const [rateCalculation, setRateCalculation] = useState({
    pickupPincode: '',
    deliveryPincode: '',
    weight: '',
    codAmount: '',
    result: null as any,
    loading: false
  });

  // New shipment form
  const [newShipment, setNewShipment] = useState<any>({
    customer_name: '',
    customer_phone: '',
    delivery_address: '',
    delivery_pincode: '',
    delivery_city: '',
    delivery_state: '',
    cod_amount: '',
    weight: '',
    length: '',
    width: '',
    height: '',
    products_desc: '',
    order_id: undefined, // Optional order ID for linking
    payment_method: '' // Payment method from order
  });

  // Import orders functionality
  const [availableOrders, setAvailableOrders] = useState<Array<{
    id: string;
    customer_name: string;
    customer_phone: string;
    delivery_address: string;
    delivery_pincode: string;
    delivery_city: string;
    delivery_state: string;
    cod_amount: number;
    weight: number;
    payment_method: string;
    products: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    created_at: string;
  }>>([]);
  const [showOrderImport, setShowOrderImport] = useState(false);

  // Waybill generation
  const [waybillGeneration, setWaybillGeneration] = useState({
    count: '5',
    waybills: [] as string[],
    loading: false
  });

  // Expected TAT
  const [expectedTAT, setExpectedTAT] = useState({
    origin_pin: '',
    destination_pin: '',
    mot: 'S',
    pdt: 'B2C',
    expected_pickup_date: new Date().toISOString().split('T')[0],
    result: null as any,
    loading: false
  });

  // Pickup request
  const [pickupRequest, setPickupRequest] = useState({
    pickup_time: '11:00:00',
    pickup_date: new Date().toISOString().split('T')[0],
    pickup_location: 'warehouse_name',
    expected_package_count: 1,
    result: null as any,
    loading: false
  });
  
  // Selected shipments for pickup
  const [selectedShipmentsForPickup, setSelectedShipmentsForPickup] = useState<string[]>([]);

  // Warehouse management
  const [warehouseCreate, setWarehouseCreate] = useState({
    phone: '',
    city: '',
    name: '',
    pin: '',
    address: '',
    country: 'India',
    email: '',
    registered_name: '',
    return_address: '',
    return_pin: '',
    return_city: '',
    return_state: '',
    return_country: 'India',
    result: null as any,
    loading: false
  });

  const [warehouseEdit, setWarehouseEdit] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    pin: '',
    email: '',
    registered_name: '',
    return_address: '',
    return_city: '',
    return_pin: '',
    is_active: true,
    result: null as any,
    loading: false
  });

  // Advanced shipment creation
  const [advancedShipment, setAdvancedShipment] = useState({
    client: '',
    return_name: 'Lurevi Store',
    order: '',
    return_country: 'India',
    weight: '',
    city: '',
    pin: '',
    return_state: 'Maharashtra',
    products_desc: '',
    shipping_mode: 'Express',
    state: '',
    quantity: 1,
    waybill: '',
    phone: '',
    add: '',
    payment_mode: 'Prepaid',
    order_date: new Date().toLocaleDateString('en-IN').split('/').reverse().join('-'),
    seller_gst_tin: '',
    name: '',
    return_add: '123 Art Street, Mumbai',
    total_amount: '',
    seller_name: 'Lurevi Store',
    return_city: 'Mumbai',
    country: 'India',
    return_pin: '400001',
    return_phone: '+91 555 123 4567',
    qc_type: 'param',
    custom_qc: [] as CustomQCItem[],
    pickup_location_name: 'warehouse_name',
    result: null as any,
    loading: false
  });

  useEffect(() => {
    loadShipments();
    loadWarehouses();
    
    // Check if Delhivery API is configured
    const checkApiConfiguration = () => {
      const token = import.meta.env.VITE_DELHIVERY_API_TOKEN;
      if (!token || token === 'your-delhivery-api-token' || token === 'xxxxxxxxxxxxxxxx') {
        NotificationManager.warning(
          'Delhivery API not configured. Using mock data for testing. Please configure your API token in .env file.',
          0 // Don't auto-close
        );
      }
      // Only show warning if API is not configured - success is not necessary
    };
    
    checkApiConfiguration();
  }, []);

  const loadWarehouses = async () => {
    try {
      const dbWarehouses = await shippingService.getAllWarehouses();
      setWarehouses(dbWarehouses);
      console.log(`✅ Loaded ${dbWarehouses.length} warehouses from database`);
      
      // Auto-select warehouse if only one active warehouse exists
      const activeWarehouses = dbWarehouses.filter(w => w.is_active);
      if (activeWarehouses.length === 1 && !pickupRequest.pickup_location) {
        setPickupRequest(prev => ({ 
          ...prev, 
          pickup_location: activeWarehouses[0].name 
        }));
        console.log(`✅ Auto-selected warehouse: ${activeWarehouses[0].name}`);
      }
    } catch (error) {
      console.error('Error loading warehouses:', error);
      NotificationManager.error('Failed to load warehouses from database');
    }
  };

  const loadShipments = async () => {
    setLoading(true);
    try {
      // Load shipments from database
      const dbShipments = await shippingService.getAllShipments();
      
      // Transform to match UI format
      const formattedShipments: Shipment[] = dbShipments.map((ship: any) => ({
        id: ship.id,
        waybill: ship.waybill,
        customer_name: ship.customer_name,
        customer_phone: ship.customer_phone,
        delivery_address: ship.delivery_address,
        delivery_pincode: ship.delivery_pincode,
        status: ship.status,
        created_at: ship.created_at,
        estimated_delivery: ship.estimated_delivery || '',
        cod_amount: ship.cod_amount || 0,
        weight: ship.weight,
        tracking_url: ship.tracking_url || `https://track.delhivery.com/${ship.waybill}`,
        pickup_date: ship.pickup_date,
        pickup_status: ship.pickup_status,
        pickup_location: ship.pickup_location,
        pickup_attempts: ship.pickup_attempts,
        last_pickup_attempt: ship.last_pickup_attempt
      }));
      
      setShipments(formattedShipments);
      console.log(`✅ Loaded ${formattedShipments.length} shipments from database`);
    } catch (error) {
      console.error('Error loading shipments:', error);
      NotificationManager.error('Failed to load shipments from database');
    } finally {
      setLoading(false);
    }
  };

  const handlePinCodeCheck = async () => {
    if (!pinCodeCheck.pinCode) {
      NotificationManager.error('Please enter a pincode');
      return;
    }

    setPinCodeCheck(prev => ({ ...prev, loading: true }));
    try {
      const result = await delhiveryService.checkPinCodeServiceability(pinCodeCheck.pinCode);
      setPinCodeCheck(prev => ({ ...prev, result }));
      
      // Add to search history
      if (result.delivery_codes && result.delivery_codes.length > 0) {
        const firstCode = result.delivery_codes[0];
        const historyEntry = {
          pinCode: pinCodeCheck.pinCode,
          result: result,
          timestamp: new Date().toLocaleString(),
          city: firstCode.city,
          state: firstCode.state,
          serviceable: firstCode.serviceability === 'Serviceable'
        };
        
        setSearchHistory(prev => {
          // Remove if already exists (to move to top)
          const filtered = prev.filter(item => item.pinCode !== pinCodeCheck.pinCode);
          // Add to beginning and limit to 10 items
          return [historyEntry, ...filtered].slice(0, 10);
        });
      }
      
      // No notification needed for successful pincode check - result is visible
    } catch (error) {
      NotificationManager.error('Failed to check pincode serviceability');
    } finally {
      setPinCodeCheck(prev => ({ ...prev, loading: false }));
    }
  };

  const handleHistorySearch = (pinCode: string) => {
    setPinCodeCheck(prev => ({ ...prev, pinCode }));
  };

  const clearHistory = () => {
    setSearchHistory([]);
    // No notification needed - action is self-evident
  };

  const removeHistoryItem = (pinCode: string) => {
    setSearchHistory(prev => prev.filter(item => item.pinCode !== pinCode));
    // No notification needed - removal is immediately visible
  };

  // Helper functions for address parsing
  const extractPinCodeFromAddress = (address: string): string => {
    const pinCodeMatch = address.match(/\b\d{6}\b/);
    return pinCodeMatch ? pinCodeMatch[0] : '';
  };

  const extractCityFromAddress = (address: string): string => {
    // Common Indian cities to extract
    const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan', 'Vasai', 'Varanasi', 'Srinagar', 'Aurangabad', 'Navi Mumbai', 'Solapur', 'Vijayawada', 'Kolhapur', 'Amritsar', 'Noida', 'Ranchi', 'Howrah', 'Coimbatore', 'Raipur', 'Jabalpur', 'Gwalior', 'Chandigarh', 'Tiruchirappalli', 'Mysore', 'Bhubaneswar', 'Kochi', 'Bhavnagar', 'Salem', 'Warangal', 'Guntur', 'Bhiwandi', 'Amravati', 'Nanded', 'Kolhapur', 'Sangli', 'Malegaon', 'Ulhasnagar', 'Jalgaon', 'Latur', 'Ahmadnagar', 'Dhule', 'Ichalkaranji', 'Parbhani', 'Jalna', 'Bhusawal', 'Panvel', 'Satara', 'Beed', 'Yavatmal', 'Kamptee', 'Gondia', 'Barshi', 'Achalpur', 'Osmanabad', 'Nandurbar', 'Wardha', 'Udgir', 'Hinganghat', 'Gurgaon', 'Faridabad', 'Noida', 'Ghaziabad', 'Meerut', 'Agra', 'Lucknow', 'Kanpur', 'Varanasi', 'Allahabad', 'Bareilly', 'Moradabad', 'Aligarh', 'Saharanpur', 'Gorakhpur', 'Firozabad', 'Jhansi', 'Muzaffarnagar', 'Mathura', 'Shahjahanpur', 'Rampur', 'Modinagar', 'Hapur', 'Etawah', 'Mirzapur', 'Bulandshahr', 'Sambhal', 'Amroha', 'Hardoi', 'Fatehpur', 'Raebareli', 'Orai', 'Sitapur', 'Bahraich', 'Modinagar', 'Shamli', 'Kasganj', 'Ghazipur', 'Sultanpur', 'Azamgarh', 'Bijnor', 'Sahaswan', 'Basti', 'Chandausi', 'Akbarpur', 'Ballia', 'Tanda', 'Greater Noida', 'Shikohabad', 'Shamli', 'Awagarh', 'Kasganj', 'Etah', 'Mainpuri', 'Firozabad', 'Aligarh', 'Hathras', 'Sambhal', 'Amroha', 'Moradabad', 'Rampur', 'Bareilly', 'Shahjahanpur', 'Hardoi', 'Sitapur', 'Lakhimpur', 'Bahraich', 'Shravasti', 'Balrampur', 'Gonda', 'Siddharthnagar', 'Basti', 'Sant Kabir Nagar', 'Maharajganj', 'Gorakhpur', 'Kushinagar', 'Deoria', 'Azamgarh', 'Mau', 'Ballia', 'Jaunpur', 'Ghazipur', 'Chandauli', 'Varanasi', 'Sant Ravidas Nagar', 'Mirzapur', 'Sonbhadra', 'Allahabad', 'Fatehpur', 'Pratapgarh', 'Kaushambi', 'Chitrakoot', 'Banda', 'Hamirpur', 'Mahoba', 'Lalitpur', 'Jhansi', 'Jalaun', 'Orai', 'Etawah', 'Auraiya', 'Kanpur Dehat', 'Kanpur Nagar', 'Unnao', 'Lucknow', 'Rae Bareli', 'Sultanpur', 'Amethi', 'Faizabad', 'Ambedkar Nagar', 'Barabanki', 'Bahraich', 'Shravasti', 'Balrampur', 'Gonda', 'Siddharthnagar', 'Basti', 'Sant Kabir Nagar', 'Maharajganj', 'Gorakhpur', 'Kushinagar', 'Deoria', 'Azamgarh', 'Mau', 'Ballia', 'Jaunpur', 'Ghazipur', 'Chandauli', 'Varanasi', 'Sant Ravidas Nagar', 'Mirzapur', 'Sonbhadra'];
    
    for (const city of cities) {
      if (address.toLowerCase().includes(city.toLowerCase())) {
        return city;
      }
    }
    return '';
  };

  const extractStateFromAddress = (address: string): string => {
    // Common Indian states to extract
    const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'Tamil Nadu', 'West Bengal', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Madhya Pradesh', 'Andhra Pradesh', 'Bihar', 'Odisha', 'Kerala', 'Assam', 'Punjab', 'Haryana', 'Chhattisgarh', 'Jharkhand', 'Uttarakhand', 'Himachal Pradesh', 'Tripura', 'Meghalaya', 'Manipur', 'Nagaland', 'Goa', 'Arunachal Pradesh', 'Mizoram', 'Sikkim', 'Jammu and Kashmir', 'Ladakh'];
    
    for (const state of states) {
      if (address.toLowerCase().includes(state.toLowerCase())) {
        return state;
      }
    }
    return '';
  };

  const calculateOrderWeight = (orderItems: any[]): number => {
    // Estimate weight based on product types
    let totalWeight = 0;
    
    orderItems.forEach(item => {
      const productTitle = (item.product_title || item.products?.title || '').toLowerCase();
      
      if (productTitle.includes('hoodie') || productTitle.includes('sweatshirt')) {
        totalWeight += 0.5; // 500g per clothing item
      } else if (productTitle.includes('t-shirt') || productTitle.includes('shirt')) {
        totalWeight += 0.2; // 200g per t-shirt
      } else if (productTitle.includes('poster') || productTitle.includes('print')) {
        totalWeight += 0.1; // 100g per poster
      } else {
        totalWeight += 0.3; // Default 300g for other items
      }
    });
    
    return Math.max(totalWeight, 0.1); // Minimum 100g
  };

  const loadAvailableOrders = async () => {
    try {
      setLoading(true);
      
      // Fetch real orders from Supabase using OrderService
      const orders = await orderService.getAllOrders({
        status: 'processing',
        limit: 50
      });
      
      // Transform the orders to match our expected format
      const transformedOrders = orders.map((order: any) => ({
        id: order.id,
        customer_name: order.customer_name || 'Unknown Customer',
        customer_phone: order.customer_phone || '',
        delivery_address: order.shipping_address || '',
        delivery_pincode: extractPinCodeFromAddress(order.shipping_address || ''),
        delivery_city: extractCityFromAddress(order.shipping_address || ''),
        delivery_state: extractStateFromAddress(order.shipping_address || ''),
        cod_amount: order.total_amount || 0,
        weight: calculateOrderWeight(order.order_items || []),
        payment_method: order.payment_method || 'prepaid',
        products: order.order_items?.map((item: any) => ({
          name: item.product_title || item.products?.title || 'Unknown Product',
          quantity: item.quantity || 1,
          price: item.unit_price || item.total_price || 0
        })) || [],
        created_at: order.created_at || new Date().toISOString()
      }));

            setAvailableOrders(transformedOrders);
            // No notification needed - data loading is routine operation
    } catch (error) {
      console.error('Error loading orders:', error);
      NotificationManager.error('Failed to load orders. Using fallback data.');
      
      // Fallback to mock data if API fails
      const mockOrders = [
        {
          id: 'ORD001',
          customer_name: 'John Doe',
          customer_phone: '+91 9876543210',
          delivery_address: '123 Main Street, Sector 15, Gurgaon',
          delivery_pincode: '122001',
          delivery_city: 'Gurgaon',
          delivery_state: 'Haryana',
          cod_amount: 2500,
          weight: 1.2,
          payment_method: 'cod',
          products: [
            { name: 'Wireless Headphones', quantity: 1, price: 2500 }
          ],
          created_at: '2024-01-15T10:30:00Z'
        },
        {
          id: 'ORD002',
          customer_name: 'Jane Smith',
          customer_phone: '+91 8765432109',
          delivery_address: '456 Park Avenue, Andheri West',
          delivery_pincode: '400058',
          delivery_city: 'Mumbai',
          delivery_state: 'Maharashtra',
          cod_amount: 1800,
          weight: 0.8,
          payment_method: 'razorpay',
          products: [
            { name: 'Smart Watch', quantity: 1, price: 1800 }
          ],
          created_at: '2024-01-14T14:20:00Z'
        },
        {
          id: 'ORD003',
          customer_name: 'Mike Johnson',
          customer_phone: '+91 7654321098',
          delivery_address: '789 Tech Park, Electronic City',
          delivery_pincode: '560100',
          delivery_city: 'Bangalore',
          delivery_state: 'Karnataka',
          cod_amount: 3200,
          weight: 2.1,
          payment_method: 'razorpay',
          products: [
            { name: 'Laptop Stand', quantity: 1, price: 1200 },
            { name: 'Wireless Mouse', quantity: 1, price: 2000 }
          ],
          created_at: '2024-01-13T09:15:00Z'
        }
      ];
      setAvailableOrders(mockOrders);
    } finally {
      setLoading(false);
    }
  };

  const importOrderToForm = (order: any) => {
    setNewShipment({
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      delivery_address: order.delivery_address,
      delivery_pincode: order.delivery_pincode,
      delivery_city: order.delivery_city,
      delivery_state: order.delivery_state,
      cod_amount: order.cod_amount.toString(),
      weight: order.weight.toString(),
      length: '30', // Default dimensions
      width: '20',
      height: '15',
      products_desc: order.products.map((p: any) => `${p.name} (Qty: ${p.quantity})`).join(', '),
      order_id: order.id, // Store order ID for linking
      payment_method: order.payment_method // Store payment method
    } as any);
    setShowOrderImport(false);
    // No notification needed - form population is immediately visible
  };

  const clearShipmentForm = () => {
    setNewShipment({
      customer_name: '',
      customer_phone: '',
      delivery_address: '',
      delivery_pincode: '',
      delivery_city: '',
      delivery_state: '',
      cod_amount: '',
      weight: '',
      length: '',
      width: '',
      height: '',
      products_desc: '',
      order_id: undefined
    });
    // No notification needed - form clearing is self-evident
  };

  const handleRateCalculation = async () => {
    if (!rateCalculation.pickupPincode || !rateCalculation.deliveryPincode || !rateCalculation.weight) {
      NotificationManager.error('Please fill in all required fields');
      return;
    }

    setRateCalculation(prev => ({ ...prev, loading: true }));
    try {
      const rateData = {
        pickup_pincode: rateCalculation.pickupPincode,
        delivery_pincode: rateCalculation.deliveryPincode,
        weight: parseFloat(rateCalculation.weight),
        cod_amount: parseFloat(rateCalculation.codAmount || '0'),
        length: 10,
        width: 10,
        height: 10,
        product_code: 'DEXPRESS',
        sub_product_code: 'DEXPRESS'
      };
      
      const result = await delhiveryService.getShippingRates(rateData);
      setRateCalculation(prev => ({ ...prev, result }));
      // No notification needed - results are displayed directly
    } catch (error) {
      NotificationManager.error('Failed to calculate shipping rates');
    } finally {
      setRateCalculation(prev => ({ ...prev, loading: false }));
    }
  };

  const handleCreateShipment = async () => {
    if (!newShipment.customer_name || !newShipment.customer_phone || !newShipment.delivery_address) {
      NotificationManager.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const shipmentData = {
        shipments: [{
          name: newShipment.customer_name,
          phone: newShipment.customer_phone,
          add: newShipment.delivery_address,
          pin: newShipment.delivery_pincode,
          city: newShipment.delivery_city,
          state: newShipment.delivery_state,
          country: 'India',
          order: `ORD_${Date.now()}`,
          payment_mode: newShipment.cod_amount ? 'COD' : 'Prepaid',
          products_desc: newShipment.products_desc,
          cod_amount: parseFloat(newShipment.cod_amount || '0'),
          weight: parseFloat(newShipment.weight),
          length: parseFloat(newShipment.length || '10'),
          width: parseFloat(newShipment.width || '10'),
          height: parseFloat(newShipment.height || '10'),
          shipment_width: parseFloat(newShipment.width || '10'),
          shipment_height: parseFloat(newShipment.height || '10'),
          shipping_mode: 'Surface',
          pickup_date: new Date().toISOString().split('T')[0]
        }],
        pickup_location: {
          name: 'warehouse_name'
        }
      };

      // Try to create shipment in Delhivery and get waybill (optional)
      let waybill = '';
      let delhiverySuccess = false;
      
      try {
        const result = await delhiveryService.createShipment(shipmentData);
        
        // Try to generate waybill from Delhivery
        try {
          const waybills = await delhiveryService.generateWaybills(1);
          waybill = waybills[0] || '';
        } catch (waybillError: any) {
          console.warn('⚠️ Failed to get waybill from Delhivery:', waybillError.message);
        }
        
        if (waybill) {
          delhiverySuccess = true;
          console.log('✅ Shipment created in Delhivery with waybill:', waybill);
        }
      } catch (delhiveryError: any) {
        console.warn('⚠️ Delhivery API not available, creating shipment in database only:', delhiveryError.message);
      }
      
      // If no waybill from Delhivery, generate local waybill
      if (!waybill) {
        waybill = `LOCAL_${Date.now()}`;
        console.log('📋 Generated local waybill:', waybill);
      }
      
      // ALWAYS save shipment to database (regardless of Delhivery status)
      try {
        await shippingService.createShipment({
          waybill: waybill,
          customer_name: newShipment.customer_name,
          customer_phone: newShipment.customer_phone,
          delivery_address: newShipment.delivery_address,
          delivery_pincode: newShipment.delivery_pincode,
          delivery_city: newShipment.delivery_city,
          delivery_state: newShipment.delivery_state,
          delivery_country: 'India',
          products_desc: newShipment.products_desc,
          cod_amount: parseFloat(newShipment.cod_amount || '0'),
          weight: parseFloat(newShipment.weight),
          length: parseFloat(newShipment.length || '10'),
          width: parseFloat(newShipment.width || '10'),
          height: parseFloat(newShipment.height || '10'),
          status: 'pending',
          payment_mode: newShipment.cod_amount ? 'COD' : 'Prepaid',
          pickup_date: new Date().toISOString().split('T')[0],
          order_id: newShipment.order_id // Link to order if imported from orders
        });
        
        console.log(`✅ Shipment ${waybill} saved to database${newShipment.order_id ? ` (linked to order ${newShipment.order_id})` : ''}`);
        
        // Show appropriate message based on what worked
        const orderText = newShipment.order_id ? ` for Order #${newShipment.order_id}` : '';
        if (delhiverySuccess) {
          NotificationManager.success(`Shipment created${orderText}! Waybill: ${waybill}`);
        } else {
          NotificationManager.success(`Shipment saved to database${orderText}! Waybill: ${waybill}`);
        }
        
        // Reload shipments to show the new one
        loadShipments();
      } catch (dbError: any) {
        console.error('Failed to save shipment to database:', dbError);
        if (delhiverySuccess) {
          NotificationManager.warning(`Shipment created in Delhivery (${waybill}) but failed to save to database`);
        } else {
          NotificationManager.error('Failed to create shipment. Please try again.');
        }
      }
      
      // Reset form
      setNewShipment({
        customer_name: '',
        customer_phone: '',
        delivery_address: '',
        delivery_pincode: '',
        delivery_city: '',
        delivery_state: '',
        cod_amount: '',
        weight: '',
        length: '',
        width: '',
        height: '',
        products_desc: '',
        order_id: undefined
      });
    } catch (error) {
      console.error('Shipment creation error:', error);
      NotificationManager.error('Failed to create shipment');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackShipment = async (waybill: string) => {
    try {
      const result = await delhiveryService.trackShipment(waybill);
      // Tracking result received - no notification needed
    } catch (error) {
      NotificationManager.error('Failed to track shipment');
    }
  };

  const handleCancelShipment = async (waybill: string) => {
    if (!confirm('Are you sure you want to cancel this shipment?')) return;

    try {
      const result = await delhiveryService.cancelShipmentViaEdit(waybill);
      
      // Update the shipment status in database
      await shippingService.updateShipmentStatus(waybill, 'cancelled');
      
      // Update the shipment status in local state immediately
      setShipments(prev => prev.map(shipment => 
        shipment.waybill === waybill 
          ? { ...shipment, status: 'cancelled' }
          : shipment
      ));
      
      // Show success message - important action that needs confirmation
      if (result.message && result.message.includes('mock')) {
        NotificationManager.success('Shipment cancelled (mock mode - API not configured)');
      } else {
        NotificationManager.success('Shipment cancelled successfully');
      }
      
      console.log(`✅ Shipment ${waybill} cancelled and saved to database`);
    } catch (error) {
      console.error('Cancel shipment error:', error);
      NotificationManager.error('Failed to cancel shipment');
    }
  };

  const handleGenerateWaybills = async () => {
    if (!waybillGeneration.count) {
      NotificationManager.error('Please enter number of waybills to generate');
      return;
    }

    setWaybillGeneration(prev => ({ ...prev, loading: true }));
    try {
      const waybills = await delhiveryService.generateWaybills(parseInt(waybillGeneration.count));
      setWaybillGeneration(prev => ({ ...prev, waybills }));
      // No notification needed - generated waybills are displayed
    } catch (error) {
      NotificationManager.error('Failed to generate waybills');
    } finally {
      setWaybillGeneration(prev => ({ ...prev, loading: false }));
    }
  };

  const handleCalculateTAT = async () => {
    if (!expectedTAT.origin_pin || !expectedTAT.destination_pin) {
      NotificationManager.error('Please enter both origin and destination pin codes');
      return;
    }

    setExpectedTAT(prev => ({ ...prev, loading: true }));
    try {
      const result = await delhiveryService.getExpectedTAT(expectedTAT);
      setExpectedTAT(prev => ({ ...prev, result }));
      // No notification needed - TAT result is displayed
    } catch (error) {
      NotificationManager.error('Failed to calculate expected TAT');
    } finally {
      setExpectedTAT(prev => ({ ...prev, loading: false }));
    }
  };

  const handleRequestPickup = async () => {
    console.log('🚀 handleRequestPickup called');
    console.log('📦 Pickup request data:', pickupRequest);
    console.log('📋 Selected shipments:', selectedShipmentsForPickup);
    
    if (!pickupRequest.pickup_location || !pickupRequest.pickup_date) {
      NotificationManager.error('Please fill in all required fields');
      return;
    }

    if (selectedShipmentsForPickup.length === 0) {
      NotificationManager.error('Please select at least one shipment for pickup');
      return;
    }

    setPickupRequest(prev => ({ ...prev, loading: true, result: null }));
    try {
      // Update expected package count based on selected shipments
      const updatedPickupRequest = {
        ...pickupRequest,
        expected_package_count: selectedShipmentsForPickup.length
      };

      console.log('📤 Sending pickup request to Delhivery...');
      
      // Request pickup from Delhivery API
      const result = await delhiveryService.requestPickup(updatedPickupRequest);
      
      console.log('📥 Received response from Delhivery:', result);
      setPickupRequest(prev => ({ ...prev, result }));
      
      if (result.success) {
        console.log('✅ Pickup requested successfully via Delhivery API');
        console.log('🆔 Pickup ID:', result.pickup_id);
        
        // Update shipment pickup date in database
        try {
          for (const waybill of selectedShipmentsForPickup) {
            await shippingService.updateShipment(waybill, {
              pickup_date: pickupRequest.pickup_date,
              pickup_id: result.pickup_id
            });
          }
          
          console.log(`✅ Updated ${selectedShipmentsForPickup.length} shipment(s) in database`);
          
          // Reload shipments to reflect updated status
          loadShipments();
          
          // Clear selection
          setSelectedShipmentsForPickup([]);
          
          NotificationManager.success(
            `✅ Pickup requested successfully! Pickup ID: ${result.pickup_id || 'N/A'}`
          );
        } catch (dbError: any) {
          console.error('Failed to update shipment pickup status in database:', dbError);
          NotificationManager.warning('Pickup requested via Delhivery but failed to update database');
        }
      } else {
        // Delhivery request failed
        console.error('❌ Delhivery pickup request failed:', result.message);
        console.error('📋 Error details:', result.error);
        
        // Show detailed error message
        let errorMsg = `❌ ${result.message}`;
        if (result.error) {
          errorMsg += `\n\n${result.error}`;
        }
        
        // Show troubleshooting steps if available
        if (result.troubleshooting && result.troubleshooting.length > 0) {
          console.log('💡 Troubleshooting steps:');
          result.troubleshooting.forEach((step: string, idx: number) => {
            console.log(`   ${idx + 1}. ${step}`);
          });
          
          errorMsg += '\n\n💡 Troubleshooting:\n' + result.troubleshooting.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n');
        }
        
        NotificationManager.error(errorMsg, 10000); // Show for 10 seconds
        
        // Still try to update database for internal tracking
        console.log('ℹ️ Updating database for internal tracking...');
        try {
          for (const waybill of selectedShipmentsForPickup) {
            await shippingService.updateShipment(waybill, {
              pickup_date: pickupRequest.pickup_date
            });
          }
          
          console.log(`✅ Updated ${selectedShipmentsForPickup.length} shipment(s) in database (internal tracking)`);
          loadShipments();
          
          NotificationManager.warning(
            `⚠️ Pickup NOT sent to Delhivery (see error above), but scheduled in database for internal tracking.`
          );
        } catch (dbError: any) {
          console.error('Failed to update database:', dbError);
          NotificationManager.error('Failed to schedule pickup in database. Please try again.');
        }
      }
    } catch (error: any) {
      console.error('❌ Unexpected error in handleRequestPickup:', error);
      NotificationManager.error(`Unexpected error: ${error.message}`);
    } finally {
      setPickupRequest(prev => ({ ...prev, loading: false }));
    }
  };

  const handleCreateWarehouse = async () => {
    setWarehouseCreate(prev => ({ ...prev, loading: true }));
    try {
      // Try to call Delhivery API (optional - won't block Supabase save)
      let delhiverySuccess = false;
      try {
        const result = await delhiveryService.createWarehouseWithValidation(warehouseCreate);
        setWarehouseCreate(prev => ({ ...prev, result }));
        delhiverySuccess = result.success;
        if (result.success) {
          console.log('✅ Warehouse created in Delhivery');
        }
      } catch (delhiveryError: any) {
        console.warn('⚠️ Delhivery API not available, saving to Supabase only:', delhiveryError.message);
        // Continue to save in Supabase even if Delhivery fails
      }
      
      // ALWAYS save warehouse to Supabase database (regardless of Delhivery status)
      try {
        const savedWarehouse = await shippingService.createWarehouse({
          name: warehouseCreate.name,
          phone: warehouseCreate.phone,
          email: warehouseCreate.email,
          city: warehouseCreate.city,
          pin: warehouseCreate.pin,
          address: warehouseCreate.address,
          country: warehouseCreate.country || 'India',
          registered_name: warehouseCreate.registered_name,
          return_address: warehouseCreate.return_address,
          return_pin: warehouseCreate.return_pin,
          return_city: warehouseCreate.return_city,
          return_state: warehouseCreate.return_state,
          return_country: warehouseCreate.return_country || 'India',
          is_active: true
        });
        
        console.log('✅ Warehouse saved to Supabase database:', savedWarehouse.id);
        
        if (delhiverySuccess) {
          NotificationManager.success('Warehouse created in Delhivery and saved to database!');
        } else {
          NotificationManager.success('Warehouse saved to database successfully!');
        }
        
        // Reload warehouses list
        loadWarehouses();
        
        // Reset form
        setWarehouseCreate(prev => ({
          ...prev,
          phone: '',
          city: '',
          name: '',
          pin: '',
          address: '',
          country: 'India',
          email: '',
          registered_name: '',
          return_address: '',
          return_pin: '',
          return_city: '',
          return_state: '',
          return_country: 'India',
          result: null
        }));
      } catch (dbError: any) {
        console.error('Failed to save warehouse to database:', dbError);
        NotificationManager.warning('Warehouse created in Delhivery but failed to save to database');
      }
    } catch (error: any) {
      console.error('Warehouse creation error:', error);
      NotificationManager.error(error.message || 'Failed to create warehouse');
    } finally {
      setWarehouseCreate(prev => ({ ...prev, loading: false }));
    }
  };

  const handleEditWarehouse = async (warehouseId: string) => {
    setWarehouseEdit(prev => ({ ...prev, loading: true }));
    try {
      // Try to call Delhivery API (optional - won't block Supabase update)
      let delhiverySuccess = false;
      try {
        const result = await delhiveryService.editWarehouseWithValidation(warehouseEdit);
        setWarehouseEdit(prev => ({ ...prev, result }));
        delhiverySuccess = result.success;
        if (result.success) {
          console.log('✅ Warehouse updated in Delhivery');
        }
      } catch (delhiveryError: any) {
        console.warn('⚠️ Delhivery API not available, updating in Supabase only:', delhiveryError.message);
        // Continue to update in Supabase even if Delhivery fails
      }
      
      // ALWAYS update warehouse in Supabase database (regardless of Delhivery status)
      try {
        await shippingService.updateWarehouse(warehouseId, {
          name: warehouseEdit.name,
          phone: warehouseEdit.phone,
          email: warehouseEdit.email,
          city: warehouseEdit.city,
          pin: warehouseEdit.pin,
          address: warehouseEdit.address,
          registered_name: warehouseEdit.registered_name,
          return_address: warehouseEdit.return_address,
          return_city: warehouseEdit.return_city,
          return_pin: warehouseEdit.return_pin,
          is_active: warehouseEdit.is_active
        });
        
        console.log('✅ Warehouse updated in Supabase database');
        
        if (delhiverySuccess) {
          NotificationManager.success('Warehouse updated in Delhivery and database!');
        } else {
          NotificationManager.success('Warehouse updated in database successfully!');
        }
        
        // Reload warehouses list
        await loadWarehouses();
        // Close edit form
        setShowWarehouseEdit(false);
        setSelectedWarehouse(null);
      } catch (dbError: any) {
        console.error('Database update error:', dbError);
        NotificationManager.error('Failed to update warehouse in database');
      }
    } catch (error: any) {
      console.error('Warehouse update error:', error);
      NotificationManager.error(error.message || 'Failed to update warehouse');
    } finally {
      setWarehouseEdit(prev => ({ ...prev, loading: false }));
    }
  };

  const handleCreateAdvancedShipment = async () => {
    if (!advancedShipment.client || !advancedShipment.name || !advancedShipment.phone) {
      NotificationManager.error('Please fill in all required fields');
      return;
    }

    setAdvancedShipment(prev => ({ ...prev, loading: true }));
    try {
      const shipmentData: AdvancedCreateShipmentRequest = {
        shipments: [{
          client: advancedShipment.client,
          return_name: advancedShipment.return_name,
          order: advancedShipment.order,
          return_country: advancedShipment.return_country,
          weight: advancedShipment.weight,
          city: advancedShipment.city,
          pin: advancedShipment.pin,
          return_state: advancedShipment.return_state,
          products_desc: advancedShipment.products_desc,
          shipping_mode: advancedShipment.shipping_mode,
          state: advancedShipment.state,
          quantity: advancedShipment.quantity,
          waybill: advancedShipment.waybill || undefined,
          phone: advancedShipment.phone,
          add: advancedShipment.add,
          payment_mode: advancedShipment.payment_mode,
          order_date: advancedShipment.order_date,
          seller_gst_tin: advancedShipment.seller_gst_tin || undefined,
          name: advancedShipment.name,
          return_add: advancedShipment.return_add,
          total_amount: parseInt(advancedShipment.total_amount || '0'),
          seller_name: advancedShipment.seller_name,
          return_city: advancedShipment.return_city,
          country: advancedShipment.country,
          return_pin: advancedShipment.return_pin,
          return_phone: advancedShipment.return_phone,
          qc_type: advancedShipment.qc_type,
          custom_qc: advancedShipment.custom_qc.length > 0 ? advancedShipment.custom_qc : undefined
        }],
        pickup_location: {
          name: advancedShipment.pickup_location_name
        }
      };

      const result = await delhiveryService.createAdvancedShipmentWithWaybill(shipmentData);
      setAdvancedShipment(prev => ({ ...prev, result }));
      console.log('✅ Advanced shipment created in Delhivery');
      // Important action - keep notification
      NotificationManager.success('Advanced shipment created successfully');
    } catch (error: any) {
      console.error('Failed to create advanced shipment:', error);
      if (error.code === 'ERR_NETWORK') {
        NotificationManager.error('Network error. Delhivery API is unavailable. Please check your connection and try again.');
      } else {
        NotificationManager.error(error.message || 'Failed to create advanced shipment');
      }
    } finally {
      setAdvancedShipment(prev => ({ ...prev, loading: false }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'picked_up': return 'text-blue-600 bg-blue-100';
      case 'in_transit': return 'text-purple-600 bg-purple-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'picked_up': return <Package className="w-4 h-4" />;
      case 'in_transit': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getPickupStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-blue-600 bg-blue-100';
      case 'picked_up': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getPickupStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Clock className="w-3 h-3" />;
      case 'picked_up': return <CheckCircle className="w-3 h-3" />;
      case 'failed': return <XCircle className="w-3 h-3" />;
      case 'cancelled': return <X className="w-3 h-3" />;
      default: return <AlertCircle className="w-3 h-3" />;
    }
  };

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = shipment.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.waybill.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.delivery_pincode.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });


  return (
    <AdminLayout title="Shipping Management" noHeader={true}>
      <ShippingSecondaryNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
      />
      <div className="ml-20 p-6">
        {/* Tab Content */}
        {activeTab === 'shipments' && (
          <div>
          {/* Filters */}
          <div className="mb-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search shipments..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="picked_up">Picked Up</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Shipments Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Waybill
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pickup
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      COD Amount
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredShipments.map((shipment) => (
                    <tr key={shipment.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{shipment.waybill}</div>
                        <div className="text-xs text-gray-500">{shipment.created_at}</div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{shipment.customer_name}</div>
                        <div className="text-xs text-gray-500">{shipment.customer_phone}</div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="text-sm text-gray-900">{shipment.delivery_address}</div>
                        <div className="text-xs text-gray-500">{shipment.delivery_pincode}</div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                          {getStatusIcon(shipment.status)}
                          <span className="ml-1 capitalize">{shipment.status.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {shipment.pickup_id ? (
                          <div className="text-sm">
                            <div className="flex items-center">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPickupStatusColor(shipment.pickup_status || 'scheduled')}`}>
                                {getPickupStatusIcon(shipment.pickup_status || 'scheduled')}
                                <span className="ml-1 capitalize">{shipment.pickup_status?.replace('_', ' ') || 'Scheduled'}</span>
                              </span>
                            </div>
                            {shipment.pickup_date && (
                              <div className="text-xs text-gray-500 mt-1">
                                {new Date(shipment.pickup_date).toLocaleDateString()}
                                {shipment.pickup_time && ` at ${shipment.pickup_time}`}
                              </div>
                            )}
                            {shipment.pickup_attempts && shipment.pickup_attempts > 0 && (
                              <div className="text-xs text-orange-600">
                                {shipment.pickup_attempts} attempt{shipment.pickup_attempts > 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              <Clock className="w-3 h-3 mr-1" />
                              Not Scheduled
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        Rs {shipment.cod_amount}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium space-x-1">
                        <button
                          onClick={() => handleTrackShipment(shipment.waybill)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {shipment.status !== 'delivered' && shipment.status !== 'cancelled' && (
                          <button
                            onClick={() => handleCancelShipment(shipment.waybill)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          </div>
        )}

        {activeTab === 'pincheck' && (
          <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Pin Code Serviceability Check</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Pin Code
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Enter pin code"
                  className="flex-1 px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                  value={pinCodeCheck.pinCode}
                  onChange={(e) => setPinCodeCheck(prev => ({ ...prev, pinCode: e.target.value }))}
                />
                <button
                  onClick={handlePinCodeCheck}
                  disabled={pinCodeCheck.loading}
                  className="px-3 py-1.5 bg-pink-600 text-white text-sm rounded-md hover:bg-pink-700 disabled:opacity-50"
                >
                  {pinCodeCheck.loading ? 'Checking...' : 'Check'}
                </button>
              </div>
            </div>

            {pinCodeCheck.result && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-4">Serviceability Result:</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pin Code</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Services</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hub</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zone</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {pinCodeCheck.result.delivery_codes.map((code, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {code.pin}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {code.city}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {code.state}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              code.serviceability === 'Serviceable' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {code.serviceability}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <div className="flex flex-wrap gap-1">
                              {code.pre_paid === 'Y' && (
                                <span className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Pre-paid</span>
                              )}
                              {code.cod === 'Y' && (
                                <span className="inline-flex px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">COD</span>
                              )}
                              {code.pickup === 'Y' && (
                                <span className="inline-flex px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">Pickup</span>
                              )}
                              {code.reverse === 'Y' && (
                                <span className="inline-flex px-2 py-1 text-xs bg-pink-100 text-pink-800 rounded">Reverse</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <div>
                              <div className="font-medium">{code.hub_name}</div>
                              <div className="text-xs text-gray-500">{code.hub_code}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {code.zone}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Search History */}
            {searchHistory.length > 0 && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">Previous Searches</h3>
                  <button
                    onClick={clearHistory}
                    className="text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-2">
                  {searchHistory.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <MapPin className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">{item.pinCode}</span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              item.serviceable 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {item.serviceable ? 'Serviceable' : 'Not Serviceable'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.city}, {item.state}
                          </div>
                          <div className="text-xs text-gray-400">
                            {item.timestamp}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleHistorySearch(item.pinCode)}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                        >
                          Search Again
                        </button>
                        <button
                          onClick={() => removeHistoryItem(item.pinCode)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Remove from history"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          </div>
        )}

        {activeTab === 'rates' && (
          <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Shipping Rate Calculator</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Pickup Pin Code
              </label>
              <input
                type="text"
                placeholder="400001"
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                value={rateCalculation.pickupPincode}
                onChange={(e) => setRateCalculation(prev => ({ ...prev, pickupPincode: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Delivery Pin Code
              </label>
              <input
                type="text"
                placeholder="110001"
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                value={rateCalculation.deliveryPincode}
                onChange={(e) => setRateCalculation(prev => ({ ...prev, deliveryPincode: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="0.5"
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                value={rateCalculation.weight}
                onChange={(e) => setRateCalculation(prev => ({ ...prev, weight: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                COD Amount (Rs)
              </label>
              <input
                type="number"
                placeholder="1500"
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                value={rateCalculation.codAmount}
                onChange={(e) => setRateCalculation(prev => ({ ...prev, codAmount: e.target.value }))}
              />
            </div>
          </div>
          <div className="mt-3">
            <button
              onClick={handleRateCalculation}
              disabled={rateCalculation.loading}
              className="px-4 py-2 bg-pink-600 text-white text-sm rounded-md hover:bg-pink-700 disabled:opacity-50"
            >
              {rateCalculation.loading ? 'Calculating...' : 'Calculate Rates'}
            </button>
          </div>

          {rateCalculation.result && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Rate Calculation Result:</h3>
              <pre className="text-sm text-gray-600 overflow-auto">
                {JSON.stringify(rateCalculation.result, null, 2)}
              </pre>
            </div>
          )}
        </div>
        )}

        {activeTab === 'create' && (
          <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Create New Shipment</h2>
            <button
              onClick={() => {
                loadAvailableOrders();
                setShowOrderImport(true);
              }}
              disabled={loading}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-1.5"
            >
              <Package className="w-3.5 h-3.5" />
              <span>{loading ? 'Loading...' : 'Import Orders'}</span>
            </button>
          </div>

          {/* Order Import Modal */}
          {showOrderImport && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Select Order to Import</h3>
                  <button
                    onClick={() => setShowOrderImport(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="p-4 overflow-y-auto max-h-[60vh]">
                  {availableOrders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No processing orders found</p>
                      <p className="text-sm text-gray-400">Orders with "processing" status will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {availableOrders.map((order) => (
                        <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <span className="font-semibold text-gray-900 text-sm">#{order.id}</span>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  {new Date(order.created_at).toLocaleDateString()}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(order.created_at).toLocaleTimeString()}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
                                  <p className="font-medium text-gray-900">{order.customer_name}</p>
                                  <p className="text-gray-600 text-xs">{order.customer_phone}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600 text-xs">{order.delivery_city}, {order.delivery_state}</p>
                                  <p className="text-gray-600 text-xs">Pin: {order.delivery_pincode}</p>
                                </div>
                              </div>
                              <div className="mt-2 space-y-1">
                                <p className="text-xs text-gray-600">
                                  <span className="font-medium">Products:</span> {order.products.map(p => `${p.name} (${p.quantity})`).join(', ')}
                                </p>
                                <div className="flex items-center space-x-4 text-xs">
                                  <span className="text-gray-600">
                                    <span className="font-medium">Amount:</span> ₹{order.cod_amount.toLocaleString()}
                                  </span>
                                  <span className="text-gray-600">
                                    <span className="font-medium">Weight:</span> {order.weight}kg
                                  </span>
                                  <span className={`px-2 py-1 rounded-full font-medium ${
                                    order.payment_method?.toLowerCase() === 'cod' 
                                      ? 'bg-orange-100 text-orange-700' 
                                      : 'bg-green-100 text-green-700'
                                  }`}>
                                    {order.payment_method?.toLowerCase() === 'cod' ? 'COD' : 'Prepaid'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => importOrderToForm(order)}
                              className="ml-4 px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors flex items-center space-x-1"
                            >
                              <Package className="w-3 h-3" />
                              <span>Import</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                value={newShipment.customer_name}
                onChange={(e) => setNewShipment(prev => ({ ...prev, customer_name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Customer Phone *
              </label>
              <input
                type="text"
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                value={newShipment.customer_phone}
                onChange={(e) => setNewShipment(prev => ({ ...prev, customer_phone: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Delivery Address *
              </label>
              <textarea
                rows={2}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                value={newShipment.delivery_address}
                onChange={(e) => setNewShipment(prev => ({ ...prev, delivery_address: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Pin Code
              </label>
              <input
                type="text"
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                value={newShipment.delivery_pincode}
                onChange={(e) => setNewShipment(prev => ({ ...prev, delivery_pincode: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                value={newShipment.delivery_city}
                onChange={(e) => setNewShipment(prev => ({ ...prev, delivery_city: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                value={newShipment.delivery_state}
                onChange={(e) => setNewShipment(prev => ({ ...prev, delivery_state: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                value={newShipment.weight}
                onChange={(e) => setNewShipment(prev => ({ ...prev, weight: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                COD Amount (Rs)
              </label>
              <input
                type="number"
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                value={newShipment.cod_amount}
                onChange={(e) => setNewShipment(prev => ({ ...prev, cod_amount: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Length (cm)
              </label>
              <input
                type="number"
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                value={newShipment.length}
                onChange={(e) => setNewShipment(prev => ({ ...prev, length: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Width (cm)
              </label>
              <input
                type="number"
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                value={newShipment.width}
                onChange={(e) => setNewShipment(prev => ({ ...prev, width: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Height (cm)
              </label>
              <input
                type="number"
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                value={newShipment.height}
                onChange={(e) => setNewShipment(prev => ({ ...prev, height: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Product Description
              </label>
              <textarea
                rows={2}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                value={newShipment.products_desc}
                onChange={(e) => setNewShipment(prev => ({ ...prev, products_desc: e.target.value }))}
              />
            </div>
          </div>
          <div className="mt-4 flex space-x-3">
            <button
              onClick={handleCreateShipment}
              disabled={loading}
              className="px-4 py-2 bg-pink-600 text-white text-sm rounded-md hover:bg-pink-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Shipment'}
            </button>
            <button
              onClick={clearShipmentForm}
              className="px-4 py-2 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600 transition-colors flex items-center space-x-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Form</span>
            </button>
          </div>
          </div>
        )}

        {activeTab === 'waybills' && (
          <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Generate Waybills</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Number of Waybills
              </label>
              <input
                type="number"
                min="1"
                max="100"
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                value={waybillGeneration.count}
                onChange={(e) => setWaybillGeneration(prev => ({ ...prev, count: e.target.value }))}
                placeholder="Enter number of waybills to generate"
              />
            </div>
            <button
              onClick={handleGenerateWaybills}
              disabled={waybillGeneration.loading}
              className="px-4 py-2 bg-pink-600 text-white text-sm rounded-md hover:bg-pink-700 disabled:opacity-50"
            >
              {waybillGeneration.loading ? 'Generating...' : 'Generate Waybills'}
            </button>

            {waybillGeneration.waybills.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Generated Waybills:</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {waybillGeneration.waybills.map((waybill, index) => (
                    <div key={index} className="p-2 bg-white rounded border text-sm font-mono">
                      {waybill}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          </div>
        )}

        {activeTab === 'tat' && (
          <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Expected TAT Calculator</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Origin Pin Code
              </label>
              <input
                type="text"
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                value={expectedTAT.origin_pin}
                onChange={(e) => setExpectedTAT(prev => ({ ...prev, origin_pin: e.target.value }))}
                placeholder="e.g., 122003"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Destination Pin Code
              </label>
              <input
                type="text"
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                value={expectedTAT.destination_pin}
                onChange={(e) => setExpectedTAT(prev => ({ ...prev, destination_pin: e.target.value }))}
                placeholder="e.g., 136118"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Mode of Transport
              </label>
              <select
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                value={expectedTAT.mot}
                onChange={(e) => setExpectedTAT(prev => ({ ...prev, mot: e.target.value }))}
              >
                <option value="S">Surface</option>
                <option value="A">Air</option>
                <option value="R">Rail</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Product Type
              </label>
              <select
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                value={expectedTAT.pdt}
                onChange={(e) => setExpectedTAT(prev => ({ ...prev, pdt: e.target.value }))}
              >
                <option value="B2C">B2C</option>
                <option value="B2B">B2B</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Expected Pickup Date
              </label>
              <input
                type="date"
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                value={expectedTAT.expected_pickup_date}
                onChange={(e) => setExpectedTAT(prev => ({ ...prev, expected_pickup_date: e.target.value }))}
              />
            </div>
          </div>
          <div className="mt-3">
            <button
              onClick={handleCalculateTAT}
              disabled={expectedTAT.loading}
              className="px-4 py-2 bg-pink-600 text-white text-sm rounded-md hover:bg-pink-700 disabled:opacity-50"
            >
              {expectedTAT.loading ? 'Calculating...' : 'Calculate TAT'}
            </button>
          </div>

          {expectedTAT.result && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Expected TAT Result:</h3>
              <pre className="text-sm text-gray-600 overflow-auto">
                {JSON.stringify(expectedTAT.result, null, 2)}
              </pre>
            </div>
          )}
          </div>
        )}

        {activeTab === 'pickup' && (
          <div className="space-y-4">
          {/* Pending Shipments for Pickup */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Shipments Ready for Pickup</h2>
            <p className="text-sm text-gray-600 mb-4">Select shipments to include in pickup request</p>
            
            {shipments.filter(s => s.status === 'pending').length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No pending shipments available for pickup</p>
                <p className="text-sm mt-1">Create a shipment first to request pickup</p>
              </div>
            ) : (
              <div className="space-y-2">
                {shipments.filter(s => s.status === 'pending').map((shipment) => (
                  <div 
                    key={shipment.waybill}
                    className={`border rounded-lg p-3 cursor-pointer transition-all ${
                      selectedShipmentsForPickup.includes(shipment.waybill)
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      setSelectedShipmentsForPickup(prev => 
                        prev.includes(shipment.waybill)
                          ? prev.filter(w => w !== shipment.waybill)
                          : [...prev, shipment.waybill]
                      );
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedShipmentsForPickup.includes(shipment.waybill)}
                          onChange={() => {}}
                          className="mt-1 h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-mono font-semibold text-pink-600">{shipment.waybill}</span>
                            <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
                              Pending Pickup
                            </span>
                          </div>
                          <div className="text-sm text-gray-700">
                            <span className="font-medium">{shipment.customer_name}</span> • {shipment.customer_phone}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            📍 {shipment.delivery_address}, {shipment.delivery_pincode}
                          </div>
                          <div className="flex items-center space-x-3 mt-2 text-xs text-gray-600">
                            <span>⚖️ {shipment.weight}kg</span>
                            <span>💰 ₹{shipment.cod_amount}</span>
                            <span>📅 {new Date(shipment.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {selectedShipmentsForPickup.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>{selectedShipmentsForPickup.length}</strong> shipment(s) selected for pickup
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedShipmentsForPickup.map(waybill => (
                    <span key={waybill} className="px-2 py-1 bg-white border border-blue-300 rounded text-xs font-mono">
                      {waybill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pickup Request Form */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Pickup Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Pickup Location *
              </label>
              {warehouses.length === 0 ? (
                <div className="space-y-2">
                  <div className="w-full px-2.5 py-1.5 text-sm border border-yellow-300 rounded-md bg-yellow-50">
                    <span className="text-yellow-700">⚠️ No warehouses available.</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('warehouse')}
                    className="w-full px-2.5 py-1.5 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    + Create Warehouse First
                  </button>
                </div>
              ) : (
                <>
                  <select
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                    value={pickupRequest.pickup_location}
                    onChange={(e) => setPickupRequest(prev => ({ ...prev, pickup_location: e.target.value }))}
                  >
                    <option value="">Select warehouse</option>
                    {warehouses
                      .filter(w => w.is_active)
                      .map((warehouse) => (
                        <option key={warehouse.id} value={warehouse.name}>
                          {warehouse.name} - {warehouse.city}, {warehouse.pin}
                        </option>
                      ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {warehouses.filter(w => w.is_active).length} active warehouse(s) available
                  </p>
                </>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Pickup Date *
              </label>
              <input
                type="date"
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                value={pickupRequest.pickup_date}
                onChange={(e) => setPickupRequest(prev => ({ ...prev, pickup_date: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Pickup Time
              </label>
              <input
                type="time"
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                value={pickupRequest.pickup_time}
                onChange={(e) => setPickupRequest(prev => ({ ...prev, pickup_time: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Expected Package Count
              </label>
              <input
                type="number"
                min="1"
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                value={pickupRequest.expected_package_count}
                onChange={(e) => setPickupRequest(prev => ({ ...prev, expected_package_count: parseInt(e.target.value) }))}
              />
            </div>
            </div>
            
            <div className="mt-3">
            <button
              onClick={handleRequestPickup}
              disabled={pickupRequest.loading}
              className="px-4 py-2 bg-pink-600 text-white text-sm rounded-md hover:bg-pink-700 disabled:opacity-50"
            >
              {pickupRequest.loading ? 'Requesting...' : 'Request Pickup'}
            </button>
          </div>

          {pickupRequest.result && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Pickup Request Result:</h3>
              <pre className="text-sm text-gray-600 overflow-auto">
                {JSON.stringify(pickupRequest.result, null, 2)}
              </pre>
            </div>
          )}
          </div>
          </div>
        )}

        {activeTab === 'warehouse' && (
          <div className="space-y-4">
          {/* Saved Warehouses List */}
          {warehouses.length > 0 && (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Saved Warehouses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {warehouses.map((warehouse) => (
                  <div key={warehouse.id} className="border border-gray-200 rounded-lg p-3 hover:border-pink-300 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{warehouse.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{warehouse.registered_name || 'Unregistered'}</p>
                      </div>
                      {warehouse.is_active ? (
                        <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">Active</span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">Inactive</span>
                      )}
                    </div>
                    <div className="space-y-1.5 text-sm text-gray-600">
                      <div className="flex items-start">
                        <MapPin className="w-3.5 h-3.5 mr-1.5 mt-0.5 flex-shrink-0 text-gray-400" />
                        <span className="text-xs">{warehouse.address}, {warehouse.city}, {warehouse.pin}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs">📞 {warehouse.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs">✉️ {warehouse.email}</span>
                      </div>
                    </div>
                    {warehouse.return_address && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-500 font-medium mb-1">Return Address:</p>
                        <p className="text-xs text-gray-600">{warehouse.return_address}, {warehouse.return_city}, {warehouse.return_pin}</p>
                      </div>
                    )}
                    <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                      <span>Created: {new Date(warehouse.created_at).toLocaleDateString()}</span>
                      <button
                        onClick={() => {
                          setSelectedWarehouse(warehouse);
                          setWarehouseEdit({
                            name: warehouse.name,
                            phone: warehouse.phone,
                            city: warehouse.city,
                            pin: warehouse.pin,
                            address: warehouse.address,
                            email: warehouse.email,
                            registered_name: warehouse.registered_name || '',
                            return_address: warehouse.return_address || '',
                            return_city: warehouse.return_city || '',
                            return_pin: warehouse.return_pin || '',
                            is_active: warehouse.is_active
                          });
                          setShowWarehouseEdit(true);
                        }}
                        className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Edit Warehouse */}
          {showWarehouseEdit && selectedWarehouse && (
            <div className="bg-white rounded-lg shadow p-4 border-2 border-blue-300">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900">Edit Warehouse: {selectedWarehouse.name}</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded">
                    <span className="font-medium">Editing</span>
                  </span>
                  <button
                    onClick={() => {
                      setShowWarehouseEdit(false);
                      setSelectedWarehouse(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Warehouse Name *
                  </label>
                  <input
                    type="text"
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                    value={warehouseEdit.name}
                    onChange={(e) => setWarehouseEdit({ ...warehouseEdit, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="text"
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                    value={warehouseEdit.phone}
                    onChange={(e) => setWarehouseEdit({ ...warehouseEdit, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                    value={warehouseEdit.email}
                    onChange={(e) => setWarehouseEdit({ ...warehouseEdit, email: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <textarea
                    rows={2}
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                    value={warehouseEdit.address}
                    onChange={(e) => setWarehouseEdit({ ...warehouseEdit, address: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                    value={warehouseEdit.city}
                    onChange={(e) => setWarehouseEdit({ ...warehouseEdit, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Pin Code *
                  </label>
                  <input
                    type="text"
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                    value={warehouseEdit.pin}
                    onChange={(e) => setWarehouseEdit({ ...warehouseEdit, pin: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Registered Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                    value={warehouseEdit.registered_name}
                    onChange={(e) => setWarehouseEdit({ ...warehouseEdit, registered_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Return Address
                  </label>
                  <input
                    type="text"
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                    value={warehouseEdit.return_address}
                    onChange={(e) => setWarehouseEdit({ ...warehouseEdit, return_address: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Return City
                  </label>
                  <input
                    type="text"
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                    value={warehouseEdit.return_city}
                    onChange={(e) => setWarehouseEdit({ ...warehouseEdit, return_city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Return Pin Code
                  </label>
                  <input
                    type="text"
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                    value={warehouseEdit.return_pin}
                    onChange={(e) => setWarehouseEdit({ ...warehouseEdit, return_pin: e.target.value })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-warehouse-active"
                    checked={warehouseEdit.is_active}
                    onChange={(e) => setWarehouseEdit({ ...warehouseEdit, is_active: e.target.checked })}
                    className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                  />
                  <label htmlFor="edit-warehouse-active" className="text-sm text-gray-700">
                    Active Warehouse
                  </label>
                </div>
              </div>
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={() => handleEditWarehouse(selectedWarehouse?.id || '')}
                  disabled={warehouseEdit.loading}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {warehouseEdit.loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => {
                    setShowWarehouseEdit(false);
                    setSelectedWarehouse(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Create Warehouse */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Create New Warehouse</h2>
              <div className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded">
                <span className="font-medium">Tip:</span> All fields marked with * are required
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Warehouse Name *
                </label>
                <input
                  type="text"
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                  value={warehouseCreate.name}
                  onChange={(e) => setWarehouseCreate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter warehouse name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                  value={warehouseCreate.phone}
                  onChange={(e) => setWarehouseCreate(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="9876543210"
                  pattern="[0-9]{10}"
                  title="Enter a valid 10-digit Indian phone number"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                  value={warehouseCreate.email}
                  onChange={(e) => setWarehouseCreate(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="abc@gmail.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                  value={warehouseCreate.city}
                  onChange={(e) => setWarehouseCreate(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Kota"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Pin Code *
                </label>
                <input
                  type="text"
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                  value={warehouseCreate.pin}
                  onChange={(e) => setWarehouseCreate(prev => ({ ...prev, pin: e.target.value }))}
                  placeholder="400001"
                  pattern="[0-9]{6}"
                  title="Enter a valid 6-digit pin code"
                  maxLength={6}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                  value={warehouseCreate.country}
                  onChange={(e) => setWarehouseCreate(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="India"
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <textarea
                  rows={2}
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                  value={warehouseCreate.address}
                  onChange={(e) => setWarehouseCreate(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter warehouse address"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Registered Name
                </label>
                <input
                  type="text"
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                  value={warehouseCreate.registered_name}
                  onChange={(e) => setWarehouseCreate(prev => ({ ...prev, registered_name: e.target.value }))}
                  placeholder="registered_account_name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Return Pin Code
                </label>
                <input
                  type="text"
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                  value={warehouseCreate.return_pin}
                  onChange={(e) => setWarehouseCreate(prev => ({ ...prev, return_pin: e.target.value }))}
                  placeholder="110042"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Return City
                </label>
                <input
                  type="text"
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                  value={warehouseCreate.return_city}
                  onChange={(e) => setWarehouseCreate(prev => ({ ...prev, return_city: e.target.value }))}
                  placeholder="Kota"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Return State
                </label>
                <input
                  type="text"
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                  value={warehouseCreate.return_state}
                  onChange={(e) => setWarehouseCreate(prev => ({ ...prev, return_state: e.target.value }))}
                  placeholder="Delhi"
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Return Address
                </label>
                <textarea
                  rows={2}
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                  value={warehouseCreate.return_address}
                  onChange={(e) => setWarehouseCreate(prev => ({ ...prev, return_address: e.target.value }))}
                  placeholder="return_address"
                />
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={handleCreateWarehouse}
                disabled={warehouseCreate.loading}
                className="px-4 py-2 bg-pink-600 text-white text-sm rounded-md hover:bg-pink-700 disabled:opacity-50"
              >
                {warehouseCreate.loading ? 'Creating...' : 'Create Warehouse'}
              </button>
            </div>

            {warehouseCreate.result && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Warehouse Creation Result:</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">Status:</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      warehouseCreate.result.success 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {warehouseCreate.result.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {warehouseCreate.result.message}
                  </div>
                  {warehouseCreate.result.warehouse_id && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Warehouse ID:</span> {warehouseCreate.result.warehouse_id}
                    </div>
                  )}
                  {process.env.NODE_ENV === 'development' && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-500 cursor-pointer">Show Raw Response</summary>
                      <pre className="text-xs text-gray-600 overflow-auto mt-2 p-2 bg-white rounded border">
                        {JSON.stringify(warehouseCreate.result, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Edit Warehouse - Deprecated: Now using inline edit in warehouse list */}
          {false && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Edit Warehouse (Deprecated)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warehouse Name *
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  value={warehouseEdit.name}
                  onChange={(e) => setWarehouseEdit(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="registered_wh_name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  value={warehouseEdit.phone}
                  onChange={(e) => setWarehouseEdit(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="9988******"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  value={warehouseEdit.address}
                  onChange={(e) => setWarehouseEdit(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="HUDA Market, Gurugram, Haryana - 122001"
                />
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={handleEditWarehouse}
                disabled={warehouseEdit.loading}
                className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50"
              >
                {warehouseEdit.loading ? 'Updating...' : 'Update Warehouse'}
              </button>
            </div>

            {warehouseEdit.result && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Warehouse Update Result:</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">Status:</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      warehouseEdit.result.success 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {warehouseEdit.result.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {warehouseEdit.result.message}
                  </div>
                  {process.env.NODE_ENV === 'development' && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-500 cursor-pointer">Show Raw Response</summary>
                      <pre className="text-xs text-gray-600 overflow-auto mt-2 p-2 bg-white rounded border">
                        {JSON.stringify(warehouseEdit.result, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            )}
          </div>
          )}
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Advanced Shipment Creation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Client Name *
              </label>
              <input
                type="text"
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                value={advancedShipment.client}
                onChange={(e) => setAdvancedShipment(prev => ({ ...prev, client: e.target.value }))}
                placeholder="pass the registered client name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Order Number
              </label>
              <input
                type="text"
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                value={advancedShipment.order}
                onChange={(e) => setAdvancedShipment(prev => ({ ...prev, order: e.target.value }))}
                placeholder="1234567890"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                value={advancedShipment.name}
                onChange={(e) => setAdvancedShipment(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Jitendra Singh"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Customer Phone *
              </label>
              <input
                type="text"
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                value={advancedShipment.phone}
                onChange={(e) => setAdvancedShipment(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="1234567890"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Weight
              </label>
              <input
                type="text"
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                value={advancedShipment.weight}
                onChange={(e) => setAdvancedShipment(prev => ({ ...prev, weight: e.target.value }))}
                placeholder="150.0 gm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                value={advancedShipment.quantity}
                onChange={(e) => setAdvancedShipment(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                placeholder="1"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                value={advancedShipment.city}
                onChange={(e) => setAdvancedShipment(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Meerjapuram"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Pin Code
              </label>
              <input
                type="text"
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                value={advancedShipment.pin}
                onChange={(e) => setAdvancedShipment(prev => ({ ...prev, pin: e.target.value }))}
                placeholder="521111"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                value={advancedShipment.state}
                onChange={(e) => setAdvancedShipment(prev => ({ ...prev, state: e.target.value }))}
                placeholder="Andhra Pradesh"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Total Amount
              </label>
              <input
                type="number"
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                value={advancedShipment.total_amount}
                onChange={(e) => setAdvancedShipment(prev => ({ ...prev, total_amount: e.target.value }))}
                placeholder="749"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Shipping Mode
              </label>
              <select
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                value={advancedShipment.shipping_mode}
                onChange={(e) => setAdvancedShipment(prev => ({ ...prev, shipping_mode: e.target.value }))}
              >
                <option value="Express">Express</option>
                <option value="Surface">Surface</option>
                <option value="Air">Air</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Payment Mode
              </label>
              <select
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                value={advancedShipment.payment_mode}
                onChange={(e) => setAdvancedShipment(prev => ({ ...prev, payment_mode: e.target.value }))}
              >
                <option value="Prepaid">Prepaid</option>
                <option value="Pickup">Pickup</option>
                <option value="COD">COD</option>
              </select>
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Delivery Address
              </label>
              <textarea
                rows={2}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                value={advancedShipment.add}
                onChange={(e) => setAdvancedShipment(prev => ({ ...prev, add: e.target.value }))}
                placeholder="7 106 abc road, 2020 building"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Product Description
              </label>
              <textarea
                rows={2}
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                value={advancedShipment.products_desc}
                onChange={(e) => setAdvancedShipment(prev => ({ ...prev, products_desc: e.target.value }))}
                placeholder="NEW EI PIKOK (PURPAL-ORANGE)"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Pickup Location Name
              </label>
              <input
                type="text"
                className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-transparent"
                value={advancedShipment.pickup_location_name}
                onChange={(e) => setAdvancedShipment(prev => ({ ...prev, pickup_location_name: e.target.value }))}
                placeholder="pass the registered pickup WH name"
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={handleCreateAdvancedShipment}
              disabled={advancedShipment.loading}
              className="px-4 py-2 bg-pink-600 text-white text-sm rounded-md hover:bg-pink-700 disabled:opacity-50"
            >
              {advancedShipment.loading ? 'Creating...' : 'Create Advanced Shipment'}
            </button>
          </div>

          {advancedShipment.result && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Advanced Shipment Result:</h3>
              <pre className="text-sm text-gray-600 overflow-auto">
                {JSON.stringify(advancedShipment.result, null, 2)}
              </pre>
            </div>
          )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Shipping;
