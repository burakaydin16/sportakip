
# PilaTrack - Pilates Takip Uygulaması

Bu proje Netlify ve Supabase ile çalışacak şekilde yapılandırılmıştır.

## Supabase Kurulumu

1. [Supabase](https://supabase.com/) üzerinde yeni bir proje oluşturun.
2. **SQL Editor** kısmına gidin ve aşağıdaki sorguyu çalıştırarak `sessions` tablosunu oluşturun:

```sql
create table sessions (
  id uuid default gen_random_uuid() primary key,
  date date not null,
  time text not null,
  status text not null,
  created_at timestamptz default now()
);

-- RLS Politikalarını Etkinleştirin (Test için Herkese Açık)
alter table sessions enable row level security;
create policy "Public Access" on sessions for all using (true);
```

## Netlify Kurulumu

1. Projeyi GitHub'a yükleyin.
2. Netlify'da "New site from Git" diyerek bu depoyu bağlayın.
3. **Site Settings > Build & deploy > Environment variables** kısmına gidin ve şu iki değişkeni ekleyin:
   - `SUPABASE_URL`: Supabase panelindeki Project URL.
   - `SUPABASE_ANON_KEY`: Supabase panelindeki API Key (anon public).

Bundan sonra her değişiklik yaptığınızda Netlify otomatik olarak güncelleyecektir.
