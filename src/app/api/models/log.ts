import { Schema, model, models } from "mongoose";

export interface ILog {
  userEmail: string;
  direction15m: "Bullish" | "Bearish";
  direction1hr: "Bullish" | "Bearish";
  option: "CALL" | "PUT";
  outcome: "WIN" | "LOSS";
  confirmedConditions: boolean;
  entryPrice?: number;
  exitPrice?: number;
  contracts?: number;
  imageUrls: string[];
  createdAt: Date;
  updatedAt: Date;
}

const LogSchema = new Schema<ILog>(
  {
    userEmail: { type: String, required: true, index: true },
    direction15m: { type: String, enum: ["Bullish", "Bearish"], required: true },
    direction1hr: { type: String, enum: ["Bullish", "Bearish"], required: true },
    option: { type: String, enum: ["CALL", "PUT"], required: true },
    outcome: { type: String, enum: ["WIN", "LOSS"], required: true },
    confirmedConditions: { type: Boolean, required: true, default: false },
    entryPrice: { type: Number },
    exitPrice: { type: Number },
    contracts: { type: Number },
    imageUrls: { type: [String], default: [] },
  },
  { timestamps: true }
);

delete models["Log"];
export const Log = model<ILog>("Log", LogSchema);
