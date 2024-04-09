import axiosInstance from "@/lib/AxiosConfig";
import axios from "axios";

const registerUser = async (
  name: string,
  email: string,
  password: string,
  isRaffleHolder: boolean
) => {
  try {
    const response = await axiosInstance.post("/auth/register", {
      name,
      email,
      password,
      isRaffleHolder,
    });
    return response.data;
  } catch (error) {
    // Handle errors
    if (axios.isAxiosError(error)) {
      return Promise.reject(
        error.response?.data || "An error occurred during registration"
      );
    } else {
      // The error is unrelated to Axios
      return Promise.reject("An unexpected error occurred");
    }
  }
};

const loginUser = async (email: string, password: string) => {
  try {
    const response = await axiosInstance.post("/auth/login", {
      email,
      password,
    });
    return response.data; // "Logged in successfully"
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data || "An error occurred during login");
    } else {
      // Handle unexpected errors
      throw new Error("An unexpected error occurred");
    }
  }
};

const logoutUser = async () => {
  try {
    const response = await axiosInstance.get("/auth/logout");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data || "An error occurred during logout"
      );
    } else {
      throw new Error("An unexpected error occurred");
    }
  }
};

export { registerUser, loginUser, logoutUser };
