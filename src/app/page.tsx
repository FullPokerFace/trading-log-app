import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import Text from "@/components/text";
import { auth } from "@/app/api/auth";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <Text variant="title">Diamond Log</Text>
          <Text variant="subtitle">
            {session
              ? "You're signed in. Continue to your dashboard."
              : "Sign in with the button above to continue"}
          </Text>
        </CardHeader>
        {session ? (
          <CardContent className="flex justify-center">
            <Link href="/dashboard" className={buttonVariants()}>
              Go to dashboard
            </Link>
          </CardContent>
        ) : (
          <CardContent />
        )}
      </Card>
    </div>
  );
}
