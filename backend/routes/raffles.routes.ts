import { Router } from "express";
import {
  createRaffle,
  listRaffles,
  enterRaffle,
  drawWinner,
  deleteTicketsByUser,
  claimPrize,
} from "../controllers/raffles.controllers";

import isAuthenticatedAndRaffleHolder from "../middleware/authenticate"; // Middleware to check if the user is authenticated and is a raffle holder

const raffleRoutes = Router();

raffleRoutes
  .route("/create")
  .post(isAuthenticatedAndRaffleHolder, createRaffle); // Only the raffle holder can create a raffle
raffleRoutes.route("/").get(listRaffles);
raffleRoutes.route("/enter").post(enterRaffle);
raffleRoutes.route("/:raffleId/draw-winner").post(drawWinner);
raffleRoutes.route("/:raffleId/delete-tickets").delete(deleteTicketsByUser);
raffleRoutes.route("/:raffleId/claim-prize").post(claimPrize);

export default raffleRoutes;
