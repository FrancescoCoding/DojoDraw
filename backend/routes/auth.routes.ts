import { Router } from "express";
import {
  register,
  login,
  logout,
  verifySession,
} from "../controllers/auth.controllers";

const authRoutes = Router();

authRoutes.route("/register").post(register);
authRoutes.route("/login").post(login);
authRoutes.route("/logout").get(logout);
authRoutes.route("/verify-session").get(verifySession);

export default authRoutes;
