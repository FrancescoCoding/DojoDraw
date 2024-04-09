import { Request, Response } from "express";
import { Raffle } from "../models/Raffle";
import { User } from "../models/User";

// Create a new raffle
const createRaffle = async (req: Request, res: Response) => {
  try {
    const { title, description, prizeDetails, drawDate, imageUrl } = req.body;
    const createdBy = req.user?._id;

    const newRaffle = new Raffle({
      title,
      description,
      prizeDetails,
      drawDate,
      createdBy,
      imageUrl,
    });

    await newRaffle.save();
    res.status(201).json({ message: "Raffle created successfully", newRaffle });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).send(error.message);
    } else {
      res.status(500).send("An unexpected error occurred");
    }
  }
};

// List all raffles
const listRaffles = async (req: Request, res: Response) => {
  try {
    let raffles = await Raffle.find()
      .populate("createdBy", "name email")
      .lean();

    // Asynchronously populate each ticket's ownerName from the id
    raffles = await Promise.all(
      raffles.map(async (raffle) => {
        // Populate ownerName for each ticket if not a guest
        const ticketsWithOwnerName = await Promise.all(
          raffle.tickets.map(async (ticket) => {
            if (!ticket.isGuest && ticket.owner) {
              const user = await User.findById(ticket.owner).lean();
              ticket.ownerName = user ? user.name : "Unknown";
            } else {
              ticket.ownerName = "Guest";
            }
            return ticket;
          })
        );
        raffle.tickets = ticketsWithOwnerName;
        return raffle;
      })
    );

    res.status(200).json(raffles);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).send(error.message);
    } else {
      res.status(500).send("An unexpected error occurred");
    }
  }
};

// Enter a raffle (purchase ticket)
const enterRaffle = async (req: Request, res: Response) => {
  try {
    const { raffleId, numbers, guestEmail } = req.body;
    const userId = req.user ? req.user._id : undefined;
    const isGuest = guestEmail ? true : false;

    if (numbers.length > 5) {
      return res.status(400).send("You can only select up to 5 numbers");
    }

    const raffle = await Raffle.findById(raffleId);
    if (!raffle) {
      return res.status(404).send("Raffle not found");
    }

    // If it's a guest ticket, send their email to the database
    const ticket = {
      owner: userId || undefined,
      numbers,
      isGuest,
      guestEmail: isGuest ? guestEmail : undefined,
    };

    raffle.tickets.push(ticket);
    await raffle.save();

    res
      .status(200)
      .json({ message: "Successfully entered the raffle", raffle });
  } catch (error) {
    res.status(500).send("An unexpected error occurred");
  }
};

// Draw a winner for a raffle, including logic for dealing with lucky numbers and prize distribution
const drawWinner = async (req: Request, res: Response) => {
  try {
    const { raffleId } = req.params;
    const totalPrize = 100; // Total prize for lucky number winners

    const raffle = await Raffle.findById(raffleId);
    if (!raffle) {
      return res.status(404).send("Raffle not found");
    }

    if (raffle.tickets.length === 0) {
      return res.status(400).send("No entries in this raffle");
    }

    // Draw the main prize winner by selecting a random ticket
    const mainPrizeWinnerIndex = Math.floor(
      Math.random() * raffle.tickets.length
    );
    const mainPrizeWinner = raffle.tickets[mainPrizeWinnerIndex];

    // Draw a lucky number between 1 and 40
    const luckyNumber = Math.floor(Math.random() * 40) + 1;

    // Find tickets that contain the lucky number
    const luckyNumberWinners = raffle.tickets.filter((ticket) =>
      ticket.numbers.includes(luckyNumber)
    );

    // Calculate prize share for lucky number winners
    let prizePerWinner = 0;
    if (luckyNumberWinners.length > 0) {
      prizePerWinner = totalPrize / luckyNumberWinners.length;
    }

    // Data to update in the raffle document
    const updateData = {
      $set: {
        "winner.ticketId": (mainPrizeWinner as any)._id,
        "winner.isGuest": mainPrizeWinner.isGuest,
        "winner.guestEmail": mainPrizeWinner.guestEmail || "",
        drawDate: new Date(),
      },
      $push: {
        luckyNumberWinners: {
          $each: luckyNumberWinners.map((winner) => ({
            ticketId: (winner as any)._id,
            prizeShare: prizePerWinner,
            isGuest: winner.isGuest,
            guestEmail: winner.guestEmail || "",
          })),
        },
      },
      luckyNumber: luckyNumber,
    };

    // Update the raffle document with the winner and lucky number winners information
    await Raffle.findByIdAndUpdate(raffleId, updateData, { new: true });

    // Removing guest tickets from the raffle once the draw is complete
    await removeGuestTickets(raffleId);

    // Respond with the draw results
    res.status(200).json({
      message: "Winner drawn successfully",
      drawDate: updateData.$set.drawDate,
      mainPrizeWinner: {
        ticketId: updateData.$set["winner.ticketId"],
        isGuest: updateData.$set["winner.isGuest"],
        guestEmail: updateData.$set["winner.guestEmail"],
      },
      luckyNumber: luckyNumber,
      luckyNumberWinners: updateData.$push.luckyNumberWinners.$each.map(
        (winner) => ({
          ticketId: winner.ticketId,
          prizeShare: winner.prizeShare,
          isGuest: winner.isGuest,
          guestEmail: winner.guestEmail,
        })
      ),
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).send(error.message);
    } else {
      res.status(500).send("An unexpected error occurred");
    }
  }
};

