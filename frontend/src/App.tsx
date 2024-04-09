import "./App.css";

import { ThemeProvider } from "@mui/material";
import { BrowserRouter as Router } from "react-router-dom";

import theme from "./shared/theme/config";

import RoutesManager from "./routes/RoutesManager";

import Footer from "./shared/components/Footer";
import AuthProvider from "./context/AuthContext";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <RoutesManager />
        </Router>
        <Footer />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
