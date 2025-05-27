
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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
    const { 
      visitId, 
      agentEmail, 
      visitDate, 
      visitTime, 
      clientName, 
      clientPhone, 
      propertyTitle, 
      propertyAddress 
    }: VisitNotificationRequest = await req.json();

    const visitDateTime = new Date(`${visitDate}T${visitTime}`);
    const formattedDate = visitDateTime.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const emailResponse = await resend.emails.send({
      from: "Nouvelle SMS Immobilier <noreply@agence.com>",
      to: [agentEmail],
      subject: `Rappel de visite - ${clientName} - ${propertyTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Rappel de visite</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .visit-info { background: #f8fafc; border-left: 4px solid #1e40af; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
            .info-item { padding: 10px; background: #f1f5f9; border-radius: 4px; }
            .info-label { font-weight: bold; color: #1e40af; font-size: 12px; text-transform: uppercase; }
            .info-value { margin-top: 5px; }
            .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
            .button { display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏠 Rappel de Visite</h1>
              <p>Nouvelle SMS Immobilier</p>
            </div>
            
            <div class="content">
              <p>Bonjour,</p>
              
              <p>Nous vous rappelons qu'une visite est programmée <strong>demain</strong> :</p>
              
              <div class="visit-info">
                <h3>📅 Détails de la visite</h3>
                <p><strong>Date :</strong> ${formattedDate}</p>
                <p><strong>Heure :</strong> ${visitTime}</p>
              </div>

              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">👤 Client</div>
                  <div class="info-value">
                    <strong>${clientName}</strong><br>
                    📞 ${clientPhone}
                  </div>
                </div>
                
                <div class="info-item">
                  <div class="info-label">🏡 Propriété</div>
                  <div class="info-value">
                    <strong>${propertyTitle}</strong><br>
                    📍 ${propertyAddress}
                  </div>
                </div>
              </div>

              <p><strong>Points à vérifier avant la visite :</strong></p>
              <ul>
                <li>✅ Confirmer la présence du client</li>
                <li>✅ Préparer les documents de la propriété</li>
                <li>✅ Vérifier l'accès à la propriété</li>
                <li>✅ Prévoir les clés et badges d'accès</li>
              </ul>

              <p>Bonne visite !</p>
            </div>
            
            <div class="footer">
              <p><strong>Nouvelle SMS Immobilier</strong></p>
              <p>CRM Immobilier - Système de notification automatique</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in schedule-visit-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
