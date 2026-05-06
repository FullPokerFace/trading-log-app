import { getIndicators } from "@/app/api/indicator-actions";
import LogEntryFormClient from "@/components/log-entry-form-client";

export default async function LogEntryForm() {
  const indicators = await getIndicators();

  return <LogEntryFormClient indicators={indicators} />;
}
