// The services and projects of the site, per language, and how they relate:
// a project names the services it shows (its `services` field), so a service
// page can list its projects and a project page its services.
import type { CollectionEntry } from "astro:content";
import type { Lang } from "../i18n";
import { entrySlug } from "./content";
import { sortedItems } from "./items";

export type Service = CollectionEntry<"services">;
export type Project = CollectionEntry<"projects">;

export async function services(lang: Lang): Promise<Service[]> {
  return sortedItems("services", lang);
}

export async function projects(lang: Lang): Promise<Project[]> {
  return sortedItems("projects", lang);
}

/** The projects that show a service, in list order. */
export async function projectsOf(service: Service, lang: Lang): Promise<Project[]> {
  const name = entrySlug(service);
  return (await projects(lang)).filter((project) => project.data.services.includes(name));
}

/** The services a project shows, in list order; a name with no service page stops the build. */
export async function servicesOf(project: Project, lang: Lang): Promise<Service[]> {
  const all = await services(lang);
  for (const name of project.data.services) {
    if (!all.some((service) => entrySlug(service) === name)) {
      throw new Error(`src/content/projects/${project.id}.md: services lists "${name}", but src/content/services/${lang}/${name}.md does not exist.`);
    }
  }
  return all.filter((service) => project.data.services.includes(entrySlug(service)));
}
