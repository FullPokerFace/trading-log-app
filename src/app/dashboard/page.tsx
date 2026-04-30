import { auth } from "@/app/api/auth";
import { redirect } from "next/navigation";
import LogEntryForm from "@/components/log-entry-form";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) redirect("/");

  return (
    <div className="flex flex-1 items-start justify-end px-6 py-6">
      <LogEntryForm />
    </div>
  );
}
