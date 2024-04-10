import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cron from "node-cron";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import cors from "cors";

import { connectDB } from "./database/db";

import { automatedDrawForEligibleRaffles } from "./controllers/raffles.controllers";

import authRoutes from "./routes/auth.routes";
import raffleRoutes from "./routes/raffles.routes";

import { User, IUser } from "./models/User";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

declare global {
  namespace Express {
    interface User extends IUser {}
  }
}

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "yourSecretKey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only send cookie over HTTPS.
      domain:
        process.env.NODE_ENV === "development"
          ? "localhost"
          : "DojoDraw.netlify.app",
      sameSite: process.env.NODE_ENV === "development" ? "lax" : "none", // Use 'none' for cross-site delivery
      // maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

const whitelist = [
  "http://127.0.0.1:5174",
  "http://localhost:5174",
  "https://dojodraw.netlify.app",
  "https://dojodraw.netlify.app/",
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Passport setup
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const userDoc = await User.findOne({ email: email });

        if (!userDoc) {
          return done(null, false, { message: "Incorrect email." });
        }
        const user = userDoc.toObject(); // Convert to plain object
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: "Incorrect password." });
        }
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user: Express.User, done) => {
  done(null, user._id.toString());
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id).exec();
    done(null, user ? user.toObject() : false);
  } catch (err) {
    done(err);
  }
});

export const db = async (): Promise<void> => {
  await connectDB();
};

void db();

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/auth", authRoutes);
app.use("/raffles", raffleRoutes);

// Middleware to log incoming requests (for debugging)
// app.use((req, res, next) => {
//   console.log("Incoming request:", req.method, req.path);
//   next();
// });

// Schedule automated raffle draws every minute
cron.schedule("0 0 * * *", () => {
  console.log("Initiating automated draw for eligible raffles...");
  automatedDrawForEligibleRaffles()
    .then(() => console.log("Automated draw completed."))
    .catch((err) => console.error("Error during automated draw:", err));
});

/* Root path */
app.get("/", (req: Request, res: Response) => {
  res.send("Raffles Backend API");
});

/* Start the Express app and listen
 for incoming requests on the specified port */
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
