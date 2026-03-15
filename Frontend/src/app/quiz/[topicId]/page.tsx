import Quiz from './Quiz';

export default async function QuizPage({
  params,
}: {
  params: Promise<{ topicId?: string }>;
}) {
  const { topicId } = await params;

  if (!topicId) return;

  return <Quiz topicId={topicId} />;
}
