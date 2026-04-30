import { getLogs } from "@/app/api/log-actions";
import { Card, CardContent } from "@/components/ui/card";
import Text from "@/components/text";
import DeleteLogButton from "@/components/delete-log-button";
import ImageLightbox from "@/components/image-lightbox";
import {
  TrendingUp,
  TrendingDown,
  Trophy,
  CircleX,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";

function Badge({ positive, children }: { positive: boolean; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ${positive
      ? "bg-sky-500/10 text-sky-400 ring-sky-500/20"
      : "bg-red-500/10 text-red-400 ring-red-500/20"
      }`}>
      {children}
    </span>
  );
}

export default async function Logs() {
  const logs = await getLogs();

  return (
    <div className="flex flex-col gap-4">
      <Text variant="title">Trade Log</Text>
      <Card className="w-full">
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <Text variant="subtitle" className="py-10 text-center">
              No entries yet. Add your first log.
            </Text>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">15m</th>
                    <th className="px-4 py-3 font-medium">1hr</th>
                    <th className="px-4 py-3 font-medium">Option</th>
                    <th className="px-4 py-3 font-medium">Outcome</th>
                    <th className="px-4 py-3 font-medium">Conditions</th>
                    <th className="px-4 py-3 font-medium">Screenshots</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className={`group/row transition-colors hover:brightness-95 ${log.outcome === "WIN"
                        ? "bg-sky-500/5"
                        : "bg-red-500/5"
                        }`}
                    >
                      <td className="px-4 py-3 tabular-nums text-muted-foreground">
                        {new Date(log.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <Badge positive={log.direction15m === "Bullish"}>
                          {log.direction15m === "Bullish"
                            ? <TrendingUp className="size-3" />
                            : <TrendingDown className="size-3" />}
                          {log.direction15m}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge positive={log.direction1hr === "Bullish"}>
                          {log.direction1hr === "Bullish"
                            ? <TrendingUp className="size-3" />
                            : <TrendingDown className="size-3" />}
                          {log.direction1hr}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge positive={log.option === "CALL"}>
                          {log.option === "CALL"
                            ? <TrendingUp className="size-3" />
                            : <TrendingDown className="size-3" />}
                          {log.option}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge positive={log.outcome === "WIN"}>
                          {log.outcome === "WIN"
                            ? <Trophy className="size-3" />
                            : <CircleX className="size-3" />}
                          {log.outcome}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 flex pl-12">
                        {log.confirmedConditions
                          ? <ShieldCheck className="size-4 text-sky-400" />
                          : <ShieldOff className="size-4 text-muted-foreground" />}
                      </td>
                      <td className="px-4 py-3">
                        <ImageLightbox urls={log.imageUrls} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DeleteLogButton id={log.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
