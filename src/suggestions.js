import {compatibility} from './medley.js';
const vocabulary={
 'Adoração':['adorar','adoracao','adoro','louvor','louvar','santo','gloria'],
 'Confiança':['confiar','confio','confianca','descanso','descansar','medo','paz'],
 'Amor':['amor','ama','amado','amar','cuidado','abraco'],
 'Gratidão':['gratidao','grato','agradecer','obrigado','bondade'],
 'Esperança':['esperanca','esperar','renovo','amanha','promessa'],
 'Entrega':['entrega','entrego','render','rendo','vontade','altar'],
 'Presença':['presenca','perto','habitar','habita','comunhao'],
 'Salvação':['salvacao','salvou','cruz','perdao','redencao','graca']
};
const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function themes(text=''){
 const words=new Set(normalize(text).match(/[a-z]+/g)||[]);
 return Object.entries(vocabulary).filter(([,terms])=>terms.some(t=>words.has(t))).map(([theme])=>theme);
}
const chord=/^[A-G](?:#|b)?(?:m(?!aj)|maj|dim|aug|sus)?(?:\d+)?(?:add\d+)?(?:\([#b]?\d+\))?(?:\/[A-G][#b]?)?$/;
export function chords(text=''){
 const found=[];
 for(const line of text.split('\n')){
  const bracketed=[...line.matchAll(/\[([^\]]+)\]/g)].map(m=>m[1]);
  const tokens=line.trim().split(/\s+/).filter(t=>t&&!/^[|:./-]+$/.test(t));
  const candidates=bracketed.length?bracketed:(tokens.length&&tokens.every(t=>chord.test(t))?tokens:[]);
  for(const c of candidates)if(chord.test(c)&&!found.includes(c))found.push(c);
 }
 return found;
}
export function suggest(current,songs,excluded=[]){
 if(!current)return [];
 const sourceThemes=themes(current.lyrics||''),sourceChords=chords(current.lyrics||'');
 return songs.filter(s=>s.id!==current.id&&!excluded.includes(s.id)).map(song=>{
  const musical=compatibility(current,song);
  const sharedThemes=themes(song.lyrics||'').filter(t=>sourceThemes.includes(t));
  const sharedChords=chords(song.lyrics||'').filter(c=>sourceChords.includes(c));
  const reasons=[...musical.reasons,...sharedThemes.map(t=>`Tema em comum: ${t}`)];
  if(sharedChords.length)reasons.push(`Acordes em comum: ${sharedChords.join(', ')}`);
  if(!current.lyrics?.trim()||!song.lyrics?.trim())reasons.push('Letra ausente: tema não comparado');
  else if(!sharedThemes.length)reasons.push('Sem tema em comum detectado');
  const score=musical.score+Math.min(60,sharedThemes.length*30)+Math.min(20,sharedChords.length*5);
  const transition=musical.reasons.includes('Mesmo tom')?'Experimente sustentar o acorde de tônica e entrar na próxima música no mesmo tom.':musical.reasons.includes('Tonalidades relativas')?'Experimente um acorde comum como passagem para a tonalidade relativa.':current.key&&song.key?`Ensaie uma pausa ou modulação de ${current.key} para ${song.key} antes da próxima entrada.`:'Confira os tons antes de escolher o acorde de passagem.';
  return {song,score,reasons,transition};
 }).sort((a,b)=>b.score-a.score||a.song.title.localeCompare(b.song.title));
}
