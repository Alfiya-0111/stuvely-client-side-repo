import React, { useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { auth } from "../firebaseConfig";

function RecommendedProducts({ allProducts }) {
  const [recommended, setRecommended] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    const db = getDatabase();

    const fetchHistory = () => {
      if (user) {
        // 🔹 Login user → Firebase se search history lo
        const searchRef = ref(db, `users/${user.uid}/searchHistory`);
        onValue(searchRef, (snapshot) => {
          const history = snapshot.val() || [];
          updateRecommended(history);
        });
      } else {
        // 🔹 Without login → LocalStorage se history lo
        const history = JSON.parse(localStorage.getItem("searchHistory")) || [];
        updateRecommended(history);
      }
    };

    const updateRecommended = (history) => {
      if (history.length > 0) {
        const lastSearch = history[history.length - 1].toLowerCase();
        const filtered = allProducts.filter(
          (p) =>
            p.name.toLowerCase().includes(lastSearch) ||
            p.category.toLowerCase().includes(lastSearch)
        );
        setRecommended(filtered);
      }
    };

    fetchHistory();
  }, [allProducts]);

  return (
    <div className="mt-10 px-6">
      <h3 className="text-2xl font-semibold mb-4">Recommended for You</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recommended.length > 0 ? (
          recommended.map((item, i) => (
            <div
              key={i}
              className="border p-3 rounded-lg shadow-sm hover:shadow-md transition-all"
            >
              <img
                src={item.image}
                alt={item.name}
                className="h-40 w-full object-cover rounded-md"
              />
              <p className="mt-2 font-medium">{item.name}</p>
              <p className="text-sm text-gray-500">{item.category}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Search products to get recommendations</p>
        )}
      </div>
    </div>
  );
}

export default RecommendedProducts;
