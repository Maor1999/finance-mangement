const fetchMonthlySummaryFromFinance = async (token, year, month) => {
  const baseUrl = process.env.FINANCE_BASE_URL;
  if (!baseUrl) {
    const err = new Error("FINANCE_BASE_URL is not set");
    err.status = 500;
    throw err;
  }

  const url = `${baseUrl}/summary/${year}/${month}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  let body;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const err = new Error("Failed to fetch monthly summary from Finance");
    err.status = res.status;
    err.details = body;
    throw err;
  }

  if (body && typeof body === "object" && "data" in body) {
    return body.data;
  }

  return body;
};

export { fetchMonthlySummaryFromFinance };
