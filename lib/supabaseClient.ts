import { createClient } from '@supabase/supabase-js';

// LÜTFEN BURAYI KENDİ SUPABASE PROJE BİLGİLERİNİZLE DOLDURUN
const SUPABASE_URL = 'https://acstgywaqtodilbtfomr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjc3RneXdhcXRvZGlsYnRmb21yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMzA3NDMsImV4cCI6MjA4MTcwNjc0M30.YzYYFkIWZg4Bjy8yA3oNlHl6aEjKzsKsZiVQg5dCUeE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
