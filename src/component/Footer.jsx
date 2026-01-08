// src/component/Footer.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebaseConfig";
import { ref, onValue } from "firebase/database";

export default function Footer() {
  const [footerData, setFooterData] = useState({
    columns: {},
    social: {},
    mailUs: "",
    address: "",
  });

  useEffect(() => {
    const footerRef = ref(db, "footer");
    const unsubscribe = onValue(footerRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setFooterData({
          columns: data.columns || {},
          social: data.social || {},
          mailUs: data.mailUs || "",
          address: data.address || "",
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const columns = footerData.columns || {};

  return (
    <footer className="bg-[#f6f6f6] text-gray-800 border-t border-gray-200">
      {/* Top Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">

        {/* Dynamic Columns */}
        {Object.entries(columns).map(([colName, colData]) => (
          <div key={colName}>
            <h3 className="text-xs font-semibold tracking-widest uppercase mb-5">
              {colName}
            </h3>

            <ul className="space-y-3">
              {colData.links &&
                Object.entries(colData.links).map(([linkName, slug]) => (
                  <li key={slug}>
                    <Link
                      to={`/page/${slug}`}
                      className="text-sm text-gray-600 hover:text-black transition border-b border-transparent hover:border-black pb-[2px]"
                    >
                      {linkName}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        ))}

        {/* Mail & Address */}
        <div>
          <h3 className="text-xs font-semibold tracking-widest uppercase mb-5">
            Contact
          </h3>

          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            {footerData.mailUs || "-"}
          </p>

          <p className="text-sm text-gray-600 leading-relaxed">
            {footerData.address || "-"}
          </p>
        </div>
      </div>

      {/* Social Links */}
      {footerData.social && Object.keys(footerData.social).length > 0 && (
        <div className="max-w-7xl mx-auto px-6 pb-8 flex flex-wrap gap-6">
          {Object.entries(footerData.social).map(([name, url]) => (
            <a
              key={name}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs uppercase tracking-widest text-gray-500 hover:text-black transition"
            >
              {name}
            </a>
          ))}
        </div>
      )}

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 py-6 text-center">
        <p className="text-xs tracking-widest text-gray-500 uppercase">
          © 2025 Stuvely — All Rights Reserved
        </p>
      </div>
    </footer>
  );
}
