
import { createClient } from '@supabase/supabase-js';

/**
 * PilaTrack - Supabase Client Configuration
 */

const getEnv = (name: string): string => {
  // 1. Tipik süreç değişkenleri (Netlify/Node)
  try {
    if (typeof process !== 'undefined' && process.env && process.env[name]) {
      return process.env[name] as string;
    }
  } catch (e) {}

  // 2. Window üzerindeki env (Bazı platformlar buraya enjekte eder)
  try {
    if (typeof window !== 'undefined' && (window as any).env && (window as any).env[name]) {
      return (window as any).env[name];
    }
  } catch (e) {}

  return '';
};

// Değişkenleri Çek
const SUPABASE_URL = getEnv('SUPABASE_URL') || 'https://acstgywaqtodilbtfomr.supabase.co';

// Kullanıcının belirttiği SUPABASE_KEY ismine tam öncelik veriyoruz
const SUPABASE_KEY = 
  getEnv('SUPABASE_KEY') || 
  getEnv('SUPABASE_ANON_KEY') || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjc3RneXdhcXRvZGlsYnRmb21yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMzA3NDMsImV4cCI6MjA4MTcwNjc0M30.YzYYFkIWZg4Bjy8yA3oNlHl6aEjKzsKsZiVQg5dCUeE';

// Yapılandırma kontrolü
export const isConfigValid = Boolean(
  SUPABASE_URL && 
  SUPABASE_URL.startsWith('https://') && 
  SUPABASE_KEY && 
  SUPABASE_KEY.length > 50
);

// İstemci oluşturma
export const supabase = isConfigValid 
  ? createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }) 
  : null;

console.log("PilaTrack Diagnostics:", {
  urlFound: !!getEnv('SUPABASE_URL'),
  keyFound: !!getEnv('SUPABASE_KEY'),
  anonKeyFound: !!getEnv('SUPABASE_ANON_KEY'),
  isConfigValid
});
