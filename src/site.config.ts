// The site's own facts, read at build time: languages, company, contact,
// legal pages, lists of items, structured data and security.txt. Change the
// values here; the shape is in src/lib/site-settings.ts. Nothing here is
// secret: it all ends up in the public pages. Values that differ per
// Environment go to /config.json instead (src/lib/config.ts).
// First written by `pnpm init-site` from site.yaml; from then on it is the
// site's own.

import type { SiteSettings } from "./lib/site-settings";

/** The site's languages. With one language, the URLs have no language prefix. */
export const languages = ["sl", "it", "hr", "en"] as const;
export type Lang = (typeof languages)[number];

const site: SiteSettings<Lang> = {
  url: "https://astragroup.si",
  name: "Astra Group",
  description: {
    sl: "Gradbeno podjetje z Obale in Krasa. Novogradnje, prenove, fasade in strehe, od temeljev do ključa.",
    it: "Impresa edile del Litorale e del Carso. Nuove costruzioni, ristrutturazioni, facciate e tetti, dalle fondamenta alla consegna chiavi in mano.",
    hr: "Građevinska tvrtka s Obale i Krasa. Novogradnje, obnove, fasade i krovovi, od temelja do ključa.",
    en: "A construction company on the Slovenian coast and the Karst. New builds, renovations, facades and roofs, from the foundations to turnkey."
  },
  languages: languages,
  defaultLanguage: "sl",
  themeColor: "#1a1b3b",
  collections: [
    {
      id: "services",
      title: {
        sl: "Storitve",
        it: "Servizi",
        hr: "Usluge",
        en: "Services"
      },
      lead: {
        sl: "Gradimo, prenavljamo in urejamo okolico hiš, od temeljev do ključa. Šest področij del in en sogovornik od ogleda do predaje.",
        it: "Costruiamo, ristrutturiamo e sistemiamo gli esterni delle case, dalle fondamenta alla consegna chiavi in mano. Sei ambiti di lavoro e un solo referente dal sopralluogo alla consegna.",
        hr: "Gradimo, obnavljamo i uređujemo okoliš kuća, od temelja do ključa. Šest područja rada i jedan sugovornik od izvida do predaje.",
        en: "We build and renovate houses and lay out their grounds, from the foundations to turnkey. Six kinds of work and one contact from the site visit to the handover."
      },
      nav: true,
      home: true
    },
    {
      id: "projects",
      title: {
        sl: "Projekti",
        it: "Progetti",
        hr: "Projekti",
        en: "Projects"
      },
      lead: {
        sl: "Hiše in objekti, ki smo jih zgradili in prenovili.",
        it: "Case ed edifici che abbiamo costruito e ristrutturato.",
        hr: "Kuće i objekti koje smo izgradili i obnovili.",
        en: "Houses and buildings we have built and renovated."
      },
      nav: true,
      home: true
    }
  ],
  company: {
    name: "Astra Group",
    legalName: "ASTRA GROUP d.o.o.",
    address: {
      street: "Ulica 15. maja 2",
      postalCode: "6000",
      city: "Koper - Capodistria",
      country: "SI"
    },
    registrationNumber: "6610463000",
    vatId: "SI50724240",
    logo: "/favicon.svg",
    profiles: []
  },
  contact: {
    phone: "+386 41 230 310",
    topics: [
      {
        email: "david.volk@astragroup.si",
        label: {
          sl: "Povpraševanja in ponudbe",
          it: "Richieste e preventivi",
          hr: "Upiti i ponude",
          en: "Enquiries and quotes"
        }
      }
    ],
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Ulica+15.+maja+2%2C+6000+Koper"
  },
  legalPages: {
    imprint: true,
    privacy: true,
    accessibility: true,
    sustainability: false,
    terms: true
  },
  structuredData: "LocalBusiness",
  securityTxt: {
    contact: "mailto:info@trislab.com",
    expires: "2027-11-11T19:19:40.738Z"
  }
};

export default site;
