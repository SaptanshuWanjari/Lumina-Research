import { toAbsoluteUrl } from "@/lib/site-config";

const discoveryLinks = [
  {
    label: "API Catalog",
    href: "/.well-known/api-catalog",
    description: "RFC 9727 API discovery linkset.",
  },
  {
    label: "OpenAPI",
    href: "/openapi.json",
    description: "Machine-readable description of the website BFF routes.",
  },
  {
    label: "Health",
    href: "/api/health",
    description: "Service liveness probe.",
  },
  {
    label: "OIDC Discovery",
    href: "/.well-known/openid-configuration",
    description: "Authorization server metadata for protected APIs.",
  },
  {
    label: "Protected Resource Metadata",
    href: "/.well-known/oauth-protected-resource",
    description: "Resource-side OAuth discovery metadata.",
  },
];

export default function ApiDocsPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 px-6 py-16">
      <header className="space-y-4">
        <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">
          API Discovery
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-neutral-950">
          Lumina Research API
        </h1>
        <p className="max-w-3xl text-base leading-7 text-neutral-700">
          Discovery surface for agents and integrators. Start with the API
          catalog, then follow the OpenAPI description and auth metadata for
          protected routes.
        </p>
      </header>

      <section className="grid gap-4">
        {discoveryLinks.map((link) => (
          <article
            key={link.href}
            className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-lg font-medium text-neutral-950">{link.label}</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-700">
              {link.description}
            </p>
            <a
              className="mt-3 inline-flex text-sm font-medium text-neutral-950 underline decoration-neutral-300 underline-offset-4"
              href={link.href}
            >
              {toAbsoluteUrl(link.href)}
            </a>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6">
        <h2 className="text-xl font-medium text-neutral-950">Protected routes</h2>
        <p className="mt-3 text-sm leading-6 text-neutral-700">
          Workspace APIs under <code>/api</code> back the authenticated dashboard,
          cases, search, reports, and run review flows. Supabase issues user
          identity, and the website exposes discovery metadata so agents can
          determine auth requirements before calling protected resources.
        </p>
      </section>
    </main>
  );
}
