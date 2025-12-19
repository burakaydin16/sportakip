
import { createClient } from '@supabase/supabase-js';

/**
 * 1. ADIM: AŞAĞIDAKİ DEĞERLERİ DEĞİŞTİRİN
 * Supabase Panel -> Settings -> API kısmından alın.
 */
const SUPABASE_URL = 'https://acstgywaqtodilbtfomr.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjc3RneXdhcXRvZGlsYnRmb21yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMzA3NDMsImV4cCI6MjA4MTcwNjc0M30.YzYYFkIWZg4Bjy8yA3oNlHl6aEjKzsKsZiVQg5dCUeE';

/**
 * 2. ADIM: Netlify ortam değişkenlerini güvenli kontrol etme
 * (Tarayıcıda çökme yaşamamak için 'typeof' kontrolü şarttır)
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

// Değerlerin geçerliliğini kontrol et
export const isSupabaseConfigured = Boolean(
  finalUrl && 
  finalUrl.startsWith('https://') && 
  finalKey && 
  finalKey.length > 20
);

// İstemciyi başlat (Eğer bilgiler yoksa null döner, App.tsx bunu yakalar)
export const supabase = isSupabaseConfigured 
  ? createClient(finalUrl, finalKey) 
  : null;

if (!isSupabaseConfigured) {
  console.error("PilaTrack: Supabase bağlantı bilgileri eksik! Uygulama beklemeye alındı.");
}
