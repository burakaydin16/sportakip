
import { createClient } from '@supabase/supabase-js';

// Güvenli ortam değişkeni okuma (Tarayıcı uyumlu)
const getEnv = (key: string): string => {
  try {
    // Netlify veya diğer ortamlarda global process kontrolü
    // @ts-ignore
    const env = (typeof window !== 'undefined' && (window as any).process?.env) || (typeof process !== 'undefined' && process.env);
    return env ? env[key] : '';
  } catch {
    return '';
  }
};

// Varsayılan değerleri veya ortam değişkenlerini al
const supabaseUrl = getEnv('SUPABASE_URL') || 'https://acstgywaqtodilbtfomr.supabase.co';
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjc3RneXdhcXRvZGlsYnRmb21yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMzA3NDMsImV4cCI6MjA4MTcwNjc0M30.YzYYFkIWZg4Bjy8yA3oNlHl6aEjKzsKsZiVQg5dCUeE';

// Yapılandırma geçerlilik kontrolü
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseUrl.startsWith('https://') && 
  supabaseAnonKey && 
  supabaseAnonKey.length > 20
);

// İstemciyi başlat veya null döndür (Any cast'ten kaçınarak güvenliği sağla)
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (!isSupabaseConfigured) {
  console.warn("PilaTrack: Supabase yapılandırması eksik veya hatalı. Lütfen Netlify/Vercel panelinden SUPABASE_URL ve SUPABASE_ANON_KEY değerlerini kontrol edin.");
}
