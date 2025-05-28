
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
  notificationDelayHours: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Scheduling notification...");
    
    const { 
      visitId, 
      agentEmail, 
      visitDate, 
      visitTime, 
      clientName, 
      clientPhone, 
      propertyTitle, 
      propertyAddress,
      notificationDelayHours = 24
    }: VisitNotificationRequest = await req.json();

    console.log("Notification scheduling data:", {
      visitId,
      agentEmail,
      visitDate,
      visitTime,
      clientName,
      propertyTitle,
      notificationDelayHours
    });

    // Calculer l'heure de notification
    const visitDateTime = new Date(`${visitDate}T${visitTime}`);
    const notificationTime = new Date(visitDateTime.getTime() - (notificationDelayHours * 60 * 60 * 1000));

    console.log(`Visit scheduled for: ${visitDateTime.toISOString()}`);
    console.log(`Notification will be sent at: ${notificationTime.toISOString()}`);
    console.log(`Delay: ${notificationDelayHours} hours before visit`);

    // Dans un système réel, vous programmeriez ici la tâche
    // Pour cette démo, nous retournons juste les informations de programmation
    const response = {
      success: true,
      message: "Notification scheduled successfully",
      scheduledFor: notificationTime.toISOString(),
      visitDateTime: visitDateTime.toISOString(),
      delayHours: notificationDelayHours,
      recipient: agentEmail
    };

    console.log("Notification scheduled:", response);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error scheduling notification:", error);
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
