"use server";

import { signIn, signOut } from "@/app/api/auth";

export async function handleSignIn() {
  await signIn("google", { redirectTo: "/dashboard" });
}

export async function handleSignOut() {
  await signOut({ redirectTo: "/" });
}
