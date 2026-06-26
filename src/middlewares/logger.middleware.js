const winston = require("winston");
const path = require("path");

const { createLogger, format, transports } = winston;

const logger = createLogger({
  level: "info",
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.File({
      filename: path.join("logs", "error.log"),
      level: "info",
    }),
    new transports.File({
      filename: path.join("logs", "app.log"),
      level: "http",
    }),
  ],
});

logger.add(
  new transports.Console({
    level: "error",
    format: format.combine(
      format.colorize(),
      format.timestamp(),
      format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
  })
);


module.exports = logger;
