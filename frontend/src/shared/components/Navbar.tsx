import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useNavigate } from "react-router-dom";

import useAuth from "@/hooks/useAuth";

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const { isAuthenticated, user, logout } = useAuth();

  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          onClick={handleMenu}>
          <MenuIcon />
        </IconButton>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          keepMounted
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          open={open}
          onClose={handleClose}>
          <MenuItem onClick={handleClose} component={Link} to="/">
            Home
          </MenuItem>
          <MenuItem onClick={handleClose} component={Link} to="/login">
            Login
          </MenuItem>
          <MenuItem onClick={handleClose} component={Link} to="/register">
            Register
          </MenuItem>
        </Menu>
        {/* logo */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link
            to="/"
            style={{
              textDecoration: "none",
              color: "inherit",
            }}>
            DojoDraw
          </Link>
        </Typography>
        <Box sx={{ flexGrow: 0 }}>
          {!isAuthenticated ? (
            <Button
              color="primary"
              variant="outlined"
              onClick={() => handleNavigate("/login")}
              sx={{
                color: "#fff !important",
                bgcolor: "tertiary.main",
                "&:hover": {
                  color: "#fff !important",
                },
              }}>
              Login
            </Button>
          ) : (
            <>
              <Button
                color="inherit"
                sx={{
                  marginRight: "10px",
                }}
                onClick={() => handleNavigate("/user")}>
                {user?.name}
              </Button>

              <Button
                color="inherit"
                onClick={handleLogout}
                sx={{
                  color: "#fff !important",
                  bgcolor: "tertiary.main",
                  "&:hover": {
                    color: "#fff !important",
                  },
                }}>
                Logout
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
