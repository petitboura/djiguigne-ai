import { createClient } from "@supabase/supabase-js";

// Même projet Supabase que l'app (djiguigne-frontend/lib/supabase.ts) : un
// compte créé ici fonctionne directement sur l'app, et inversement. Next.js
// parle DIRECTEMENT à Supabase Auth via ce client JS, pas besoin de passer
// par le backend FastAPI pour l'authentification.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const cleAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !cleAnon) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont requis (voir .env.local.example)."
  );
}

export const supabase = createClient(url, cleAnon);
