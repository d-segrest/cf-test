const statePositions = {
  AL:[610,390], AK:[165,510], AZ:[245,390], AR:[545,375], CA:[145,330], CO:[355,330], CT:[815,220], DE:[785,285], FL:[690,475], GA:[655,405],
  HI:[300,525], IA:[540,255], ID:[260,210], IL:[595,285], IN:[640,285], KS:[465,330], KY:[655,330], LA:[555,435], MA:[835,205], MD:[775,285],
  ME:[835,145], MI:[655,220], MN:[525,185], MO:[545,320], MS:[585,410], MT:[350,175], NC:[720,350], ND:[480,165], NE:[465,280], NH:[818,175],
  NJ:[795,258], NM:[330,390], NV:[210,300], NY:[760,220], OH:[680,275], OK:[475,375], OR:[160,210], PA:[750,255], RI:[842,222], SC:[690,385],
  SD:[470,215], TN:[630,355], TX:[460,445], UT:[285,325], VA:[725,320], VT:[800,175], WA:[165,155], WI:[585,220], WV:[705,305], WY:[350,255]
};

function trackEvent(name) {
  fetch('/api/track', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ event: name || 'interaction' })
  }).catch(() => {});
}

async function loadStats() {
  try {
    const res = await fetch('/api/stats');
    const data = await res.json();
    renderStats(data);
  } catch {
    renderStats({ demo: true, totalVisits: 0, states: {} });
  }
}


// Cloudflare Worker main entry point
export default {
  async fetch(request, env, ctx) {
    // 1. Check the country code
    const country = request.cf?.country;

    // 2. Allow US traffic and legitimate search bots
    const isUS = country === 'US';
    const isBot = request.cf?.asOrganization?.toLowerCase().includes('google') || false;

    // 3. Block if it's outside the US
    if (country && !isUS && !isBot) {
      return new Response('Access Denied: This portfolio is restricted to US regions.', {
        status: 403,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    // 4. If US, serve your HTML portfolio page
    return new Response(htmlContent, {
      headers: { 'content-type': 'text/html;charset=UTF-8' },
    });
  },
};

function renderStats(data) {
  document.getElementById('visitCount').textContent = data.totalVisits ?? 0;
  const pins = document.getElementById('pins');
  pins.innerHTML = '';
  const states = data.states || {};
  const entries = Object.entries(states).sort((a,b) => (b[1].count || 0) - (a[1].count || 0));

  for (const [state, info] of entries.slice(0, 20)) {
    const pos = statePositions[state];
    if (!pos) continue;
    const [x, y] = pos;
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'pin');
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', Math.min(10 + (info.count || 1) * 2, 24));
    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('x', x + 16); t.setAttribute('y', y + 7); t.textContent = state;
    g.appendChild(c); g.appendChild(t); pins.appendChild(g);
  }

  const box = document.getElementById('stateCounts');
  if (!entries.length) {
    box.innerHTML = '<p>No visitor state data yet. After the Cloudflare KV binding is added, visits will appear here.</p>';
    return;
  }
  box.innerHTML = entries.slice(0, 12).map(([state, info]) =>
    `<div class="state-row"><strong>${state}</strong><span>${info.count || 0} visit${(info.count || 0) === 1 ? '' : 's'}</span></div>`
  ).join('');
}

function activateTab(name) {
  const target = name || 'resume';
  document.querySelectorAll('[data-tab-panel]').forEach(panel => {
    const isActive = panel.getAttribute('data-tab-panel') === target;
    panel.hidden = !isActive;
    panel.classList.toggle('active', isActive);
  });
  document.querySelectorAll('[data-tab]').forEach(button => {
    const isActive = button.getAttribute('data-tab') === target;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
}

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();
  fetch('/api/track', { method: 'GET' }).then(() => loadStats()).catch(loadStats);

  document.querySelectorAll('[data-tab]').forEach(button => {
    button.addEventListener('click', () => {
      activateTab(button.getAttribute('data-tab'));
      document.querySelector('.tab-shell')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  document.querySelectorAll('[data-tab-link]').forEach(link => {
    link.addEventListener('click', (event) => {
      const tab = link.getAttribute('data-tab-link');
      if (tab && tab !== 'overview') {
        event.preventDefault();
        activateTab(tab);
        document.querySelector('.tab-shell')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  const hashTab = window.location.hash.replace('#', '');
  if (hashTab && document.querySelector(`[data-tab-panel="${hashTab}"]`)) activateTab(hashTab);

  document.querySelectorAll('[data-track]').forEach(el => {
    el.addEventListener('click', () => trackEvent(el.getAttribute('data-track')));
    if (el.tagName === 'VIDEO' || el.tagName === 'AUDIO') {
      el.addEventListener('play', () => trackEvent(el.getAttribute('data-track')));
    }
  });
});
