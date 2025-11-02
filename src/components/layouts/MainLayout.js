// src/components/layouts/MainLayout.js
import React from 'react';
import Navbar from '../Navbar';
import Footer from '../Footer';

const MainLayout = ({ children }) => {
  return (
    <div>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;
