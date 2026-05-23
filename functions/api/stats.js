export async function onRequestGet(context) {
  const { env } = context;
  if (!env.VISITOR_KV) {
    return Response.json({
      demo: true,
      totalVisits: 0,
      totalClicks: 0,
      states: {},
      message: 'Add a Cloudflare KV binding named VISITOR_KV to store visitor analytics.'
    });
  }
  const raw = await env.VISITOR_KV.get('stats');
  return Response.json(raw ? JSON.parse(raw) : { totalVisits: 0, totalClicks: 0, states: {}, events: {} });
}
