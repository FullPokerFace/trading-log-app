"use server";

import { auth } from "@/app/api/auth";

export type LogEntryState = {
  success?: boolean;
  error?: string;
};

export async function createLogEntry(
  _prev: LogEntryState,
  formData: FormData
): Promise<LogEntryState> {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const direction15m = formData.get("direction15m") as string;
  const direction1hr = formData.get("direction1hr") as string;
  const option = formData.get("option") as string;
  const outcome = formData.get("outcome") as string;
  const confirmedConditions = formData.get("confirmedConditions") === "on";

  if (!direction15m || !direction1hr || !option || !outcome) {
    return { error: "All fields are required." };
  }

  // DB write will go here once the model is created
  console.log("Log entry:", {
    direction15m,
    direction1hr,
    option,
    outcome,
    confirmedConditions,
    user: session.user.email,
  });

  return { success: true };
}
