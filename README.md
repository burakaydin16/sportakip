
# PilaTrack - Supabase & Netlify Kurulum Rehberi

Eğer Netlify'da projeniz açılmıyorsa, lütfen aşağıdaki 2 adımı sırasıyla uygulayın.

## 1. ADIM: Supabase Değerlerini Dosyaya Yazın
Netlify bazen ortam değişkenlerini (Environment Variables) hemen algılamayabilir. En hızlı çözüm şudur:
- `lib/supabaseClient.ts` dosyasını açın.
- `SUPABASE_URL` ve `SUPABASE_ANON_KEY` yazan yerlere kendi panelinizdeki değerleri **tırnak içinde** yapıştırın.
- Dosyayı kaydedin.

## 2. ADIM: Tabloları Oluşturun (HAYATİ ÖNEMDE)
Uygulama açılsa bile giriş yapamazsınız çünkü veritabanı boş. Şunu yapın:
1.  Supabase projenizde sol menüdeki **SQL Editor** simgesine tıklayın.
2.  **+ New query** butonuna basın.
3.  Aşağıdaki kodu kopyalayıp kutuya yapıştırın:

```sql
-- 1. Tabloları ve Yetkileri Temizle
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.sessions;
DROP TABLE IF EXISTS public.profiles;

-- 2. Profil Tablosu
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  updated_at timestamptz DEFAULT now()
);

-- 3. Dersler Tablosu
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

-- 4. Otomatik Kayıt Fonksiyonu
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

-- 5. Güvenlik İzinleri (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes kendi profilini görür" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Herkes kendi dersini yönetir" ON public.sessions FOR ALL USING (auth.uid() = user_id);
```
4.  Sağ alttaki **Run** butonuna basın. Başarılı olduysa yeşil bir yazı çıkacaktır.

Artık uygulamanız Netlify üzerinde sorunsuz açılacak ve ders eklemenize izin verecektir.
