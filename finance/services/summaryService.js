import { listExpensesByUser } from "../dataAccessDb/expenseData.js";
import { listSalariesByUser } from "../dataAccessDb/salaryData.js";
import { buildSummaryKey, getFromCache, saveToCache } from "../redis/cache.js";

const TZ = "Asia/Jerusalem";
const PAGE_TAKE = 1000;

const buildError = (message, status, code) => {
  const err = new Error(message);
  err.status = status;
  err.code = code;
  return err;
};

const assertYearMonth = (year, month) => {
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw buildError("Invalid year", 400, "INVALID_YEAR");
  }
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw buildError("Invalid month", 400, "INVALID_MONTH");
  }
};

const getSummaryCacheTtlSeconds = () => {
  const minutesRaw = process.env.SUMMARY_CACHE_TTL;
  const minutes = minutesRaw ? Number(minutesRaw) : 120;
  if (!Number.isFinite(minutes) || minutes <= 0) return 120 * 60;
  return Math.floor(minutes * 60);
};

const toMoneyStringFromCents = (cents) => {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const whole = Math.floor(abs / 100);
  const fraction = String(abs % 100).padStart(2, "0");
  return `${sign}${whole}.${fraction}`;
};

const toCents = (value) => {
  if (value === null || value === undefined) return 0;

  const str = typeof value === "string" ? value : value.toString?.() ?? String(value);

  const match = str.match(/^(-)?(\d+)(?:\.(\d{1,2}))?$/);
  if (!match) {
    throw buildError("Invalid money value", 500, "INVALID_MONEY_VALUE");
  }

  const sign = match[1] ? -1 : 1;
  const whole = Number(match[2]);
  const fracRaw = match[3] ?? "";
  const frac = Number(fracRaw.padEnd(2, "0"));

  return sign * (whole * 100 + frac);
};

const getTzOffsetMinutes = (date, timeZone) => {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  const parts = dtf.formatToParts(date);
  const pick = (type) => parts.find((p) => p.type === type)?.value;

  const y = Number(pick("year"));
  const m = Number(pick("month"));
  const d = Number(pick("day"));
  const hh = Number(pick("hour"));
  const mm = Number(pick("minute"));
  const ss = Number(pick("second"));

  const asIfUtc = Date.UTC(y, m - 1, d, hh, mm, ss);
  const actualUtc = date.getTime();

  return Math.round((asIfUtc - actualUtc) / 60000);
};

const zonedTimeToUtc = (year, month, day, hour, minute, second, timeZone) => {
  let utcGuessMs = Date.UTC(year, month - 1, day, hour, minute, second);
  let guessDate = new Date(utcGuessMs);

  let offsetMin = getTzOffsetMinutes(guessDate, timeZone);
  utcGuessMs =
    Date.UTC(year, month - 1, day, hour, minute, second) - offsetMin * 60000;

  guessDate = new Date(utcGuessMs);
  offsetMin = getTzOffsetMinutes(guessDate, timeZone);
  utcGuessMs =
    Date.UTC(year, month - 1, day, hour, minute, second) - offsetMin * 60000;

  return new Date(utcGuessMs);
};

const monthRangeAsiaJerusalemAsUtc = (year, month) => {
  const from = zonedTimeToUtc(year, month, 1, 0, 0, 0, TZ);

  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const to = zonedTimeToUtc(nextYear, nextMonth, 1, 0, 0, 0, TZ);

  return { from, to };
};

const safeGetCache = async (key) => {
  try {
    return await getFromCache(key);
  } catch (err) {
    return null;
  }
};

const safeSetCache = async (key, value, ttlSeconds) => {
  try {
    await saveToCache(key, value, ttlSeconds);
  } catch (err) {
  }
};

const addExpenseToCategoryMap = (map, exp) => {
  const category = exp.category ?? "OTHER";
  const amountCents = toCents(exp.amount);
  const prev = map.get(category) ?? 0;
  map.set(category, prev + amountCents);
};

const finalizeByCategory = (map) => {
  const out = {};
  for (const [category, cents] of map.entries()) {
    out[category] = toMoneyStringFromCents(cents);
  }
  return out;
};

const accumulateExpenses = async ({ userId, from, to }) => {
  let skip = 0;
  let totalCents = 0;
  const byCategoryMap = new Map();

  while (true) {
    const page = await listExpensesByUser({
      userId,
      from,
      to,
      skip,
      take: PAGE_TAKE,
    });

    if (!page || page.length === 0) break;

    for (const exp of page) {
      totalCents += toCents(exp.amount);
      addExpenseToCategoryMap(byCategoryMap, exp);
    }

    if (page.length < PAGE_TAKE) break;
    skip += PAGE_TAKE;
  }

  return {
    expenseTotalCents: totalCents,
    byCategory: finalizeByCategory(byCategoryMap),
  };
};

const accumulateSalaries = async ({ userId, from, to }) => {
  let skip = 0;
  let totalCents = 0;

  while (true) {
    const page = await listSalariesByUser({
      userId,
      from,
      to,
      skip,
      take: PAGE_TAKE,
    });

    if (!page || page.length === 0) break;

    for (const sal of page) {
      totalCents += toCents(sal.amount);
    }

    if (page.length < PAGE_TAKE) break;
    skip += PAGE_TAKE;
  }

  return { salaryTotalCents: totalCents };
};

const getMonthlySummaryForUser = async (userId, year, month) => {
  assertYearMonth(year, month);

  const key = buildSummaryKey(userId, year, month);
  const cached = await safeGetCache(key);
  if (cached) return cached;

  const { from, to } = monthRangeAsiaJerusalemAsUtc(year, month);

  const [expAgg, salAgg] = await Promise.all([
    accumulateExpenses({ userId, from, to }),
    accumulateSalaries({ userId, from, to }),
  ]);

  const result = {
    year,
    month,
    salaryTotal: toMoneyStringFromCents(salAgg.salaryTotalCents),
    expenseTotal: toMoneyStringFromCents(expAgg.expenseTotalCents),
    net: toMoneyStringFromCents(
    salAgg.salaryTotalCents - expAgg.expenseTotalCents
    ),
    byCategory: expAgg.byCategory,
  };

  await safeSetCache(key, result, getSummaryCacheTtlSeconds());
  return result;
};

export { getMonthlySummaryForUser };
