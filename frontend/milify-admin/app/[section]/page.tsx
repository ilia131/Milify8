"use client";

import { notFound, useParams } from "next/navigation";
import { ResourcePage } from "@milify/panel-kit/resources";
import { resources } from "@/services/resources";

export default function ManagementPage() {
  const { section } = useParams<{ section: string }>();
  if (!Object.hasOwn(resources, section)) notFound();
  return <ResourcePage key={section} resource={resources[section]} />;
}
