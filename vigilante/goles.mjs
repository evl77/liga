// Vigilante de goles: consulta ESPN cada 30 s durante ~4,5 min y envía avisos a ntfy.
// Configuración (GitHub → Settings → Secrets and variables → Actions):
//   Secret   NTFY_TOPIC  = el canal que muestra la app en Favoritos
//   Variable FAVORITOS   = IDs de equipo separados por comas (los muestra la app)
import fs from 'node:fs';
const TOPIC = process.env.NTFY_TOPIC;
const FAVS = (process.env.FAVORITOS || '').split(',').map(s => s.trim()).filter(Boolean);
const STATE = 'estado.json';
if (!TOPIC || !FAVS.length) { console.log('Falta NTFY_TOPIC o FAVORITOS'); process.exit(0); }

let st = {}; try { st = JSON.parse(fs.readFileSync(STATE, 'utf8')); } catch {}
const ymd = d => d.toISOString().slice(0, 10).replace(/-/g, '');
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function ronda() {
  const hoy = new Date(), ayer = new Date(Date.now() - 864e5);
  let enJuego = false;
  for (const lg of ['esp.1', 'esp.2', 'uefa.champions', 'uefa.europa']) {
    const eventos = [];
    for (const dia of [ayer, hoy]) {
      try {
        const d = await (await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${lg}/scoreboard?dates=${ymd(dia)}`)).json();
        eventos.push(...(d.events || []));
      } catch (e) { console.log('Error ESPN', lg, e.message); }
    }
    for (const ev of eventos) {
      const c = ev.competitions?.[0]; if (!c) continue;
      const H = c.competitors.find(x => x.homeAway === 'home'), A = c.competitors.find(x => x.homeAway === 'away');
      if (!FAVS.includes(H.team.id) && !FAVS.includes(A.team.id)) continue;
      const estado = ev.status?.type?.state;
      if (estado === 'pre') continue;
      if (estado === 'in') enJuego = true;
      const ahora = `${+H.score || 0}-${+A.score || 0}`, antes = st[ev.id];
      if (antes === undefined) { st[ev.id] = ahora; continue; }
      if (antes !== ahora) {
        const [ph, pa] = antes.split('-').map(Number), nh = +H.score || 0, na = +A.score || 0;
        const marca = nh > ph ? H : na > pa ? A : null;
        if (marca) {
          const g = (c.details || []).filter(x => x.scoringPlay).pop();
          const quien = g?.athletesInvolved?.[0]?.displayName, min = g?.clock?.displayValue;
          const mio = FAVS.includes(marca.team.id);
          await fetch(`https://ntfy.sh/${TOPIC}`, {
            method: 'POST',
            headers: { Title: `${mio ? '¡GOL del' : 'Gol del'} ${marca.team.shortDisplayName}!`, Tags: 'soccer', Priority: mio ? 'high' : 'default' },
            body: `${H.team.shortDisplayName} ${nh} - ${na} ${A.team.shortDisplayName}${quien ? ' · ' + quien : ''}${min ? ' (' + min + ')' : ''}`,
          });
          console.log('Aviso enviado', ev.name, ahora);
        }
        st[ev.id] = ahora;
      }
    }
  }
  return enJuego;
}

const fin = Date.now() + 270e3;
do { if (!(await ronda())) break; await sleep(30e3); } while (Date.now() < fin);
const ks = Object.keys(st); if (ks.length > 200) ks.slice(0, ks.length - 200).forEach(k => delete st[k]);
fs.writeFileSync(STATE, JSON.stringify(st));
