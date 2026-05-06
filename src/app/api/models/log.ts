import { Schema, model, models } from "mongoose";
import {
  defaultIndicatorIcon,
  indicatorIconOptions,
  type IndicatorIconName,
} from "@/lib/indicator-icons";

export interface ILogIndicator {
  indicatorId: string;
  label: string;
  icon: IndicatorIconName;
  type: "checkbox";
  value: boolean;
}

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
  indicators: ILogIndicator[];
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
    indicators: {
      type: [
        {
          indicatorId: { type: String, required: true },
          label: { type: String, required: true },
          icon: {
            type: String,
            required: true,
            enum: indicatorIconOptions.map((icon) => icon.name),
            default: defaultIndicatorIcon,
          },
          type: {
            type: String,
            enum: ["checkbox"],
            required: true,
            default: "checkbox",
          },
          value: { type: Boolean, required: true, default: false },
        },
      ],
      default: [],
    },
    imageUrls: { type: [String], default: [] },
  },
  { timestamps: true }
);

delete models["Log"];
export const Log = model<ILog>("Log", LogSchema);
