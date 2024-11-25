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

interface WeatherDataOptions {
  lat: number;
  long: number;
}
export const getWeatherData = async ({ lat, long }: WeatherDataOptions) => {
  const response = await axios<WeatherResponse>(
    `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${long}&appid=${weatherAPIKey}&units=imperial`,
  );

  return response.data;
};
