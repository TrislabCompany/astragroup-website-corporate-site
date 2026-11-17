// Languages, URLs and interface strings. Every page and component gets its
// language from here, never from a hard-coded "en".
//
// URLs: with two or more languages every page lives under its language
// (/en, /sl/o-nas), and "/" leads to the default language. With one
// language there is no prefix (/, /o-nas). No address ends in a slash except
// "/" (astro.config.mjs). Each address is in its page's language: the code
// uses internal paths ("/about", "/services/fasade") and ./routes.ts
// translates them.

import site, { languages, type Lang } from "../site.config";
import { itemNameOf, itemSlug, pageNameOf, pages, type PageName } from "./routes";
import en, { type UiKey, type UiStrings } from "./ui/en";
import hr from "./ui/hr";
import it from "./ui/it";
import sl from "./ui/sl";

export { languages, pages, type Lang, type PageName };
export const defaultLanguage: Lang = site.defaultLanguage;

/** Add a file to ui/ and a line here for each new language. A language not in
 * src/site.config.ts may stay here; it is never used. */
const ui: Record<Lang, UiStrings> & Record<string, UiStrings> = { en, sl, it, hr };

/** True when the URLs carry a language prefix. */
export const prefixed = languages.length > 1;

export function t(lang: Lang, key: UiKey): string {
  return ui[lang][key];
}

export function isLang(value: string | undefined): value is Lang {
  return (languages as readonly string[]).includes(value ?? "");
}

/**
 * An internal path's address in the given language: "/" gives "/sl",
 * "/about" gives "/sl/o-nas", "/services/fasade" gives "/it/servizi/facciate".
 */
export function localizedPath(lang: Lang, path = "/"): string {
  const [page, item, ...rest] = path.split("/").filter(Boolean);
  const segments: string[] = [];
  if (page) segments.push(page in pages ? pages[page as PageName][lang] : page);
  if (item) segments.push(itemSlug(page, lang, item));
  segments.push(...rest);
  const clean = `/${segments.join("/")}`;
  if (!prefixed) return clean;
  return clean === "/" ? `/${lang}` : `/${lang}${clean}`;
}

/**
 * The internal path of an address, without its language: "/sl/o-nas" gives
 * "/about", "/it/servizi/facciate" gives "/services/fasade". At build time a
 * page's path ends in ".html" ("/sl/o-nas.html", "/sl.html": build.format
 * "file"), which is dropped.
 */
export function unlocalizedPath(pathname: string): string {
  const [, first, ...rest] = pathname.replace(/\.html$/, "").split("/");
  const lang = prefixed && isLang(first) ? first : defaultLanguage;
  const [segment, item, ...more] = (prefixed && isLang(first) ? rest : [first, ...rest]).filter(Boolean);
  if (!segment) return "/";
  const page = pageNameOf(segment, lang) ?? segment;
  const parts = [page];
  if (item) parts.push(itemNameOf(page, lang, item));
  return `/${[...parts, ...more].join("/")}`;
}

/**
 * getStaticPaths for a page under src/pages/[...lang]/: one copy per language,
 * or one copy at the root when the site has one language.
 */
export function languagePaths() {
  return languages.map((lang) => ({ params: { lang: prefixed ? lang : undefined }, props: { lang } }));
}

/**
 * getStaticPaths for a page whose address is in its language
 * (src/pages/[...lang]/[about].astro): the parameter is named after the page,
 * and its value is the page's address in each language (./routes.ts).
 */
export function pagePaths(page: PageName) {
  return languagePaths().map((path) => ({ ...path, params: { ...path.params, [page]: pages[page][path.props.lang] } }));
}

/** The territory each supported language code is written in, for Open Graph (en_GB) and number and date formats. */
const territory: Record<string, string> = {
  en: "GB", sl: "SI", hr: "HR", sr: "RS", it: "IT", de: "DE", fr: "FR", es: "ES", pt: "PT", nl: "NL", pl: "PL", cs: "CZ", sk: "SK", hu: "HU", ro: "RO", bg: "BG", el: "GR", sv: "SE", da: "DK", fi: "FI", nb: "NO",
};

/** The BCP 47 tag for dates and numbers. */
export function locale(lang: Lang): string {
  // Serbian is written in the Latin script on this site.
  if ((lang as string) === "sr") return "sr-Latn";
  return (lang as string) === "en" ? "en-GB" : lang;
}

/** The Open Graph locale, language_TERRITORY: "en_GB", "sl_SI". A code not in the list above repeats itself ("xx_XX"): add it there. */
export function ogLocale(lang: Lang): string {
  return `${lang}_${territory[lang] ?? lang.toUpperCase()}`;
}
