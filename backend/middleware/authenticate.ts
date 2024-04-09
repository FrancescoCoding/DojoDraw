import { Request, Response, NextFunction } from "express";

const isAuthenticatedAndRaffleHolder = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated() && req.user?.isRaffleHolder) {
    return next();
  } else if (!req.isAuthenticated()) {
    res
      .status(401)
      .json({ message: "You must be logged in to perform this action." });
  } else {
    res
      .status(403)
      .json({ message: "You do not have permission to create raffles." });
  }
};

export default isAuthenticatedAndRaffleHolder;
