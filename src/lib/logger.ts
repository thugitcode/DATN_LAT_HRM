/**
 * Logger utility that only logs in non-production environments
 * Automatically disabled in production builds
 *
 * This implementation preserves the original file path in console
 * by directly binding to console methods instead of wrapping them
 */

const isDevelopment = window.NODE_ENV !== "prod";

// Create noop functions for production
const noop = () => {};

/**
 * Log info message (only in development)
 */
const log = isDevelopment ? console.log.bind(console) : noop;

/**
 * Log error message (only in development)
 */
const error = isDevelopment ? console.error.bind(console) : noop;

/**
 * Log warning message (only in development)
 */
const warn = isDevelopment ? console.warn.bind(console) : noop;

/**
 * Log debug message (only in development)
 */
const debug = isDevelopment ? console.debug.bind(console) : noop;

/**
 * Log info message (alias for log)
 */
const info = log;

/**
 * Group logs together (only in development)
 */
const group = isDevelopment ? console.group.bind(console) : noop;

/**
 * Group logs together collapsed (only in development)
 */
const groupCollapsed = isDevelopment ? console.groupCollapsed.bind(console) : noop;

/**
 * End a group (only in development)
 */
const groupEnd = isDevelopment ? console.groupEnd.bind(console) : noop;

/**
 * Log a table (only in development)
 */
const table = isDevelopment ? console.table.bind(console) : noop;

/**
 * Start a timer (only in development)
 */
const time = isDevelopment ? console.time.bind(console) : noop;

/**
 * End a timer (only in development)
 */
const timeEnd = isDevelopment ? console.timeEnd.bind(console) : noop;

/**
 * Logger object with all methods
 */
export const logger = {
  log,
  error,
  warn,
  debug,
  info,
  group,
  groupCollapsed,
  groupEnd,
  table,
  time,
  timeEnd,
};

/**
 * Create a logger with prefix (still preserves file path)
 */
export const createLogger = (prefix: string) => {
  if (!isDevelopment) {
    return logger;
  }

  return {
    log: (...args: unknown[]) => console.log(`[${prefix}]`, ...args),
    error: (...args: unknown[]) => console.error(`[${prefix}]`, ...args),
    warn: (...args: unknown[]) => console.warn(`[${prefix}]`, ...args),
    debug: (...args: unknown[]) => console.debug(`[${prefix}]`, ...args),
    info: (...args: unknown[]) => console.log(`[${prefix}]`, ...args),
    group: (label: string) => console.group(`[${prefix}] ${label}`),
    groupCollapsed: (label: string) => console.groupCollapsed(`[${prefix}] ${label}`),
    groupEnd: console.groupEnd.bind(console),
    table: (data: unknown) => {
      console.log(`[${prefix}]`);
      console.table(data);
    },
    time: (label: string) => console.time(`[${prefix}] ${label}`),
    timeEnd: (label: string) => console.timeEnd(`[${prefix}] ${label}`),
  };
};
