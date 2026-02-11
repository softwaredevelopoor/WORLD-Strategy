export type LogLevel = "debug" | "info" | "warn" | "error";

class Logger {
  private minLevel: LogLevel = (
    process.env.LOG_LEVEL || "info"
  ).toLowerCase() as LogLevel;

  private levels = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  private shouldLog(level: LogLevel): boolean {
    return this.levels[level] >= this.levels[this.minLevel];
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog("debug")) {
      console.log(`[DEBUG] ${message}`, data ? data : "");
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog("info")) {
      console.log(`[INFO] ${message}`, data ? data : "");
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog("warn")) {
      console.warn(`[WARN] ${message}`, data ? data : "");
    }
  }

  error(message: string, data?: any): void {
    if (this.shouldLog("error")) {
      console.error(`[ERROR] ${message}`, data ? data : "");
    }
  }
}

export const logger = new Logger();
