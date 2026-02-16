import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { getResume } from "@/actions/resume";
import { BuilderClient } from "@/components/builder/builder-client";

interface BuilderPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BuilderPage({ params }: BuilderPageProps) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user) {
    redirect("/login");
  }

  const resume = await getResume(id);

  if (!resume) {
    notFound();
  }

  return <BuilderClient resume={resume} />;
}
