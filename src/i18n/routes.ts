// The addresses of the pages in each language: /sl/storitve/fasade,
// /it/servizi/facciate, /en/services/facades.
//
// The code names every page by one internal path, in English and with the
// item's file name: "/about", "/services/fasade". localizedPath() in
// ./index.ts turns it into the address in a language, and unlocalizedPath()
// turns an address back, so the language switch, the hreflang links and the
// marked menu item work from the same internal path in every language.
//
// - A page's address in each language is in `pages` below.
// - An item's address is the `address` in its front matter
//   (src/content/<collection>/<language>/<name>.md), or its file name.

import type { Lang } from "../site.config";

/** The first part of a page's address, per language. The key is the internal name. */
export const pages = {
  about: { sl: "o-nas", it: "chi-siamo", hr: "o-nama", en: "about" },
  contact: { sl: "kontakt", it: "contatti", hr: "kontakt", en: "contact" },
  services: { sl: "storitve", it: "servizi", hr: "usluge", en: "services" },
  projects: { sl: "projekti", it: "progetti", hr: "projekti", en: "projects" },
  imprint: { sl: "impresum", it: "note-legali", hr: "impresum", en: "imprint" },
  privacy: { sl: "zasebnost", it: "privacy", hr: "privatnost", en: "privacy" },
  accessibility: { sl: "dostopnost", it: "accessibilita", hr: "pristupacnost", en: "accessibility" },
  terms: { sl: "splosni-pogoji", it: "condizioni-generali", hr: "opci-uvjeti", en: "terms" },
  sustainability: { sl: "trajnost", it: "sostenibilita", hr: "odrzivost", en: "sustainability" },
  sitemap: { sl: "zemljevid-strani", it: "mappa-del-sito", hr: "karta-stranica", en: "sitemap" },
} as const satisfies Record<string, Record<Lang, string>>;

export type PageName = keyof typeof pages;

/** The address segment of a page in a language: pageSlug("about", "sl") is "o-nas". */
export function pageSlug(page: PageName, lang: Lang): string {
  return pages[page][lang];
}

// The `address` of every item, read from the front matter of its file, so the
// address of an item is known without waiting for the content collections.
const files = import.meta.glob<string>("../content/{services,projects}/*/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

/** item slugs by collection, then language, then file name. */
const itemSlugs = new Map<string, string>();
for (const [file, text] of Object.entries(files)) {
  const [, collection, lang, name] = file.match(/content\/([^/]+)\/([^/]+)\/([^/]+)\.md$/) ?? [];
  const front = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? "";
  const slug = front.match(/^address:\s*["']?([^"'\r\n]+?)["']?\s*$/m)?.[1];
  if (slug) itemSlugs.set(`${collection}/${lang}/${name}`, slug);
}

// Two items of a collection with the same address in one language would
// overwrite each other's page.
const seen = new Map<string, string>();
for (const [file] of Object.entries(files)) {
  const [, collection, lang, name] = file.match(/content\/([^/]+)\/([^/]+)\/([^/]+)\.md$/) ?? [];
  const address = `${collection}/${lang}/${itemSlugs.get(`${collection}/${lang}/${name}`) ?? name}`;
  const other = seen.get(address);
  if (other) throw new Error(`${file} and ${other} have the same address (${address}): give one a different address.`);
  seen.set(address, file);
}

/** The address segment of an item: itemSlug("services", "it", "fasade") is "facciate". */
export function itemSlug(collection: string, lang: Lang, name: string): string {
  return itemSlugs.get(`${collection}/${lang}/${name}`) ?? name;
}

/** The internal page name of an address segment in a language: "o-nas" in Slovenian is "about". */
export function pageNameOf(segment: string, lang: Lang): PageName | undefined {
  return (Object.keys(pages) as PageName[]).find((page) => pages[page][lang] === segment);
}

/** The file name of an item from its address segment: "facciate" in Italian services is "fasade". */
export function itemNameOf(collection: string, lang: Lang, segment: string): string {
  for (const [key, slug] of itemSlugs) {
    if (slug === segment && key.startsWith(`${collection}/${lang}/`)) return key.split("/")[2];
  }
  return segment;
}
