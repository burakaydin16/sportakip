
# PilaTrack - Veritabanı Kurulum Rehberi (v2.1)

Bu uygulama profesyonel bir profil sistemi ve kullanıcı bazlı izolasyon içerir. Eğer Netlify/Vercel üzerinde projeniz açılmıyorsa veya tablo hatası alıyorsanız, lütfen Supabase panelinizde aşağıdaki adımları uygulayın.

## 1. SQL Kurulumu (Kritik Adım)

Supabase Dashboard > **SQL Editor** kısmına gidin ve aşağıdaki kodun tamamını kopyalayıp **Run** deyin. Bu işlem; profiller tablosunu, dersler tablosunu ve otomatik kullanıcı senkronizasyonu için gerekli olan tetikleyiciyi (trigger) oluşturur.

```sql
-- 1. MEVCUT YAPILARI TEMİZLE (Sıfır Kurulum)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS profiles;

-- 2. PROFİLLER TABLOSU (Kullanıcı Verileri)
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  updated_at timestamptz DEFAULT now()
);

-- 3. DERSLER (SESSIONS) TABLOSU
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

-- 4. OTOMATİK PROFİL OLUŞTURMA FONKSİYONU
-- auth.users'a birisi kaydolduğunda profiles tablosuna da otomatik eklenir
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. TRIGGER'I AKTİFLEŞTİR
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. GÜVENLİK (RLS - Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Politikalar: Herkes sadece kendi verisini görebilir/yönetebilir
CREATE POLICY "Profiles are viewable by owner" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles are updatable by owner" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Sessions are manageable by owner" ON sessions FOR ALL USING (auth.uid() = user_id);

-- 7. PERFORMANS İNDEKSLERİ
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
```

## 2. Ortam Değişkenleri (Netlify Ayarı)

Netlify Dashboard > Site Settings > **Environment Variables** kısmına gidip aşağıdaki iki değeri Supabase projenizden alıp ekleyin:

- `SUPABASE_URL`: Proje URL'niz
- `SUPABASE_ANON_KEY`: Proje Anon Key'iniz

Bu ayarları yaptıktan sonra projenizi tekrar "Deploy" etmeniz gerekebilir.
