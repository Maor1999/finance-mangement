import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

async function hashPassword(plainPassword) {
  if (!plainPassword || typeof plainPassword !== "string") {
    throw new Error("Password must be a valid non-empty string");
  }
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

async function verifyPassword(plainPassword, hashedPassword) {
  if (!hashedPassword) return false;
  return bcrypt.compare(plainPassword, hashedPassword);
}

export { hashPassword, verifyPassword };

