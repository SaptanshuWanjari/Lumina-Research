import { redirect } from "next/navigation";

export default async function CasesIdPage(props: PageProps<"/cases/[id]">) {
  const { id } = await props.params;
  if (id.includes("-")) {
    redirect(`/cases/${id}/details`);
  }
  redirect("/cases");
}
