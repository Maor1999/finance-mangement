import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

const hashPassword = async (plainPassword) => {
  if (!plainPassword || typeof plainPassword !== "string") {
    throw new Error("Password must be a valid non-empty string");
  }
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
};

const verifyPassword = async (plainPassword, hashedPassword) => {
  if (!hashedPassword) return false;
  return bcrypt.compare(plainPassword, hashedPassword);
};

export { hashPassword, verifyPassword };

