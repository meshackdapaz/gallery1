-- Add this to your Supabase SQL Editor and run it

-- 1. Events Table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  invite_code TEXT NOT NULL UNIQUE,
  host_id UUID
);

-- 2. Photos Table
CREATE TABLE IF NOT EXISTS public.photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  url TEXT NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  aspect_ratio NUMERIC,
  ai_caption TEXT
);

-- 3. Photo Reactions Table
CREATE TABLE IF NOT EXISTS public.photo_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  photo_id UUID REFERENCES public.photos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emoji TEXT DEFAULT '❤️',
  UNIQUE(photo_id, user_id)
);

-- 4. Enable RLS but allow public access for now (or set up proper policies)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public events access" ON public.events FOR ALL USING (true);
CREATE POLICY "Public photos access" ON public.photos FOR ALL USING (true);
CREATE POLICY "Public reactions access" ON public.photo_reactions FOR ALL USING (true);

-- 5. Storage (Ensure memorial-photos bucket exists)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('memorial-photos', 'memorial-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'memorial-photos');
CREATE POLICY "Insert Access" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'memorial-photos');

-- 6. Setup Realtime triggers (Note: Supabase uses slightly different Realtime triggers setup than Insforge so we enable Realtime publications directly)
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE public.photos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.photo_reactions;
