import sql from "@leafac/sqlite";

export const sqliteConds = {
  eq: sql`=`,
  ne: sql`<>`,
  gt: sql`>`,
  lt: sql`<`,
  gte: sql`>=`,
  lte: sql`<=`,
  btw: sql`between`,
  lk: sql`like`,
  in: sql`in`,
  exts: sql`exists`,
};

export const and = (...queries) => join(queries, sql` and `);

export const or = (...queries) => join(queries, sql` or `);

export const not = (query) => sql`not $${query}`;

export const condExp = (key, cond, value) =>
  sql`$${key} $${sqliteConds[cond]} $${isQuery(value) ? sql`$${value}` : sql`${value}`}`;

export const eq = (prop, value) => condExp(prop, "eq", value);

export const ne = (prop, value) => condExp(prop, "ne", value);

export const gt = (prop, value) => condExp(prop, "gt", value);

export const lt = (prop, value) => condExp(prop, "lt", value);

export const gte = (prop, value) => condExp(prop, "gte", value);

export const lte = (prop, value) => condExp(prop, "lte", value);

export const btw = (prop, from, to) =>
  condExp(prop, "btw", sql`$${isQuery(from) ? from : sql`${from}`} and $${isQuery(to) ? to : sql`${to}`}`);

export const lk = (prop, value) => condExp(prop, "lk", value);

export const iin = (prop, ...value) => condExp(prop, "in", sql`($${join(value)})`);

export const exts = (prop, value) => condExp(prop, "exts", sql`($${value})`);

export const join = (values, glue = sql`, `) =>
  // eslint-disable-next-line unicorn/no-array-reduce
  values.reduce(
    (acc, curr, index, array) =>
      sql`$${acc}$${index === 0 || index === array.length ? sql`` : glue}$${
        isQuery(curr) ? sql`$${curr}` : sql`${curr}`
      }`,
    sql``,
  );

export const isQuery = (value) => {
  return typeof value === "object" && Array.isArray(value?.sourceParts) && Array.isArray(value?.parameters);
};
