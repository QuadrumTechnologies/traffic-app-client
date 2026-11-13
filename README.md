# Dashboard build for Cloudflare Pages

`dashboard.zip` is the static export (`next build`, `output: "export"`) of `main`, uploaded to the Cloudflare Pages project `quadrum-dashboard`. That project serves `app.quadrumtechnologies.com` and `traffic-signal.quadrumtechnologies.com` (since 13 Nov 2026).

Build it with:

```
NEXT_PUBLIC_BACKEND_URL=https://api.quadrumtechnologies.com/api/v1 \
NEXT_PUBLIC_BACKEND_WS=wss://api.quadrumtechnologies.com/ws \
npx next build   # writes out/
cd out && zip -qr -X ../dashboard.zip .
```

Deploy: Pages project `quadrum-dashboard` → Create deployment → Production → upload `dashboard.zip` → wait until every file is uploaded → Save and deploy.

This branch holds build output only; the source is on `main`.
