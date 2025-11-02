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
    UserPlus,
    BookOpen,
    Video,
    Wallet,
    User,
} from "lucide-react";

const navigation = [
    { name: "Home", href: "/teacher-dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "My Students", href: "/teacher-dashboard/students", icon: <Users size={20} /> },
    { name: "Lessons", href: "/teacher-dashboard/lessons", icon: <BookOpen size={20} /> },
    { name: "Live Classes", href: "/teacher-dashboard/liveclasses", icon: <Video size={20} /> },
    { name: "Schedule", href: "/teacher-dashboard/schedule", icon: <Calendar size={20} /> },
    { name: "Video Editor", href: "/teacher-dashboard/videoeditor", icon: <GraduationCap size={20} /> },
    { name: "My Wallet", href: "/teacher-dashboard/mywallet", icon: <Wallet size={20} /> },
    { name: "My Account", href: "/teacher-dashboard/myaccount", icon: <User size={20} /> },
];

const TeacherSidebar = ({ mobileOpen, onClose, userInfo }) => {
    return (
        <>
            {/* Mobile Sidebar */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={onClose}
                sx={{
                    display: { xs: "block", md: "none" },
                    "& .MuiDrawer-paper": {
                        width: 280,
                        backgroundColor: "#87CEEB",
                        borderRight: "1px solid #e5e7eb"
                    },
                }}
            >
                <SidebarContent onClose={onClose} />
            </Drawer>

            {/* Desktop Sidebar */}
            <Drawer
                variant="permanent"
                open
                sx={{
                    display: { xs: "none", md: "block" },
                    "& .MuiDrawer-paper": {
                        width: 280,
                        position: "fixed",
                        height: "100vh",
                        backgroundColor: "#87CEEB",
                        borderRight: "1px solid #e5e7eb"
                    },
                }}
            >
                <SidebarContent />
            </Drawer>
        </>
    );
};

const SidebarContent = ({ onClose }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("userInfo");
        navigate("/login");
    };

    return (
        <>
            {/* Header */}
            <Toolbar sx={{ 
                display: "flex", 
                justifyContent: "space-between", 
                p: 2,
                backgroundColor: "#015575",
                color: "white"
            }}>
                <Typography 
                    variant="h6" 
                    sx={{ 
                        fontFamily: "'Lilita One', cursive",
                        fontSize: "1.5rem",
                        letterSpacing: "0.5px"
                    }}
                >
                    Teachers Dashboard
                </Typography>
                {onClose && (
                    <IconButton onClick={onClose} sx={{ color: "white" }}>
                        <CloseIcon />
                    </IconButton>
                )}
            </Toolbar>
            <Divider />

            {/* Navigation */}
            <List sx={{ px: 2 }}>
                {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                        <ListItemButton
                            key={item.name}
                            component={Link}
                            to={item.href}
                            onClick={onClose}
                            sx={{
                                borderRadius: "8px",
                                mb: 1,
                                backgroundColor: isActive ? "#e6f2f8" : "transparent",
                                color: isActive ? "#015575" : "#1f2937",
                                "&:hover": { 
                                    backgroundColor: "#e6f2f8",
                                    color: "#015575"
                                },
                                transition: "all 0.2s ease-in-out"
                            }}
                        >
                            <ListItemIcon sx={{ 
                                color: isActive ? "#015575" : "#6b7280",
                                minWidth: "40px"
                            }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText 
                                primary={item.name} 
                                primaryTypographyProps={{
                                    fontFamily: "'Josefin Sans', sans-serif",
                                    fontWeight: 600,
                                    fontSize: "0.95rem"
                                }} 
                            />
                        </ListItemButton>
                    );
                })}
            </List>

            <Divider sx={{ my: 2 }} />

            {/* Logout */}
            <List sx={{ px: 2 }}>
                <ListItemButton 
                    onClick={handleLogout} 
                    sx={{ 
                        color: "#ef4444",
                        borderRadius: "8px",
                        "&:hover": { 
                            backgroundColor: "#fee2e2",
                        }
                    }}
                >
                    <ListItemIcon sx={{ color: "#ef4444", minWidth: "40px" }}>
                        <LogOut size={20} />
                    </ListItemIcon>
                    <ListItemText 
                        primary="Logout" 
                        primaryTypographyProps={{
                            fontFamily: "'Josefin Sans', sans-serif",
                            fontWeight: 600,
                            fontSize: "0.95rem"
                        }} 
                    />
                </ListItemButton>
            </List>
        </>
    );
};

export { navigation };
export default TeacherSidebar;