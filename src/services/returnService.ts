import { supabase } from './supabaseService';
import { delhiveryService, ReturnPickupRequest, ReturnPickupResponse, ReturnTrackingInfo } from './DelhiveryService';
import { EmailService } from './emailService';

export interface ReturnRequest {
  orderId: string;
  itemId: string;
  reason: string;
  customerNotes?: string;
  requestedBy: string; // customer email or user ID
}

export interface ReturnRequestData {
  id: string;
  order_id: string;
  order_item_id: string;
  product_id: string;
  product_title: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  reason: string;
  customer_notes?: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  requested_by: string;
  requested_at: string;
  processed_at?: string;
  admin_notes?: string;
  refund_amount?: number;
  refund_method?: string;
}

export interface ReturnResult {
  success: boolean;
  returnId?: string;
  error?: string;
}

export class ReturnService {
  
  /**
   * Check if an order item is eligible for return
   */
  static async isEligibleForReturn(orderId: string, itemId: string): Promise<{ eligible: boolean; reason?: string }> {
    try {
      // Get order and item details
      const { data: orderItem, error } = await supabase
        .from('order_items')
        .select(`
          *,
          orders!inner(
            id,
            status,
            created_at,
            customer_email
          )
        `)
        .eq('order_id', orderId)
        .eq('id', itemId)
        .single();

      if (error || !orderItem) {
        return { eligible: false, reason: 'Order item not found' };
      }

      const order = orderItem.orders;
      
      // Check if order is completed
      if (order.status !== 'completed') {
        return { eligible: false, reason: 'Order must be completed before return' };
      }

      // Check if it's within 30 days
      const orderDate = new Date(order.created_at);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      if (orderDate < sevenDaysAgo) {
        return { eligible: false, reason: 'Return window has expired (7 days)' };
      }

      // Check if product type is digital (digital products are not returnable)
      if (orderItem.selected_product_type === 'digital') {
        return { eligible: false, reason: 'Digital products are not eligible for return' };
      }

      // Check if there's already a pending or approved return
      try {
        const { data: existingReturn } = await supabase
          .from('return_requests')
          .select('id, status')
          .eq('order_item_id', itemId)
          .in('status', ['pending', 'approved', 'processing'])
          .single();

        if (existingReturn) {
          return { eligible: false, reason: 'Return request already exists for this item' };
        }
      } catch (tableError) {
        // If return_requests table doesn't exist yet, skip this check
        console.log('Return requests table not available yet, skipping duplicate check');
      }

      return { eligible: true };
    } catch (error) {
      console.error('Error checking return eligibility:', error);
      return { eligible: false, reason: 'Error checking eligibility' };
    }
  }

