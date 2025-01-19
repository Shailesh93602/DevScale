import React from "react";
import { fetchData } from "@/app/services/fetchData";
import { toast } from "react-toastify";
import Resources from "./Resources";

export default async function Resource({
  params,
}: {
  params: Promise<{ id?: string }>;
}) {
  const { id } = await params;

  const response = await fetchData("GET", "/resources/" + id);
  const data = response.data;

  if (!data.success) {
    toast.error(data.message);
    return;
  }

  return <Resources resource={data.resource.topics} />;
}
