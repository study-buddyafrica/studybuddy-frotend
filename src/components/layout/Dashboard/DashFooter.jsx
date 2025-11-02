import React from "react";

const Footer = () => {
    return (
        <footer className="bg-gray-200 text-center py-4 mt-8">
            <p className="text-sm text-gray-600">&copy; {new Date().getFullYear()} StudyBuddy. All rights reserved.</p>
        </footer>
    );
};
export default Footer;