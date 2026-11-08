# Security notes

- Store Telegram, OpenAI, database, and website API credentials only in the deployment platform's secret manager or a local untracked `.env` file.
- Never expose `WEBSITE_API_KEY` to browser code. Submit website leads from a trusted server-side handler over HTTPS.
- Set `ADMIN_TELEGRAM_IDS` to only the numeric Telegram IDs of trusted operators. The `/leads` command displays customer contact details.
- Restrict database network access to the application host and use a dedicated database user with only required privileges.
- Back up PostgreSQL and define a retention/deletion process for customer lead records.
- Rotate credentials immediately if they are committed or disclosed.
- Review dependencies and deployment logs regularly; do not log API keys or full customer messages unnecessarily.

Report suspected vulnerabilities privately to the repository owner rather than posting customer data or secrets in public issues.
