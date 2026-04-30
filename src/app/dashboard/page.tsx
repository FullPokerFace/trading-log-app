import { Suspense } from "react";
import { auth } from "@/app/api/auth";
import { redirect } from "next/navigation";
import LogEntryForm from "@/components/log-entry-form";
import Logs from "@/components/logs";
import PageLoader from "@/components/page-loader";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) redirect("/");

  return (
    <div className="container mx-auto flex flex-1 flex-col gap-6 px-4 py-6">
      <div className="flex justify-end">
        <LogEntryForm />
      </div>
      <Suspense fallback={<PageLoader />}>
        <Logs />
      </Suspense>
    </div>
  );
}
