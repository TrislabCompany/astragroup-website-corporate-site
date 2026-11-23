# astragroup-website-corporate-site

Astra Group, astragroup.si, built from `tl-template-website` v0.5.0. Read this first; the detail is in [`docs/`](docs/).

## What it is

An [Astro](https://astro.build) site built into static files, served by Cloudflare Pages. The corporate site of Astra Group, a construction and renovation company in the Coastal-Karst region of Slovenia. It replaces the earlier Angular app at astragroup.si; what to build is in [docs/brief.md](docs/brief.md).

It has a home page, an about page, a contact page, an imprint, a privacy policy, general terms, an accessibility statement, a sitemap page and a 404 page; the six service groups (`services`) and the company's projects (`projects`), each with a list page and a page per item. It sets no cookies, runs no JavaScript and loads no outside service. The earlier site's addresses redirect to the new pages in `public/_redirects`.

The look is the site's own: today's navy and amber (`src/styles/tokens.css`), Roboto, the logo traced to SVG (`public/logo.svg`, `public/favicon.svg`), and the components in `src/components/` (service and project cards, the step list, the project gallery, the contact band, the link to an extension site). The texts are in `src/content/` (`pages/` for the home and about pages) and `src/i18n/ui/`.

**Languages:** Slovenian, Italian, Croatian, English. The first is the default; each language lives under its own URL.

## Environments

| Environment | Address | Shows | Who can open it |
| --- | --- | --- | --- |
| `dev` | `dev.astragroup.si` | The newest merged work | Signed-in people only |
| `staging` | `staging.astragroup.si` | The newest release | Signed-in people only |
| `production` | `astragroup.si` | The promoted release | Everyone, after the cutover |

How a change moves between them is in [docs/deployment.md](docs/deployment.md). Where each one runs and which version is deployed: `pnpm status`.

## Before production

- A lawyer reviews the privacy policy, the general terms and the accessibility statement in `src/content/legal/<language>/`.
- A native speaker reviews the Italian, Croatian and English texts; Slovenian is the source.
- The company confirms every fact: the texts of the services, the steps of how a job runs and the places on the home page, and the about page.
- The company confirms it may publish the project photos taken from the earlier site; then set `photosCleared: true` in each project in `src/content/projects/`. Add a project's place and year (`place`, `year`) only once the company has confirmed them.
- Check the facts in `src/site.config.ts` against the company's published data.
- Set `analytics` in `src/site.config.ts` with the Cloudflare Web Analytics token from tl-cloud-infrastructure, and name it in the privacy policy ([docs/analytics.md](docs/analytics.md)).

## Work on it

1. `pnpm install`, then `pnpm dev`, and open <http://localhost:4321>.
2. Run `pnpm test` and `pnpm test:a11y` before every push ([docs/getting-started.md](docs/getting-started.md)).
3. Every change is a PR to `main`. `ci / ci` must pass and a code owner must approve. A merge deploys to `dev`.

## More

- [AGENTS.md](AGENTS.md): the guide for coding agents and their skills.
- [Site settings](docs/site-settings.md): languages, lists of items, contact and legal pages, the brand.
- [Deployment](docs/deployment.md): deploy, release and promote.
- [Quality checks](docs/quality-checks.md): what `ci / ci` checks.
- [Updates from the template](docs/upgrading/README.md): `.template-version` and update PRs.

## Licence

Proprietary: [LICENSE](LICENSE). The code is public to read, but it belongs to Trislab d.o.o., and only Trislab, and the clients of the applications Trislab delivers under a written agreement, may use it. Cloning or forking it for use, copying, redistribution and training AI models on it are not allowed. Material of others, such as the dependencies and a client's texts, logos and photos, keeps its owner's rights and its own licence.
