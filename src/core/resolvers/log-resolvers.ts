/* eslint-disable @typescript-eslint/naming-convention */
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

export const resolveLevel = (log: Record<string, unknown>, maps: Record<string, string>, def: unknown) => {
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
    levelFromParsedData = resolveLogName(levelFromParsedData as any);

    if (!levelFromParsedData) {
      levelFromParsedData = def;
    }
  }

  return levelFromParsedData;
};

export const resolveName = (log: Record<string, unknown>, maps: Record<string, string>, def: unknown) => {
  return log?.[maps?.name] ?? def;
};

export const resolveTimestamp = (log: Record<string, unknown>, maps: Record<string, string>, def: Date) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return Number.isNaN(new Date(log?.[maps?.timestamp] as any).getTime())
    ? def
    : new Date(log?.[maps?.timestamp] as string);
};

export const resolveMessage = (log: Record<string, unknown>, maps: Record<string, string>, def: unknown) => {
  return log?.[maps?.message] ?? def;
};

export const resolveLogName = <K extends keyof typeof logLevels.labels>(level: K) => {
  return logLevels.labels[level];
};
