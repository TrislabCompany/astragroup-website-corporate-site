// The design rules of docs/brief.md that a machine can check, on the built
// site: no photo shows twice on a page, no placeholder text (sample text,
// lorem ipsum, TBD, TODO) reaches any page in any language, and no element
// has a style attribute. Run by `pnpm test` after the build, so ci runs it on
// every PR.

import { readdir, readFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL("..", import.meta.url));
const dist = join(rootDir, "dist");

/** Words that mark text nobody finished, in the site's languages. */
export const PLACEHOLDERS = [/lorem ipsum/i, /\bTODO\b/, /\bTBD\b/, /\bsample text\b/i, /vzorčno besedilo/i, /testo di esempio/i, /primjer teksta/i, /\[(?:adapt|prilagodite)\b/i];

/**
 * The photo an image is made from: Astro names every size of one photo
 * "<file name>.<hash>_<variant>.<ext>", so the part before "_" names the photo.
 * Images outside /_astro/ (the logo) are not photos and give undefined.
 */
export function photoOf(src) {
  const match = /\/_astro\/([^/_]+)_[^/]*\.(?:avif|webp|jpe?g|png)$/i.exec(src ?? "");
  return match?.[1];
}

/** The photos shown more than once on a page, from its <img> tags. */
export function repeatedPhotos(html) {
  const seen = new Map();
  for (const [tag] of html.matchAll(/<img\b[^>]*>/gi)) {
    const photo = photoOf(/\ssrc="([^"]*)"/i.exec(tag)?.[1]);
    if (photo) seen.set(photo, (seen.get(photo) ?? 0) + 1);
  }
  return [...seen].filter(([, count]) => count > 1).map(([photo]) => photo);
}

/** The text a reader sees: the page without its scripts, styles and tags. */
export function visibleText(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
}

/** The placeholder words in a page's visible text and its alternative texts. */
export function placeholdersIn(html) {
  const alts = [...html.matchAll(/\salt="([^"]*)"/gi)].map((match) => match[1]).join(" ");
  const text = `${visibleText(html)} ${alts}`;
  return PLACEHOLDERS.filter((pattern) => pattern.test(text)).map((pattern) => text.match(pattern)[0]);
}

/** True when an element of the page has a style attribute. */
export function hasStyleAttribute(html) {
  return /<[a-z][^>]*\sstyle\s*=/i.test(html);
}

/** Every problem of one page, as messages. */
export function problems(page, html) {
  const found = [];
  for (const photo of repeatedPhotos(html)) found.push(`design: ${page} shows the photo ${photo} more than once. A photo shows at most once on a page: choose another photo for one of them in src/content/.`);
  for (const word of placeholdersIn(html)) found.push(`design: ${page} has placeholder text ("${word}"). Write the real text in src/content/ or src/i18n/ui/.`);
  if (hasStyleAttribute(html)) found.push(`design: ${page} has a style attribute. Move the rule to src/styles/global.css.`);
  return found;
}

async function htmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map((entry) => (entry.isDirectory() ? htmlFiles(join(dir, entry.name)) : entry.name.endsWith(".html") ? [join(dir, entry.name)] : [])));
  return files.flat();
}

async function main() {
  const files = await htmlFiles(dist).catch(() => []);
  if (files.length === 0) {
    console.error("design: no pages in dist/. Run astro build first.");
    process.exit(1);
  }
  const found = [];
  for (const file of files) {
    const page = `/${relative(dist, file).split(sep).join("/")}`;
    found.push(...problems(page, await readFile(file, "utf8")));
  }
  if (found.length > 0) {
    for (const message of found) console.error(message);
    process.exit(1);
  }
  console.log(`design: ok. ${files.length} pages: no photo twice on a page, no placeholder text, no style attributes.`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) await main();
