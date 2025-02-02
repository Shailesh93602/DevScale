import CodingChallenge from './CodingChallenge';

export default async function ViewChallengePage({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) {
    return <div className="container mx-auto p-4">Challenge not found.</div>;
  }

  return <CodingChallenge id={id} />;
}
