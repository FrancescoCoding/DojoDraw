import axiosInstance from "@/lib/AxiosConfig";
import axios from "axios";

const createRaffle = async ({
  title,
  description,
  prizeDetails,
  drawDate,
  imageUrl,
}: {
  title: string;
  description: string;
  prizeDetails: string;
  drawDate: Date;
  imageUrl: string | undefined;
}) => {
  try {
    const response = await axiosInstance.post("/raffles/create", {
      title,
      description,
      prizeDetails,
      drawDate,
      imageUrl,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data || "An error occurred while creating the raffle"
      );
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

// Service to list all raffles
const listRaffles = async () => {
  try {
    const response = await axiosInstance.get("/raffles/");
    return response.data; // Array of raffles
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data || "An error occurred while fetching raffles"
      );
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

// Service to enter a raffle
const enterRaffle = async (
  raffleId: string,
  numbers: number[],
  guestEmail?: string
) => {
  try {
    const response = await axiosInstance.post("/raffles/enter", {
      raffleId,
      numbers,
      guestEmail,
    });
    return response.data; // Confirmation of entry
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data || "An error occurred while entering the raffle"
      );
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

// Service to draw a winner for a raffle
const drawWinner = async (raffleId: string) => {
  try {
    const response = await axiosInstance.post(
      `/raffles/${raffleId}/draw-winner`
    );
    return response.data; // Details of the draw result
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data || "An error occurred while drawing the winner"
      );
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

const deleteTicketsByUser = async (raffleId: string, userId: string) => {
  try {
    const response = await axiosInstance.delete(
      `/raffles/${raffleId}/delete-tickets`,
      {
        data: { userId },
      }
    );
    return response.data; // Confirmation of ticket deletion
  } catch (error) {
    throw new Error("An error occurred while deleting the tickets");
  }
};

// Service for a raffle winner to claim their prize
const claimPrize = async (
  raffleId: string,
  userId: string | undefined,
  guestEmail?: string
) => {
  try {
    const response = await axiosInstance.post(
      `/raffles/${raffleId}/claim-prize`,
      {
        userId,
        guestEmail,
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data || "An error occurred while claiming the prize"
      );
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

export {
  createRaffle,
  listRaffles,
  enterRaffle,
  drawWinner,
  deleteTicketsByUser,
  claimPrize,
};
