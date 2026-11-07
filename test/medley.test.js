import test from 'node:test';
import assert from 'node:assert/strict';
import {compatibility,makeMedley} from '../src/medley.js';
import {safeUrl,parseSongs} from '../server/importer.js';
test('same key ranks above distant keys; tempo differentiates',()=>{
 const a={key:'G',bpm:70}; assert.ok(compatibility(a,{key:'G',bpm:72}).score>compatibility(a,{key:'C#',bpm:70}).score);
 assert.ok(compatibility(a,{key:'G',bpm:72}).score>compatibility(a,{key:'G',bpm:110}).score);
});
test('relative keys recognized in both directions',()=>{assert.ok(compatibility({key:'C'},{key:'Am'}).reasons.includes('Tonalidades relativas'));assert.ok(compatibility({key:'Am'},{key:'C'}).reasons.includes('Tonalidades relativas'));});
test('keeps chosen first song and does not repeat or invent songs',()=>{const songs=[{id:'1',title:'A',key:'C'},{id:'2',title:'B',key:'G'},{id:'3',title:'C',key:'C'}];const result=makeMedley(songs,'2',6);assert.equal(result[0].id,'2');assert.equal(result.length,3);assert.equal(new Set(result.map(s=>s.id)).size,3);assert.equal(songs[0].id,'1');assert.deepEqual(makeMedley(songs,'unknown'),[]);});
test('unknown metadata is not treated as compatible',()=>{assert.equal(compatibility({},{key:'C'}).score,0);assert.deepEqual(compatibility({},{}).reasons,['Tom a conferir']);});
test('import restricts network targets and supports actual user domain',()=>{
 assert.equal(safeUrl('https://www.cifraclub.com/@13487389/repertorio/14171923/').hostname,'www.cifraclub.com');
 for(const url of ['http://www.cifraclub.com/','https://evil.com/','https://www.cifraclub.com.evil.com/','https://user:pass@cifraclub.com/','https://cifraclub.com:8080/','http://127.0.0.1/']) assert.throws(()=>safeUrl(url));
});
test('HTML import deduplicates song links and excludes navigation',()=>{
 const html='<a href="/artista/cancao/">Canção</a><a href="/artista/cancao/">Canção</a><a href="https://evil.com/a/b/">Other</a><a href="/aulas/violao/">Aulas</a><a href="/@123/listas/">Profile</a>';
 const songs=parseSongs(html,'https://www.cifraclub.com/');assert.equal(songs.length,1);assert.equal(songs[0].title,'Canção');assert.equal(songs[0].key,'');assert.equal(songs[0].bpm,null);
});
