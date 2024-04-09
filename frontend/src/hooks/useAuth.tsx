import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

// Custom hook to use the auth context
export default function useAuth() {
  return useContext(AuthContext);
}
