// src/pages/DynamicPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebaseConfig";
import { ref, onValue } from "firebase/database";

export default function DynamicPage() {
  const { slug } = useParams();
  const [pageData, setPageData] = useState({ title: "", content: "" });

  useEffect(() => {
    if (!slug) return;
    const pageRef = ref(db, `pages/${slug}`);
    const unsubscribe = onValue(pageRef, (snapshot) => {
      if (snapshot.exists()) {
        setPageData(snapshot.val());
      } else {
        setPageData({
          title: "Page Not Found",
          content: "Sorry, this page does not exist.",
        });
      }
    });
    return () => unsubscribe();
  }, [slug]);

  return (
    <div className="max-w-5xl mx-auto p-6 mt-10 bg-white rounded-lg shadow">
      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-4">{pageData.title}</h1>

      {/* Page Content */}
      <div
        className="prose max-w-full"
        dangerouslySetInnerHTML={{ __html: pageData.content || "" }}
      />
    </div>
  );
}
