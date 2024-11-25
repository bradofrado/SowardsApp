"use server";

import { getVacationEvents } from "api/src/repositories/event";
import { getUserVacation } from "api/src/repositories/user-vacation";
import { getWeatherData } from "api/src/repositories/weather";
import { prisma } from "db/lib/prisma";
import { datesEqual, isDateInBetween } from "model/src/utils";
import { generateItinerary as generateItineraryAI } from "api/src/repositories/openai";

export const getUser = getUserVacation;

export const generateItinerary = async (date: Date): Promise<string> => {
  const events = await getVacationEvents({ db: prisma });
  const eventsToday = events
    .map((event) => ({
      ...event,
      date: new Date(
        event.date.toLocaleString("en-US", { timeZone: "Pacific/Honolulu" }),
      ),
    }))
    .filter((event) => datesEqual(date, event.date));

  const location = getLocationFromDate(date);
  const weatherData = await getWeatherData(location);

  const weatherDescription = `${weatherData.daily[0].weather[0].description} with a high of ${weatherData.daily[0].temp.max} and a low of ${weatherData.daily[0].temp.min}`;

  const itinerary = await generateItineraryAI({
    date,
    events: eventsToday,
    weather: weatherDescription,
  });

  return itinerary;
};

const getLocationFromDate = (date: Date) => {
  return isDateInBetween(date, new Date("2024-08-01"), new Date("2024-08-07"))
    ? { lat: 21.64, long: -157.91 }
    : { lat: 19.93, long: -155.78 };
};
