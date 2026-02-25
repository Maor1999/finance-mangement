import prisma from "../prisma/prisma.js";
import { hashPassword, verifyPassword } from "./passwordService.js";
import { signToken } from "./tokenService.js";

const registerUser = async ({ fullName, email, password }) => {
  const existUser = await prisma.user.findUnique({ where: { email } });
  if (existUser) {
  throw new Error("Email already exists");
  }
  const passwordHash = await hashPassword(password);
  const newUser = await prisma.user.create({
  data: { fullName, email, passwordHash },
  });
  const token = signToken({ id: newUser.id, email: newUser.email });
  return {token, user: newUser};
};

const loginUser = async ({ email, password }) => { 
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
  throw new Error("Invalid credentials");
  }
  const isPasswordValid = await verifyPassword(password, user.passwordHash);
  if (!isPasswordValid) {
  throw new Error("Invalid credentials");
  }
  const token = signToken({ id: user.id, email: user.email });
  return {token, user};
}

export { registerUser, loginUser };