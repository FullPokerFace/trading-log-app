"use server";

import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { auth } from "@/app/api/auth";
import { connectDB } from "@/app/api/db";
import { Log, type ILog } from "@/app/api/models/log";
import { Indicator } from "@/app/api/models/indicator";
import { defaultIndicatorIcon } from "@/lib/indicator-icons";

export type LogEntry = Pick<ILog, "direction15m" | "direction1hr" | "option" | "outcome" | "confirmedConditions" | "entryPrice" | "exitPrice" | "contracts" | "indicators" | "imageUrls" | "createdAt"> & { id: string };

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
    entryPrice: doc.entryPrice,
    exitPrice: doc.exitPrice,
    contracts: doc.contracts,
    indicators: doc.indicators ?? [],
    imageUrls: doc.imageUrls ?? [],
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
  const entryPrice = formData.get("entryPrice") ? Number(formData.get("entryPrice")) : undefined;
  const exitPrice = formData.get("exitPrice") ? Number(formData.get("exitPrice")) : undefined;
  const contracts = formData.get("contracts") ? Number(formData.get("contracts")) : undefined;
  const imageUrls = formData.getAll("imageUrls").map(String).filter(Boolean);
  const indicatorIds = Array.from(
    new Set(
      formData
        .getAll("indicatorIds")
        .map(String)
        .filter((id) => Types.ObjectId.isValid(id))
    )
  );
  const checkedIndicatorIds = new Set(
    formData.getAll("checkedIndicators").map(String)
  );

  if (!direction15m || !direction1hr || !option || !outcome) {
    return { error: "All fields are required." };
  }

  try {
    await connectDB();
    const indicatorDocs = indicatorIds.length > 0
      ? await Indicator.find({
        _id: { $in: indicatorIds },
        userEmail: session.user.email,
      })
        .sort({ createdAt: 1 })
        .lean()
      : [];
    const indicators = indicatorDocs.map((indicator) => ({
      indicatorId: indicator._id.toString(),
      label: indicator.label,
      icon: indicator.icon ?? defaultIndicatorIcon,
      type: indicator.type,
      value: checkedIndicatorIds.has(indicator._id.toString()),
    }));

    await Log.create({
      userEmail: session.user.email,
      direction15m,
      direction1hr,
      option,
      outcome,
      confirmedConditions,
      entryPrice,
      exitPrice,
      contracts,
      indicators,
      imageUrls,
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
  const log = await Log.findOneAndDelete({ _id: id, userEmail: session.user.email }).lean();

  if (log?.imageUrls?.length) {
    await Promise.allSettled(
      log.imageUrls.map((url) => {
        const imageId = url.split("/").at(-2);
        return fetch(
          `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v1/${imageId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}` },
          }
        );
      })
    );
  }

  revalidatePath("/dashboard");
}
