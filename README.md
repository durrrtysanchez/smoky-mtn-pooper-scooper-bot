# Smoky Mountain Pooper Scoopers — Telegram Assistant

Node.js + Telegraf customer-service and lead-generation bot.

## Included
- Telegram menu for services, service area, contact, and quote requests.
- Multi-step quote intake saved to PostgreSQL.
- Admin notifications and restricted `/leads` command.
- Optional OpenAI answers grounded in configured business facts.
- Authenticated website lead endpoint `POST /api/leads` and health check `GET /health`.
- Request limits, input limits, environment-based secrets, and graceful shutdown.

## Requirements
Node.js 20+, PostgreSQL, and a Telegram bot token from BotFather. OpenAI API key is optional.

## Local setup
1. Clone this repository and run `npm install`.
2. Copy `.env.example` to `.env`.
3. Set `TELEGRAM_BOT_TOKEN` and `DATABASE_URL`.
4. Set `ADMIN_TELEGRAM_IDS` to your numeric Telegram user ID(s), comma-separated.
5. Set a long random `WEBSITE_API_KEY` before enabling website form submissions.
6. Optionally set `OPENAI_API_KEY`.
7. Run `npm run check`, then `npm start`.

The app creates the leads table and indexes at startup. Never commit `.env`, tokens, or credentials.

## Website integration
Send a server-to-server request to `POST /api/leads` with header `x-api-key: YOUR_WEBSITE_API_KEY` and JSON:

```json
{
  "name": "Taylor Customer",
  "phone": "8655550100",
  "address": "123 Example Road, Tennessee 377xx",
  "serviceType": "Weekly pet-waste cleanup",
  "frequency": "Weekly",
  "notes": "Gate is on the left"
}
```

Success returns `{ "ok": true, "leadId": 123 }`. Keep the API key on your website server; never expose it in browser JavaScript or public HTML. Use HTTPS. Add origin controls if the endpoint is exposed across origins.

## Verify before launch
Confirm exact ZIP-code coverage, current phone/email, and all promotion terms. The configured weekly offer is $14.99/week with the first cleaning free when recurring weekly visits are scheduled. Add other prices only when confirmed. Provide a privacy notice and retention policy for customer leads.

## Deployment
Use a persistent Node.js host with PostgreSQL and configure environment variables in its secret manager. This version uses Telegram long polling; run only one bot instance. Serve the HTTP API behind HTTPS.

## Known next improvements
In-progress quote state currently lives in process memory and is lost on restart; completed leads are durable. Next milestones: persistent quote sessions, lead status updates, website widget integration, and automated tests. No appointment booking or payment processing is enabled.
