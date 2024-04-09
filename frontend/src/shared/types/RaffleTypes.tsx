export type TimeLeft = {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
};

export type RaffleTicket = {
  _id: string;
  owner: string;
  numbers: number[];
  isGuest: boolean;
  ownerName?: string;
};

export type RaffleCreatedBy = {
  _id: string;
  name: string;
  email: string;
};

export type Raffle = {
  _id: string;
  title: string;
  description: string;
  prizeDetails: string;
  drawDate: string;
  createdBy: RaffleCreatedBy;
  tickets: RaffleTicket[];
  imageUrl?: string;
  timeLeft: TimeLeft;
  winner?: {
    ticketId: string;
    isGuest: boolean;
    guestEmail?: string;
  } | null;
  luckyNumber?: number | null;
  luckyNumberWinners: Array<{
    ticketId: string;
    prizeShare: number;
    isGuest: boolean;
    guestEmail?: string;
  }>;
  hasBeenClaimed: boolean;
};

export type GuestTicket = {
  _id: string;
  raffleId: string;
  numbers: number[];
};
