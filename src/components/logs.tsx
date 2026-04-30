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
  ArrowUpFromLine,
  ArrowDownToLine,
  Hash,
  DollarSign,
  Check,
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

function calcPnl(log: { entryPrice?: number; exitPrice?: number; contracts?: number }) {
  if (log.entryPrice == null || log.exitPrice == null) return null;
  return (log.exitPrice - log.entryPrice) * (log.contracts ?? 1) * 100;
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
                    <th className="px-4 py-4 font-medium">Date</th>
                    <th className="px-4 py-4 font-medium">15m</th>
                    <th className="px-4 py-4 font-medium">1hr</th>
                    <th className="px-4 py-4 font-medium">Option</th>
                    <th className="px-4 py-4 font-medium">Outcome</th>
                    <th className="px-4 py-4 font-medium">Entry</th>
                    <th className="px-4 py-4 font-medium">Exit</th>
                    <th className="px-4 py-4 font-medium">Contracts</th>
                    <th className="px-4 py-4 font-medium">P&L</th>
                    <th className="px-4 py-4 font-medium">Followed entry rules?</th>
                    <th className="px-4 py-4 font-medium">Screenshots</th>
                    <th className="px-4 py-4" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="group/row transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-4 tabular-nums text-muted-foreground">
                        {new Date(log.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-4">
                        <Badge positive={log.direction15m === "Bullish"}>
                          {log.direction15m === "Bullish"
                            ? <TrendingUp className="size-3" />
                            : <TrendingDown className="size-3" />}
                          {log.direction15m}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <Badge positive={log.direction1hr === "Bullish"}>
                          {log.direction1hr === "Bullish"
                            ? <TrendingUp className="size-3" />
                            : <TrendingDown className="size-3" />}
                          {log.direction1hr}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <Badge positive={log.option === "CALL"}>
                          {log.option === "CALL"
                            ? <TrendingUp className="size-3" />
                            : <TrendingDown className="size-3" />}
                          {log.option}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <Badge positive={log.outcome === "WIN"}>
                          {log.outcome === "WIN"
                            ? <Trophy className="size-3" />
                            : <CircleX className="size-3" />}
                          {log.outcome}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 tabular-nums">
                        {log.entryPrice != null
                          ? <span className="flex items-center gap-1 text-sky-400"><ArrowUpFromLine className="size-3" />${log.entryPrice}</span>
                          : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-4 py-4 tabular-nums">
                        {log.exitPrice != null
                          ? <span className="flex items-center gap-1 text-red-400"><ArrowDownToLine className="size-3" />${log.exitPrice}</span>
                          : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-4 py-4 tabular-nums">
                        {log.contracts != null
                          ? <span className="flex items-center gap-1 text-muted-foreground ">{log.contracts}</span>
                          : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-4 py-4 tabular-nums">
                        {(() => {
                          const pnl = calcPnl(log);
                          if (pnl == null) return <span className="text-muted-foreground">—</span>;
                          return (
                            <span className={`flex items-center gap-1 font-medium ${pnl >= 0 ? "text-sky-400" : "text-red-400"}`}>
                              <DollarSign className="size-3" />
                              {pnl >= 0 ? "+" : ""}{pnl.toFixed(2)}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-4 ">
                        {log.confirmedConditions
                          ? <span className="flex items-center gap-1 text-sky-400"><Check className="size-3" />Yes</span>
                          : <span className="flex items-center gap-1 text-red-400"><CircleX className="size-3" />No</span>}
                      </td>
                      <td className="px-4 py-4">
                        <ImageLightbox urls={log.imageUrls} />
                      </td>
                      <td className="px-4 py-4 text-right">
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

      {(() => {
        const totals = logs.reduce(
          (acc, log) => {
            const pnl = calcPnl(log);
            if (pnl != null) acc.total += pnl;
            return acc;
          },
          { total: 0 }
        );
        const hasPnl = logs.some((l) => calcPnl(l) != null);
        if (!hasPnl) return null;
        const positive = totals.total >= 0;
        return (
          <div className="flex items-center justify-end gap-2">
            <Text variant="subtitle">Total P&L</Text>
            <span className={`flex items-center gap-1 text-sm font-semibold ${positive ? "text-sky-400" : "text-red-400"}`}>
              <DollarSign className="size-3.5" />
              {positive ? "+" : ""}{totals.total.toFixed(2)}
            </span>
          </div>
        );
      })()}
    </div>
  );
}
