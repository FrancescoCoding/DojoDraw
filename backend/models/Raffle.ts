import mongoose, { Document, Model } from "mongoose";
import { IUser } from "./User";

interface IRaffle extends Document {
  title: string;
  description: string;
  prizeDetails: string;
  drawDate: Date;
  imageUrl?: string;
  tickets: Array<{
    owner: IUser["_id"];
    ownerName?: string;
    numbers: number[];
    isGuest: boolean;
    guestEmail?: string;
  }>;
  createdBy: IUser["_id"];
  winner: {
    ticketId: mongoose.Schema.Types.ObjectId;
    isGuest: boolean;
    guestEmail?: string;
  } | null;
  luckyNumber: number | null;
  luckyNumberWinners: Array<{
    ticketId: mongoose.Schema.Types.ObjectId;
    prizeShare: number;
    isGuest: boolean;
    guestEmail?: string;
  }>;
  hasBeenClaimed: boolean;
}

const raffleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    prizeDetails: { type: String, required: true },
    drawDate: { type: Date, required: true },
    imageUrl: { type: String, default: "" },
    tickets: [
      {
        owner: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        ownerName: { type: String, default: "" },
        numbers: {
          type: [Number],
          required: true,
          validate: {
            validator: (numbers: number[]) => numbers.length <= 5,
            message: "You can only select up to 5 numbers",
          },
        },
        isGuest: { type: Boolean, default: false },
        guestEmail: { type: String, default: "" },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    winner: {
      ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      isGuest: { type: Boolean, required: true, default: false },
      guestEmail: { type: String, default: "" },
    },
    luckyNumber: { type: Number, default: null },
    luckyNumberWinners: [
      {
        ticketId: { type: mongoose.Schema.Types.ObjectId, required: true },
        prizeShare: { type: Number, required: true },
        isGuest: { type: Boolean, required: true },
        guestEmail: { type: String, default: "" },
      },
    ],
    hasBeenClaimed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Raffle: Model<IRaffle> = mongoose.model<IRaffle>(
  "Raffle",
  raffleSchema,
  "Raffles"
);

export { IRaffle, Raffle };
