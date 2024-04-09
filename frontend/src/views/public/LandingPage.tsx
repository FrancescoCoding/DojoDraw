import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Chip,
  Divider,
  Grid,
  Tooltip,
  IconButton,
  Typography,
  Button,
  CardActions,
  CardContent,
  List,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ListItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import Modal from "@/shared/components/Modal";
import CustomImageList from "@/shared/components/CustomImageList";
import CreateRaffle from "../private/CreateRaffle";

import { listRaffles, deleteTicketsByUser } from "@/services/rafflesService";
import { Raffle, TimeLeft } from "@/shared/types/RaffleTypes";

import BonsaiLogo from "@/assets/miyagi-do-karate-logo.png";

import useAuth from "@/hooks/useAuth";
import GuestEntries from "@/shared/components/GuestEntries";

const LandingPage = () => {
  const navigate = useNavigate();

  const [isCreateRaffleModalOpen, setIsCreateRaffleModalOpen] = useState(false);
  const [raffles, setRaffles] = useState<Raffle[]>([]);

  const { isAuthenticated, user } = useAuth();

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleCloseModal = () => {
    setIsCreateRaffleModalOpen(false);
  };

  // Fetch raffles from the backend
  const fetchRaffles = async () => {
    try {
      const fetchedRaffles = await listRaffles();
      setRaffles(fetchedRaffles);
    } catch (error) {
      console.error("Failed to fetch raffles:", error);
    }
  };

  // Fetch raffles on component mount
  useEffect(() => {
    fetchRaffles();
  }, []);

  // Delete tickets by Rafle ID and User ID
  const handleDeleteTickets = async (raffleId: string) => {
    if (!user) {
      console.error("User is not authenticated");
      return;
    }

    try {
      await deleteTicketsByUser(raffleId, user.id);
      console.log("Tickets deleted successfully");
      await fetchRaffles(); // Refresh the list of raffles to reflect the deletion
    } catch (error) {
      console.error("Failed to delete tickets", error);
    }
  };

  // The countdown display logic
  useEffect(() => {
    const timer = setInterval(() => {
      setRaffles((currentRaffles) =>
        currentRaffles.map((raffle) => ({
          ...raffle,
          timeLeft: calculateTimeLeft(raffle.drawDate),
        }))
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Retrieve guest entries from local storage
  const guestEntries = JSON.parse(
    localStorage.getItem("guestRaffleEntries") || "[]"
  );

  // Filter the raffles based on guest entries in local storage to find which raffles they have entered
  const enteredRaffles = raffles.filter((raffle) =>
    guestEntries.some((entry: { tickets: { raffleId: string }[] }) =>
      entry.tickets.some((ticket) => ticket.raffleId === raffle._id)
    )
  );

  // Alert the user if they have won a prize
  const [hasAlerted, setHasAlerted] = useState(false);

  useEffect(() => {
    if (hasAlerted) return; // If the have already been alerted, do not alert again until the page is refreshed

    // Filter raffles with winners that have not been claimed
    const rafflesWithWinners = raffles.filter(
      (raffle) =>
        raffle.winner !== null &&
        raffle.luckyNumber !== null &&
        !raffle.hasBeenClaimed
    );

    // If the user has won a prize in those raffles, alert them
    rafflesWithWinners.forEach((raffle) => {
      const winningTicket = raffle.tickets.find(
        (ticket) => ticket._id === raffle.winner?.ticketId
      );

      if (
        !raffle.winner?.isGuest &&
        winningTicket?.owner === user?.id &&
        !raffle.hasBeenClaimed
      ) {
        alert("You have won a prize! Claim it now.");
        setHasAlerted(true);
      }
    });
  }, [raffles, user, hasAlerted]);

  return (
    <Grid container spacing={0}>
      <Grid item md={5}>
        <CardContent
          sx={{
            backgroundColor: "#f5f5f5",
            color: "primary.main",
            padding: "16px 24px",
            overflowY: "auto",
          }}>
          {/* Unauthenticated View */}
          {!isAuthenticated ? (
            <>
              <Typography
                gutterBottom
                variant="h5"
                component="div"
                sx={{
                  textAlign: "center",
                }}>
                Welcome to DojoDraw!
              </Typography>
              <img
                src={BonsaiLogo}
                alt="Miyagi-Do Karate Logo"
                style={{
                  width: "30%",
                  margin: "1.5rem auto",
                  display: "block",
                }}
              />
              <Typography variant="body1" color="text.secondary" sx={{ my: 2 }}>
                DojoDraw is a platform for martial arts enthusiasts to
                participate in raffles for various martial arts contests and
                more! Enter a raffle, buy tickets, and win a chance to win a
                cool item!
              </Typography>
              <Typography variant="h6" color="text.primary" sx={{ my: 2 }}>
                How to Participate
              </Typography>
              <Typography variant="body2" color="text.secondary" align="left">
                1. Select a martial arts contest and enter the associated
                raffle.
                <br />
                2. <strong>Purchase your tickets - no account needed</strong>,
                just provide your contact details.
                <br />
                3. Select your <strong>lucky numbers</strong> for a chance to
                win a cash prize on top of the raffle item.
                <br />
                4. Keep an eye on the draw date and may your fighter's luck be
                with you!
              </Typography>
              <Typography variant="h6" color="text.primary" sx={{ mt: 2 }}>
                Benefits of Registering
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Register to save your preferences, hold your own raffles, and
                keep track of all your tickets in one place!
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Already registered? Log in to access your dashboard and see
                upcoming draws.
              </Typography>
              <CardActions
                sx={{
                  paddingTop: "16px",
                  paddingLeft: "0",
                }}>
                <Button
                  color="primary"
                  variant="contained"
                  sx={{
                    " &:hover": {
                      color: "#fff",
                      backgroundColor: "tertiary.main",
                    },
                  }}
                  onClick={() => handleNavigate("/register")}>
                  Register
                </Button>
                <Button
                  color="primary"
                  variant="outlined"
                  onClick={() => handleNavigate("/login")}
                  sx={{
                    "&:hover": {
                      color: "#fff",
                      backgroundColor: "tertiary.main",
                    },
                  }}>
                  Login
                </Button>
              </CardActions>
              {/* Guest Entries */}
              {!isAuthenticated && enteredRaffles.length > 0 && (
                <GuestEntries
                  enteredRaffles={enteredRaffles}
                  guestEntries={guestEntries}
                />
              )}
            </>
          ) : (
            <>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                <Typography gutterBottom variant="h5" component="div" sx={{}}>
                  Welcome {user?.name.split(" ")[0]}!
                </Typography>

                <Chip
                  variant="outlined"
                  color="primary"
                  label={
                    user?.isRaffleHolder
                      ? "Raffle Holder Account"
                      : "Normal Account"
                  }
                  sx={{ mt: 1 }}
                />
              </Box>
              {user?.isRaffleHolder && (
                <>
                  <Typography variant="h6" color="text.primary" sx={{ mt: 2 }}>
                    My Raffles
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}>
                    Want to hold your own raffle? Click below to get started!
                  </Typography>

                  <CardActions
                    sx={{
                      paddingTop: "16px",
                      paddingLeft: "0",
                    }}>
                    <Button
                      color="primary"
                      variant="contained"
                      sx={{
                        " &:hover": {
                          color: "#fff",
                          backgroundColor: "tertiary.main",
                        },
                      }}
                      onClick={() => setIsCreateRaffleModalOpen(true)}>
                      Create Raffle
                    </Button>
                  </CardActions>
                </>
              )}
              <Box sx={{ my: 2 }}>
                <Typography variant="h6" color="text.primary" sx={{ my: 2 }}>
                  Entered Raffles
                </Typography>
                {raffles.filter((raffle) =>
                  raffle.tickets.some((ticket) => ticket.owner === user?.id)
                ).length > 0 ? (
                  raffles
                    .filter((raffle) =>
                      raffle.tickets.some((ticket) => ticket.owner === user?.id)
                    )
                    .map((raffle) => {
                      const userRaffleTickets = raffle.tickets.filter(
                        (ticket) => ticket.owner === user?.id
                      );

                      // Check for winning ticket(s) based on the lucky number
                      const hasWinningTicket = userRaffleTickets.some(
                        (ticket) =>
                          raffle.luckyNumberWinners.some(
                            (winner) => winner.ticketId === ticket._id
                          )
                      );

                      return (
                        <Accordion key={raffle._id}>
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-label="Expand"
                            aria-controls="additional-actions1-content"
                            id="additional-actions1-header">
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                flexWrap: "wrap",
                                gap: 1,
                              }}>
                              <Typography>{raffle.title}</Typography>
                              <Chip
                                label={`${userRaffleTickets.length} Ticket${userRaffleTickets.length > 1 ? "s" : ""}`}
                                size="medium"
                                sx={{
                                  backgroundColor: "primary.main",
                                  color: "white",
                                }}
                              />

                              {raffle.winner?.ticketId !== null && (
                                <Chip
                                  label={
                                    raffle.tickets.find(
                                      (ticket) =>
                                        ticket._id === raffle.winner?.ticketId
                                    )?.ownerName === user?.name
                                      ? "You won the raffle!"
                                      : `Raffle Winner: ${
                                          raffle.winner?.isGuest
                                            ? `${raffle.winner?.guestEmail} (Guest)`
                                            : raffle.tickets.find(
                                                (ticket) =>
                                                  ticket._id ===
                                                  raffle.winner?.ticketId
                                              )?.ownerName || "Unknown"
                                        }`
                                  }
                                  size="medium"
                                  sx={{
                                    backgroundColor: `${
                                      raffle.tickets.find(
                                        (ticket) =>
                                          ticket._id === raffle.winner?.ticketId
                                      )?.ownerName === user?.name
                                        ? "success.main"
                                        : "secondary.main"
                                    }`,
                                    color: "white",
                                  }}
                                />
                              )}
                              {raffle.winner?.ticketId !== null &&
                                raffle.tickets.find(
                                  (ticket) =>
                                    ticket._id === raffle.winner?.ticketId
                                )?.ownerName !== user?.name && (
                                  <Chip
                                    label="You lost 😟"
                                    size="medium"
                                    sx={{
                                      backgroundColor: "error.dark",
                                      color: "white",
                                    }}
                                  />
                                )}

                              {hasWinningTicket && (
                                <Chip
                                  label="Lucky number winner!"
                                  size="medium"
                                  sx={{
                                    fontWeight: "bold",
                                    backgroundColor: "gold",
                                    color: "black",
                                  }}
                                />
                              )}
                            </Box>
                            <Tooltip
                              title="Exit raffle and delete tickets"
                              arrow
                              placement="top"
                              componentsProps={{
                                tooltip: {
                                  sx: {
                                    backgroundColor: "error.main",
                                    "& .MuiTooltip-arrow": {
                                      color: "error.main",
                                    },
                                  },
                                },
                              }}>
                              <IconButton
                                onClick={(event) => {
                                  event.stopPropagation(); // Prevent accordion toggle
                                  handleDeleteTickets(raffle._id);
                                }}
                                edge="end"
                                color="error"
                                sx={{
                                  ml: "auto",
                                  mr: 0.5,
                                }}>
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </AccordionSummary>
                          <Divider />
                          <AccordionDetails>
                            <List sx={{ width: "100%" }}>
                              {raffle.luckyNumber != null && (
                                <Typography
                                  sx={{
                                    mx: 2,
                                    fontFamily: "monospace",
                                    color: "text.secondary",
                                  }}>
                                  <Chip
                                    label={`Extracted Lucky Number: ${raffle.luckyNumber}`}
                                    size="medium"
                                    color="success"
                                    sx={{
                                      alignContent: "right",
                                      width: "100%",
                                      mb: 1,
                                      fontWeight: "bold",
                                    }}
                                  />
                                </Typography>
                              )}

                              {userRaffleTickets.map((ticket, index) => {
                                const winnerInfo =
                                  raffle.luckyNumberWinners.find(
                                    (winner) => winner.ticketId === ticket._id
                                  );

                                return (
                                  <ListItem
                                    key={index}
                                    sx={{
                                      py: 1,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                    }}>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                      }}>
                                      <Typography
                                        sx={{
                                          fontFamily: "monospace",
                                          marginRight: 1,
                                        }}>
                                        Ticket {index + 1}:
                                      </Typography>
                                      {ticket.numbers.map(
                                        (number, numberIndex) => {
                                          const isLuckyNumber =
                                            number === raffle.luckyNumber;
                                          return (
                                            <Chip
                                              key={numberIndex}
                                              label={number}
                                              size="small"
                                              sx={{
                                                backgroundColor: isLuckyNumber
                                                  ? "gold"
                                                  : "primary.main",
                                                color: isLuckyNumber
                                                  ? "black"
                                                  : "white",
                                                marginRight: 0.5,
                                                fontWeight: "bold",
                                              }}
                                            />
                                          );
                                        }
                                      )}
                                    </Box>
                                    {winnerInfo && raffle.luckyNumber && (
                                      <Chip
                                        label={`Won: £${winnerInfo.prizeShare.toFixed(2)}!`}
                                        size="medium"
                                        sx={{
                                          height: "24px",
                                          backgroundColor: "gold",
                                          color: "black",
                                          fontWeight: "bold",
                                        }}
                                      />
                                    )}
                                    {raffle.luckyNumber !== null &&
                                      !winnerInfo && (
                                        <Chip
                                          label="Unlucky"
                                          color="error"
                                          size="small"
                                          sx={{ mt: 1 }}
                                        />
                                      )}
                                  </ListItem>
                                );
                              })}
                            </List>
                          </AccordionDetails>
                        </Accordion>
                      );
                    })
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    You have not entered any raffles.
                  </Typography>
                )}
              </Box>
            </>
          )}
        </CardContent>
      </Grid>

      <Grid item xs={12} md={7} style={{ overflow: "auto" }}>
        <CustomImageList raffles={raffles} fetchRaffles={fetchRaffles} />
      </Grid>

      <Modal
        isOpen={isCreateRaffleModalOpen}
        onClose={() => setIsCreateRaffleModalOpen(false)}
        title="Create New Raffle"
        content={
          <CreateRaffle
            onClose={() => {
              handleCloseModal();
              fetchRaffles();
            }}
          />
        }
      />
    </Grid>
  );
};

export default LandingPage;

// Adjusted calculateTimeLeft to return default values
const calculateTimeLeft = (drawDate: string): TimeLeft => {
  const difference = +new Date(drawDate) - +new Date();
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
