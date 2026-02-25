const prismaError = (err) => {
    if (!err?.code?.startsWith?.("P")) return null;
  
    const messages = {
      P2002: "Duplicate value for a unique field",
      P2025: "Record not found",
      P2003: "Invalid reference (foreign key constraint failed)",
    };
  
    const status = {
      P2002: 409,
      P2025: 404,
      P2003: 409,
    };
  
    return {
      status: status[err.code] || 500,
      code: "DB_ERROR",
      dbCode: err.code,
      message: messages[err.code] || "Database error",
      details: process.env.NODE_ENV === "production" 
        ? { type: err.code } 
        : (err.meta || null),
    };
  };
  
  export { prismaError };
  