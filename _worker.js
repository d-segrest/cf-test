export default {
  async fetch(request, env, ctx) {
    const country = request.cf?.country || request.headers.get("cf-ipcountry");

    if (country !== "US") {
      return new Response("Access Denied: USA traffic only.", {
        status: 403,
        headers: {
          "content-type": "text/plain; charset=utf-8"
        }
      });
    }

    return env.ASSETS.fetch(request);
  },
};