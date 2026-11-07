import { load } from 'cheerio';
import { fetch, EnvHttpProxyAgent } from 'undici';
const hosts = new Set(['www.cifraclub.com.br', 'cifraclub.com.br', 'www.cifraclub.com', 'cifraclub.com']);
export function safeUrl(value) {
  let url;
  try { url = new URL(value); } catch { throw new Error('Informe um link válido do Cifra Club.'); }
  if (url.protocol !== 'https:' || !hosts.has(url.hostname) || url.username || url.password || (url.port && url.port !== '443')) throw new Error('Use um link HTTPS de cifraclub.com ou cifraclub.com.br.');
  url.hash = ''; return url;
}
const excluded = new Set(['musico','musicos','usuario','usuarios','listas','lista','playlists','playlist','aulas','blog','forum','estilos','instrumentos','artistas','busca','letras','login','cadastro','premium','academy']);
export function parseSongs(html, base) {
  const $ = load(html), songs = new Map();
  $('a[href]').each((_, el) => {
    let url; try { url = safeUrl(new URL($(el).attr('href'), base).href); } catch { return; }
    const parts = url.pathname.split('/').filter(Boolean);
    if(parts.length !== 2 || parts[0].startsWith('@') || excluded.has(parts[0]) || /\.(jpg|png|js|css)$/.test(parts[1])) return;
    url.search = ''; url.pathname = `/${parts.join('/')}/`;
    const title = $(el).find('[class*="title"], [class*="name"]').first().text().trim() || $(el).text().trim();
    if (!title || title.length > 160 || songs.has(url.href)) return;
    const artist = $(el).attr('data-artist') || parts[0].replaceAll('-', ' ');
    songs.set(url.href, { id: url.href, title, artist, key: '', bpm: null, url: url.href, source: 'Cifra Club' });
  });
  return [...songs.values()].slice(0, 200);
}
export async function importList(value) {
  let url = safeUrl(value);
  const dispatcher = new EnvHttpProxyAgent();
  try {
    for (let i = 0; i < 4; i++) {
      const response = await fetch(url, { dispatcher, redirect: 'manual', signal: AbortSignal.timeout(15000), headers: { 'User-Agent': 'Medley/1.0 (public playlist import)', 'Accept': 'text/html' } });
      if ([301,302,303,307,308].includes(response.status)) {
        const location=response.headers.get('location'); await response.body?.cancel();
        if(!location) throw new Error('Redirecionamento inválido.');
        url = safeUrl(new URL(location, url).href); continue;
      }
      if(!response.ok) { await response.body?.cancel(); throw new Error('O Cifra Club não liberou esta lista. Confira se ela é pública e tente novamente.'); }
      if(!response.headers.get('content-type')?.includes('text/html')) { await response.body?.cancel(); throw new Error('Este link não contém uma página de lista.'); }
      let size=0; const chunks=[];
      for await(const chunk of response.body) { size+=chunk.length; if(size>2_000_000) throw new Error('Lista muito grande para importar.'); chunks.push(Buffer.from(chunk)); }
      const songs=parseSongs(Buffer.concat(chunks).toString('utf8'),url.href);
      if(!songs.length) throw new Error('Não encontramos músicas no HTML desta lista. Ela pode ser privada ou carregar por JavaScript. Adicione as músicas manualmente.');
      return songs;
    }
    throw new Error('O link redirecionou muitas vezes.');
  } finally { await dispatcher.close(); }
}
