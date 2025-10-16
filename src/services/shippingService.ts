import { supabase } from './supabaseService';

// ============================================
// WAREHOUSE OPERATIONS
// ============================================

export interface Warehouse {
  id?: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  pin: string;
  address: string;
  country: string;
  registered_name?: string;
  return_address?: string;
  return_pin?: string;
  return_city?: string;
  return_state?: string;
  return_country?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Shipment {
  id?: string;
  waybill: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_address: string;
  delivery_pincode: string;
  delivery_city: string;
  delivery_state: string;
  delivery_country?: string;
  return_name?: string;
  return_address?: string;
  return_phone?: string;
  return_pincode?: string;
  return_city?: string;
  return_state?: string;
  return_country?: string;
  products_desc?: string;
  cod_amount?: number;
  weight: number;
  length?: number;
  width?: number;
  height?: number;
  status?: 'pending' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled' | 'returned';
  payment_mode?: 'Prepaid' | 'COD' | 'Pickup';
  shipping_mode?: 'Express' | 'Surface' | 'Air';
  tracking_url?: string;
  estimated_delivery?: string;
  actual_delivery_date?: string;
  delhivery_waybill?: string;
  delhivery_status?: string;
  delhivery_tracking_data?: any;
  pickup_date?: string;
  order_id?: string;
  warehouse_id?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PinCodeCheck {
  id?: string;
  pin_code: string;
  city?: string;
  state?: string;
  serviceable: boolean;
  hub_code?: string;
  hub_name?: string;
  zone?: string;
  services?: any;
  check_result?: any;
  checked_at?: string;
  checked_by?: string;
}

class ShippingService {
  // ============================================
  // WAREHOUSE METHODS
  // ============================================

  async getAllWarehouses(): Promise<Warehouse[]> {
    try {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      throw error;
    }
  }

  async getActiveWarehouses(): Promise<Warehouse[]> {
    try {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching active warehouses:', error);
      throw error;
    }
  }

  async getWarehouseById(id: string): Promise<Warehouse | null> {
    try {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching warehouse:', error);
      throw error;
    }
  }

  async createWarehouse(warehouse: Warehouse): Promise<Warehouse> {
    try {
      const { data, error } = await supabase
        .from('warehouses')
        .insert([{
          name: warehouse.name,
          phone: warehouse.phone,
          email: warehouse.email,
          city: warehouse.city,
          pin: warehouse.pin,
          address: warehouse.address,
          country: warehouse.country || 'India',
          registered_name: warehouse.registered_name,
          return_address: warehouse.return_address,
          return_pin: warehouse.return_pin,
          return_city: warehouse.return_city,
          return_state: warehouse.return_state,
          return_country: warehouse.return_country || 'India',
          is_active: warehouse.is_active !== undefined ? warehouse.is_active : true
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating warehouse:', error);
      throw error;
    }
  }

  async updateWarehouse(id: string, warehouse: Partial<Warehouse>): Promise<Warehouse> {
    try {
      const { data, error } = await supabase
        .from('warehouses')
        .update(warehouse)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating warehouse:', error);
      throw error;
    }
  }

  async deleteWarehouse(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('warehouses')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      throw error;
    }
  }

  async toggleWarehouseStatus(id: string, isActive: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from('warehouses')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error toggling warehouse status:', error);
      throw error;
    }
  }

  // ============================================
  // SHIPMENT METHODS
  // ============================================

  async getAllShipments(): Promise<Shipment[]> {
    try {
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching shipments:', error);
      throw error;
    }
  }

  async getShipmentsByStatus(status: string): Promise<Shipment[]> {
    try {
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching shipments by status:', error);
      throw error;
    }
  }

  async getShipmentByWaybill(waybill: string): Promise<Shipment | null> {
    try {
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .eq('waybill', waybill)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching shipment:', error);
      return null;
    }
  }

  async createShipment(shipment: Shipment): Promise<Shipment> {
    try {
      const { data, error } = await supabase
        .from('shipments')
        .insert([{
          waybill: shipment.waybill,
          customer_name: shipment.customer_name,
          customer_phone: shipment.customer_phone,
          customer_email: shipment.customer_email,
          delivery_address: shipment.delivery_address,
          delivery_pincode: shipment.delivery_pincode,
          delivery_city: shipment.delivery_city,
          delivery_state: shipment.delivery_state,
          delivery_country: shipment.delivery_country || 'India',
          return_name: shipment.return_name,
          return_address: shipment.return_address,
          return_phone: shipment.return_phone,
          return_pincode: shipment.return_pincode,
          return_city: shipment.return_city,
          return_state: shipment.return_state,
          return_country: shipment.return_country || 'India',
          products_desc: shipment.products_desc,
          cod_amount: shipment.cod_amount || 0,
          weight: shipment.weight,
          length: shipment.length,
          width: shipment.width,
          height: shipment.height,
          status: shipment.status || 'pending',
          payment_mode: shipment.payment_mode || 'Prepaid',
          shipping_mode: shipment.shipping_mode || 'Express',
          tracking_url: shipment.tracking_url,
          estimated_delivery: shipment.estimated_delivery,
          pickup_date: shipment.pickup_date,
          order_id: shipment.order_id,
          warehouse_id: shipment.warehouse_id,
          notes: shipment.notes,
          delhivery_waybill: shipment.delhivery_waybill,
          delhivery_status: shipment.delhivery_status,
          delhivery_tracking_data: shipment.delhivery_tracking_data
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating shipment:', error);
      throw error;
    }
  }

  async updateShipment(waybill: string, updates: Partial<Shipment>): Promise<Shipment> {
    try {
      const { data, error } = await supabase
        .from('shipments')
        .update(updates)
        .eq('waybill', waybill)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating shipment:', error);
      throw error;
    }
  }

  async updateShipmentStatus(waybill: string, status: Shipment['status']): Promise<void> {
    try {
      const { error } = await supabase
        .from('shipments')
        .update({ status })
        .eq('waybill', waybill);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating shipment status:', error);
      throw error;
    }
  }

  async deleteShipment(waybill: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('shipments')
        .delete()
        .eq('waybill', waybill);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting shipment:', error);
      throw error;
    }
  }

  async getShipmentsByOrderId(orderId: string): Promise<Shipment[]> {
    try {
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching shipments by order:', error);
      throw error;
    }
  }

  // ============================================
  // PIN CODE CHECK METHODS
  // ============================================

  async savePinCodeCheck(pinCheck: PinCodeCheck): Promise<void> {
    try {
      const { error } = await supabase
        .from('pin_code_checks')
        .insert([{
          pin_code: pinCheck.pin_code,
          city: pinCheck.city,
          state: pinCheck.state,
          serviceable: pinCheck.serviceable,
          hub_code: pinCheck.hub_code,
          hub_name: pinCheck.hub_name,
          zone: pinCheck.zone,
          services: pinCheck.services,
          check_result: pinCheck.check_result,
          checked_by: pinCheck.checked_by
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving pin code check:', error);
      // Don't throw - pin code check history is optional
    }
  }

  async getPinCodeHistory(limit: number = 50): Promise<PinCodeCheck[]> {
    try {
      const { data, error } = await supabase
        .from('pin_code_checks')
        .select('*')
        .order('checked_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching pin code history:', error);
      return [];
    }
  }

  // ============================================
  // SEARCH AND FILTER METHODS
  // ============================================

  async searchShipments(query: string): Promise<Shipment[]> {
    try {
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .or(`waybill.ilike.%${query}%,customer_name.ilike.%${query}%,customer_phone.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching shipments:', error);
      throw error;
    }
  }

  async searchWarehouses(query: string): Promise<Warehouse[]> {
    try {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .or(`name.ilike.%${query}%,city.ilike.%${query}%,pin.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching warehouses:', error);
      throw error;
    }
  }

  // ============================================
  // STATISTICS METHODS
  // ============================================

  async getShipmentStats(): Promise<{
    total: number;
    pending: number;
    picked_up: number;
    in_transit: number;
    delivered: number;
    cancelled: number;
  }> {
    try {
      const { data: all, error: allError } = await supabase
        .from('shipments')
        .select('status', { count: 'exact', head: true });

      if (allError) throw allError;

      const { data: pending } = await supabase
        .from('shipments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { data: pickedUp } = await supabase
        .from('shipments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'picked_up');

      const { data: inTransit } = await supabase
        .from('shipments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'in_transit');

      const { data: delivered } = await supabase
        .from('shipments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'delivered');

      const { data: cancelled } = await supabase
        .from('shipments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'cancelled');

      return {
        total: all?.length || 0,
        pending: pending?.length || 0,
        picked_up: pickedUp?.length || 0,
        in_transit: inTransit?.length || 0,
        delivered: delivered?.length || 0,
        cancelled: cancelled?.length || 0
      };
    } catch (error) {
      console.error('Error fetching shipment stats:', error);
      return {
        total: 0,
        pending: 0,
        picked_up: 0,
        in_transit: 0,
        delivered: 0,
        cancelled: 0
      };
    }
  }
}

export const shippingService = new ShippingService();

