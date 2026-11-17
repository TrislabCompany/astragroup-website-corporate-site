// The sitemap's finishing touches, used by astro.config.mjs (docs/search-engines.md).
// Shared with the template (template-manifest.yaml).
//
// @astrojs/sitemap writes sitemap-index.xml and sitemap-0.xml in the sitemaps.org
// format, with every page's language versions as <xhtml:link rel="alternate">,
// the way Google reads them. These helpers make it say what the pages say:
// - the same x-default as the pages' hreflang (the default language);
// - no page that asks to stay out of search (<meta name="robots" content="noindex">).
import { readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

/**
 * The alternates of a sitemap entry with x-default added, pointing at the
 * default language's version, as the pages' <link rel="alternate"> do.
 * @param {{ url: string, lang: string }[] | undefined} links
 * @param {string} defaultLanguage
 */
export function withDefaultLanguage(links, defaultLanguage) {
  if (!links || links.length < 2) return links;
  const target = links.find((link) => link.lang === defaultLanguage);
  return target ? [...links, { lang: "x-default", url: target.url }] : links;
}

/**
 * The language alternates of a built page, as its <link rel="alternate"
 * hreflang> say, x-default included. For a site whose addresses differ per
 * language (/sl/o-nas, /en/about), @astrojs/sitemap can't pair the languages
 * by path, so the sitemap takes them from the page itself.
 * @param {URL} distDir  the build's output folder
 * @param {string} url   the page's absolute address
 * @returns {Promise<{ url: string, lang: string }[] | undefined>}
 */
export async function alternatesOfPage(distDir, url) {
  const path = new URL(url).pathname.replace(/\/+$/, "");
  const file = new URL(path === "" ? "index.html" : `${path.slice(1)}.html`, distDir);
  const html = await readFile(file, "utf8").catch(() => "");
  const links = [...html.matchAll(/<link\s+rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]+)"/gi)].map(([, lang, href]) => ({ lang, url: href }));
  return links.length > 0 ? links : undefined;
}

const NOINDEX = /<meta\s+name="robots"\s+content="[^"]*noindex[^"]*"/i;

/**
 * The sitemap without the <url> entries whose address is in `drop`.
 * @param {string} xml
 * @param {Set<string>} drop
 */
export function withoutUrls(xml, drop) {
  return xml.replace(/<url>[\s\S]*?<\/url>/g, (entry) => {
    const loc = entry.match(/<loc>([^<]+)<\/loc>/)?.[1];
    return loc && drop.has(loc) ? "" : entry;
  });
}

/**
 * An integration that runs after @astrojs/sitemap and takes out every page
 * marked noindex: a sitemap lists only pages that should be found.
 * @param {string} siteUrl
 * @returns {import("astro").AstroIntegration}
 */
export function sitemapWithoutNoindex(siteUrl) {
  return {
    name: "sitemap-without-noindex",
    hooks: {
      "astro:build:done": async ({ dir }) => {
        const root = fileURLToPath(dir);
        const entries = await readdir(root, { withFileTypes: true, recursive: true });
        const drop = new Set();
        for (const entry of entries) {
          if (!entry.isFile() || !entry.name.endsWith(".html")) continue;
          const html = await readFile(join(entry.parentPath, entry.name), "utf8");
          if (!NOINDEX.test(html)) continue;
          // en/about.html is /en/about and index.html is / (build.format "file").
          const file = join(entry.parentPath, entry.name).slice(root.length).split(/[\\/]/).filter(Boolean).join("/");
          const address = `/${file.replace(/\.html$/, "")}`.replace(/\/index$/, "");
          drop.add(address === "" ? `${siteUrl}/` : `${siteUrl}${address}`);
        }
        if (drop.size === 0) return;
        for (const entry of entries) {
          if (!entry.isFile() || !/^sitemap-\d+\.xml$/.test(entry.name)) continue;
          const file = join(entry.parentPath, entry.name);
          await writeFile(file, withoutUrls(await readFile(file, "utf8"), drop));
        }
      },
    },
  };
}
