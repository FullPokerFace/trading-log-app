"use server";

import { auth } from "@/app/api/auth";
import { connectDB } from "@/app/api/db";
import { Log, type ILog } from "@/app/api/models/log";

export type LogEntryState = {
  success?: boolean;
  error?: string;
};

export async function createLogEntry(
  _prev: LogEntryState,
  formData: FormData
): Promise<LogEntryState> {
  const session = await auth();
  if (!session?.user?.email) return { error: "Unauthorized" };

  const direction15m = formData.get("direction15m") as ILog["direction15m"];
  const direction1hr = formData.get("direction1hr") as ILog["direction1hr"];
  const option = formData.get("option") as ILog["option"];
  const outcome = formData.get("outcome") as ILog["outcome"];
  const confirmedConditions = formData.get("confirmedConditions") === "on";

  if (!direction15m || !direction1hr || !option || !outcome) {
    return { error: "All fields are required." };
  }

  try {
    await connectDB();
    await Log.create({
      userEmail: session.user.email,
      direction15m,
      direction1hr,
      option,
      outcome,
      confirmedConditions,
    });
  } catch (err) {
    console.error("Failed to save log entry:", err);
    return { error: "Failed to save entry. Please try again." };
  }

  return { success: true };
}
