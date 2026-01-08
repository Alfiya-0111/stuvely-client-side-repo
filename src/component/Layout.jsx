import React from "react";
import Nav from "./Nav";
import Footer from "./Footer";

function Layout({ children, allProducts }) {
  return (
    <>
      {/* ✅ Pass allProducts to Nav so search works */}
      <Nav allProducts={allProducts} />
      
      <main className="content">{children}</main>
      
      <Footer />
    </>
  );
}

export default Layout;
