/* eslint-disable no-console -- Using console for basic logging until we implement a proper logging solution */
type LogLevel = "info" | "error" | "warn";

interface LogMessage {
  message: string;
  [key: string]: unknown;
}

class Logger {
  private log(level: LogLevel, data: LogMessage) {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      ...data,
    };

    if (level === "error") {
      console.error(JSON.stringify(logData));
    } else {
      console.log(JSON.stringify(logData));
    }
  }

  info(data: LogMessage) {
    this.log("info", data);
  }

  error(data: LogMessage) {
    this.log("error", data);
  }

  warn(data: LogMessage) {
    this.log("warn", data);
  }
}

export const logger = new Logger();
