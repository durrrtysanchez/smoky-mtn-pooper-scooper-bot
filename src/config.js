import 'dotenv/config';
const required = ['TELEGRAM_BOT_TOKEN', 'DATABASE_URL'];
for (const key of required) if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
export const config = {
  telegramToken: process.env.TELEGRAM_BOT_TOKEN, databaseUrl: process.env.DATABASE_URL,
  openaiApiKey: process.env.OPENAI_API_KEY || '', openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  adminIds: (process.env.ADMIN_TELEGRAM_IDS || '').split(',').map(v => v.trim()).filter(Boolean),
  websiteApiKey: process.env.WEBSITE_API_KEY || '', port: Number(process.env.PORT || 3000),
  businessName: process.env.BUSINESS_NAME || 'Smoky Mountain Pooper Scoopers',
  websiteUrl: process.env.WEBSITE_URL || 'https://smokymtnpooperscooper.com',
  phone: process.env.BUSINESS_PHONE || '', email: process.env.BUSINESS_EMAIL || '',
  serviceArea: process.env.SERVICE_AREA || 'East Tennessee', weeklyPrice: Number(process.env.WEEKLY_PRICE || 14.99)
};
