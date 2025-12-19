
import { createClient } from '@supabase/supabase-js';

/**
 * 🛠 SUPABASE BAĞLANTI AYARLARI
 * 
 * 1. Supabase panelinize gidin (app.supabase.com)
 * 2. Settings (⚙️) -> API sekmesine tıklayın.
 * 3. 'Project URL' ve 'anon public' key değerlerini kopyalayın.
 * 4. Aşağıdaki tırnak içindeki alanlara yapıştırın.
 */
const SUPABASE_URL = 'https://acstgywaqtodilbtfomr.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjc3RneXdhcXRvZGlsYnRmb21yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMzA3NDMsImV4cCI6MjA4MTcwNjc0M30.YzYYFkIWZg4Bjy8yA3oNlHl6aEjKzsKsZiVQg5dCUeE';

/**
 * Ortam değişkenlerini kontrol eden yardımcı fonksiyon.
 * Netlify üzerinde çalışırken bu değerler otomatik olarak okunur.
 */
const getSafeEnv = (key: string): string => {
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      // @ts-ignore
      return process.env[key];
    }
    // @ts-ignore
    if (typeof window !== 'undefined' && (window as any).env && (window as any).env[key]) {
      // @ts-ignore
      return (window as any).env[key];
    }
  } catch (e) {
    // Hata durumunda boş dön
  }
  return '';
};

const finalUrl = getSafeEnv('SUPABASE_URL') || SUPABASE_URL;
const finalKey = getSafeEnv('SUPABASE_ANON_KEY') || SUPABASE_ANON_KEY;

// Yapılandırma kontrolü
export const isSupabaseConfigured = Boolean(
  finalUrl && 
  finalUrl.startsWith('https://') && 
  finalKey && 
  finalKey.length > 20
);

// Supabase istemcisini oluştur
export const supabase = isSupabaseConfigured 
  ? createClient(finalUrl, finalKey) 
  : null;

if (!isSupabaseConfigured) {
  console.error("PilaTrack: Supabase URL veya Key bulunamadı. Lütfen lib/supabaseClient.ts dosyasını düzenleyin.");
}
