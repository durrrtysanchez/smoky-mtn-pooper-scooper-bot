import { config } from './config.js';
import { initDb,pool } from './db.js';
import { bot } from './bot.js';
import { app } from './server.js';
let server;let stopping=false;
async function shutdown(signal){if(stopping)return;stopping=true;console.log(`Received ${signal}; shutting down...`);try{await bot.stop(signal);}catch{}if(server)await new Promise(resolve=>server.close(resolve));await pool.end();process.exit(0);}
process.once('SIGINT',()=>shutdown('SIGINT'));process.once('SIGTERM',()=>shutdown('SIGTERM'));
try{await initDb();server=app.listen(config.port,()=>console.log(`HTTP server listening on ${config.port}`));await bot.launch();console.log('Telegram bot is running.');}
catch(error){console.error('Startup failed:',error);await pool.end().catch(()=>{});process.exit(1);}
