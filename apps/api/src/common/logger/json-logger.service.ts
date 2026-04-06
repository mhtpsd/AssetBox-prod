import { Injectable, LoggerService, LogLevel, Scope } from '@nestjs/common';

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: string;
  traceId?: string;
  requestId?: string;
  [key: string]: unknown;
}

/**
 * JsonLogger — outputs structured JSON logs for production observability.
 *
 * Each log line is a JSON object with the fields:
 *   timestamp  — ISO 8601 UTC timestamp
 *   level      — log level (log, error, warn, debug, verbose)
 *   message    — the log message
 *   context    — the NestJS context/class name (optional)
 *   traceId    — distributed trace ID, if set via AsyncLocalStorage (optional)
 *   requestId  — HTTP request ID from X-Request-ID header (optional)
 *
 * Usage in NestJS:
 *   const app = await NestFactory.create(AppModule, { logger: new JsonLogger() });
 *
 * Or inject per-module:
 *   @Injectable()
 *   export class MyService {
 *     private readonly logger = new JsonLogger(MyService.name);
 *   }
 */
@Injectable({ scope: Scope.TRANSIENT })
export class JsonLogger implements LoggerService {
  private context?: string;

  constructor(context?: string) {
    this.context = context;
  }

  private write(level: string, message: unknown, context?: string, ...optionalParams: unknown[]): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message: this.formatMessage(message),
      context: context ?? this.context,
    };

    // Merge any extra object params into the log entry (e.g. {userId: '123'})
    for (const param of optionalParams) {
      if (param && typeof param === 'object' && !Array.isArray(param)) {
        Object.assign(entry, param);
      }
    }

    // Write to stdout as a single JSON line
    process.stdout.write(JSON.stringify(entry) + '\n');
  }

  private formatMessage(message: unknown): string {
    if (typeof message === 'string') return message;
    if (message instanceof Error) return message.stack ?? message.message;
    return JSON.stringify(message);
  }

  log(message: unknown, context?: string, ...rest: unknown[]): void {
    this.write('log', message, context, ...rest);
  }

  error(message: unknown, trace?: string, context?: string, ...rest: unknown[]): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message: this.formatMessage(message),
      context: context ?? this.context,
    };
    if (trace) {
      entry['trace'] = trace;
    }
    for (const param of rest) {
      if (param && typeof param === 'object' && !Array.isArray(param)) {
        Object.assign(entry, param);
      }
    }
    process.stderr.write(JSON.stringify(entry) + '\n');
  }

  warn(message: unknown, context?: string, ...rest: unknown[]): void {
    this.write('warn', message, context, ...rest);
  }

  debug(message: unknown, context?: string, ...rest: unknown[]): void {
    this.write('debug', message, context, ...rest);
  }

  verbose(message: unknown, context?: string, ...rest: unknown[]): void {
    this.write('verbose', message, context, ...rest);
  }

  fatal(message: unknown, context?: string, ...rest: unknown[]): void {
    this.write('fatal', message, context, ...rest);
  }

  setLogLevels(_levels: LogLevel[]): void {
    // Log level filtering can be added here if needed
  }
}
