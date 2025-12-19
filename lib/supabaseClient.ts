
import { createClient } from '@supabase/supabase-js';

/**
 * SUPABASE YAPILANDIRMASI
 * 
 * Bu uygulama hem Netlify/Vercel ortam değişkenlerini hem de 
 * manuel girilen değerleri destekler.
 */

const getEnv = (name: string): string => {
  try {
    // @ts-ignore
    return process.env[name] || (window as any).env?.[name] || '';
  } catch {
    return '';
  }
};

// 1. URL Belirleme
const SUPABASE_URL = getEnv('SUPABASE_URL') || 'https://acstgywaqtodilbtfomr.supabase.co';

// 2. KEY Belirleme (Öncelik sırasına göre deniyoruz)
const SUPABASE_KEY = 
  getEnv('SUPABASE_KEY') || 
  getEnv('SUPABASE_ANON_KEY') || 
  getEnv('REACT_APP_SUPABASE_ANON_KEY') ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjc3RneXdhcXRvZGlsYnRmb21yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMzA3NDMsImV4cCI6MjA4MTcwNjc0M30.YzYYFkIWZg4Bjy8yA3oNlHl6aEjKzsKsZiVQg5dCUeE';

// Yapılandırma geçerli mi?
export const isConfigValid = Boolean(
  SUPABASE_URL && 
  SUPABASE_URL.startsWith('https://') && 
  SUPABASE_KEY && 
  SUPABASE_KEY.length > 50
);

// İstemciyi oluştur (Geçersizse null döner, App.tsx bunu yakalar)
export const supabase = isConfigValid 
  ? createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    }) 
  : null;

console.log('PilaTrack Connection Status:', isConfigValid ? '✅ Configured' : '❌ Configuration Missing');
