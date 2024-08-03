import axios from "axios";

const weatherAPIKey = process.env.OPEN_WEATHER_API_KEY || "";

interface WeatherResponse {
  daily: {
    dt: number;
    temp: {
      day: number;
      eve: number;
      morn: number;
      night: number;
      min: number;
      max: number;
    };
    weather: {
      description: string;
    }[];
  }[];
  alerts: {
    description: string;
    start: number;
    end: number;
    event: string;
    sender_name: string;
  }[];
}

export const getWeatherData = async () => {
  const response = await axios<WeatherResponse>(
    `https://api.openweathermap.org/data/3.0/onecall?lat=33.44&lon=-94.04&appid=${weatherAPIKey}&units=imperial`,
  );

  return response.data;
};
