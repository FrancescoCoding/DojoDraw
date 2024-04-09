import React, { useState } from "react";
import {
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Chip,
} from "@mui/material";
import useAuth from "@/hooks/useAuth";
import NumberSelector from "@/shared/components/NumberSelector"; // Ensure this path matches your project structure

import { enterRaffle } from "@/services/rafflesService";

import { Raffle } from "@/shared/types/RaffleTypes";
import { drawWinner } from "@/services/rafflesService";

type Ticket = {
  owner: string;
  ownerName?: string;
  numbers: number[];
  isGuest: boolean;
  guestEmail?: string;
};

interface RaffleDetailsProps {
  raffle: Raffle;
  onClose: () => void;
}

function RaffleDetails({ raffle, onClose }: RaffleDetailsProps) {
  const [contact, setContact] = useState("");
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [imageLoaded, setImageLoaded] = useState(false);

  const { isAuthenticated, user } = useAuth();

  const isMyRaffle = raffle.createdBy.email === user?.email;

  const handleContactChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setContact(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const data = {
      raffleId: raffle._id,
      numbers: selectedNumbers,
      guestEmail: !isAuthenticated ? contact : undefined,
    };

    try {
      const response = await enterRaffle(
        data.raffleId,
        data.numbers,
        data.guestEmail
      );
      console.log("Successfully entered the raffle");
      const submittedTicketId = response.raffle.tickets.find(
        (ticket: Ticket) =>
          ticket.guestEmail === data.guestEmail &&
          ticket.numbers.toString() === data.numbers.toString()
      )?._id;

      if (!isAuthenticated && data.guestEmail && submittedTicketId) {
        const entries = JSON.parse(
          localStorage.getItem("guestRaffleEntries") || "[]"
        );
        const entryIndex = entries.findIndex(
          (entry: { email: string; tickets: Ticket[] }) =>
            entry.email === data.guestEmail
        );

        if (entryIndex > -1) {
          // If the email exists, append raffleId and numbers
          entries[entryIndex].tickets.push({
            raffleId: data.raffleId,
            numbers: data.numbers,
            _id: submittedTicketId,
          });
        } else {
          // Create a new email and create an entry
          entries.push({
            email: data.guestEmail,
            tickets: [
              {
                raffleId: data.raffleId,
                numbers: data.numbers,
                _id: submittedTicketId,
              },
            ],
          });
        }

        localStorage.setItem("guestRaffleEntries", JSON.stringify(entries));
      }

      onClose();
    } catch (error) {
      console.error(error);
      // @todo Handle error
    }
  };

  const calculateTimeLeft = () => {
    const difference = +new Date(raffle.drawDate) - +new Date();
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  };

  const timeLeft = calculateTimeLeft();
  const isRaffleOver =
    timeLeft.days === 0 &&
    timeLeft.hours === 0 &&
    timeLeft.minutes === 0 &&
    timeLeft.seconds === 0;

  // Handle the selection of numbers
  const onNumberChange = (number: number) => {
    setSelectedNumbers((prevNumbers) => {
      if (prevNumbers.includes(number)) {
        return prevNumbers.filter((num) => num !== number);
      }
      if (prevNumbers.length < 5) {
        return [...prevNumbers, number];
      }
      return prevNumbers;
    });
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        m: 2,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        maxWidth: 600,
        margin: "1rem auto",
      }}>
      {!isRaffleOver && isMyRaffle && (
        <Button
          variant="contained"
          color="primary"
          onClick={() => drawWinner(raffle._id).then(() => onClose())}>
          Draw Winner
        </Button>
      )}
      {!imageLoaded && <CircularProgress />}
      <img
        src={raffle.imageUrl}
        style={{
          height: "200px",
          margin: "1rem auto",
          borderRadius: "4px",
          display: imageLoaded ? "block" : "none",
        }}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageLoaded(false)}
      />
      <Typography variant="body1">
        Participants: {raffle.tickets.length}
      </Typography>
      <Typography variant="body1">
        Draw Date: {new Date(raffle.drawDate).toLocaleString()}
      </Typography>

      {isRaffleOver ? (
        <>
          {raffle.tickets.length > 0 ? (
            <Chip
              label={`Lucky Number: ${raffle.luckyNumber || "N/A"}`}
              color="success"
            />
          ) : null}
          <Chip
            label={
              raffle.tickets.length > 0
                ? `Winner: ${
                    raffle.tickets.find(
                      (ticket) => ticket._id === raffle.winner?.ticketId
                    )?.ownerName || "No Entries"
                  }`
                : "No Entries"
            }
            color="primary"
          />

          <Typography variant="h6" color="error">
            This raffle has ended. Stay tuned for future raffles!
          </Typography>
        </>
      ) : (
        <>
          <Typography variant="body1">
            Time Left: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m{" "}
            {timeLeft.seconds}s
          </Typography>
          <NumberSelector
            selectedNumbers={selectedNumbers}
            onNumberChange={onNumberChange}
          />
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}>
            {isAuthenticated ? null : (
              <TextField
                label="Contact Information"
                variant="outlined"
                margin="dense"
                type="email"
                required
                autoComplete="email"
                value={contact}
                onChange={handleContactChange}
              />
            )}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isRaffleOver}>
              {isAuthenticated ? "Enter Raffle" : "Enter Raffle as a Guest"}
            </Button>
          </form>
        </>
      )}
      <Button onClick={onClose} color="error">
        Close
      </Button>
    </Paper>
  );
}

export default RaffleDetails;
