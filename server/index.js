import express from 'express';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
mkdirSync('data',{recursive:true});
const db=new DatabaseSync('data/films.db');
db.exec(`CREATE TABLE IF NOT EXISTS films (id INTEGER PRIMARY KEY, title TEXT NOT NULL, year TEXT, genre TEXT, format TEXT, code TEXT UNIQUE, poster TEXT, overview TEXT, watched INTEGER DEFAULT 0, added TEXT DEFAULT CURRENT_TIMESTAMP)`);
const app=express();app.use(express.json({limit:'30kb'}));
const failure=(res,message,status=400)=>res.status(status).json({error:message});
async function external(url,headers={}){const r=await fetch(url,{headers,signal:AbortSignal.timeout(12000)});if(!r.ok)throw Error('Datakällan kunde inte svara. Kontrollera API-nyckel och försök igen.');return r.json();}
app.get('/api/status',(req,res)=>res.json({barcode:true,barcodeProvider:'UPCitemdb',tmdb:!!process.env.TMDB_TOKEN}));
app.get('/api/films',(req,res)=>res.json(db.prepare('SELECT * FROM films ORDER BY id DESC').all()));
app.get('/api/lookup',async(req,res)=>{
 try{
  const code=String(req.query.code||'').trim();
  if(!/^\d{8,14}$/.test(code))return failure(res,'Ange 8–14 siffror från streckkoden.');
  const response=await fetch('https://api.upcitemdb.com/prod/trial/lookup?'+new URLSearchParams({upc:code}),{signal:AbortSignal.timeout(12000)});
  if(response.status===429)return failure(res,'Gränsen för gratisuppslag är nådd eller sökningarna går för snabbt. Försök igen senare.',429);
  if(!response.ok)return failure(res,'Filmdatabasen kunde inte svara. Försök igen senare.',502);
  const data=await response.json();
  if(data.code!=='OK')return failure(res,'Filmdatabasen kunde inte genomföra sökningen. Försök igen senare.',502);
  const p=data.items?.[0];
  if(!p)return failure(res,'Ingen film hittades för den streckkoden. Kontrollera siffrorna eller prova ett annat fodral.',404);
  const title=p.title||'';
  if(!title.trim())return failure(res,'Databasen saknar titel för denna streckkod.',404);
  res.json({title,poster:p.images?.find(url=>/^https?:\/\//.test(url))||'',overview:p.description||'',genre:'Övrigt',format:/4k|uhd/i.test(title)?'4K UHD':/blu.?ray/i.test(title)?'Blu-ray':'DVD'});
 }catch(e){failure(res,'Kunde inte nå filmdatabasen. Försök igen om en stund.',502);}
});
app.get('/api/search',async(req,res)=>{try{if(!process.env.TMDB_TOKEN)return failure(res,'Titelsökning behöver TMDB_TOKEN på servern. Du kan fortfarande fylla i filmen manuellt.',503);const q=String(req.query.q||'').trim().slice(0,200);if(!q)return res.json([]);const data=await external('https://api.themoviedb.org/3/search/movie?'+new URLSearchParams({query:q,language:'sv-SE',include_adult:'false'}),{Authorization:`Bearer ${process.env.TMDB_TOKEN}`});res.json(data.results.slice(0,10).map(m=>({title:m.title,year:m.release_date?.slice(0,4)||'',poster:m.poster_path?'https://image.tmdb.org/t/p/w500'+m.poster_path:'',overview:m.overview||'',tmdbId:m.id})));}catch(e){failure(res,e.message,502);}});
app.post('/api/films',(req,res)=>{const f=req.body;if(typeof f.title!=='string'||!f.title.trim()||f.title.length>200||!['DVD','Blu-ray','4K UHD'].includes(f.format))return failure(res,'Kontrollera titel och format.');if(f.poster&&!/^https?:\/\//.test(f.poster))return failure(res,'Omslaget måste vara en http- eller https-adress.');try{const result=db.prepare('INSERT INTO films(title,year,genre,format,code,poster,overview) VALUES(?,?,?,?,?,?,?)').run(f.title.trim(),String(f.year||'').slice(0,4),String(f.genre||'Övrigt').slice(0,60),f.format,String(f.code||'').trim()||null,f.poster||'',String(f.overview||'').slice(0,10000));res.status(201).json({id:Number(result.lastInsertRowid)});}catch(e){failure(res,e.message.includes('UNIQUE')?'Den streckkoden finns redan i samlingen.':'Kunde inte spara filmen.',409);}});
app.patch('/api/films/:id',(req,res)=>{db.prepare('UPDATE films SET watched=? WHERE id=?').run(req.body.watched?1:0,Number(req.params.id));res.json({ok:true});});
app.delete('/api/films/:id',(req,res)=>{db.prepare('DELETE FROM films WHERE id=?').run(Number(req.params.id));res.json({ok:true});});
app.use(express.static(path.resolve('dist')));
app.listen(Number(process.env.PORT||3001),'0.0.0.0',()=>console.log('Robbes filmhörna: http://localhost:'+(process.env.PORT||3001)));
