import prisma from "../prisma/prisma.js";
import { hashPassword, verifyPassword } from "./passwordService.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken, refreshExpSeconds } from "./tokenService.js";

const buildTokenPair = (user) => {
  const accessToken = signAccessToken({ id: user.id, email: user.email, role: user.role });
  const refreshToken = signRefreshToken({ id: user.id, email: user.email });
  const expiresAt = new Date(Date.now() + refreshExpSeconds * 1000);
  return { accessToken, refreshToken, expiresAt };
};

const registerUser = async ({ fullName, email, password }) => {
  const existUser = await prisma.user.findUnique({ where: { email } });
  if (existUser) {
    throw new Error("Email already exists");
  }
  const passwordHash = await hashPassword(password);
  const newUser = await prisma.user.create({
    data: { fullName, email, passwordHash },
  });

  const { accessToken, refreshToken, expiresAt } = buildTokenPair(newUser);

  await prisma.session.create({
    data: { userId: newUser.id, refreshToken, expiresAt },
  });

  return {
    accessToken,
    refreshToken,
    user: { id: newUser.id, fullName: newUser.fullName, email: newUser.email },
  };
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

  const { accessToken, refreshToken, expiresAt } = buildTokenPair(user);

  await prisma.session.create({
    data: { userId: user.id, refreshToken, expiresAt },
  });

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, fullName: user.fullName, email: user.email },
  };
};

const refreshTokens = async ({ refreshToken }) => {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (err) {
    throw err;
  }

  const session = await prisma.session.findUnique({ where: { refreshToken } });

  if (!session || session.revokedAt !== null || session.expiresAt < new Date()) {
    throw new Error("RefreshTokenInvalid: session not found or revoked.");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    throw new Error("RefreshTokenInvalid: user not found.");
  }

  const { accessToken: newAccessToken, refreshToken: newRefreshToken, expiresAt } = buildTokenPair(user);

  await prisma.$transaction([
    prisma.session.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    }),
    prisma.session.create({
      data: { userId: user.id, refreshToken: newRefreshToken, expiresAt },
    }),
  ]);

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

const logoutUser = async ({ refreshToken }) => {
  const session = await prisma.session.findUnique({ where: { refreshToken } });

  if (!session || session.revokedAt !== null) {
    throw new Error("RefreshTokenInvalid: session not found or already revoked.");
  }

  await prisma.session.update({
    where: { id: session.id },
    data: { revokedAt: new Date() },
  });
};

export { registerUser, loginUser, refreshTokens, logoutUser };
