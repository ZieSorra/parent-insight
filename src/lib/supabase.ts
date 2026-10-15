import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabasePublishableKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Safe connectivity probe. This checks authentication/client connectivity only;
 * it does not bypass RLS or expose private records.
 */
export async function checkSupabaseConnection(): Promise<{ ok: boolean; message: string }> {
  if (!supabase) {
    return {
      ok: false,
      message: 'Supabase belum dikonfigurasi. Tambahkan VITE_SUPABASE_URL dan VITE_SUPABASE_PUBLISHABLE_KEY ke environment build.',
    };
  }

  const { error } = await supabase.auth.getSession();
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: 'Klien Supabase aktif. Akses data tetap mengikuti autentikasi dan kebijakan RLS.' };
}
