import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { config } from './config.js';
import { createLead } from './db.js';
import { bot } from './bot.js';
export const app=express();app.disable('x-powered-by');app.use(express.json({limit:'20kb'}));
app.get('/health',(_req,res)=>res.json({ok:true,service:'smps-telegram-bot'}));
app.post('/api/leads',rateLimit({windowMs:60000,limit:15,standardHeaders:true,legacyHeaders:false}),async(req,res)=>{
  if(!config.websiteApiKey||req.get('x-api-key')!==config.websiteApiKey)return res.status(401).json({error:'Unauthorized'});
  const {name,phone,address,serviceType,frequency,notes}=req.body||{};
  if([name,phone,address,serviceType,frequency].some(v=>typeof v!=='string'||!v.trim()||v.length>500))return res.status(400).json({error:'Please provide name, phone, address, serviceType, and frequency.'});
  try{const lead=await createLead({name:name.trim(),phone:phone.trim(),address:address.trim(),serviceType:serviceType.trim(),frequency:frequency.trim(),notes:typeof notes==='string'?notes.slice(0,2000):'',source:'website'});
    const msg=['New website lead',`Lead #${lead.id}`,`Name: ${lead.name}`,`Phone: ${lead.phone}`,`Address: ${lead.address}`,`Service: ${lead.service_type}`,`Frequency: ${lead.frequency}`].join('\n');
    await Promise.allSettled(config.adminIds.map(id=>bot.telegram.sendMessage(id,msg)));return res.status(201).json({ok:true,leadId:lead.id});
  }catch(e){console.error('Website lead error:',e);return res.status(500).json({error:'Unable to save lead.'});}
});
