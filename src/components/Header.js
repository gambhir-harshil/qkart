import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Avatar, Button, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import React from "react";
import { useHistory } from "react-router-dom";
import "./Header.css";

const Header = ({ children, hasHiddenAuthButtons }) => {
  let history = useHistory();

  let userName = localStorage.getItem("username");

  const logout = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <Box className="header">
      <Box className="header-title">
        <img src="logo_light.svg" alt="QKart-icon"></img>
      </Box>
      {children}
      {hasHiddenAuthButtons ? (
        <Button
          className="explore-button"
          startIcon={<ArrowBackIcon />}
          variant="text"
          onClick={(e) => {
            history.push("/");
          }}
        >
          Back to explore
        </Button>
      ) : userName ? (
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar alt={userName} src="/public/avatar.png" />
          <p>{userName}</p>
          <Button variant="contained" onClick={logout}>
            LOGOUT
          </Button>
        </Stack>
      ) : (
        <Stack direction="row" spacing={2}>
          <Button
            variant="plain"
            sx={{ color: "#00a278" }}
            onClick={(e) => {
              history.push("/login");
            }}
          >
            LOGIN
          </Button>
          <Button
            variant="contained"
            onClick={(e) => {
              history.push("/register");
            }}
          >
            REGISTER
          </Button>
        </Stack>
      )}
    </Box>
  );
};

export default Header;
