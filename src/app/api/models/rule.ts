import { Schema, model, models } from "mongoose";

export interface IRule {
  userEmail: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const RuleSchema = new Schema<IRule>(
  {
    userEmail: { type: String, required: true, index: true },
    text: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

delete models["Rule"];
export const Rule = model<IRule>("Rule", RuleSchema);
