import { getRules } from "@/app/api/rule-actions";
import Text from "@/components/text";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpenCheck } from "lucide-react";

export default async function TradingRules() {
  const rules = await getRules();

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <BookOpenCheck className="size-5 text-primary" />
        <Text variant="title">Trading Rules</Text>
      </div>
      <Card>
        <CardContent>
          {rules.length === 0 ? (
            <Text variant="subtitle" className="py-4 text-center">
              No rules yet.
            </Text>
          ) : (
            <ol className="flex flex-col gap-2">
              {rules.map((rule, index) => (
                <li
                  key={rule.id}
                  className="flex items-start gap-3 rounded-lg border border-input bg-background/40 px-3 py-2.5"
                >
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-medium text-primary">
                    {index + 1}
                  </span>
                  <p className="min-w-0 whitespace-pre-wrap break-words text-sm leading-6">
                    {rule.text}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
