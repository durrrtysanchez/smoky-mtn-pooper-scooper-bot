import OpenAI from 'openai';
import { config } from './config.js';
const client = config.openaiApiKey ? new OpenAI({ apiKey: config.openaiApiKey }) : null;
export async function answerCustomer(message) {
  if (!client) return 'I can help with service information and quote requests. Choose “Request a quote” from the menu, or contact the business for questions that need a team member.';
  const facts = `Business: ${config.businessName}\nWebsite: ${config.websiteUrl}\nPhone: ${config.phone || 'Not configured'}\nEmail: ${config.email || 'Not configured'}\nService area: ${config.serviceArea}\nWeekly offer: $${config.weeklyPrice.toFixed(2)} per week; first cleaning free when recurring weekly visits are scheduled.\nDo not invent one-time prices, exact ZIP-code coverage, appointment availability, guarantees, or unlisted service details.`;
  const response = await client.chat.completions.create({ model: config.openaiModel, temperature: 0.2, max_tokens: 350, messages: [
    { role: 'system', content: `You are the customer-service assistant for ${config.businessName}. Be concise and professional. Use only verified facts below. Never invent prices, service coverage, availability, policies, or promises. If unsure, say a team member will confirm. Never request payment-card data or passwords. Encourage quote requests.\n${facts}` },
    { role: 'user', content: String(message).slice(0,2000) }
  ] });
  return response.choices[0]?.message?.content?.trim() || 'I could not prepare an answer just now. Please submit a quote request or contact the business.';
}
