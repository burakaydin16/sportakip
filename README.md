
# PilaTrack - Supabase Bağlantı Rehberi

Uygulamanın çalışması için Supabase hesabınızdan iki değeri alıp koda eklemeniz ve bir SQL komutu çalıştırmanız gerekiyor.

## 1. Adım: API Anahtarlarını Bulma
Supabase paneline (app.supabase.com) girin ve projenizi seçin:
1.  Sol menünün en altındaki **Settings** (Çark simgesi ⚙️) tıklayın.
2.  Açılan menüden **API** seçeneğine tıklayın.
3.  **Project URL** kısmındaki linki kopyalayın ve `lib/supabaseClient.ts` dosyasındaki `supabaseUrl` kısmına yapıştırın.
4.  **Project API keys** başlığı altındaki `anon` `public` yazan anahtarı kopyalayın ve `lib/supabaseClient.ts` dosyasındaki `supabaseAnonKey` kısmına yapıştırın.

## 2. Adım: Veritabanı Tablolarını Oluşturma
Sol menüdeki **SQL Editor** (Üstten 4. veya 5. simge `>_`) tıklayın:
1.  **+ New query** diyerek boş bir sayfa açın.
2.  Aşağıdaki kodu tamamen kopyalayıp oraya yapıştırın ve **Run** butonuna basın:

```sql
-- TABLOLARI SIFIRDAN OLUŞTURUR
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.sessions;
DROP TABLE IF EXISTS public.profiles;

-- 1. PROFİLLER
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  updated_at timestamptz DEFAULT now()
);

-- 2. DERSLER
CREATE TABLE public.sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  time text NOT NULL,
  status text NOT NULL DEFAULT 'PLANNED' 
    CHECK (status IN ('PLANNED', 'ATTENDED', 'MISSED', 'POSTPONED_BY_TEACHER', 'TEACHER_ABSENT', 'CANCELLED')),
  note text,
  created_at timestamptz DEFAULT now()
);

-- 3. OTOMATİK PROFİL TETİKLEYİCİSİ
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. GÜVENLİK (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by owner" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Sessions are manageable by owner" ON sessions FOR ALL USING (auth.uid() = user_id);
```

## 3. Adım: Netlify Dağıtımı (Opsiyonel)
Eğer uygulamayı Netlify üzerinden yayınlayacaksanız, Netlify panelinde **Site Settings > Environment Variables** kısmına şunları ekleyin:
- `SUPABASE_URL`: (Supabase URL'niz)
- `SUPABASE_ANON_KEY`: (Supabase Anon Anahtarınız)
