# Dashboard build for Cloudflare Pages

`dashboard.zip` is the static export (`next build`, `output: "export"`) of the `v2-pages` branch, uploaded to the Cloudflare Pages project `quadrum-dashboard`. Build it with:

```
NEXT_PUBLIC_BACKEND_URL=https://api.quadrumtechnologies.com/api/v1 \
NEXT_PUBLIC_BACKEND_WS=wss://api.quadrumtechnologies.com/ws \
npx next build   # writes out/
```

This branch holds build output only; the source is on `v2-pages`.
