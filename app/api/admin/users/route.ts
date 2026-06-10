import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Missing Supabase environment variables' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Format users similarly to how realUserService expects
    const formattedUsers = data.users.map(user => ({
      id: user.id,
      email: user.email || '',
      created_at: user.created_at,
      email_confirmed_at: user.email_confirmed_at,
      last_sign_in_at: user.last_sign_in_at,
      phone: user.phone,
      raw_app_meta_data: user.app_metadata,
      raw_user_meta_data: user.user_metadata,
      is_anonymous: user.is_anonymous,
      role: user.app_metadata?.role || 'customer',
      aud: user.aud,
      confirmation_sent_at: user.confirmation_sent_at,
      recovery_sent_at: user.recovery_sent_at,
      email_change_sent_at: user.email_change_sent_at,
      new_email: user.new_email,
      invited_at: user.invited_at,
      action_link: user.action_link,
      email_change: user.new_email,
      new_phone: user.phone,
      phone_change: user.phone,
      phone_change_sent_at: user.email_change_sent_at,
      confirmed_at: user.confirmed_at,
      email_change_confirm_status: 0,
      banned_until: undefined,
      reauthentication_sent_at: undefined,
      reauthentication_token: undefined,
      is_sso_user: user.is_sso_user,
      deleted_at: user.deleted_at,
      is_super_admin: false,
      app_metadata: user.app_metadata,
      user_metadata: user.user_metadata,
      identities: user.identities,
      factors: user.factors
    }));

    return NextResponse.json({ users: formattedUsers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
