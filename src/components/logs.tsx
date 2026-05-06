import { getIndicators } from "@/app/api/indicator-actions";
import { getLogs } from "@/app/api/log-actions";
import { Card, CardContent } from "@/components/ui/card";
import Text from "@/components/text";
import DeleteLogButton from "@/components/delete-log-button";
import ImageLightbox from "@/components/image-lightbox";
import IndicatorIcon from "@/components/indicator-icon";
import { defaultIndicatorIcon } from "@/lib/indicator-icons";
import {
  ArrowUpFromLine,
  ArrowDownToLine,
  DollarSign,
  Check,
} from "lucide-react";

function calcPnl(log: { entryPrice?: number; exitPrice?: number; contracts?: number }) {
  if (log.entryPrice == null || log.exitPrice == null) return null;
  return (log.exitPrice - log.entryPrice) * (log.contracts ?? 1) * 100;
}

export default async function Logs() {
  const [logs, currentIndicators] = await Promise.all([
    getLogs(),
    getIndicators(),
  ]);
  const indicatorColumns = [...currentIndicators];
  const seenIndicatorIds = new Set(indicatorColumns.map((indicator) => indicator.id));

  logs.forEach((log) => {
    log.indicators.forEach((indicator) => {
      if (seenIndicatorIds.has(indicator.indicatorId)) return;
      seenIndicatorIds.add(indicator.indicatorId);
      indicatorColumns.push({
        id: indicator.indicatorId,
        label: indicator.label,
        icon: indicator.icon ?? defaultIndicatorIcon,
        type: indicator.type,
        createdAt: log.createdAt,
      });
    });
  });

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
                    <th className="px-4 py-4 font-medium">Entry</th>
                    <th className="px-4 py-4 font-medium">Exit</th>
                    <th className="px-4 py-4 font-medium">Contracts</th>
                    <th className="px-4 py-4 font-medium">P&L</th>
                    {indicatorColumns.map((indicator) => (
                      <th key={indicator.id} className="min-w-40 px-4 py-4 font-medium">
                        <span className="flex items-center gap-1.5">
                          <IndicatorIcon name={indicator.icon} className="size-3.5" />
                          {indicator.label}
                        </span>
                      </th>
                    ))}
                    <th className="px-4 py-4 font-medium">Screenshots</th>
                    <th className="px-4 py-4" />
                  </tr>
                </thead>
                <tbody className="divide-y ">
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
                      {indicatorColumns.map((indicator) => {
                        const value = log.indicators.find(
                          (logIndicator) => logIndicator.indicatorId === indicator.id
                        )?.value;

                        return (
                          <td key={indicator.id} className="min-w-40 px-4 py-4">
                            {value == null ? (
                              <span className="text-muted-foreground">-</span>
                            ) : value ? (
                              <span className="flex items-center gap-1 text-sky-400"><Check className="size-3" />Yes</span>
                            ) : null}
                          </td>
                        );
                      })}
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
