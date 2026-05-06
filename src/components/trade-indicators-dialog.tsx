import { getIndicators } from "@/app/api/indicator-actions";
import TradeIndicatorsDialogClient from "@/components/trade-indicators-dialog-client";

export default async function TradeIndicatorsDialog() {
  const indicators = await getIndicators();

  return <TradeIndicatorsDialogClient indicators={indicators} />;
}
