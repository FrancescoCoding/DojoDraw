import mongoose, { Document, Model } from "mongoose";

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  isRaffleHolder: boolean;
}

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isRaffleHolder: { type: Boolean, default: false },
});

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema, "Users");

export { IUser, User };
