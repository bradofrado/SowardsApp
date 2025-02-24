import { z } from "zod";

export const externalAccountSchema = z.object({
  account_id: z.string(),
  name: z.string(),
  subtype: z.nullable(z.string()),
  mask: z.nullable(z.string()),
  access_token: z.string(),
});

export type ExternalAccount = z.infer<typeof externalAccountSchema>;

export const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;
export type Month = (typeof months)[number];
