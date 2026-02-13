# Deploy Guide (Cloudflare Pages)

## Project
- Cloudflare Pages project: `surl`
- Live domain: `https://cap-ly.com`

## One-time setup (first time on a machine)
```bash
cd "/Users/ccaptain/Documents/Dev Projects/URL-Shortner"
npx wrangler login
```

## Fast manual deploy (after any change)
```bash
cd "/Users/ccaptain/Documents/Dev Projects/URL-Shortner"
npm run deploy:cloudflare
```

## Recommended workflow (every change)
```bash
cd "/Users/ccaptain/Documents/Dev Projects/URL-Shortner"
git add .
git commit -m "Describe your change"
git push origin master
npm run deploy:cloudflare
```

## Verify deployment
1. Open `https://cap-ly.com`
2. Hard refresh: `Cmd + Shift + R` (macOS)
3. If needed, check latest deployment:
```bash
npx wrangler pages deployment list --project-name surl
```

## Optional: fully automatic deploy from GitHub
In Cloudflare Dashboard:
1. `Workers & Pages` -> `surl` -> `Settings` -> `Builds & deployments`
2. Connect GitHub repo `captaine13/url-shortner`
3. Production branch: `master`
4. Build command: *(empty)*
5. Build output directory: `public`

After this, deploy is just:
```bash
git add .
git commit -m "Describe your change"
git push origin master
```
