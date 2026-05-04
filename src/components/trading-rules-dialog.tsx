import { getRules } from "@/app/api/rule-actions";
import TradingRulesDialogClient from "@/components/trading-rules-dialog-client";

export default async function TradingRulesDialog() {
  const rules = await getRules();

  return <TradingRulesDialogClient rules={rules} />;
}
