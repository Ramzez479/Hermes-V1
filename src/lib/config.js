export const N8N_WEBHOOK_URL = 'https://ramzez12.app.n8n.cloud/webhook/hermes-agent';

export const N8N_TIMEOUT_MS = Number(
  process.env.EXPO_PUBLIC_N8N_TIMEOUT_MS || process.env.N8N_TIMEOUT_MS || 15000
);

export function assertWebhookConfigured() {
  if (!N8N_WEBHOOK_URL) {
    console.warn(
      'N8N_WEBHOOK_URL no está configurado. Define EXPO_PUBLIC_N8N_WEBHOOK_URL en .env.'
    );
  }
}