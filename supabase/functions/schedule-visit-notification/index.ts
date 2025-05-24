
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VisitNotificationRequest {
  visitId: string;
  agentEmail: string;
  visitDate: string;
  visitTime: string;
  clientName: string;
  clientPhone: string;
  propertyTitle: string;
  propertyAddress: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: VisitNotificationRequest = await req.json();
    
    console.log("Scheduling visit notification:", body);

    // Calculer la date d'envoi (24h avant la visite)
    const visitDateTime = new Date(`${body.visitDate}T${body.visitTime}`);
    const notificationDate = new Date(visitDateTime.getTime() - 24 * 60 * 60 * 1000);
    
    // Pour la démo, nous envoyons l'email immédiatement
    // Dans un environnement de production, vous utiliseriez un service de planification
    const emailResponse = await resend.emails.send({
      from: "CRM Immobilier <onboarding@resend.dev>",
      to: [body.agentEmail],
      subject: `Rappel: Visite programmée demain - ${body.propertyTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Rappel de visite programmée</h2>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Détails de la visite</h3>
            <p><strong>Date:</strong> ${new Date(body.visitDate).toLocaleDateString('fr-FR')}</p>
            <p><strong>Heure:</strong> ${body.visitTime}</p>
            <p><strong>Propriété:</strong> ${body.propertyTitle}</p>
            <p><strong>Adresse:</strong> ${body.propertyAddress}</p>
          </div>

          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Informations client</h3>
            <p><strong>Nom:</strong> ${body.clientName}</p>
            <p><strong>Téléphone:</strong> ${body.clientPhone}</p>
          </div>

          <p style="margin-top: 30px;">
            Cette visite est programmée pour demain. N'oubliez pas de vous préparer et de contacter le client si nécessaire.
          </p>

          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Cet email a été envoyé automatiquement par votre CRM Immobilier.
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.data?.id,
      scheduledFor: notificationDate.toISOString()
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in schedule-visit-notification function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Assurez-vous que la clé API Resend est configurée"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
