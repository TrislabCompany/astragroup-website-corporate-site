import { glob } from "astro/loaders";
import { defineCollection, z, type SchemaContext } from "astro:content";
import { seoFields } from "./components/seo/fields";

// Content is kept per language: src/content/<collection>/<language>/<name>.md.
// The same file name in two languages is the same item translated; its id is
// "<language>/<name>" (src/lib/content.ts splits it). Slovenian is the source
// text; Italian, Croatian and English are written from it and reviewed before
// production (docs/brief.md, "Languages").

// One page per item: /<lang>/<collection>/<name>. A list of items is a
// collection here and an entry in `collections` in src/site.config.ts, under
// the same id. The search fields (a search title, a share image, noindex) are
// in seoFields.

/** A photo with what it shows, in the entry's language ("" only for a decorative one). */
const photo = (image: SchemaContext["image"]) =>
  z.object({
    src: image(),
    alt: z.string(),
  });

// The six service groups of the company (docs/brief.md, "Pages or modules").
const services = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/services" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      /** Position in lists, lowest first. */
      order: z.number().int(),
      tags: z.array(z.string()).default([]),
      /** The photo of the card and the page head: the company's own work, never a stock photo standing for a project. */
      photo: photo(image).optional(),
      /** What the group includes: the items listed on the page and the card. */
      features: z.array(z.string()).min(1).default([]),
      /** The extension site that covers this service in depth (fasadanakljuc.si, strehanakljuc.si). */
      extensionSite: z
        .object({
          url: z.string().url(),
          name: z.string(),
          text: z.string(),
        })
        .optional(),
      ...seoFields(image),
    }),
});

// The company's references: only its own projects, with only their own real
// photos (docs/brief.md, "Design rules").
const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      /** Position in lists, lowest first. */
      order: z.number().int(),
      tags: z.array(z.string()).default([]),
      /** The type of work, shown on the card ("Facade renovation"). */
      type: z.string(),
      /** The place, only once the company has confirmed it may be named. */
      place: z.string().optional(),
      /** The year of the work, only once the company has confirmed it. */
      year: z.number().int().min(2000).max(2100).optional(),
      /** The names of the services (src/content/services/<language>/<name>.md) the project shows. */
      services: z.array(z.string()).min(1),
      /** The photo of the card and the page head. */
      cover: photo(image),
      /** The other photos of the project, shown in its gallery. */
      gallery: z.array(photo(image)).default([]),
      /**
       * false while it is not known that the company may publish the photos
       * taken from the earlier site: "to check before production".
       */
      photosCleared: z.boolean().default(false),
      ...seoFields(image),
    }),
});

// The texts of the home and about pages: src/content/pages/<language>/home.md
// and about.md. The fields a page doesn't use stay empty.
const pages = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    /** The home page's slogan, the first line of the hero. */
    slogan: z.string().optional(),
    /** What the hero photo shows. */
    heroAlt: z.string().optional(),
    /** The text of a short block: the hero's sentence, the region band. */
    intro: z.string().optional(),
    steps: z
      .object({
        title: z.string(),
        lead: z.string(),
        items: z.array(z.object({ title: z.string(), text: z.string() })).min(2),
      })
      .optional(),
    region: z.object({ title: z.string(), text: z.string(), places: z.array(z.string()).default([]) }).optional(),
    /** The about page's vision, mission, values and goals. */
    principles: z.array(z.object({ title: z.string(), text: z.string() })).default([]),
  }),
});

// The texts of the privacy policy, the accessibility statement and the
// general terms: src/content/legal/<language>/privacy.md, accessibility.md
// and terms.md. The imprint is built from src/site.config.ts. The pages show
// no date: no law asks for one, and a date that is not kept up to date does
// more harm than good.
const legal = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/legal" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
  }),
});

export const collections = { services, projects, pages, legal };
