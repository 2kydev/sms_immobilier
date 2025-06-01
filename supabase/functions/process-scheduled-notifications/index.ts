
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Processing scheduled notifications...");
    
    // Récupérer les visites qui doivent être notifiées maintenant
    const now = new Date();
    const { data: visits, error: visitsError } = await supabase
      .from('visits')
      .select('*')
      .eq('statut', 'planifiee')
      .eq('notification_enabled', true)
      .not('notification_email', 'is', null);

    if (visitsError) {
      throw visitsError;
    }

    console.log(`Found ${visits?.length || 0} visits with notifications enabled`);

    for (const visit of visits || []) {
      // Calculer l'heure de notification
      const visitDateTime = new Date(`${visit.date}T${visit.heure}`);
      const notificationTime = new Date(visitDateTime.getTime() - (visit.notification_delay_hours * 60 * 60 * 1000));
      
      console.log(`Visit ${visit.id}: notification should be sent at ${notificationTime.toISOString()}, current time: ${now.toISOString()}`);
      
      // Améliorer la logique de vérification du timing
      // Pour des notifications de moins de 2 heures : fenêtre de 5 minutes
      // Pour des notifications de plus de 2 heures : fenêtre de 30 minutes
      const timeDiff = notificationTime.getTime() - now.getTime();
      const isShortDelay = visit.notification_delay_hours < 2;
      const timeWindow = isShortDelay ? 5 * 60 * 1000 : 30 * 60 * 1000; // 5 min ou 30 min
      
      const shouldSend = timeDiff <= timeWindow && timeDiff >= -timeWindow;
      
      console.log(`Visit ${visit.id}: delay=${visit.notification_delay_hours}h, timeDiff=${Math.round(timeDiff/60000)}min, window=${timeWindow/60000}min, shouldSend=${shouldSend}`);
      
      if (shouldSend) {
        // Vérifier si la notification n'a pas déjà été envoyée
        const { data: existingLog } = await supabase
          .from('email_logs')
          .select('id')
          .eq('visit_id', visit.id)
          .eq('status', 'sent')
          .single();

        if (!existingLog) {
          console.log(`Sending notification for visit ${visit.id}`);
          
          const formattedDate = visitDateTime.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });

          try {
            const emailResponse = await resend.emails.send({
              from: "SMS Immobilier <onboarding@resend.dev>",
              to: [visit.notification_email],
              subject: `Rappel de visite - ${visit.client_prenom} ${visit.client_nom} - ${visit.propriete_titre}`,
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
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>🏠 Rappel de Visite</h1>
                      <p>SMS Immobilier</p>
                    </div>
                    
                    <div class="content">
                      <p>Bonjour,</p>
                      
                      <p>Nous vous rappelons qu'une visite est programmée :</p>
                      
                      <div class="visit-info">
                        <h3>📅 Détails de la visite</h3>
                        <p><strong>Date :</strong> ${formattedDate}</p>
                        <p><strong>Heure :</strong> ${visit.heure}</p>
                      </div>

                      <div class="info-grid">
                        <div class="info-item">
                          <div class="info-label">👤 Client</div>
                          <div class="info-value">
                            <strong>${visit.client_prenom} ${visit.client_nom}</strong><br>
                            📞 ${visit.client_telephone}
                          </div>
                        </div>
                        
                        <div class="info-item">
                          <div class="info-label">🏡 Propriété</div>
                          <div class="info-value">
                            <strong>${visit.propriete_titre}</strong><br>
                            📍 ${visit.propriete_adresse}
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
                      <p><strong>SMS Immobilier</strong></p>
                      <p>CRM Immobilier - Système de notification automatique</p>
                    </div>
                  </div>
                </body>
                </html>
              `,
            });

            if (emailResponse.error) {
              throw new Error(`Email sending failed: ${emailResponse.error.message}`);
            }

            // Enregistrer le log d'email réussi
            await supabase.from('email_logs').insert([{
              visit_id: visit.id,
              recipient_email: visit.notification_email,
              email_type: 'visit_reminder',
              status: 'sent',
              sent_at: new Date().toISOString()
            }]);

            console.log(`Notification sent successfully for visit ${visit.id}`);

          } catch (emailError) {
            console.error(`Failed to send notification for visit ${visit.id}:`, emailError);
            
            // Enregistrer le log d'échec
            await supabase.from('email_logs').insert([{
              visit_id: visit.id,
              recipient_email: visit.notification_email,
              email_type: 'visit_reminder',
              status: 'failed',
              error_message: emailError instanceof Error ? emailError.message : 'Unknown error'
            }]);
          }
        } else {
          console.log(`Notification already sent for visit ${visit.id}`);
        }
      }
    }

    return new Response(JSON.stringify({ 
      message: "Scheduled notifications processed successfully",
      processed: visits?.length || 0
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error processing scheduled notifications:", error);
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
