
import React, { useState } from "react";
import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Breadcrumbs, Paper, Avatar, InputBase } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import HomeIcon from "@mui/icons-material/Home";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { navigation } from "./Sidebar";

const Header = ({ onMenuClick, user }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const pageTitle = navigation.find((item) => item.href === location.pathname)?.name || "Dashboard";

    const [anchorEl, setAnchorEl] = useState(null);
    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);
    
    const handleLogout = () => {
        setAnchorEl(null);
        // Implement logout logic here
        console.log("User logged out");
        navigate("/login");
    };

    return (
        <AppBar
            position="static"
            sx={{
                px: 3,
                py: 1.5,
                boxShadow: "none",
                borderBottom: "1px solid #ddd",
                width: { xs: "100%", md: "calc(100% - 250px)" },
                marginLeft: { md: "250px" },
                borderRadius: "0 0 12px 12px",
                background: "linear-gradient(135deg, #1E3A8A 30%, #3B82F6 100%)",
                color: "white",
            }}
        >
            <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {/* Left: Mobile Menu Button & Breadcrumbs */}
                <div className="flex items-center">
                    <IconButton onClick={onMenuClick} sx={{ display: { xs: "block", md: "none" }, color: "white", mr: 2 }}>
                        <MenuIcon />
                    </IconButton>
                    <Breadcrumbs aria-label="breadcrumb" sx={{ color: "white" }}>
                        <Link to="/">
                            <HomeIcon fontSize="small" sx={{ color: "white" }} />
                        </Link>
                        <Typography sx={{ color: "white" }}>{pageTitle}</Typography>
                    </Breadcrumbs>
                </div>

                {/* Center: Search Bar */}
                <Paper
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        px: 2,
                        py: 0.5,
                        borderRadius: 20,
                        boxShadow: "none",
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        width: { xs: "auto", md: "300px" },
                        backdropFilter: "blur(10px)",
                    }}
                >
                    <SearchIcon sx={{ color: "white" }} />
                    <InputBase
                        placeholder="Search..."
                        sx={{
                            border: "none",
                            outline: "none",
                            background: "none",
                            marginLeft: 1,
                            flex: 1,
                            color: "white",
                            '::placeholder': { color: "rgba(255, 255, 255, 0.7)" }
                        }}
                    />
                </Paper>

                {/* Right: Profile Icon */}
                <IconButton onClick={handleMenuOpen} sx={{ display: "flex", alignItems: "center", color: "white" }}>
                    <Avatar src={user?.avatar} sx={{ width: 32, height: 32, mr: 1 }} />
                    <Typography>{user?.username || "User"}</Typography>
                    <ArrowDropDownIcon />
                </IconButton>

                {/* Profile Menu */}
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                    <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
                    <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
