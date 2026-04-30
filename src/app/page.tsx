import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Text from "@/components/text";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <Text variant="title">Diamond Log</Text>
          <Text variant="subtitle">Sign in with the button above to continue</Text>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  );
}
