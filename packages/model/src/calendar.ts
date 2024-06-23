import { z } from "zod";

export const calendarColorSchema = z.union([
  z.literal("blue"),
  z.literal("pink"),
  z.literal("gray"),
  z.literal("yellow"),
  z.literal("green"),
  z.literal("red"),
  z.literal("violet"),
]);
export type CalendarColorType = z.infer<typeof calendarColorSchema>;
