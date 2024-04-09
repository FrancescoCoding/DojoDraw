import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  Chip,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { GuestTicket, Raffle } from "../types/RaffleTypes";

type GuestEntriesProps = {
  enteredRaffles: Raffle[];
  guestEntries: { tickets: GuestTicket[] }[];
};

const GuestEntries = ({ enteredRaffles, guestEntries }: GuestEntriesProps) => {
  return (
    <Box>
      <Typography variant="h6" my={2}>
        Your Entries (Guest)
      </Typography>
      {enteredRaffles.map((raffle) => {
        const guestRaffleTickets =
          guestEntries
            .find((entry: { tickets: { raffleId: string }[] }) =>
              entry.tickets.some((ticket) => ticket.raffleId === raffle._id)
            )
            ?.tickets.filter(
              (ticket: GuestTicket) => ticket.raffleId === raffle._id
            ) || [];

        // Check for winning ticket(s) based on the lucky number
        const hasWinningTicket = guestRaffleTickets.some(
          (ticket: GuestTicket) =>
            raffle.luckyNumberWinners.some(
              (winner) => winner.ticketId === ticket._id
            )
        );

        const raffleHasWinner = raffle.winner?.ticketId !== null;

        return (
          <Accordion key={raffle._id}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}>
                <Typography>{raffle.title}</Typography>
                <Chip
                  label={`${guestRaffleTickets.length} Ticket${guestRaffleTickets.length > 1 ? "s" : ""}`}
                  size="medium"
                  sx={{
                    backgroundColor: "primary.main",
                    color: "white",
                  }}
                />

                {raffleHasWinner && (
                  <Chip
                    label={`Raffle Winner: ${
                      raffle.winner?.isGuest
                        ? `${raffle.winner?.guestEmail} (Guest)`
                        : raffle.tickets.find(
                            (ticket) => ticket._id === raffle.winner?.ticketId
                          )?.ownerName || "Unknown"
                    }`}
                    size="medium"
                    sx={{
                      backgroundColor: raffle.winner?.isGuest
                        ? "success.main"
                        : "secondary.main",
                      color: "white",
                    }}
                  />
                )}
                {/* Show whether the guest has won or lost the raffle */}
                {!raffle.winner?.isGuest &&
                  raffle.winner?.isGuest !== null &&
                  raffleHasWinner && (
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
            </AccordionSummary>
            <Divider />
            <AccordionDetails sx={{ p: 0 }}>
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
                        color: "white",
                        mb: 1,
                      }}
                    />
                  </Typography>
                )}

                <Typography
                  sx={{
                    mx: 2,
                    fontFamily: "monospace",
                    color: "text.secondary",
                  }}>
                  My Lucky Numbers:
                </Typography>

                {guestRaffleTickets.map(
                  (ticket: GuestTicket, index: number) => {
                    // Find this ticket's winning information if it exists in the luckyNumberWinners array
                    const winnerInfo = raffle.luckyNumberWinners.find(
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
                          {ticket.numbers.map((number, numberIndex) => {
                            const isLuckyNumber = number === raffle.luckyNumber;
                            return (
                              <Chip
                                key={numberIndex}
                                label={number}
                                size="small"
                                sx={{
                                  backgroundColor: isLuckyNumber
                                    ? "success.main"
                                    : "primary.main",
                                  color: "white",
                                  marginRight: 0.5,
                                }}
                              />
                            );
                          })}
                        </Box>
                        {winnerInfo && raffle.luckyNumber && (
                          <Chip
                            label={`Won: £${winnerInfo.prizeShare.toFixed(2)}!`}
                            size="small"
                            sx={{
                              height: "24px",
                              backgroundColor: "gold",
                              color: "black",
                              fontWeight: "bold",
                            }}
                          />
                        )}
                        {raffle.luckyNumber !== null && !winnerInfo ? (
                          <Chip
                            label="Unlucky"
                            color="error"
                            size="small"
                            sx={{ height: "24px" }}
                          />
                        ) : null}
                      </ListItem>
                    );
                  }
                )}
              </List>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};

export default GuestEntries;
