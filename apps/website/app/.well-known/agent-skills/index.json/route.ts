import {
  getAgentSkillDigest,
  getAgentSkillDocuments,
  toAbsoluteUrl,
} from "@/lib/site-config";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const baseUrl = new URL(request.url).origin;
  const skills = getAgentSkillDocuments(baseUrl).map((skill) => ({
    name: skill.name,
    type: "skill-md",
    description: skill.description,
    url: toAbsoluteUrl(skill.urlPath, baseUrl),
    digest: getAgentSkillDigest(skill.body),
  }));

  return Response.json(
    {
      $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
      skills,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    },
  );
}
