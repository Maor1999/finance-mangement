const errorHandler = (err, req, res, next) => {
if (err?.name === "ZodError" && Array.isArray(err?.issues)) {
return res.status(400).json({ ok: false, error: err.issues });
}

if (err?.errors) {
return res.status(400).json({ ok: false, error: err.errors });
}

if (err?.message === "Email already exists") {
return res.status(409).json({ ok: false, error: err.message });
}

if (err?.message === "Invalid credentials") {
return res.status(401).json({ ok: false, error: err.message });
}

if (err?.message?.startsWith("JWTExpired:")) {
return res.status(401).json({ ok: false, error: "Token has expired" });
}

if (err?.message?.startsWith("JWTInvalid:")) {
return res.status(401).json({ ok: false, error: "Invalid token" });
}

if (err?.message?.startsWith("JWTUnknownError:")) {
return res.status(401).json({ ok: false, error: "Token verification failed" });
}

if (err?.message?.startsWith("VerifyError:")) {
return res.status(401).json({ ok: false, error: "Invalid token format" });
}

if (err?.message?.startsWith("SignError:")) {
return res.status(500).json({ ok: false, error: "Failed to generate token" });
}

if (err?.message?.startsWith("ConfigError:")) {
return res.status(500).json({ ok: false, error: "Server configuration error" });
}

if (err?.code === "P2002") {
return res.status(409).json({ ok: false, error: "Duplicate entry" });
}

if (err?.code?.startsWith("P")) {
return res.status(500).json({ ok: false, error: "Database error" });
}

return res.status(500).json({ ok: false, error: "Internal server error" });
};

export default errorHandler;
