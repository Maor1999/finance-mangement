const TZ = "Asia/Jerusalem";

const getYearAndMonthFromDate = (dateValue) => {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    const error = new Error("Invalid date value");
    error.code = "INVALID_DATE_FOR_CACHE";
    throw error;
  }

  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
  });

  const parts = dtf.formatToParts(date);
  const yearStr = parts.find((p) => p.type === "year")?.value;
  const monthStr = parts.find((p) => p.type === "month")?.value;

  const year = Number(yearStr);
  const month = Number(monthStr);

  if (!Number.isInteger(year) || !Number.isInteger(month)) {
    const error = new Error("Failed to extract year/month for cache invalidation");
    error.code = "INVALID_DATE_FOR_CACHE";
    throw error;
  }
  return { year, month };
};

export { getYearAndMonthFromDate };
