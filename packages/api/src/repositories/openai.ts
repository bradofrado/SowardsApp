import { isDateInBetween } from "model/src/utils";
import { UserVacation, VacationEvent } from "model/src/vacation";
import { getAmountOfPeople } from "model/src/vacation-utils";
import Openai from "openai";
import { z } from "zod";

const openai = new Openai();

const eventResponseSchema = z.object({
  name: z.string(),
  description: z.string(),
  location: z.string(),
  website: z.string(),
  amountAdult: z.number(),
  amountChild: z.number(),
  durationMinutes: z.number(),
});

export const generateEvents = async (
  user: UserVacation,
  event: VacationEvent,
): Promise<VacationEvent[]> => {
  const date = event.date;
  const notes = event.notes;
  const amounts = getAmountOfPeople(user.dependents);
  const location = isDateInBetween(date, new Date(), new Date("2024-08-07"))
    ? "Oahu"
    : "The Big Island";

  const prompt = `Give me vacation activity ideas for my family trip in Hawaii. The activity to plan for is ${
    amounts.adult
  } adults and ${
    amounts.child
  } children. We will be in ${location} on ${date.toDateString()}. The activities should be family-friendly and suitable for all ages. Prioritize free activites, but paid activities are ok. Here is some more information, if any: ${notes}. Give the answers in this JSON format: \`{name: string, description: string, location: string, website: string, amountAdult: number, amountChild: number, durationMinutes: number}\``;
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are a vacation event planner tasked with generating events for a family vacation in Hawaii.",
      },
      { role: "user", content: prompt },
    ],
  });
  if (
    response.choices[0].finish_reason === "stop" &&
    response.choices[0].message.content
  ) {
    let content = response.choices[0].message.content;
    const firstChar = content.indexOf("[");
    const lastChar = content.lastIndexOf("]");
    content = content.slice(firstChar, lastChar + 1);

    const parsed = z.array(eventResponseSchema).safeParse(JSON.parse(content));
    if (!parsed.success) throw new Error("Invalid response from openai");

    return parsed.data.map((result) => ({
      id: "",
      name: result.name,
      location: result.location,
      notes: result.description,
      amounts: [
        { type: "adult", amount: result.amountAdult, createdById: user.id },
        { type: "child", amount: result.amountChild, createdById: user.id },
      ],
      date,
      durationMinutes: result.durationMinutes,
      isPublic: true,
      userIds: [],
      createdById: user.id,
      groupIds: [],
      links: [result.website],
      personLimit: undefined,
    }));
  }
  throw new Error("Invalid response from openai");
};
