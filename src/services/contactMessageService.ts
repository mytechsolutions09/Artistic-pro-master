import { supabase } from './supabaseService';

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  category: 'general' | 'order' | 'shipping' | 'returns' | 'technical' | 'billing';
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at?: string;
  updated_at?: string;
  admin_notes?: string;
  assigned_to?: string;
  response?: string;
  response_sent_at?: string;
}

export interface ContactMessageFilters {
  status?: string;
  category?: string;
  priority?: string;
  assigned_to?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export class ContactMessageService {
  /**
   * Submit a new contact message
   */
  static async submitMessage(messageData: Omit<ContactMessage, 'id' | 'status' | 'priority' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .insert([
          {
            name: messageData.name,
            email: messageData.email,
            subject: messageData.subject,
            message: messageData.message,
            category: messageData.category,
            status: 'new',
            priority: this.determinePriority(messageData.category, messageData.subject, messageData.message)
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error submitting contact message:', error);
        return { success: false, error: error.message };
      }

      // Send notification email to admin
      await this.sendNotificationEmail(data);

      return { success: true, messageId: data.id };
    } catch (error) {
      console.error('Error submitting contact message:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Get all contact messages with filters
   */
  static async getMessages(filters: ContactMessageFilters = {}): Promise<{ success: boolean; messages?: ContactMessage[]; error?: string }> {
    try {
      let query = supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to);
      }
      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,subject.ilike.%${filters.search}%,message.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching contact messages:', error);
        return { success: false, error: error.message };
      }

      return { success: true, messages: data || [] };
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Get a single contact message by ID
   */
  static async getMessageById(id: string): Promise<{ success: boolean; message?: ContactMessage; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching contact message:', error);
        return { success: false, error: error.message };
      }

      return { success: true, message: data };
    } catch (error) {
      console.error('Error fetching contact message:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Update a contact message
   */
  static async updateMessage(id: string, updates: Partial<ContactMessage>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating contact message:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating contact message:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Delete a contact message
   */
  static async deleteMessage(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting contact message:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting contact message:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Get message statistics
   */
  static async getMessageStats(): Promise<{ success: boolean; stats?: any; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('status, priority, category, created_at');

      if (error) {
        console.error('Error fetching message stats:', error);
        return { success: false, error: error.message };
      }

      const stats = {
        total: data.length,
        new: data.filter(m => m.status === 'new').length,
        in_progress: data.filter(m => m.status === 'in_progress').length,
        resolved: data.filter(m => m.status === 'resolved').length,
        closed: data.filter(m => m.status === 'closed').length,
        urgent: data.filter(m => m.priority === 'urgent').length,
        high: data.filter(m => m.priority === 'high').length,
        medium: data.filter(m => m.priority === 'medium').length,
        low: data.filter(m => m.priority === 'low').length,
        byCategory: {
          general: data.filter(m => m.category === 'general').length,
          order: data.filter(m => m.category === 'order').length,
          shipping: data.filter(m => m.category === 'shipping').length,
          returns: data.filter(m => m.category === 'returns').length,
          technical: data.filter(m => m.category === 'technical').length,
          billing: data.filter(m => m.category === 'billing').length,
        },
        today: data.filter(m => {
          const today = new Date().toISOString().split('T')[0];
          return m.created_at?.startsWith(today);
        }).length,
        thisWeek: data.filter(m => {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return new Date(m.created_at || '') > weekAgo;
        }).length
      };

      return { success: true, stats };
    } catch (error) {
      console.error('Error fetching message stats:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Determine message priority based on content
   */
  private static determinePriority(category: string, subject: string, message: string): 'low' | 'medium' | 'high' | 'urgent' {
    const urgentKeywords = ['urgent', 'emergency', 'asap', 'immediately', 'critical', 'broken', 'not working'];
    const highKeywords = ['important', 'priority', 'issue', 'problem', 'error', 'bug'];
    
    const content = `${subject} ${message}`.toLowerCase();
    
    if (urgentKeywords.some(keyword => content.includes(keyword))) {
      return 'urgent';
    }
    
    if (category === 'technical' || category === 'billing' || highKeywords.some(keyword => content.includes(keyword))) {
      return 'high';
    }
    
    if (category === 'order' || category === 'shipping') {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * Send notification email to admin
   */
  private static async sendNotificationEmail(message: ContactMessage): Promise<void> {
    try {
      // This would integrate with your email service
      // For now, we'll just log it
      console.log('New contact message notification:', {
        id: message.id,
        name: message.name,
        email: message.email,
        subject: message.subject,
        category: message.category,
        priority: message.priority
      });
      
      // TODO: Integrate with EmailService to send actual notification
    } catch (error) {
      console.error('Error sending notification email:', error);
    }
  }
}

export default ContactMessageService;
