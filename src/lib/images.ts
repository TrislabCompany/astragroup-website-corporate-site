// The sizes and quality the site's photos are built at. One place, so the
// page-weight budget (page-weight.config.json) holds on the pages with the
// most photos: the check counts each image's src and the largest candidate
// of its srcset. `width` sets the src: without it Astro writes the photo at
// its original size there. The company's photos are phone photos; AVIF at
// quality 50 keeps them sharp at a fraction of the default size.

/** A card in a grid, cropped to 4:3 as it shows: at most about 22rem wide, twice that on a dense screen. */
export const card = {
  width: 640,
  height: 480,
  fit: "cover" as const,
  widths: [360, 480, 640],
  sizes: "(min-width: 64rem) 22rem, (min-width: 40rem) 45vw, 100vw",
  format: "avif" as const,
  quality: 50,
};

/** A full-width head, cropped to 16:9: the home hero and the head of a service or project page. */
export const head = {
  width: 1600,
  height: 900,
  fit: "cover" as const,
  widths: [640, 960, 1280, 1600],
  sizes: "100vw",
  format: "avif" as const,
  quality: 50,
};

/** The large photo a gallery links to, opened by the browser on its own. */
export const large = { width: 1800, format: "avif" as const, quality: 60 };
