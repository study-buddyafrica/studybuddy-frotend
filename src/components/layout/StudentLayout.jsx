

import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";

import Header from "./Dashboard/DashHeader";
import Footer from "./Dashboard/DashFooter";
import Sidebar from "./Dashboard/Sidebar";

const StudentLayout = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        const storedUserInfo = JSON.parse(localStorage.getItem("userInfo"));
        setUserInfo(storedUserInfo || {});
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar - Always visible on desktop, toggle on mobile */}
            <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} userInfo={userInfo} />

            {/* Main Section (Header + Content) */}
            <div className="flex flex-col flex-1">
                {/* Header - Always visible */}
                <Header onMenuClick={() => setMobileOpen(true)} user={userInfo} />

                {/* Main Content */}
                <div className="pt-16 md:pl-64 flex-1">
                    <main className="py-6 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <Outlet context={{ userInfo }} />
                    </main>
                </div>

                {/* Footer */}
                <Footer />
            </div>
        </div>
    );
};

export default StudentLayout;
