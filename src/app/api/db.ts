import mongoose from "mongoose";

const URI = process.env.DB_URI!;

if (!URI) throw new Error("DB_URI is not defined in environment variables");

declare global {
  // eslint-disable-next-line no-var
  var _mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
}

const cached = global._mongoose ?? (global._mongoose = { conn: null, promise: null });

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(URI).then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
