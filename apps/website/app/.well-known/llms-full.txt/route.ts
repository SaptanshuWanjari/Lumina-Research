import { GET as getLlmsFullTxt } from "@/app/llms-full.txt/route";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return getLlmsFullTxt(request);
}
