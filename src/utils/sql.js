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

/**
 * @typedef { import("@leafac/sqlite").Query } TagQuery
 * @typedef { TagQuery | object | string | number } QueryValue
 */

/**
 * @param {...TagQuery} queries
 */
export const and = (...queries) => join(queries, sql` and `);

/**
 * @param {...TagQuery} queries
 */
export const or = (...queries) => join(queries, sql` or `);

/**
 * @param { TagQuery } query
 */
export const not = (query) => sql`not $${query}`;

/**
 * @param { TagQuery } key
 * @param { keyof typeof sqliteConds } cond
 * @param { QueryValue } value
 * @returns
 */
export const condExp = (key, cond, value) =>
  sql`$${key} $${sqliteConds[cond]} $${isQuery(value) ? sql`$${value}` : sql`${value}`}`;

/**
 * @param { TagQuery } prop
 * @param { QueryValue } value
 */
export const eq = (prop, value) => condExp(prop, "eq", value);

/**
 * @param { TagQuery } prop
 * @param { QueryValue } value
 */
export const ne = (prop, value) => condExp(prop, "ne", value);

/**
 * @param { TagQuery } prop
 * @param { QueryValue } value
 */
export const gt = (prop, value) => condExp(prop, "gt", value);

/**
 * @param { TagQuery } prop
 * @param { QueryValue } value
 */
export const lt = (prop, value) => condExp(prop, "lt", value);

/**
 * @param { TagQuery } prop
 * @param { QueryValue } value
 */
export const gte = (prop, value) => condExp(prop, "gte", value);

/**
 * @param { TagQuery } prop
 * @param { QueryValue } value
 */
export const lte = (prop, value) => condExp(prop, "lte", value);

/**
 * @param { TagQuery } prop
 * @param { QueryValue } from
 * @param { QueryValue } to
 */
export const btw = (prop, from, to) =>
  condExp(prop, "btw", sql`$${isQuery(from) ? from : sql`${from}`} and $${isQuery(to) ? to : sql`${to}`}`);

/**
 * @param { TagQuery } prop
 * @param { QueryValue } value
 */
export const lk = (prop, value) => condExp(prop, "lk", value);

/**
 * @param { TagQuery } prop
 * @param { ...QueryValue } value
 */
export const iin = (prop, ...value) => condExp(prop, "in", sql`($${join(value)})`);

/**
 * @param { TagQuery } prop
 * @param { TagQuery } value
 */
export const exts = (prop, value) => condExp(prop, "exts", sql`($${value})`);

/**
 * @param { QueryValue[] } values
 * @param { TagQuery } glue
 * @returns { TagQuery }
 */
export const join = (values, glue = sql`, `) =>
  // eslint-disable-next-line unicorn/no-array-reduce
  values.reduce(
    (/** @type { TagQuery } */ acc, curr, index, array) =>
      sql`$${acc}$${index === 0 || index === array.length ? sql`` : glue}$${
        isQuery(curr) ? sql`$${curr}` : sql`${curr}`
      }`,
    sql``,
  );

/**
 * @param { any } value
 * @returns { value is TagQuery }
 */
export const isQuery = (value) => {
  return typeof value === "object" && Array.isArray(value?.sourceParts) && Array.isArray(value?.parameters);
};
