export const logLevels = {
  labels: {
    0: "all",
    10: "trace",
    20: "debug",
    30: "info",
    40: "warn",
    50: "error",
    60: "fatal",
    70: "off",
  },
};

export const resolveLevel = (log, maps, def) => {
  let levelFromParsedData = log?.[maps?.level] ?? def;

  if (typeof levelFromParsedData === "string") {
    const logNumber = Number(levelFromParsedData);

    if (Number.isNaN(logNumber)) {
      const validLogLevels = Object.values(logLevels.labels);

      if (!validLogLevels.includes(levelFromParsedData)) {
        levelFromParsedData = def;
      }
    } else {
      levelFromParsedData = logNumber;
    }
  }

  if (typeof levelFromParsedData === "number") {
    levelFromParsedData = logLevels.labels[levelFromParsedData];

    if (!levelFromParsedData) {
      levelFromParsedData = def;
    }
  }

  return levelFromParsedData;
};

export const resolveName = (log, maps, def) => {
  return log?.[maps?.name] ?? def;
};

export const resolveTimestamp = (log, maps, def) => {
  return Number.isNaN(new Date(log?.[maps?.timestamp]).getTime())
    ? def
    : new Date(log?.[maps?.timestamp]).toISOString();
};

export const resolveMessage = (log, maps, def) => {
  return log?.[maps?.message] ?? def;
};

export const resolveLogName = (level) => {
  return logLevels.labels[level];
};
