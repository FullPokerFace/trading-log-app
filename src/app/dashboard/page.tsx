import { Suspense } from "react";
import { auth } from "@/app/api/auth";
import { redirect } from "next/navigation";
import LogEntryForm from "@/components/log-entry-form";
import Logs from "@/components/logs";
import PageLoader from "@/components/page-loader";
import TradeIndicatorsDialog from "@/components/trade-indicators-dialog";
import TradingRules from "@/components/trading-rules";
import TradingRulesDialog from "@/components/trading-rules-dialog";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) redirect("/");

  return (
    <div className="container mx-auto flex flex-1 flex-col gap-6 px-4 py-6">
      <div className="flex justify-end gap-3">
        <TradingRulesDialog />
        <TradeIndicatorsDialog />
        <LogEntryForm />
      </div>

      <Suspense fallback={<PageLoader />}>
        <TradingRules />
      </Suspense>

      <Suspense fallback={<PageLoader />}>
        <Logs />
      </Suspense>
    </div>
  );
}
