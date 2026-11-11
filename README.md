# Tempo

Smoke test site for Tempo, a quiet desk sand timer for people who sit at a screen all day. A student concept: nothing is for sale.

Pages: `index.html` (landing), `checkout.html`, `unavailable.html`, `results.html` (team-only tester log).

## Settings
- `site.js`: paste a Google Form link into `FORM_URL` for remote testers.
- Each page has an `ANALYTICS` comment where an analytics snippet goes.

## Publish with GitHub Pages
1. Repo Settings, Pages, deploy from the `main` branch, root folder.
2. Custom domain: `temposand.com` (the `CNAME` file already says so). Turn on "Enforce HTTPS" once the certificate is ready.
3. At the domain registrar, add four A records for the root domain (`@`) pointing to GitHub Pages: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153. Add a `www` CNAME pointing to `<your-github-username>.github.io`. Check GitHub's current Pages docs in case these change.
