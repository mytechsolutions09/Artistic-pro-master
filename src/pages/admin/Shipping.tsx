import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import ShippingSecondaryNav from '../../components/admin/ShippingSecondaryNav';
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
  Upload
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
import { NotificationManager } from '../../components/Notification';

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
}

const Shipping: React.FC = () => {
  const [activeTab, setActiveTab] = useState('shipments');
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

  // Pin code serviceability check
  const [pinCodeCheck, setPinCodeCheck] = useState({
    pinCode: '',
    result: null as DelhiveryPinCodeData | null,
    loading: false
  });

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
  const [newShipment, setNewShipment] = useState({
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
    products_desc: ''
  });

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
    result: null as any,
    loading: false
  });

  // Advanced shipment creation
  const [advancedShipment, setAdvancedShipment] = useState({
    client: '',
    return_name: 'ARVEX Store',
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
    order_date: new Date().toLocaleDateString('en-GB').split('/').reverse().join('-'),
    seller_gst_tin: '',
    name: '',
    return_add: '123 Art Street, Mumbai',
    total_amount: '',
    seller_name: 'ARVEX Store',
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
  }, []);

  const loadShipments = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockShipments: Shipment[] = [
        {
          id: '1',
          waybill: 'DL123456789',
          customer_name: 'John Doe',
          customer_phone: '+91 9876543210',
          delivery_address: '123 Main St, Mumbai',
          delivery_pincode: '400001',
          status: 'in_transit',
          created_at: '2024-01-15',
          estimated_delivery: '2024-01-18',
          cod_amount: 1500,
          weight: 0.5,
          tracking_url: 'https://track.delhivery.com/DL123456789'
        },
        {
          id: '2',
          waybill: 'DL987654321',
          customer_name: 'Jane Smith',
          customer_phone: '+91 8765432109',
          delivery_address: '456 Park Ave, Delhi',
          delivery_pincode: '110001',
          status: 'delivered',
          created_at: '2024-01-10',
          estimated_delivery: '2024-01-13',
          cod_amount: 2500,
          weight: 0.8,
          tracking_url: 'https://track.delhivery.com/DL987654321'
        }
      ];
      setShipments(mockShipments);
    } catch (error) {
      NotificationManager.error('Failed to load shipments');
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
      NotificationManager.success('Pincode serviceability checked successfully');
    } catch (error) {
      NotificationManager.error('Failed to check pincode serviceability');
    } finally {
      setPinCodeCheck(prev => ({ ...prev, loading: false }));
    }
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
      NotificationManager.success('Shipping rates calculated successfully');
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
        name: newShipment.customer_name,
        phone: newShipment.customer_phone,
        add: newShipment.delivery_address,
        pin: newShipment.delivery_pincode,
        city: newShipment.delivery_city,
        state: newShipment.delivery_state,
        country: 'India',
        return_name: 'ARVEX Store',
        return_add: '123 Art Street, Mumbai',
        return_phone: '+91 555 123 4567',
        return_pin: '400001',
        return_city: 'Mumbai',
        return_state: 'Maharashtra',
        return_country: 'India',
        products_desc: newShipment.products_desc,
        cod_amount: parseFloat(newShipment.cod_amount || '0'),
        weight: parseFloat(newShipment.weight),
        length: parseFloat(newShipment.length || '10'),
        width: parseFloat(newShipment.width || '10'),
        height: parseFloat(newShipment.height || '10'),
        pickup_date: new Date().toISOString().split('T')[0],
        payment_mode: newShipment.cod_amount ? 'COD' : 'Prepaid'
      };

      const result = await delhiveryService.createShipment(shipmentData);
      NotificationManager.success('Shipment created successfully');
      
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
        products_desc: ''
      });
      
      loadShipments();
    } catch (error) {
      NotificationManager.error('Failed to create shipment');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackShipment = async (waybill: string) => {
    try {
      const result = await delhiveryService.trackShipment(waybill);
      console.log('Tracking result:', result);
      NotificationManager.success('Shipment tracking information retrieved');
    } catch (error) {
      NotificationManager.error('Failed to track shipment');
    }
  };

  const handleCancelShipment = async (waybill: string) => {
    if (!confirm('Are you sure you want to cancel this shipment?')) return;

    try {
      await delhiveryService.cancelShipmentViaEdit(waybill);
      NotificationManager.success('Shipment cancelled successfully');
      loadShipments();
    } catch (error) {
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
      NotificationManager.success(`Generated ${waybills.length} waybills successfully`);
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
      NotificationManager.success('Expected TAT calculated successfully');
    } catch (error) {
      NotificationManager.error('Failed to calculate expected TAT');
    } finally {
      setExpectedTAT(prev => ({ ...prev, loading: false }));
    }
  };

  const handleRequestPickup = async () => {
    if (!pickupRequest.pickup_location || !pickupRequest.pickup_date) {
      NotificationManager.error('Please fill in all required fields');
      return;
    }

    setPickupRequest(prev => ({ ...prev, loading: true }));
    try {
      const result = await delhiveryService.requestPickup(pickupRequest);
      setPickupRequest(prev => ({ ...prev, result }));
      NotificationManager.success('Pickup request submitted successfully');
    } catch (error) {
      NotificationManager.error('Failed to request pickup');
    } finally {
      setPickupRequest(prev => ({ ...prev, loading: false }));
    }
  };

  const handleCreateWarehouse = async () => {
    if (!warehouseCreate.name || !warehouseCreate.phone || !warehouseCreate.address) {
      NotificationManager.error('Please fill in all required fields');
      return;
    }

    setWarehouseCreate(prev => ({ ...prev, loading: true }));
    try {
      const result = await delhiveryService.createWarehouseWithValidation(warehouseCreate);
      setWarehouseCreate(prev => ({ ...prev, result }));
      NotificationManager.success('Warehouse created successfully');
      
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
        return_country: 'India'
      }));
    } catch (error) {
      NotificationManager.error('Failed to create warehouse');
    } finally {
      setWarehouseCreate(prev => ({ ...prev, loading: false }));
    }
  };

  const handleEditWarehouse = async () => {
    if (!warehouseEdit.name || !warehouseEdit.phone || !warehouseEdit.address) {
      NotificationManager.error('Please fill in all required fields');
      return;
    }

    setWarehouseEdit(prev => ({ ...prev, loading: true }));
    try {
      const result = await delhiveryService.editWarehouseWithValidation(warehouseEdit);
      setWarehouseEdit(prev => ({ ...prev, result }));
      NotificationManager.success('Warehouse updated successfully');
    } catch (error) {
      NotificationManager.error('Failed to update warehouse');
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
      NotificationManager.success('Advanced shipment created successfully');
    } catch (error) {
      NotificationManager.error('Failed to create advanced shipment');
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shipping Management</h1>
          <p className="text-gray-600">Manage shipments, check serviceability, and calculate rates with Delhivery</p>
        </div>

      {/* Tab Content */}
      {activeTab === 'shipments' && (
        <div>
          {/* Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Waybill
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      COD Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredShipments.map((shipment) => (
                    <tr key={shipment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{shipment.waybill}</div>
                        <div className="text-sm text-gray-500">{shipment.created_at}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{shipment.customer_name}</div>
                        <div className="text-sm text-gray-500">{shipment.customer_phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{shipment.delivery_address}</div>
                        <div className="text-sm text-gray-500">{shipment.delivery_pincode}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                          {getStatusIcon(shipment.status)}
                          <span className="ml-1 capitalize">{shipment.status.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Rs {shipment.cod_amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
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
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Pin Code Serviceability Check</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pin Code
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Enter pin code"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  value={pinCodeCheck.pinCode}
                  onChange={(e) => setPinCodeCheck(prev => ({ ...prev, pinCode: e.target.value }))}
                />
                <button
                  onClick={handlePinCodeCheck}
                  disabled={pinCodeCheck.loading}
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50"
                >
                  {pinCodeCheck.loading ? 'Checking...' : 'Check'}
                </button>
              </div>
            </div>

            {pinCodeCheck.result && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Serviceability Result:</h3>
                <pre className="text-sm text-gray-600 overflow-auto">
                  {JSON.stringify(pinCodeCheck.result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'rates' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Rate Calculator</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pickup Pin Code
              </label>
              <input
                type="text"
                placeholder="400001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={rateCalculation.pickupPincode}
                onChange={(e) => setRateCalculation(prev => ({ ...prev, pickupPincode: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Pin Code
              </label>
              <input
                type="text"
                placeholder="110001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={rateCalculation.deliveryPincode}
                onChange={(e) => setRateCalculation(prev => ({ ...prev, deliveryPincode: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="0.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={rateCalculation.weight}
                onChange={(e) => setRateCalculation(prev => ({ ...prev, weight: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                COD Amount (Rs)
              </label>
              <input
                type="number"
                placeholder="1500"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={rateCalculation.codAmount}
                onChange={(e) => setRateCalculation(prev => ({ ...prev, codAmount: e.target.value }))}
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={handleRateCalculation}
              disabled={rateCalculation.loading}
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50"
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
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Shipment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={newShipment.customer_name}
                onChange={(e) => setNewShipment(prev => ({ ...prev, customer_name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Phone *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={newShipment.customer_phone}
                onChange={(e) => setNewShipment(prev => ({ ...prev, customer_phone: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Address *
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={newShipment.delivery_address}
                onChange={(e) => setNewShipment(prev => ({ ...prev, delivery_address: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pin Code
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={newShipment.delivery_pincode}
                onChange={(e) => setNewShipment(prev => ({ ...prev, delivery_pincode: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={newShipment.delivery_city}
                onChange={(e) => setNewShipment(prev => ({ ...prev, delivery_city: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={newShipment.delivery_state}
                onChange={(e) => setNewShipment(prev => ({ ...prev, delivery_state: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={newShipment.weight}
                onChange={(e) => setNewShipment(prev => ({ ...prev, weight: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                COD Amount (Rs)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={newShipment.cod_amount}
                onChange={(e) => setNewShipment(prev => ({ ...prev, cod_amount: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Length (cm)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={newShipment.length}
                onChange={(e) => setNewShipment(prev => ({ ...prev, length: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Width (cm)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={newShipment.width}
                onChange={(e) => setNewShipment(prev => ({ ...prev, width: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Height (cm)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={newShipment.height}
                onChange={(e) => setNewShipment(prev => ({ ...prev, height: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Description
              </label>
              <textarea
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={newShipment.products_desc}
                onChange={(e) => setNewShipment(prev => ({ ...prev, products_desc: e.target.value }))}
              />
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={handleCreateShipment}
              disabled={loading}
              className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Shipment'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'waybills' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Generate Waybills</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Waybills
              </label>
              <input
                type="number"
                min="1"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={waybillGeneration.count}
                onChange={(e) => setWaybillGeneration(prev => ({ ...prev, count: e.target.value }))}
                placeholder="Enter number of waybills to generate"
              />
            </div>
            <button
              onClick={handleGenerateWaybills}
              disabled={waybillGeneration.loading}
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50"
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
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Expected TAT Calculator</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Origin Pin Code
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={expectedTAT.origin_pin}
                onChange={(e) => setExpectedTAT(prev => ({ ...prev, origin_pin: e.target.value }))}
                placeholder="e.g., 122003"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination Pin Code
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={expectedTAT.destination_pin}
                onChange={(e) => setExpectedTAT(prev => ({ ...prev, destination_pin: e.target.value }))}
                placeholder="e.g., 136118"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mode of Transport
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={expectedTAT.mot}
                onChange={(e) => setExpectedTAT(prev => ({ ...prev, mot: e.target.value }))}
              >
                <option value="S">Surface</option>
                <option value="A">Air</option>
                <option value="R">Rail</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Type
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={expectedTAT.pdt}
                onChange={(e) => setExpectedTAT(prev => ({ ...prev, pdt: e.target.value }))}
              >
                <option value="B2C">B2C</option>
                <option value="B2B">B2B</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Pickup Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={expectedTAT.expected_pickup_date}
                onChange={(e) => setExpectedTAT(prev => ({ ...prev, expected_pickup_date: e.target.value }))}
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={handleCalculateTAT}
              disabled={expectedTAT.loading}
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50"
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
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Request Pickup</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pickup Location *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={pickupRequest.pickup_location}
                onChange={(e) => setPickupRequest(prev => ({ ...prev, pickup_location: e.target.value }))}
                placeholder="warehouse_name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pickup Date *
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={pickupRequest.pickup_date}
                onChange={(e) => setPickupRequest(prev => ({ ...prev, pickup_date: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pickup Time
              </label>
              <input
                type="time"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={pickupRequest.pickup_time}
                onChange={(e) => setPickupRequest(prev => ({ ...prev, pickup_time: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Package Count
              </label>
              <input
                type="number"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={pickupRequest.expected_package_count}
                onChange={(e) => setPickupRequest(prev => ({ ...prev, expected_package_count: parseInt(e.target.value) }))}
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={handleRequestPickup}
              disabled={pickupRequest.loading}
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50"
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
      )}

      {activeTab === 'warehouse' && (
        <div className="space-y-6">
          {/* Create Warehouse */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Warehouse</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warehouse Name *
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  value={warehouseCreate.name}
                  onChange={(e) => setWarehouseCreate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter warehouse name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  value={warehouseCreate.phone}
                  onChange={(e) => setWarehouseCreate(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="9999999999"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  value={warehouseCreate.email}
                  onChange={(e) => setWarehouseCreate(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="abc@gmail.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  value={warehouseCreate.city}
                  onChange={(e) => setWarehouseCreate(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Kota"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pin Code *
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  value={warehouseCreate.pin}
                  onChange={(e) => setWarehouseCreate(prev => ({ ...prev, pin: e.target.value }))}
                  placeholder="110042"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  value={warehouseCreate.country}
                  onChange={(e) => setWarehouseCreate(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="India"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  value={warehouseCreate.address}
                  onChange={(e) => setWarehouseCreate(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter warehouse address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registered Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  value={warehouseCreate.registered_name}
                  onChange={(e) => setWarehouseCreate(prev => ({ ...prev, registered_name: e.target.value }))}
                  placeholder="registered_account_name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Return Pin Code
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  value={warehouseCreate.return_pin}
                  onChange={(e) => setWarehouseCreate(prev => ({ ...prev, return_pin: e.target.value }))}
                  placeholder="110042"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Return City
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  value={warehouseCreate.return_city}
                  onChange={(e) => setWarehouseCreate(prev => ({ ...prev, return_city: e.target.value }))}
                  placeholder="Kota"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Return State
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  value={warehouseCreate.return_state}
                  onChange={(e) => setWarehouseCreate(prev => ({ ...prev, return_state: e.target.value }))}
                  placeholder="Delhi"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Return Address
                </label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  value={warehouseCreate.return_address}
                  onChange={(e) => setWarehouseCreate(prev => ({ ...prev, return_address: e.target.value }))}
                  placeholder="return_address"
                />
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={handleCreateWarehouse}
                disabled={warehouseCreate.loading}
                className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50"
              >
                {warehouseCreate.loading ? 'Creating...' : 'Create Warehouse'}
              </button>
            </div>

            {warehouseCreate.result && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Warehouse Creation Result:</h3>
                <pre className="text-sm text-gray-600 overflow-auto">
                  {JSON.stringify(warehouseCreate.result, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Edit Warehouse */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Edit Warehouse</h2>
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
                <pre className="text-sm text-gray-600 overflow-auto">
                  {JSON.stringify(warehouseEdit.result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'advanced' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Advanced Shipment Creation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Name *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={advancedShipment.client}
                onChange={(e) => setAdvancedShipment(prev => ({ ...prev, client: e.target.value }))}
                placeholder="pass the registered client name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Number
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={advancedShipment.order}
                onChange={(e) => setAdvancedShipment(prev => ({ ...prev, order: e.target.value }))}
                placeholder="1234567890"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={advancedShipment.name}
                onChange={(e) => setAdvancedShipment(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Jitendra Singh"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Phone *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={advancedShipment.phone}
                onChange={(e) => setAdvancedShipment(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="1234567890"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={advancedShipment.weight}
                onChange={(e) => setAdvancedShipment(prev => ({ ...prev, weight: e.target.value }))}
                placeholder="150.0 gm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={advancedShipment.quantity}
                onChange={(e) => setAdvancedShipment(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                placeholder="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={advancedShipment.city}
                onChange={(e) => setAdvancedShipment(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Meerjapuram"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pin Code
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={advancedShipment.pin}
                onChange={(e) => setAdvancedShipment(prev => ({ ...prev, pin: e.target.value }))}
                placeholder="521111"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={advancedShipment.state}
                onChange={(e) => setAdvancedShipment(prev => ({ ...prev, state: e.target.value }))}
                placeholder="Andhra Pradesh"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Amount
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={advancedShipment.total_amount}
                onChange={(e) => setAdvancedShipment(prev => ({ ...prev, total_amount: e.target.value }))}
                placeholder="749"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shipping Mode
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={advancedShipment.shipping_mode}
                onChange={(e) => setAdvancedShipment(prev => ({ ...prev, shipping_mode: e.target.value }))}
              >
                <option value="Express">Express</option>
                <option value="Surface">Surface</option>
                <option value="Air">Air</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Mode
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={advancedShipment.payment_mode}
                onChange={(e) => setAdvancedShipment(prev => ({ ...prev, payment_mode: e.target.value }))}
              >
                <option value="Prepaid">Prepaid</option>
                <option value="Pickup">Pickup</option>
                <option value="COD">COD</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Address
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={advancedShipment.add}
                onChange={(e) => setAdvancedShipment(prev => ({ ...prev, add: e.target.value }))}
                placeholder="7 106 abc road, 2020 building"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Description
              </label>
              <textarea
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={advancedShipment.products_desc}
                onChange={(e) => setAdvancedShipment(prev => ({ ...prev, products_desc: e.target.value }))}
                placeholder="NEW EI PIKOK (PURPAL-ORANGE)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pickup Location Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={advancedShipment.pickup_location_name}
                onChange={(e) => setAdvancedShipment(prev => ({ ...prev, pickup_location_name: e.target.value }))}
                placeholder="pass the registered pickup WH name"
              />
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={handleCreateAdvancedShipment}
              disabled={advancedShipment.loading}
              className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50"
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
