import { useState } from "react";
import {
  ImageList,
  ImageListItem,
  ImageListItemBar,
  IconButton,
  Box,
  Button,
  Chip,
} from "@mui/material";

import Modal from "@/shared/components/Modal";
import RaffleDetails from "@/views/public/RaffleDetails";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

import useAuth from "@/hooks/useAuth";

import { claimPrize } from "@/services/rafflesService";
import { Raffle, TimeLeft } from "../types/RaffleTypes";

type ModalState = {
  isOpen: boolean;
  itemDetails: Raffle | null;
};

function CustomImageList({
  raffles,
  fetchRaffles,
}: {
  raffles: Raffle[];
  fetchRaffles: () => void;
}) {
  const { user, isAuthenticated } = useAuth();

  const [currentModal, setCurrentModal] = useState<ModalState>({
    isOpen: false,
    itemDetails: null,
  });

  return (
    <ImageList
      sx={{
        transform: "translateZ(0)",
        margin: "0",
        height: "100%",
        overflowY: "auto",
      }}
      gap={0}>
      {raffles.map((raffle) => (
        <ImageListItem
          key={raffle._id}
          cols={1}
          sx={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}>
          {user && raffle.createdBy.email === user.email && (
            <Chip
              label="My Raffle"
              sx={{
                position: "absolute",
                zIndex: 2,
                top: 10,
                left: 10,
                backgroundColor: "primary.main",
                color: "white",
              }}
            />
          )}
          <Chip
            label={`${raffle.tickets.length} Participants`}
            sx={{
              position: "absolute",
              zIndex: 2,
              top: 10,
              right: 10,
              backgroundColor: "primary.main",
              color: "white",
            }}
          />
          <Chip
            label={`${raffle.tickets.filter((ticket) => ticket.isGuest).length} 
              Guest${
                raffle.tickets.filter((ticket) => ticket.isGuest).length > 1 ||
                raffle.tickets.filter((ticket) => ticket.isGuest).length === 0
                  ? "s"
                  : ""
              }`}
            sx={{
              position: "absolute",
              zIndex: 2,
              top: 45,
              right: 10,
              backgroundColor: "secondary.main",
              color: "white",
            }}
          />
          {raffle.winner !== null && raffle.luckyNumber !== null && (
            <Chip
              label="Raffle Ended"
              sx={{
                position: "absolute",
                zIndex: 2,
                top: 80,
                right: 10,
                backgroundColor: "error.main",
                color: "white",
              }}
            />
          )}
          {raffle.winner !== null && raffle.luckyNumber !== null && (
            <Box>
              <Chip
                label={`Winner: ${
                  raffle.winner?.isGuest
                    ? raffle.winner?.guestEmail + " (Guest)"
                    : raffle.tickets.find(
                        (ticket) => ticket._id === raffle.winner?.ticketId
                      )?.ownerName || "Unknown"
                }`}
                sx={{
                  position: "absolute",
                  zIndex: 2,
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  backgroundColor: "green",
                  color: "white",
                }}
              />
              {/* Only show the button if the user is the winner (Guest or User) */}
              {(user &&
                !raffle.winner?.isGuest &&
                raffle.tickets.find(
                  (ticket) => ticket._id === raffle.winner?.ticketId
                )?.ownerName === user.name) ||
              (raffle.winner?.isGuest &&
                raffle.winner.guestEmail &&
                !isAuthenticated) ? (
                <Button
                  variant="contained"
                  onClick={() => {
                    // If the user is a guest, pass the email to claim the prize
                    claimPrize(
                      raffle._id,
                      user?.id,
                      raffle.winner?.isGuest
                        ? raffle.winner.guestEmail
                        : undefined
                    )
                      .then(() => {
                        fetchRaffles();
                        alert("Prize claimed successfully!");
                      })
                      .catch((error) => alert(error.message));
                  }}
                  sx={{
                    position: "absolute",
                    zIndex: 2,
                    bottom: "11px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor: "gold",
                    color: "black",
                    fontWeight: "bold",
                    border: "1px solid transparent",
                    "&:hover": {
                      backgroundColor: "black",
                      color: "white",
                      border: "1px solid white",
                    },
                  }}>
                  <EmojiEventsIcon
                    sx={{
                      fontSize: "1.3rem",
                      mr: "0.3rem",
                    }}
                  />{" "}
                  {raffle.hasBeenClaimed ? "Prize Claimed" : "Claim Prize"}
                </Button>
              ) : null}
              <Box
                sx={{
                  position: "absolute",
                  zIndex: 1,
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                }}
              />
            </Box>
          )}
          <img
            src={raffle.imageUrl || "https://loremflickr.com/640/360"}
            alt={raffle.title}
            style={{ objectFit: "cover", height: "300px" }}
            loading="lazy"
          />
          <Box sx={{ position: "absolute", bottom: 0, width: "100%" }}>
            <ImageListItemBar
              title={raffle.title}
              subtitle={<span>Ends in: {formatTimeLeft(raffle.timeLeft)}</span>}
              actionIcon={
                <IconButton
                  sx={{ color: "white", paddingLeft: "10px" }}
                  aria-label={`info about ${raffle.title}`}>
                  <AccessTimeIcon />
                </IconButton>
              }
              actionPosition="left"
            />
            <Button
              variant="contained"
              onClick={() =>
                setCurrentModal({ isOpen: true, itemDetails: raffle })
              }
              sx={{ position: "absolute", bottom: 10, right: 10 }}>
              Buy Tickets
            </Button>
          </Box>

          {currentModal.isOpen && currentModal.itemDetails && (
            <Modal
              isOpen={currentModal.isOpen}
              onClose={() =>
                setCurrentModal({ isOpen: false, itemDetails: null })
              }
              title={currentModal.itemDetails.title}
              content={
                <RaffleDetails
                  raffle={currentModal.itemDetails}
                  onClose={() => {
                    fetchRaffles();
                    setCurrentModal({ isOpen: false, itemDetails: null });
                  }}
                />
              }
            />
          )}
        </ImageListItem>
      ))}
    </ImageList>
  );
}

// Utility function to format the time left as a string and return a skeleton while loading
function formatTimeLeft(timeLeft: TimeLeft) {
  if (!timeLeft) {
    return "Loading...";
  }
  if (
    timeLeft.days === 0 &&
    timeLeft.hours === 0 &&
    timeLeft.minutes === 0 &&
    timeLeft.seconds === 0
  ) {
    return `Raffle has ended!`;
  }
  return `${timeLeft.days || 0}d ${timeLeft.hours || 0}h ${timeLeft.minutes || 0}m ${timeLeft.seconds || 0}s`;
}

export default CustomImageList;
