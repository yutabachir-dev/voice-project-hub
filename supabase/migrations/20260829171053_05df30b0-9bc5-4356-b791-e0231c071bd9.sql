-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin','user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- CATEGORIES
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  examples text[] NOT NULL DEFAULT '{}',
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active categories" ON public.categories FOR SELECT TO anon, authenticated USING (is_active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage categories" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER categories_updated BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- STYLES
CREATE TABLE public.styles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  audio_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.styles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.styles TO authenticated;
GRANT ALL ON public.styles TO service_role;
ALTER TABLE public.styles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active styles" ON public.styles FOR SELECT TO anon, authenticated USING (is_active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage styles" ON public.styles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER styles_updated BEFORE UPDATE ON public.styles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ARTISTS
CREATE TABLE public.voice_over_artists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  gender text NOT NULL DEFAULT 'Voix féminine',
  description text NOT NULL DEFAULT '',
  photo_url text,
  video_url text,
  audio_samples text[] NOT NULL DEFAULT '{}',
  languages text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.voice_over_artists TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.voice_over_artists TO authenticated;
GRANT ALL ON public.voice_over_artists TO service_role;
ALTER TABLE public.voice_over_artists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active artists" ON public.voice_over_artists FOR SELECT TO anon, authenticated USING (is_active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage artists" ON public.voice_over_artists FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER artists_updated BEFORE UPDATE ON public.voice_over_artists FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- LINK TABLES
CREATE TABLE public.category_styles (
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  style_id uuid NOT NULL REFERENCES public.styles(id) ON DELETE CASCADE,
  PRIMARY KEY (category_id, style_id)
);
GRANT SELECT ON public.category_styles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.category_styles TO authenticated;
GRANT ALL ON public.category_styles TO service_role;
ALTER TABLE public.category_styles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read category_styles" ON public.category_styles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage category_styles" ON public.category_styles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.voice_over_styles (
  artist_id uuid NOT NULL REFERENCES public.voice_over_artists(id) ON DELETE CASCADE,
  style_id uuid NOT NULL REFERENCES public.styles(id) ON DELETE CASCADE,
  PRIMARY KEY (artist_id, style_id)
);
GRANT SELECT ON public.voice_over_styles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.voice_over_styles TO authenticated;
GRANT ALL ON public.voice_over_styles TO service_role;
ALTER TABLE public.voice_over_styles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read voice_over_styles" ON public.voice_over_styles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage voice_over_styles" ON public.voice_over_styles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.voice_over_categories (
  artist_id uuid NOT NULL REFERENCES public.voice_over_artists(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (artist_id, category_id)
);
GRANT SELECT ON public.voice_over_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.voice_over_categories TO authenticated;
GRANT ALL ON public.voice_over_categories TO service_role;
ALTER TABLE public.voice_over_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read voice_over_categories" ON public.voice_over_categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage voice_over_categories" ON public.voice_over_categories FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- CLIENTS
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL DEFAULT '',
  company text,
  job_title text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage clients" ON public.clients FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER clients_updated BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ORDERS
CREATE TYPE public.order_status AS ENUM ('nouvelle','confirmee','en_cours','terminee','annulee');

CREATE SEQUENCE public.order_number_seq START 1001;

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE DEFAULT ('VO-' || to_char(now(),'YYYY') || '-' || nextval('public.order_number_seq')),
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  artist_id uuid REFERENCES public.voice_over_artists(id) ON DELETE SET NULL,
  style_ids uuid[] NOT NULL DEFAULT '{}',
  style_names text[] NOT NULL DEFAULT '{}',
  project_description text NOT NULL DEFAULT '',
  script text NOT NULL DEFAULT '',
  script_source text NOT NULL DEFAULT 'manuel',
  status public.order_status NOT NULL DEFAULT 'nouvelle',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
GRANT USAGE ON SEQUENCE public.order_number_seq TO service_role, authenticated;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage orders" ON public.orders FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER orders_updated BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- SEED
INSERT INTO public.categories (slug, name, description, examples, sort_order) VALUES
('publicitaire','Voice-over publicitaire','Pour les publicités, spots, campagnes digitales, réseaux sociaux, radio et télévision.', ARRAY['Publicité Facebook','Publicité Instagram','Publicité TikTok','Spot radio','Publicité YouTube','Présentation de produit'],1),
('institutionnel','Voice-over institutionnel','Pour les entreprises, institutions, ONG et organisations.', ARRAY['Vidéos corporate','Présentation d''entreprise','Communication institutionnelle','Présentation de projet','Communication interne'],2),
('promotionnel','Voice-over promotionnel','Pour promouvoir une offre, un événement, un produit, un service ou une campagne.', ARRAY['Lancement de produit','Événement','Promotion','Campagne commerciale','Formation','Offre spéciale'],3);

INSERT INTO public.styles (name, description) VALUES
('Dynamique','Une voix rythmée et énergique qui capte immédiatement l''attention.'),
('Corporate','Une voix professionnelle adaptée aux communications d''entreprise.'),
('Chaleureux','Une voix douce et accueillante qui crée la proximité.'),
('Élégant','Une voix raffinée pour les marques premium.'),
('Énergique','Une voix puissante et entraînante pour les campagnes fortes.'),
('Sérieux','Une voix posée et crédible pour les messages importants.'),
('Institutionnel','Une voix neutre et rassurante pour les organisations.'),
('Jeune','Une voix fraîche et moderne pour les audiences jeunes.'),
('Autoritaire','Une voix affirmée qui inspire confiance et autorité.'),
('Émotionnel','Une voix sensible qui porte l''émotion du message.');

INSERT INTO public.category_styles (category_id, style_id)
SELECT c.id, s.id FROM public.categories c JOIN public.styles s ON true
WHERE (c.slug='publicitaire' AND s.name IN ('Dynamique','Chaleureux','Énergique','Jeune','Émotionnel','Élégant'))
   OR (c.slug='institutionnel' AND s.name IN ('Corporate','Sérieux','Institutionnel','Élégant','Autoritaire'))
   OR (c.slug='promotionnel' AND s.name IN ('Dynamique','Énergique','Chaleureux','Jeune','Corporate','Émotionnel'));

INSERT INTO public.voice_over_artists (name, gender, description, languages, photo_url, video_url) VALUES
('Aïssatou Diallo','Voix féminine','Une voix chaleureuse et élégante, idéale pour les marques qui veulent créer de la proximité.', ARRAY['Français','Wolof','Anglais'], 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'),
('Mamadou Sow','Voix masculine','Une voix dynamique et affirmée, parfaite pour les spots publicitaires et les campagnes commerciales.', ARRAY['Français','Anglais'], 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'),
('Fatou Ndiaye','Voix féminine','Une voix jeune et pétillante, taillée pour les réseaux sociaux et les formats courts.', ARRAY['Français','Wolof'], 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=80','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4'),
('Ibrahima Ba','Voix masculine','Une voix grave et institutionnelle qui inspire crédibilité et confiance.', ARRAY['Français','Anglais','Peul'], 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'),
('Awa Camara','Voix féminine','Une voix posée et corporate, très à l''aise sur les vidéos d''entreprise.', ARRAY['Français'], 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&q=80','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'),
('Cheikh Fall','Voix masculine','Une voix émotionnelle et narrative, parfaite pour raconter une histoire de marque.', ARRAY['Français','Wolof','Anglais'], 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&q=80','https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4');

INSERT INTO public.voice_over_categories (artist_id, category_id)
SELECT a.id, c.id FROM public.voice_over_artists a JOIN public.categories c ON true
WHERE (a.name='Aïssatou Diallo' AND c.slug IN ('publicitaire','institutionnel'))
   OR (a.name='Mamadou Sow' AND c.slug IN ('publicitaire','promotionnel'))
   OR (a.name='Fatou Ndiaye' AND c.slug IN ('publicitaire','promotionnel'))
   OR (a.name='Ibrahima Ba' AND c.slug IN ('institutionnel','promotionnel'))
   OR (a.name='Awa Camara' AND c.slug IN ('institutionnel'))
   OR (a.name='Cheikh Fall' AND c.slug IN ('publicitaire','institutionnel','promotionnel'));

INSERT INTO public.voice_over_styles (artist_id, style_id)
SELECT a.id, s.id FROM public.voice_over_artists a JOIN public.styles s ON true
WHERE (a.name='Aïssatou Diallo' AND s.name IN ('Chaleureux','Élégant','Émotionnel'))
   OR (a.name='Mamadou Sow' AND s.name IN ('Dynamique','Corporate','Autoritaire','Énergique'))
   OR (a.name='Fatou Ndiaye' AND s.name IN ('Jeune','Dynamique','Chaleureux'))
   OR (a.name='Ibrahima Ba' AND s.name IN ('Institutionnel','Sérieux','Autoritaire','Corporate'))
   OR (a.name='Awa Camara' AND s.name IN ('Corporate','Institutionnel','Élégant'))
   OR (a.name='Cheikh Fall' AND s.name IN ('Émotionnel','Chaleureux','Sérieux','Dynamique'));

INSERT INTO public.clients (first_name, last_name, email, phone, company, job_title) VALUES
('Awa','Sarr','awa.sarr@abc-company.com','+221 77 123 45 67','ABC Company','Responsable marketing'),
('Moussa','Diop','moussa.diop@gmail.com','+221 78 987 65 43',NULL,NULL),
('Sophie','Martin','sophie.martin@ong-espoir.org','+221 76 555 22 11','ONG Espoir','Chargée de communication'),
('Khadija','Ba','khadija@chezfatou.sn','+221 70 444 33 22','Restaurant Chez Fatou','Gérante');

INSERT INTO public.orders (client_id, category_id, artist_id, style_ids, style_names, project_description, script, status)
SELECT cl.id, c.id, a.id, ARRAY[s.id], ARRAY[s.name], d.descr, d.script, d.status::public.order_status
FROM (VALUES
  ('awa.sarr@abc-company.com','publicitaire','Mamadou Sow','Dynamique','Spot radio de 30 secondes pour le lancement de notre nouvelle gamme.','Découvrez notre nouvelle offre, disponible dès aujourd''hui chez ABC Company.','nouvelle'),
  ('moussa.diop@gmail.com','promotionnel','Fatou Ndiaye','Jeune','Vidéo TikTok pour promouvoir une offre spéciale week-end.','Ce week-end seulement, profitez de 30% de réduction sur toute la boutique !','confirmee'),
  ('sophie.martin@ong-espoir.org','institutionnel','Ibrahima Ba','Institutionnel','Film de présentation de notre ONG pour les bailleurs.','Depuis quinze ans, ONG Espoir accompagne les communautés vers l''autonomie.','en_cours'),
  ('khadija@chezfatou.sn','publicitaire','Aïssatou Diallo','Chaleureux','Publicité Instagram de 30 secondes pour le restaurant.','Chez Fatou, la cuisine sénégalaise se savoure en famille. Ce week-end, promotion spéciale.','terminee')
) AS d(email, slug, artist, style, descr, script, status)
JOIN public.clients cl ON cl.email = d.email
JOIN public.categories c ON c.slug = d.slug
JOIN public.voice_over_artists a ON a.name = d.artist
JOIN public.styles s ON s.name = d.style;