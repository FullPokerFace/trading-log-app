"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/app/api/auth";
import { connectDB } from "@/app/api/db";
import { Rule, type IRule } from "@/app/api/models/rule";

export type TradingRule = Pick<IRule, "text" | "createdAt"> & { id: string };

export type RuleState = {
  success?: boolean;
  error?: string;
};

export async function getRules(): Promise<TradingRule[]> {
  const session = await auth();
  if (!session?.user?.email) return [];

  await connectDB();
  const docs = await Rule.find({ userEmail: session.user.email })
    .sort({ createdAt: 1 })
    .lean();

  return docs.map((doc) => ({
    id: doc._id.toString(),
    text: doc.text,
    createdAt: doc.createdAt,
  }));
}

export async function createRule(
  _prev: RuleState,
  formData: FormData
): Promise<RuleState> {
  const session = await auth();
  if (!session?.user?.email) return { error: "Unauthorized" };

  const text = String(formData.get("text") ?? "").trim();

  if (!text) {
    return { error: "Rule text is required." };
  }

  if (text.length > 500) {
    return { error: "Rules must be 500 characters or less." };
  }

  try {
    await connectDB();
    await Rule.create({
      userEmail: session.user.email,
      text,
    });
  } catch (err) {
    console.error("Failed to save rule:", err);
    return { error: "Failed to save rule. Please try again." };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteRule(id: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.email) return;

  await connectDB();
  await Rule.findOneAndDelete({ _id: id, userEmail: session.user.email });

  revalidatePath("/dashboard");
}
