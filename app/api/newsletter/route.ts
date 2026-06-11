import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email address is required.' },
        { status: 400 }
      );
    }

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration is missing on the server.');
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Try to insert the email.
    // If it's unsubscribed, we might want to update it to 'subscribed'.
    // Let's do an upsert or check if it exists first.
    const { data: existing, error: findError } = await supabase
      .from('newsletter_subscribers')
      .select('id, status')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (findError) {
      throw findError;
    }

    if (existing) {
      if (existing.status === 'subscribed') {
        return NextResponse.json(
          { success: true, message: 'You are already subscribed!' },
          { status: 200 }
        );
      } else {
        // Resubscribe
        const { error: updateError } = await supabase
          .from('newsletter_subscribers')
          .update({ status: 'subscribed' })
          .eq('id', existing.id);

        if (updateError) throw updateError;

        return NextResponse.json(
          { success: true, message: 'Thank you for subscribing again!' },
          { status: 200 }
        );
      }
    }

    // Insert new subscription
    const { error: insertError } = await supabase
      .from('newsletter_subscribers')
      .insert([{ email: email.toLowerCase(), status: 'subscribed' }]);

    if (insertError) {
      // Check for unique key violation (PostgreSQL code 23505)
      if (insertError.code === '23505') {
        return NextResponse.json(
          { success: true, message: 'You are already subscribed!' },
          { status: 200 }
        );
      }
      throw insertError;
    }

    return NextResponse.json(
      { success: true, message: 'Thank you for subscribing to Lurevi!' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'An internal error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
