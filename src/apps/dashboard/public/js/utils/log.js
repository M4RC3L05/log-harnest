export const logLevels = {
  ALL: "all",
  DEBUG: "debug",
  INFO: "info",
  WARN: "warn",
  ERROR: "error",
  FATAL: "fatal",
  OFF: "off",
};

/**
 * @param { string } level
 */
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

/**
 * @param { string } level
 */
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
