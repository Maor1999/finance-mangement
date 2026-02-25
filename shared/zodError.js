const zodError = (err) => {
  // works without importing zod
  const isZod =
    err?.name === "ZodError" &&
    Array.isArray(err?.issues);

  if (!isZod) return null;

  return {
    status: 400,
    message: "invalid request data",
    code: "validation_error",
    details: err.issues,
  };
};

export { zodError };