export const keys=['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B','Cm','C#m','Dm','Ebm','Em','Fm','F#m','Gm','Abm','Am','Bbm','Bm'];
const notes={C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11};
function tone(key){if(typeof key!=='string')return null; const minor=key.endsWith('m'); const n=notes[key.replace(/m$/,'')]; return n===undefined?null:{n,minor};}
export function compatibility(a,b){
 const x=tone(a.key),y=tone(b.key); let score=0,reasons=[];
 if(x&&y){
  const delta=(y.n-x.n+12)%12;
  if(delta===0&&x.minor===y.minor){score+=70;reasons.push('Mesmo tom');}
  else if(x.minor!==y.minor&&((!x.minor&&delta===9)||(x.minor&&delta===3))){score+=60;reasons.push('Tonalidades relativas');}
  else if(x.minor===y.minor&&[5,7].includes(delta)){score+=45;reasons.push('Tons vizinhos');}
  else {score+=10;reasons.push('Exige mudança de tom');}
 } else reasons.push('Tom a conferir');
 const bpmA=Number(a.bpm),bpmB=Number(b.bpm);
 if(bpmA>0&&bpmB>0){const gap=Math.abs(bpmA-bpmB);score+=Math.max(0,30-gap);reasons.push(gap<=10?'Andamento próximo':'Ajuste de andamento');}
 return {score,reasons};
}
export function makeMedley(songs,firstId,length=4){
 const first=songs.find(s=>s.id===firstId);if(!first)return [];
 const result=[{...first,transition:null}]; const remaining=songs.filter(s=>s.id!==firstId);
 while(result.length<length&&remaining.length){const prev=result.at(-1);remaining.sort((a,b)=>compatibility(prev,b).score-compatibility(prev,a).score||a.title.localeCompare(b.title));const next=remaining.shift();result.push({...next,transition:compatibility(prev,next)});}
 return result;
}
export const demoSongs=[
 {id:'demo1',title:'A Casa É Sua',artist:'Casa Worship',key:'G',bpm:68},
 {id:'demo2',title:'Aquieta Minh’alma',artist:'Ministério Zoe',key:'G',bpm:70},
 {id:'demo3',title:'Lugar Secreto',artist:'Gabriela Rocha',key:'Em',bpm:72},
 {id:'demo4',title:'Ousado Amor',artist:'Isaias Saad',key:'G',bpm:74},
 {id:'demo5',title:'Bondade de Deus',artist:'Isaias Saad',key:'A',bpm:68},
 {id:'demo6',title:'Pra Onde Eu Irei?',artist:'Morada',key:'D',bpm:72},
 {id:'demo7',title:'Todavia Me Alegrarei',artist:'Samuel Messias',key:'C',bpm:76},
 {id:'demo8',title:'Me Atraiu',artist:'Gabriela Rocha',key:'D',bpm:70},
].map(s=>({...s,url:'',source:'Exemplo'}));
