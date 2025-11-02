
import React from "react";
import {
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    Toolbar,
    Typography,
    IconButton,
    Avatar,
    Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    DollarSign,
    FileText,
    Calendar,
    GraduationCap,
    LogOut,
} from "lucide-react";

const navigation = [
    { name: "Dashboard", href: "/student-dashboard/home", icon: <LayoutDashboard size={20} /> },
    { name: "Teachers Profile", href: "/student-dashboard/teachers", icon: <Users size={20} /> },
    { name: "Payments", href: "/student-dashboard/mywallet", icon: <DollarSign size={20} /> },
    { name: "Lessons", href: "/student-dashboard/lessons", icon: <FileText size={20} /> },
    { name: "Video Feed", href: "/student-dashboard/videofeed", icon: <Calendar size={20} /> },
    { name: "My Account", href: "/student-dashboard/myaccount", icon: <GraduationCap size={20} /> },
];

const Sidebar = ({ mobileOpen, onClose, userInfo }) => {
    return (
        <>
            {/* Mobile Sidebar */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={onClose}
                sx={{
                    display: { xs: "block", md: "none" },
                    "& .MuiDrawer-paper": { width: 280, backgroundColor: "#87CEEB" },
                }}
            >
                <SidebarContent onClose={onClose} userInfo={userInfo} />
            </Drawer>

            {/* Desktop Sidebar */}
            <Drawer
                variant="permanent"
                open
                sx={{
                    display: { xs: "none", md: "block" },
                    "& .MuiDrawer-paper": { width: 280, position: "fixed", height: "100vh", backgroundColor: "#87CEEB" },
                }}
            >
                <SidebarContent userInfo={userInfo} />
            </Drawer>
        </>
    );
};

const SidebarContent = ({ onClose, userInfo }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("userInfo"); // Clear user data
        navigate("/login"); // Redirect to login page
    };

    return (
        <>
            {/* Header */}
            <Toolbar sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
                <Typography variant="h6" sx={{ color: "#4fd4e9ff" }}>Student Dashboard</Typography>
                {onClose && (
                    <IconButton onClick={onClose}>
                        <CloseIcon sx={{ color: "#1E3A8A" }} />
                    </IconButton>
                )}
            </Toolbar>
            <Divider />

            {/* User Info */}
            {userInfo && (
                <Box sx={{ textAlign: "center", py: 3 }}>
                    <Avatar
                        src={userInfo.profilePicture || "/default-avatar.png"}
                        sx={{ width: 70, height: 70, mx: "auto" }}
                    />
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", mt: 1 }}>
                        {userInfo.username || "Student Name"}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "gray" }}>
                        {userInfo.email || "student@example.com"}
                    </Typography>
                </Box>
            )}
            <Divider />

            {/* Navigation */}
            <List>
                {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                        <ListItemButton
                            key={item.name}
                            component={Link}
                            to={item.href}
                            onClick={onClose}
                            sx={{
                                backgroundColor: isActive ? "#1E3A8A" : "transparent",
                                color: isActive ? "white" : "#1E3A8A",
                                "&:hover": { backgroundColor: "#3B82F6", color: "white" },
                            }}
                        >
                            <ListItemIcon sx={{ color: isActive ? "white" : "#1E3A8A" }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.name} />
                        </ListItemButton>
                    );
                })}
            </List>

            <Divider />

            {/* Logout */}
            <List>
                <ListItemButton onClick={handleLogout} sx={{ color: "#EF4444", "&:hover": { backgroundColor: "#FEE2E2" } }}>
                    <ListItemIcon>
                        <LogOut color="#EF4444" size={20} />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                </ListItemButton>
            </List>
        </>
    );
};

export { navigation };
export default Sidebar;
