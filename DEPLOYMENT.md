# GitHub Pages + Cloudflare Worker Deployment

This project is set up so the frontend is hosted by GitHub Pages and the backend API is hosted by Cloudflare Workers.

## 1. Deploy the Cloudflare Worker

```powershell
cd cloudflare-worker
npm install
npx wrangler login
npx wrangler deploy
```

Copy the deployed Worker URL, for example:

```text
https://osint-forge-api.YOUR_SUBDOMAIN.workers.dev
```

## 2. Configure CORS

In `cloudflare-worker/wrangler.toml`, replace `ALLOWED_ORIGINS` with your real frontend origins.

Examples:

```toml
ALLOWED_ORIGINS = "https://YOUR_USERNAME.github.io,https://YOUR_DOMAIN.com"
```

Then redeploy:

```powershell
npx wrangler deploy
```

## 3. Add optional provider secrets

Email breach enrichment uses Have I Been Pwned when a key is present:

```powershell
npx wrangler secret put HIBP_API_KEY
```

Add other provider keys the same way. Keep API keys in Cloudflare, not GitHub Pages and not browser code.

## 4. Configure GitHub Pages

In GitHub:

1. Open the repository settings.
2. Go to Pages.
3. Set source to GitHub Actions.
4. Go to repository Variables and add:

```text
NEXT_PUBLIC_API_BASE_URL=https://osint-forge-api.YOUR_SUBDOMAIN.workers.dev
```

If you deploy under `https://USERNAME.github.io/REPO_NAME`, also add:

```text
NEXT_PUBLIC_BASE_PATH=/REPO_NAME
```

If you deploy with a custom domain, leave `NEXT_PUBLIC_BASE_PATH` empty.

## 5. DNS

Point your frontend domain to GitHub Pages. Point an API subdomain, such as `api.yourdomain.com`, to the Cloudflare Worker route if you want a custom API URL.

The frontend search pages call:

```text
/api/people
/api/domains
/api/handles
/api/export
```

on the Worker base URL configured by `NEXT_PUBLIC_API_BASE_URL`.