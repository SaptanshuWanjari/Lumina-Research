import {
  getAgentSkillDigest,
  getAgentSkillDocuments,
} from "@/lib/site-config";

export async function GET() {
  const skills = getAgentSkillDocuments().map((skill) => ({
    name: skill.name,
    type: "skill-md",
    description: skill.description,
    url: skill.urlPath,
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
