
import { createClient } from '@supabase/supabase-js';

// --- SUPABASE BİLGİLERİNİZİ BURAYA YAPIŞTIRIN ---
const supabaseUrl = 'https://acstgywaqtodilbtfomr.supabase.co'; // Supabase Project URL'niz
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjc3RneXdhcXRvZGlsYnRmb21yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMzA3NDMsImV4cCI6MjA4MTcwNjc0M30.YzYYFkIWZg4Bjy8yA3oNlHl6aEjKzsKsZiVQg5dCUeE'; // Supabase anon public key'iniz
// ----------------------------------------------

// Ortam değişkenlerini kontrol eden fonksiyon (Netlify üzerinde çalışırken lazımdır)
const getEnv = (key: string): string => {
  try {
    // @ts-ignore
    const env = (typeof window !== 'undefined' && (window as any).process?.env) || (typeof process !== 'undefined' && process.env);
    return env ? env[key] : '';
  } catch {
    return '';
  }
};

// Eğer yukarıdaki değişkenler boşsa env'den çekmeye çalış
const finalUrl = supabaseUrl || getEnv('SUPABASE_URL');
const finalKey = supabaseAnonKey || getEnv('SUPABASE_ANON_KEY');

// Yapılandırma geçerlilik kontrolü
export const isSupabaseConfigured = Boolean(
  finalUrl && 
  finalUrl.startsWith('https://') && 
  finalKey && 
  finalKey.length > 20
);

// İstemciyi başlat
export const supabase = isSupabaseConfigured 
  ? createClient(finalUrl, finalKey) 
  : null;

if (!isSupabaseConfigured) {
  console.warn("PilaTrack: Supabase yapılandırması eksik! Lütfen lib/supabaseClient.ts dosyasını düzenleyin.");
}
