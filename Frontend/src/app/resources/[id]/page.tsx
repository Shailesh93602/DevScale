import React from "react";
import Resources from "./Resources";

export default async function Resource({
  params,
}: {
  params: Promise<{ id?: string }>;
}) {
  const { id } = await params;

  if (!id) return;

  return <Resources id={id} />;
}
