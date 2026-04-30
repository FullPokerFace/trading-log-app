import { auth } from "@/app/api/auth";
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID!;
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN!;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { count } = await req.json() as { count: number };
  if (!count || count < 1 || count > 10) {
    return NextResponse.json({ error: "Invalid count" }, { status: 400 });
  }

  try {
    const uploads = await Promise.all(
      Array.from({ length: count }, async () => {
        const imageId = randomBytes(12).toString("hex");
        const body = new FormData();
        body.append("requireSignedURLs", "false");
        body.append("id", imageId);
        const res = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/images/v2/direct_upload`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${API_TOKEN}` },
            body,
          }
        );
        const data = await res.json() as {
          success: boolean;
          result: { id: string; uploadURL: string };
        };
        console.log("Cloudflare response:", JSON.stringify(data, null, 2));
        if (!data.success) throw new Error("Cloudflare upload URL failed");
        return {
          uploadURL: data.result.uploadURL,
          id: data.result.id,
        };
      })
    );
    return NextResponse.json({ uploads });
  } catch (err) {
    console.error("Cloudflare direct upload error:", err);
    return NextResponse.json({ error: "Failed to get upload URLs" }, { status: 500 });
  }
}
