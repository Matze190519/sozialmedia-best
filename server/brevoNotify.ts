/**
 * Brevo (ehemals Sendinblue) E-Mail-Benachrichtigungen
 * Ersetzt das Manus-Notification-System
 * 
 * Sender: LR Lifestyle Team <info@lr-lifestyle.info>
 * Empfaenger: jedermannhandy@googlemail.com (Mathias Vinzing)
 */

const BREVO_API_KEY = process.env.BREVO_API_KEY || "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";
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const OWNER_EMAIL = "jedermannhandy@googlemail.com";
const SENDER_EMAIL = "info@lr-lifestyle.info";
const SENDER_NAME = "LR Lifestyle Team";

export interface BrevoNotification {
  title: string;
  content: string;
  recipientEmail?: string;
  recipientName?: string;
}

export async function sendBrevoNotification(payload: BrevoNotification): Promise<boolean> {
  const { title, content, recipientEmail, recipientName } = payload;

  const htmlContent = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%); border-radius: 16px; padding: 30px; color: #ffffff;">
    <div style="text-align: center; margin-bottom: 20px;">
      <h2 style="color: #f59e0b; margin: 0; font-size: 20px;">LR Content Hub</h2>
      <p style="color: #a1a1aa; font-size: 12px; margin: 5px 0 0;">sozialmedia.best</p>
    </div>
    <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; border: 1px solid rgba(255,255,255,0.1);">
      <h3 style="margin: 0 0 12px; color: #ffffff; font-size: 18px;">${title}</h3>
      <p style="color: #d1d5db; line-height: 1.6; margin: 0; white-space: pre-wrap;">${content}</p>
    </div>
    <div style="text-align: center; margin-top: 20px;">
      <a href="https://sozialmedia.best" style="display: inline-block; background: #f59e0b; color: #000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Content Hub oeffnen</a>
    </div>
  </div>
  <p style="text-align: center; color: #6b7280; font-size: 11px; margin-top: 16px;">LR Lifestyle Team &middot; sozialmedia.best</p>
</div>`.trim();

  try {
    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: SENDER_NAME, email: SENDER_EMAIL },
        to: [{ email: recipientEmail || OWNER_EMAIL, name: recipientName || "Mathias Vinzing" }],
        subject: title,
        htmlContent,
        textContent: `${title}\n\n${content}\n\n---\nLR Lifestyle Team - sozialmedia.best`,
      }),
    });

    if (!response.ok) {
      const err = await response.text().catch(() => "");
      console.error(`[Brevo] Fehler (${response.status}):`, err);
      return false;
    }

    console.log(`[Brevo] Benachrichtigung gesendet: "${title}"`);
    return true;
  } catch (error) {
    console.error("[Brevo] Fehler:", error);
    return false;
  }
}
