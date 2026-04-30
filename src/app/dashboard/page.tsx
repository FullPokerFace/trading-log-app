import { auth } from "@/app/api/auth";
import { redirect } from "next/navigation";
import Text from "@/components/text";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) redirect("/");

  return (
    <div className="flex flex-1 items-center justify-center">
      <Text variant="body">Welcome, {session.user?.name ?? "User"}</Text>
    </div>
  );
}
