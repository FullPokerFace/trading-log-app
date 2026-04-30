"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/app/api/auth";
import { connectDB } from "@/app/api/db";
import { Log, type ILog } from "@/app/api/models/log";

export type LogEntry = Pick<ILog, "direction15m" | "direction1hr" | "option" | "outcome" | "confirmedConditions" | "createdAt"> & { id: string };

export async function getLogs(): Promise<LogEntry[]> {
  const session = await auth();
  if (!session?.user?.email) return [];

  await connectDB();
  const docs = await Log.find({ userEmail: session.user.email })
    .sort({ createdAt: -1 })
    .lean();

  return docs.map((doc) => ({
    id: doc._id.toString(),
    direction15m: doc.direction15m,
    direction1hr: doc.direction1hr,
    option: doc.option,
    outcome: doc.outcome,
    confirmedConditions: doc.confirmedConditions,
    createdAt: doc.createdAt,
  }));
}

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

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteLog(id: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.email) return;

  await connectDB();
  await Log.deleteOne({ _id: id, userEmail: session.user.email });
  revalidatePath("/dashboard");
}
