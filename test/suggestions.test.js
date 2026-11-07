import test from 'node:test';
import assert from 'node:assert/strict';
import {themes,chords,suggest} from '../src/suggestions.js';
test('themes normalize accents and require full words',()=>{assert.deepEqual(themes('GRATIDÃO e bondade'),['Gratidão']);assert.deepEqual(themes('desamor'),[])});
test('recognizes chord lines and brackets without treating prose as chords',()=>{assert.deepEqual(chords('G D/F# Em C\nA casa fica aqui\n[Am7] Uma frase [D7]\nG D/F#'),['G','D/F#','Em','C','Am7','D7']);});
test('shared themes change ranking, previous songs are excluded',()=>{const a={id:'a',key:'C',lyrics:'gratidão bondade'};const b={id:'b',title:'B',key:'C',lyrics:'grato'};const c={id:'c',title:'A',key:'C',lyrics:'esperança'};assert.equal(suggest(a,[a,b,c])[0].song.id,'b');assert.deepEqual(suggest(a,[a,b,c],['b']).map(s=>s.song.id),['c']);});
test('missing metadata never invents thematic compatibility',()=>{const [s]=suggest({id:'a'},[{id:'b',title:'Amor'}]);assert.equal(s.score,0);assert.ok(s.reasons.includes('Letra ausente: tema não comparado'));assert.ok(!s.reasons.some(r=>r.startsWith('Tema em comum')));});
