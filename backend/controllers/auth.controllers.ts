import { NextFunction, Request, Response } from "express";
import { User } from "../models/User";
import bcrypt from "bcrypt";
import passport from "passport";

import { IUser } from "../models/User";

const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, isRaffleHolder } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User already exists");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      isRaffleHolder,
    });

    // Save user and return response
    await user.save();
    res.status(201).send("User registered successfully");
  } catch (error) {
    // Asserting error as an instance of Error
    if (error instanceof Error) {
      res.status(500).send(error.message);
    } else {
      // For unknown types of errors
      res.status(500).send("An error occurred");
    }
  }
};

const login = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    "local",
    (
      err: Error | null,
      user: Express.User | false, // Original user type from Passport
      info: { message: string }
    ) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).send(info.message);
      }
      req.logIn(user, (err: Error | null) => {
        if (err) {
          return next(err);
        }

        const { _id, name, email, isRaffleHolder } = user as IUser;

        return res.status(200).json({ id: _id, name, email, isRaffleHolder });
      });
    }
  )(req, res, next);
};

const logout = (req: Request, res: Response, next: NextFunction) => {
  // Terminate the session
  req.logout(function (err) {
    if (err) {
      return next(err);
    }

    // Clear the session cookie
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      }

      // Optionally clear the cookie from the client-side as well
      res.clearCookie("connect.sid", { path: "/" }); // Adjust the cookie name if different

      res.status(200).send("Logged out successfully");
    });
  });
};

const verifySession = (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    res.status(200).json({
      isAuthenticated: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        isRaffleHolder: req.user.isRaffleHolder,
      },
    });
  } else {
    res.status(200).json({ isAuthenticated: false });
  }
};

export { register, login, logout, verifySession };
