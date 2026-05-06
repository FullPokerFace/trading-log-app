"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/app/api/auth";
import { connectDB } from "@/app/api/db";
import {
  Indicator,
  type IIndicator,
} from "@/app/api/models/indicator";
import {
  defaultIndicatorIcon,
  isIndicatorIconName,
} from "@/lib/indicator-icons";

export type TradeIndicator = Pick<
  IIndicator,
  "label" | "icon" | "type" | "createdAt"
> & { id: string };

export type IndicatorState = {
  success?: boolean;
  error?: string;
};

export async function getIndicators(): Promise<TradeIndicator[]> {
  const session = await auth();
  if (!session?.user?.email) return [];

  await connectDB();
  const docs = await Indicator.find({ userEmail: session.user.email })
    .sort({ createdAt: 1 })
    .lean();

  return docs.map((doc) => ({
    id: doc._id.toString(),
    label: doc.label,
    icon: doc.icon ?? defaultIndicatorIcon,
    type: doc.type,
    createdAt: doc.createdAt,
  }));
}

export async function createIndicator(
  _prev: IndicatorState,
  formData: FormData
): Promise<IndicatorState> {
  const session = await auth();
  if (!session?.user?.email) return { error: "Unauthorized" };

  const label = String(formData.get("label") ?? "").trim();
  const iconValue = String(formData.get("icon") ?? defaultIndicatorIcon);
  const icon = isIndicatorIconName(iconValue) ? iconValue : defaultIndicatorIcon;

  if (!label) {
    return { error: "Indicator label is required." };
  }

  if (label.length > 100) {
    return { error: "Indicator labels must be 100 characters or less." };
  }

  try {
    await connectDB();
    await Indicator.create({
      userEmail: session.user.email,
      label,
      icon,
      type: "checkbox",
    });
  } catch (err) {
    console.error("Failed to save indicator:", err);
    return { error: "Failed to save indicator. Please try again." };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateIndicator(
  id: string,
  formData: FormData
): Promise<IndicatorState> {
  const session = await auth();
  if (!session?.user?.email) return { error: "Unauthorized" };

  const label = String(formData.get("label") ?? "").trim();
  const iconValue = String(formData.get("icon") ?? defaultIndicatorIcon);
  const icon = isIndicatorIconName(iconValue) ? iconValue : defaultIndicatorIcon;

  if (!label) {
    return { error: "Indicator label is required." };
  }

  if (label.length > 100) {
    return { error: "Indicator labels must be 100 characters or less." };
  }

  try {
    await connectDB();
    await Indicator.findOneAndUpdate(
      { _id: id, userEmail: session.user.email },
      { label, icon },
      { runValidators: true }
    );
  } catch (err) {
    console.error("Failed to update indicator:", err);
    return { error: "Failed to update indicator. Please try again." };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteIndicator(id: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.email) return;

  await connectDB();
  await Indicator.findOneAndDelete({ _id: id, userEmail: session.user.email });

  revalidatePath("/dashboard");
}
