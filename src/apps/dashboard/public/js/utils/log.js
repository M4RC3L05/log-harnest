export const logLevels = {
  ALL: "all",
  TRACE: "trace",
  DEBUG: "debug",
  INFO: "info",
  WARN: "warn",
  ERROR: "error",
  FATAL: "fatal",
  OFF: "off",
};

export const levelIndexes = {
  0: logLevels.ALL,
  10: logLevels.TRACE,
  20: logLevels.DEBUG,
  30: logLevels.INFO,
  40: logLevels.WARN,
  50: logLevels.ERROR,
  60: logLevels.FATAL,
  70: logLevels.OFF,
};

export const levelColor = (level) => {
  switch (level) {
    case logLevels.ALL: {
      return "purple";
    }

    case logLevels.DEBUG: {
      return "magenta";
    }

    case logLevels.INFO: {
      return "cyan";
    }

    case logLevels.WARN: {
      return "yellow";
    }

    case logLevels.ERROR: {
      return "red";
    }

    case logLevels.FATAL: {
      return "#ED0800";
    }

    case logLevels.OFF: {
      return "grey";
    }

    default: {
      return "inherit";
    }
  }
};

export const levelEmoji = (level) => {
  switch (level) {
    case logLevels.ALL: {
      return "⚪";
    }

    case logLevels.DEBUG: {
      return "🟣";
    }

    case logLevels.INFO: {
      return "ℹ️";
    }

    case logLevels.WARN: {
      return "⚠️";
    }

    case logLevels.ERROR: {
      return "❌";
    }

    case logLevels.FATAL: {
      return "☠️";
    }

    case logLevels.OFF: {
      return "🔇";
    }

    default: {
      return "";
    }
  }
};
