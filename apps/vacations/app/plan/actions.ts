"use server";

import { getVacationEvents } from "api/src/repositories/event";
import { getUserVacation } from "api/src/repositories/user-vacation";
import { getWeatherData } from "api/src/repositories/weather";
import { prisma } from "db/lib/prisma";
import { datesEqual } from "model/src/utils";
import { generateItinerary as generateItineraryAI } from "api/src/repositories/openai";

export const getUser = getUserVacation;

export const generateItinerary = async (date: Date): Promise<string> => {
  const events = await getVacationEvents({ db: prisma });
  const eventsToday = events
    .filter((event) => datesEqual(date, event.date))
    .map((event) => ({
      ...event,
      date: new Date(
        event.date.toLocaleString("en-US", { timeZone: "Pacific/Honolulu" }),
      ),
    }));

  const weatherData = await getWeatherData();

  const weatherDescription = `${weatherData.daily[0].weather[0].description} with a high of ${weatherData.daily[0].temp.max} and a low of ${weatherData.daily[0].temp.min}`;

  const itinerary = await generateItineraryAI({
    date,
    events: eventsToday,
    weather: weatherDescription,
  });

  return itinerary;
};
