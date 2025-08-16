import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CreateUserPayload {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  role: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    // Client avec le token de l'utilisateur appelant (pour vérifier son rôle)
    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: req.headers.get("Authorization") || "" } },
    });

    // Client admin (service role) pour créer l'utilisateur
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Vérifier l'utilisateur courant
    const { data: userResp, error: userErr } = await supabaseUser.auth.getUser();
    if (userErr || !userResp?.user) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Vérifier le rôle admin via la table profiles
    const { data: profile, error: profileErr } = await supabaseUser
      .from("profiles")
      .select("role")
      .eq("id", userResp.user.id)
      .maybeSingle();

    if (profileErr || !profile || profile.role !== "admin") {
      return new Response(JSON.stringify({ error: "Accès refusé" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const payload: CreateUserPayload = await req.json();
    const { email, password, nom, prenom, role } = payload;

    if (!email || !password || !nom || !prenom || !role) {
      return new Response(JSON.stringify({ error: "Champs manquants" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Créer l'utilisateur via l'API Admin
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { nom, prenom, role },
      email_confirm: true,
    });

    if (createErr) {
      return new Response(JSON.stringify({ error: createErr.message }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Créer / mettre à jour le profil
    if (created.user) {
      const { error: upsertErr } = await supabaseAdmin
        .from("profiles")
        .upsert(
          {
            id: created.user.id,
            email,
            nom,
            prenom,
            role,
            is_active: true,
          },
          { onConflict: "id" }
        );

      if (upsertErr) {
        // Ne pas échouer la requête si le profil échoue, mais signaler
        console.error("Profil upsert error:", upsertErr);
      }
    }

    return new Response(
      JSON.stringify({ success: true, userId: created.user?.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (e: any) {
    console.error("Create user edge error:", e);
    return new Response(JSON.stringify({ error: e?.message || "Erreur inconnue" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
