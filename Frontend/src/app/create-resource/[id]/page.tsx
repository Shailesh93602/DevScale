import CreateResource from "./CreateResource";

export default async function ResourceEditor({
  params,
}: {
  params: Promise<{ id?: string }>;
}) {
  const { id } = await params;

  if (!id) return;

  return <CreateResource id={id} />;
}