const deleteTicketsByUser = async (req: Request, res: Response) => {
  const { raffleId } = req.params;
  const { userId } = req.body;

  try {
    const raffle = await Raffle.findById(raffleId);
    if (!raffle) {
      return res.status(404).send("Raffle not found");
    }

    // Only filter out tickets owned by the specified user and not guest tickets
    raffle.tickets = raffle.tickets.filter((ticket) => {
      // If ticket is for a guest, keep it as is. Otherwise, check the owner.
      return (
        ticket.isGuest || (ticket.owner && ticket.owner.toString() !== userId)
      );
    });

    await raffle.save();
    res.status(200).json({ message: "Tickets deleted successfully" });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).send(error.message);
    } else {
      res.status(500).send("An unexpected error occurred");
    }
  }
};

// Remove guest tickets from a given raffle
const removeGuestTickets = async (raffleId: string): Promise<void> => {
  const raffle = await Raffle.findById(raffleId);
  if (!raffle) {
    throw new Error("Raffle not found");
  }

  // Filter out guest tickets
  const nonGuestTickets = raffle.tickets.filter((ticket) => !ticket.isGuest);
  raffle.tickets = nonGuestTickets;
  await raffle.save();
};

// Claim the prize for a raffle winner
export const claimPrize = async (req: Request, res: Response) => {
  const { raffleId } = req.params;
  const userId = req.user ? req.user._id : undefined; // Authenticated user's ID
  const guestEmail = req.body.guestEmail || undefined; // Guest email, if applicable

  try {
    const raffle = await Raffle.findById(raffleId);
    if (!raffle) {
      return res.status(404).send("Raffle not found");
    }

    // Ensure the raffle has a winner before proceeding
    if (!raffle.winner) {
      return res.status(400).send("This raffle has no winner yet.");
    }

    // Finding the winning ticket based on `raffle.winner.ticketId`
    const winningTicket = raffle.tickets.find((ticket) =>
      (ticket as any)._id.equals(raffle.winner?.ticketId)
    );

    // For registered users: Check if the owner of the winning ticket is the current user
    if (
      userId &&
      winningTicket &&
      winningTicket.owner.equals(userId) &&
      !raffle.winner.isGuest
    ) {
      if (raffle.hasBeenClaimed) {
        return res.status(400).send("Prize has already been claimed.");
      }

      raffle.hasBeenClaimed = true;
      await raffle.save();
      return res.status(200).json({ message: "Prize successfully claimed." });
    }
    // For guest users: Check if the winning ticket's guestEmail matches the provided guestEmail
    else if (
      guestEmail &&
      raffle.winner.guestEmail === guestEmail &&
      raffle.winner.isGuest
    ) {
      if (raffle.hasBeenClaimed) {
        return res.status(400).send("Prize has already been claimed.");
      }

      raffle.hasBeenClaimed = true;
      await raffle.save();
      return res.status(200).json({ message: "Prize successfully claimed." });
    } else {
      return res.status(403).send("You are not the winner of this raffle.");
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).send(error.message);
    } else {
      res.status(500).send("An unexpected error occurred");
    }
  }
};

export {
  createRaffle,
  listRaffles,
  enterRaffle,
  drawWinner,
  deleteTicketsByUser,
};

// -------------------------------------------- //
// Internal Functions (don't return a response) //
// -------------------------------------------- //

/**
 * Automatically draws winners for today's raffles, updates each with winner details, and calculates prize shares. Designed for daily scheduled execution.
 */
export const automatedDrawForEligibleRaffles = async () => {
  const now = new Date();

  // Query for eligible raffles with drawDate in the past and no winner yet
  const eligibleRaffles = await Raffle.find({
    drawDate: { $lte: now }, // Ensure drawDate has passed
    $or: [{ "winner.ticketId": null }, { winner: { $exists: false } }],
  });

  // Draw winners for each eligible raffle
  for (const raffle of eligibleRaffles) {
    // Skip raffles with no tickets
    if (raffle.tickets.length === 0) {
      continue;
    }

    // Draw the main prize winner by selecting a random ticket
    const mainPrizeWinnerIndex = Math.floor(
      Math.random() * raffle.tickets.length
    );
    const mainPrizeWinner = raffle.tickets[mainPrizeWinnerIndex];
    const luckyNumber = Math.floor(Math.random() * 40) + 1;
    const luckyNumberWinners = raffle.tickets.filter((ticket) =>
      ticket.numbers.includes(luckyNumber)
    );

    // Calculate prize share for lucky number winners
    let prizePerWinner = 0;
    const totalPrize = 100;
    if (luckyNumberWinners.length > 0) {
      prizePerWinner = totalPrize / luckyNumberWinners.length;
    }

    // Data to update in the raffle document
    const updateData = {
      $set: {
        "winner.ticketId": (mainPrizeWinner as any)._id,
        "winner.isGuest": mainPrizeWinner.isGuest,
        "winner.guestEmail": mainPrizeWinner.guestEmail || "",
        drawDate: new Date(),
      },
      // Push lucky number winners to the array
      $push: {
        luckyNumberWinners: luckyNumberWinners.map((winner) => ({
          ticketId: (winner as any)._id,
          prizeShare: prizePerWinner,
          isGuest: winner.isGuest,
          guestEmail: winner.guestEmail || "",
        })),
      },
      // Set the lucky number for the raffle
      luckyNumber: luckyNumber,
    };

    try {
      // Update the raffle document with the winner and lucky number winners information
      await Raffle.findByIdAndUpdate(raffle._id, updateData, { new: true });
    } catch (error) {
      console.error("Error drawing winner for raffle:", raffle._id, error);
    }
  }
};
