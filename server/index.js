import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { importList, safeUrl } from './importer.js';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const app = express();
app.disable('x-powered-by'); app.use(express.json({limit:'8kb'}));
app.get('/api/health', (_,res)=>res.json({ok:true}));
let active=0;
app.post('/api/import', async (req,res)=>{
  try { safeUrl(req.body?.url); } catch(e) { return res.status(400).json({error:e.message}); }
  if(active>=3) return res.status(429).json({error:'Há importações em andamento. Tente novamente em instantes.'});
  active++;
  try { res.json({songs:await importList(req.body.url)}); }
  catch(e) { res.status(422).json({error:e.message === 'fetch failed' ? 'Não foi possível acessar o Cifra Club. Verifique a conexão e se a lista é pública.' : e.message}); }
  finally {active--;}
});
app.use('/api', (_,res)=>res.status(404).json({error:'Rota não encontrada.'}));
if(process.env.NODE_ENV==='production') { app.use(express.static(path.join(root,'dist'))); app.get('*',(_,res)=>res.sendFile(path.join(root,'dist/index.html'))); }
else { const {createServer}=await import('vite'); const vite=await createServer({root,server:{middlewareMode:true},appType:'spa'}); app.use(vite.middlewares); }
app.listen(Number(process.env.PORT)||3000,'0.0.0.0',()=>console.log('Medley disponível na porta '+(process.env.PORT||3000)));
