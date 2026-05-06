import { Schema, model, models } from "mongoose";
import {
  defaultIndicatorIcon,
  indicatorIconOptions,
  type IndicatorIconName,
} from "@/lib/indicator-icons";

export type IndicatorType = "checkbox";

export interface IIndicator {
  userEmail: string;
  label: string;
  icon: IndicatorIconName;
  type: IndicatorType;
  createdAt: Date;
  updatedAt: Date;
}

const IndicatorSchema = new Schema<IIndicator>(
  {
    userEmail: { type: String, required: true, index: true },
    label: { type: String, required: true, trim: true, maxlength: 100 },
    icon: {
      type: String,
      required: true,
      enum: indicatorIconOptions.map((icon) => icon.name),
      default: defaultIndicatorIcon,
    },
    type: {
      type: String,
      required: true,
      enum: ["checkbox"],
      default: "checkbox",
    },
  },
  { timestamps: true }
);

delete models["Indicator"];
export const Indicator = model<IIndicator>("Indicator", IndicatorSchema);