  /**
   * Create a return request
   */
  static async createReturnRequest(request: ReturnRequest): Promise<ReturnResult> {
    try {
      // First check eligibility
      const eligibility = await this.isEligibleForReturn(request.orderId, request.itemId);
      if (!eligibility.eligible) {
        return { success: false, error: eligibility.reason };
      }

      // Get order item details
      const { data: orderItem, error: itemError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', request.orderId)
        .eq('id', request.itemId)
        .single();

      if (itemError || !orderItem) {
        return { success: false, error: 'Order item not found' };
      }

      // Create return request
      try {
        const { data: returnRequest, error: returnError } = await supabase
          .from('return_requests')
          .insert({
            order_id: request.orderId,
            order_item_id: request.itemId,
            product_id: orderItem.product_id,
            product_title: orderItem.product_title,
            quantity: orderItem.quantity,
            unit_price: orderItem.unit_price,
            total_price: orderItem.total_price,
            reason: request.reason,
            customer_notes: request.customerNotes,
            status: 'pending',
            requested_by: request.requestedBy || 'anonymous'
          })
          .select()
          .single();

        if (returnError) {
          console.error('Error creating return request:', returnError);
          return { success: false, error: 'Failed to create return request. Please ensure the return system is properly set up.' };
        }

        // Send email notification to returns@lurevi.in
        try {
          // Get order details for customer name
          const { data: orderData } = await supabase
            .from('orders')
            .select('customer_name, customer_email')
            .eq('id', request.orderId)
            .single();

          await EmailService.sendReturnRequestNotification({
            returnId: returnRequest.id,
            orderId: request.orderId,
            customerName: orderData?.customer_name || 'Customer',
            customerEmail: orderData?.customer_email || request.requestedBy,
            productTitle: orderItem.product_title,
            quantity: orderItem.quantity,
            totalPrice: orderItem.total_price,
            reason: request.reason,
            customerNotes: request.customerNotes || '',
            requestDate: new Date().toLocaleString('en-IN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          });
          console.log('✅ Return request notification email sent to returns@lurevi.in');
        } catch (emailError) {
          console.error('⚠️ Failed to send return notification email:', emailError);
          // Don't fail the return creation if email fails
        }

        return { success: true, returnId: returnRequest.id };
      } catch (tableError) {
        console.error('Return requests table not available:', tableError);
        return { success: false, error: 'Return system is not yet available. Please contact support.' };
      }
    } catch (error) {
      console.error('Error in createReturnRequest:', error);
      return { success: false, error: 'Internal error creating return request' };
    }
  }

  /**
   * Get return requests for a customer
   */
  static async getCustomerReturns(customerEmail: string): Promise<ReturnRequestData[]> {
    try {
      console.log('Querying returns for email:', customerEmail);
      const { data, error } = await supabase
        .from('return_requests')
        .select('*')
        .eq('requested_by', customerEmail)
        .order('requested_at', { ascending: false });

      if (error) {
        console.error('Error fetching customer returns:', error);
        return [];
      }

      console.log('Database returned:', data);
      return data || [];
    } catch (error) {
      console.error('Error in getCustomerReturns:', error);
      return [];
    }
  }

  /**
   * Get return requests for admin (all returns)
   */
  static async getAllReturns(): Promise<ReturnRequestData[]> {
    try {
      const { data, error } = await supabase
        .from('return_requests')
        .select('*')
        .order('requested_at', { ascending: false });

      if (error) {
        console.error('Error fetching all returns:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllReturns:', error);
      return [];
    }
  }

  /**
   * Update return request status (admin function)
   */
  static async updateReturnStatus(
    returnId: string, 
    status: 'approved' | 'rejected' | 'processing' | 'completed',
    adminNotes?: string,
    refundAmount?: number,
    refundMethod?: string
  ): Promise<ReturnResult> {
    try {
      const updateData: any = {
        status,
        processed_at: new Date().toISOString()
      };

      if (adminNotes) updateData.admin_notes = adminNotes;
      if (refundAmount) updateData.refund_amount = refundAmount;
      if (refundMethod) updateData.refund_method = refundMethod;

      const { error } = await supabase
        .from('return_requests')
        .update(updateData)
        .eq('id', returnId);

      if (error) {
        console.error('Error updating return status:', error);
        return { success: false, error: 'Failed to update return status' };
      }

      // If status is completed, update the original order item status
      if (status === 'completed') {
        const { data: returnRequest } = await supabase
          .from('return_requests')
          .select('order_item_id')
          .eq('id', returnId)
          .single();

        if (returnRequest) {
          // Mark the order item as returned
          await supabase
            .from('order_items')
            .update({ status: 'returned' })
            .eq('id', returnRequest.order_item_id);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error in updateReturnStatus:', error);
      return { success: false, error: 'Internal error updating return status' };
    }
  }

  /**
   * Get return request by ID
   */
  static async getReturnById(returnId: string): Promise<ReturnRequestData | null> {
    try {
      const { data, error } = await supabase
        .from('return_requests')
        .select('*')
        .eq('id', returnId)
        .single();

      if (error) {
        console.error('Error fetching return by ID:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getReturnById:', error);
      return null;
    }
  }

  /**
   * Schedule return pickup with Delhivery
   */
  static async scheduleReturnPickup(
    returnId: string,
    customerDetails: {
      name: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      pincode: string;
    },
    pickupPreferences: {
      date: string;
      timeSlot: string;
      specialInstructions?: string;
    }
  ): Promise<{ success: boolean; trackingNumber?: string; error?: string }> {
    try {
      // Get return request details
      const returnRequest = await this.getReturnById(returnId);
      if (!returnRequest) {
        return { success: false, error: 'Return request not found' };
      }

      // Prepare Delhivery pickup request
      const delhiveryRequest: ReturnPickupRequest = {
        order_id: returnRequest.order_id,
        return_request_id: returnId,
        customer_name: customerDetails.name,
        customer_phone: customerDetails.phone,
        customer_address: customerDetails.address,
        customer_city: customerDetails.city,
        customer_state: customerDetails.state,
        customer_pincode: customerDetails.pincode,
        product_name: returnRequest.product_title,
        product_description: `${returnRequest.product_title} - Return Request`,
        quantity: returnRequest.quantity,
        weight: 0.5, // Default weight, should be calculated based on product
        return_reason: returnRequest.reason,
        pickup_date: pickupPreferences.date,
        pickup_time_slot: pickupPreferences.timeSlot,
        special_instructions: pickupPreferences.specialInstructions
      };

      // Schedule pickup with Delhivery
      const pickupResponse: ReturnPickupResponse = await delhiveryService.scheduleReturnPickup(delhiveryRequest);

      if (pickupResponse.success && pickupResponse.tracking_number) {
        // Update return request with tracking information
        await supabase
          .from('return_requests')
          .update({
            status: 'processing',
            admin_notes: `Pickup scheduled with tracking: ${pickupResponse.tracking_number}. Pickup date: ${pickupResponse.estimated_pickup_date}`,
            processed_at: new Date().toISOString()
          })
          .eq('id', returnId);

        return {
          success: true,
          trackingNumber: pickupResponse.tracking_number
        };
      } else {
        return {
          success: false,
          error: pickupResponse.error || 'Failed to schedule pickup'
        };
      }
    } catch (error) {
      console.error('Error scheduling return pickup:', error);
      return {
        success: false,
        error: 'Failed to schedule return pickup'
      };
    }
  }

  /**
   * Track return pickup status
   */
  static async trackReturnPickup(trackingNumber: string): Promise<ReturnTrackingInfo | null> {
    try {
      const trackingInfo = await delhiveryService.trackReturnPickup(trackingNumber);
      return trackingInfo;
    } catch (error) {
      console.error('Error tracking return pickup:', error);
      return null;
    }
  }

  /**
   * Cancel return pickup
   */
  static async cancelReturnPickup(returnId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get return request to find pickup ID
      const returnRequest = await this.getReturnById(returnId);
      if (!returnRequest) {
        return { success: false, error: 'Return request not found' };
      }

      // Extract pickup ID from admin notes (this should be improved with a dedicated field)
      const pickupIdMatch = returnRequest.admin_notes?.match(/Pickup ID: ([A-Z0-9]+)/);
      if (!pickupIdMatch) {
        return { success: false, error: 'Pickup ID not found' };
      }

      const pickupId = pickupIdMatch[1];
      const cancelResponse = await delhiveryService.cancelReturnPickup(pickupId);

      if (cancelResponse.success) {
        // Update return request status
        await supabase
          .from('return_requests')
          .update({
            status: 'rejected',
            admin_notes: `${returnRequest.admin_notes}\nPickup cancelled on ${new Date().toISOString()}`,
            processed_at: new Date().toISOString()
          })
          .eq('id', returnId);

        return { success: true };
      } else {
        return { success: false, error: cancelResponse.error };
      }
    } catch (error) {
      console.error('Error cancelling return pickup:', error);
      return { success: false, error: 'Failed to cancel pickup' };
    }
  }

  /**
   * Get available pickup time slots
   */
  static async getPickupTimeSlots(pincode: string, date: string): Promise<string[]> {
    try {
      return await delhiveryService.getReturnPickupTimeSlots(pincode, date);
    } catch (error) {
      console.error('Error getting pickup time slots:', error);
      return [
        '9:00 AM - 12:00 PM',
        '12:00 PM - 3:00 PM',
        '3:00 PM - 6:00 PM',
        '6:00 PM - 9:00 PM'
      ];
    }
  }

  /**
   * Update return status based on Delhivery tracking
   */
  static async updateReturnStatusFromTracking(trackingNumber: string): Promise<{ success: boolean; error?: string }> {
    try {
      const trackingInfo = await this.trackReturnPickup(trackingNumber);
      if (!trackingInfo) {
        return { success: false, error: 'Unable to fetch tracking information' };
      }

      // Find return request by tracking number in admin notes
      const { data: returnRequest } = await supabase
        .from('return_requests')
        .select('*')
        .like('admin_notes', `%${trackingNumber}%`)
        .single();

      if (!returnRequest) {
        return { success: false, error: 'Return request not found for tracking number' };
      }

      // Map tracking status to return status
      let newStatus = returnRequest.status;
      switch (trackingInfo.status) {
        case 'picked_up':
          newStatus = 'processing';
          break;
        case 'delivered_to_warehouse':
          newStatus = 'processing';
          break;
        case 'processed':
          newStatus = 'completed';
          break;
      }

      // Update return request if status changed
      if (newStatus !== returnRequest.status) {
        await supabase
          .from('return_requests')
          .update({
            status: newStatus,
            admin_notes: `${returnRequest.admin_notes}\nStatus updated from tracking: ${trackingInfo.status} at ${new Date().toISOString()}`
          })
          .eq('id', returnRequest.id);
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating return status from tracking:', error);
      return { success: false, error: 'Failed to update status from tracking' };
    }
  }
}
