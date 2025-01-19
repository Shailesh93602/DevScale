import { fetchData } from "@/app/services/fetchData";
import CodingChallenge from "./CodingChallenge";

export default async function ViewChallengePage({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const response: {
    data: {
      title: string;
      description: string;
      difficulty: string;
      inputFormat: string;
      outputFormat: string;
      exampleInput: string;
      exampleOutput: string;
    };
  } = await fetchData("get", "/challenges/" + id);

  if (!response?.data) {
    return <div className="container mx-auto p-4">Challenge not found.</div>;
  }

  return <CodingChallenge challenge={response.data} />;
}
