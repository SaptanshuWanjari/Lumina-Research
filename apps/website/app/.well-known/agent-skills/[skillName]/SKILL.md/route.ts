import { getAgentSkillDocuments } from "@/lib/site-config";

export const dynamic = "force-dynamic";

type Params = Promise<{ skillName: string }>;

export async function GET(
  request: Request,
  context: { params: Params },
) {
  const baseUrl = new URL(request.url).origin;
  const { skillName } = await context.params;
  const skill = getAgentSkillDocuments(baseUrl).find((entry) => entry.name === skillName);

  if (!skill) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(skill.body, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
