import { Router } from "express";
import { auth, requireRole } from "../middlewares/auth.js";
import prisma from "../prisma/prisma.js";

const adminRouter = Router();

const listUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (userId === req.user.userId) {
      const err = new Error("Cannot delete your own account");
      err.status = 400;
      err.code = "CANNOT_DELETE_SELF";
      return next(err);
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      err.code = "USER_NOT_FOUND";
      return next(err);
    }
    await prisma.user.delete({ where: { id: userId } });
    return res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
};

adminRouter.use(auth, requireRole("ADMIN"));

adminRouter.get("/users", listUsers);
adminRouter.delete("/users/:userId", deleteUser);

export default adminRouter;
