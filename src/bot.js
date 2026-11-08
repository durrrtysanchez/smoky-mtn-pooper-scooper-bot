import { Telegraf, Markup } from 'telegraf';
import { config } from './config.js';
import { answerCustomer } from './assistant.js';
import { createLead, recentLeads } from './db.js';
export const bot = new Telegraf(config.telegramToken);
const quoteSessions = new Map();
const menu = () => Markup.keyboard([['Services & pricing','Request a quote'],['Service area','Contact us']]).resize();
const isAdmin = ctx => config.adminIds.includes(String(ctx.from?.id));
async function notifyAdmins(lead) {
  const msg = ['New lead',`Lead #${lead.id}`,`Name: ${lead.name}`,`Phone: ${lead.phone}`,`Address: ${lead.address}`,`Service: ${lead.service_type}`,`Frequency: ${lead.frequency}`,`Notes: ${lead.notes || 'None'}`,`Source: ${lead.source}`].join('\n');
  await Promise.allSettled(config.adminIds.map(id => bot.telegram.sendMessage(id,msg)));
}
bot.start(ctx => ctx.reply(`Welcome to ${config.businessName}! I can answer questions or help you request a quote. What would you like to do?`,menu()));
bot.hears('Services & pricing',ctx => ctx.reply(`Weekly service: $${config.weeklyPrice.toFixed(2)} per week. Your first cleaning is free when you schedule recurring weekly visits. Contact us for other service pricing.`,menu()));
bot.hears('Service area',ctx => ctx.reply(`We serve ${config.serviceArea}. Send your ZIP code or address in a quote request and the team can confirm coverage.`,menu()));
bot.hears('Contact us',ctx => ctx.reply([config.phone&&`Phone: ${config.phone}`,config.email&&`Email: ${config.email}`,`Website: ${config.websiteUrl}`].filter(Boolean).join('\n'),menu()));
bot.hears('Request a quote',ctx => { quoteSessions.set(ctx.from.id,{step:'name',data:{}}); return ctx.reply('Let’s get a quote started. What is your full name?',Markup.removeKeyboard()); });
const prompts={phone:'What is the best phone number to reach you?',address:'What is the service address, including ZIP code?',serviceType:'What do you need? (Weekly pet-waste cleanup, one-time cleanup, commercial cleanup, or other)',frequency:'How often would you like service? (One-time, weekly, or not sure)',notes:'Any details we should know? Reply with details, or type “skip”.'};
const steps=['name','phone','address','serviceType','frequency','notes'];
bot.command('cancel',ctx=>{quoteSessions.delete(ctx.from.id);return ctx.reply('Your current request was cancelled.',menu());});
bot.command('help',ctx=>ctx.reply('Use the menu to view services, check the service area, contact the business, or request a quote. During a quote request, send /cancel to stop.',menu()));
bot.command('leads',async ctx=>{if(!isAdmin(ctx))return ctx.reply('This command is for administrators only.');try{const leads=await recentLeads(10);return ctx.reply(leads.length?leads.map(l=>`#${l.id} · ${l.name} · ${l.phone}\n${l.service_type} / ${l.frequency} · ${l.status}`).join('\n\n'):'No leads received yet.');}catch(e){console.error(e);return ctx.reply('Could not retrieve leads right now.');}});
bot.on('text',async ctx=>{
  const text=ctx.message.text.trim(); if(text.startsWith('/'))return;
  const session=quoteSessions.get(ctx.from.id);
  if(session){
    const step=session.step;session.data[step]=step==='notes'&&/^skip$/i.test(text)?'':text;
    const next=steps.indexOf(step)+1;
    if(next<steps.length){session.step=steps[next];return ctx.reply(prompts[session.step]);}
    try{const lead=await createLead({...session.data,source:'telegram',telegramUserId:String(ctx.from.id),telegramUsername:ctx.from.username||''});quoteSessions.delete(ctx.from.id);await notifyAdmins(lead);return ctx.reply(`Thanks, ${lead.name}. Your quote request (#${lead.id}) has been sent to the team. They will follow up using the details you provided.`,menu());}
    catch(e){console.error('Lead save failed:',e);quoteSessions.delete(ctx.from.id);return ctx.reply('Sorry, we could not save your request. Please contact the business directly.',menu());}
  }
  try{await ctx.sendChatAction('typing');return ctx.reply(await answerCustomer(text),menu());}
  catch(e){console.error('Assistant response failed:',e);return ctx.reply('I am having trouble answering right now. Please try again or request a quote.',menu());}
});
bot.catch((error,ctx)=>{console.error('Telegram handler error:',error);return ctx.reply('Something went wrong. Please try again.').catch(()=>{});});
