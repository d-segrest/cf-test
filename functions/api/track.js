function stateCodeFromRegion(region) {
  const map = {
    Alabama:'AL', Alaska:'AK', Arizona:'AZ', Arkansas:'AR', California:'CA', Colorado:'CO', Connecticut:'CT', Delaware:'DE', Florida:'FL', Georgia:'GA', Hawaii:'HI', Idaho:'ID', Illinois:'IL', Indiana:'IN', Iowa:'IA', Kansas:'KS', Kentucky:'KY', Louisiana:'LA', Maine:'ME', Maryland:'MD', Massachusetts:'MA', Michigan:'MI', Minnesota:'MN', Mississippi:'MS', Missouri:'MO', Montana:'MT', Nebraska:'NE', Nevada:'NV', 'New Hampshire':'NH', 'New Jersey':'NJ', 'New Mexico':'NM', 'New York':'NY', 'North Carolina':'NC', 'North Dakota':'ND', Ohio:'OH', Oklahoma:'OK', Oregon:'OR', Pennsylvania:'PA', 'Rhode Island':'RI', 'South Carolina':'SC', 'South Dakota':'SD', Tennessee:'TN', Texas:'TX', Utah:'UT', Vermont:'VT', Virginia:'VA', Washington:'WA', 'West Virginia':'WV', Wisconsin:'WI', Wyoming:'WY', 'District of Columbia':'DC'
  };
  if (!region) return 'Unknown';
  return map[region] || region;
}

async function readStats(env) {
  if (!env.VISITOR_KV) return { totalVisits: 0, totalClicks: 0, states: {}, events: {}, demo: true };
  const raw = await env.VISITOR_KV.get('stats');
  return raw ? JSON.parse(raw) : { totalVisits: 0, totalClicks: 0, states: {}, events: {} };
}

async function writeStats(env, stats) {
  if (!env.VISITOR_KV) return;
  await env.VISITOR_KV.put('stats', JSON.stringify(stats));
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const stats = await readStats(env);
  const cf = request.cf || {};
  const country = cf.country || request.headers.get('cf-ipcountry') || 'Unknown';
  const state = country === 'US' ? stateCodeFromRegion(cf.region) : (country || 'Unknown');

  stats.totalVisits = (stats.totalVisits || 0) + 1;
  stats.states = stats.states || {};
  stats.states[state] = stats.states[state] || { count: 0, country, region: cf.region || '', city: cf.city || '' };
  stats.states[state].count += 1;
  stats.states[state].country = country;
  stats.states[state].region = cf.region || stats.states[state].region || '';
  stats.states[state].city = cf.city || stats.states[state].city || '';
  stats.lastUpdated = new Date().toISOString();

  await writeStats(env, stats);
  return Response.json({ ok: true, stored: !!env.VISITOR_KV });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const stats = await readStats(env);
  let payload = {};
  try { payload = await request.json(); } catch {}
  const event = String(payload.event || 'interaction').replace(/[^a-zA-Z0-9_\-]/g, '').slice(0, 64) || 'interaction';

  stats.totalClicks = (stats.totalClicks || 0) + 1;
  stats.events = stats.events || {};
  stats.events[event] = (stats.events[event] || 0) + 1;
  stats.lastUpdated = new Date().toISOString();

  await writeStats(env, stats);
  return Response.json({ ok: true, event, stored: !!env.VISITOR_KV });
}
