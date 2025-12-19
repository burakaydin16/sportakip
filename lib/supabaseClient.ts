
import { createClient } from '@supabase/supabase-js';

/**
 * 🛠 SUPABASE BAĞLANTI AYARLARI
 * 
 * Eğer bu değerleri kodun içine yazacaksanız, aşağıdaki tırnak içlerine yapıştırın.
 * Ancak Netlify panelinde 'SUPABASE_URL' ve 'SUPABASE_KEY' (veya 'SUPABASE_ANON_KEY') 
 * olarak tanımladıysanız uygulama onları otomatik olarak seçecektir.
 */
const DEFAULT_URL = 'https://acstgywaqtodilbtfomr.supabase.co'; 
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjc3RneXdhcXRvZGlsYnRmb21yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMzA3NDMsImV4cCI6MjA4MTcwNjc0M30.YzYYFkIWZg4Bjy8yA3oNlHl6aEjKzsKsZiVQg5dCUeE';

/**
 * Ortam değişkenlerini (Netlify/Vercel) güvenli bir şekilde okuyan fonksiyon.
 */
const getEnv = (key: string): string => {
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env && process.env[key]) return process.env[key];
    // @ts-ignore
    if (typeof window !== 'undefined' && (window as any).env && (window as any).env[key]) return (window as any).env[key];
  } catch (e) {}
  return '';
};

// URL Belirleme
const finalUrl = getEnv('SUPABASE_URL') || DEFAULT_URL;

// KEY Belirleme (Sizin belirttiğiniz gibi SUPABASE_KEY öncelikli)
const finalKey = getEnv('SUPABASE_KEY') || getEnv('SUPABASE_ANON_KEY') || DEFAULT_KEY;

// Yapılandırma doğruluğunu kontrol et
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
  console.warn("PilaTrack: Supabase yapılandırması eksik! Lütfen Netlify üzerinden SUPABASE_URL ve SUPABASE_KEY tanımlayın.");
}
