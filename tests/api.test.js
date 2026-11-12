import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {once} from 'node:events';
test('filmer sparas, dubbletter stoppas och visningsstatus kan ändras',async()=>{
 const cwd=mkdtempSync(path.join(tmpdir(),'filmhorna-'));
 const child=spawn(process.execPath,[path.resolve('server/index.js')],{cwd,env:{...process.env,PORT:'3199'},stdio:['ignore','pipe','pipe']});
 try{
 await Promise.race([once(child.stdout,'data'),once(child,'exit').then(()=>{throw Error('Servern kunde inte starta');})]);
 const call=async(route,method='GET',body)=>fetch('http://127.0.0.1:3199/api/'+route,{method,headers:{'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
 const film={title:'Testfilm',format:'Blu-ray',year:'2024',genre:'Drama',code:'1234567890123',poster:'https://example.com/poster.jpg',overview:'Sökbar beskrivning'};
 assert.equal((await call('films','POST',film)).status,201);
 assert.equal((await call('films','POST',film)).status,409);
 const list=await(await call('films')).json();assert.equal(list.length,1);assert.equal(list[0].poster,film.poster);
 await call('films/'+list[0].id,'PATCH',{watched:true});
 assert.equal((await(await call('films')).json())[0].watched,1);
 assert.equal((await call('films','POST',{title:'',format:'DVD'})).status,400);
 await call('films/'+list[0].id,'DELETE');assert.deepEqual(await(await call('films')).json(),[]);
 }finally{child.kill();await once(child,'exit');rmSync(cwd,{recursive:true,force:true});}
});
