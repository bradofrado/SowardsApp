import { displayTime, isDateInBetween, minute } from "model/src/utils";
import type { UserVacation, VacationEvent } from "model/src/vacation";
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

const getLocationFromDate = (date: Date): string => {
  return isDateInBetween(date, new Date(), new Date("2024-08-07"))
    ? "Oahu"
    : "The Big Island";
};

const generateFromPrompt = async ({
  prompt,
  context,
}: {
  prompt: string;
  context: string;
}): Promise<string> => {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: context,
      },
      { role: "user", content: prompt },
    ],
  });
  if (
    response.choices[0].finish_reason === "stop" &&
    response.choices[0].message.content
  ) {
    return response.choices[0].message.content;
  }

  throw new Error("Invalid response from openai");
};

export const generateEvents = async (
  user: UserVacation,
  event: VacationEvent,
): Promise<VacationEvent[]> => {
  const date = event.date;
  const notes = event.notes;
  const amounts = getAmountOfPeople(user.dependents);
  const location = getLocationFromDate(date);

  const prompt = `Give me vacation activity ideas for my family trip in Hawaii. The activity to plan for is ${
    amounts.adult
  } adults and ${
    amounts.child
  } children. We will be in ${location} on ${date.toDateString()}. The activities should be family-friendly and suitable for all ages. Prioritize free activites, but paid activities are ok. Here is some more information, if any: ${notes}. Give the answers in this JSON format: \`[{name: string, description: string, location: string, website: string, amountAdult: number, amountChild: number, durationMinutes: number}]\`. Make sure it is valid json and does not contain any comments.`;

  let content = await generateFromPrompt({
    prompt,
    context:
      "You are a vacation event planner tasked with generating events for a family vacation in Hawaii.",
  });

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
};

interface GenerateItineraryOptions {
  date: Date;
  events: VacationEvent[];
  weather: string;
}
export const generateItinerary = async ({
  date,
  events,
  weather,
}: GenerateItineraryOptions): Promise<string> => {
  const prompt = `
Give me a description of an itinerary for the day for our family trip. I will give you information about where we are staying currently, what the weather is like, and the list of activities for the day. First give a summary of what the day will look like at a high level. Include what to wear for the day, what to bring, and the weather in this description. Then list off the activities for the day. Keep it short--you can essentially just repeat back what I give you. Include any specific feedback after this list that may help transition from one activity to the next. This is something that will be sent to the family group chat, so give it a couple emojis and make it sound like it came from me.

Base Location: ${getLocationFromDate(date)}, Hawaii

Weather: ${weather}

Activities:
${events
  .map(
    (event) =>
      `  - ${displayTime(event.date)}-${displayTime(
        new Date(event.date.getTime() + event.durationMinutes * minute),
      )} - ${event.name}`,
  )
  .join("\n")}
`;

  const context =
    "You are a fun and casual family member helping their family scope out their day in Hawaii.";

  const content = await generateFromPrompt({ prompt, context });

  return content;
};
