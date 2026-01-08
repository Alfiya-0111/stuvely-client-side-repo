// src/pages/Wishlist.jsx
import React, { useEffect, useState } from "react";
import { db, auth } from "../../firebaseConfig";
import { ref, onValue, remove } from "firebase/database";
import { MdClose } from "react-icons/md";
import Layout from "../../component/Layout";

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const wishlistRef = ref(db, `wishlist/${user.uid}`);

    onValue(wishlistRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setWishlist(list);
      } else {
        setWishlist([]);
      }
      setLoading(false);
    });
  }, []);

  const removeFromWishlist = async (id) => {
    const user = auth.currentUser;
    if (!user) return;
    await remove(ref(db, `wishlist/${user.uid}/${id}`));
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-2xl md:text-3xl font-light tracking-wide mb-8">
          MY WISHLIST
        </h2>

        {loading ? (
          <div className="text-center py-20 text-gray-400">
            Loading wishlist...
          </div>
        ) : wishlist.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-400 text-lg tracking-wide">
              Your wishlist is empty
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="group relative bg-white overflow-hidden"
              >
                {/* Remove Button */}
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-3 right-3 z-10 bg-white/80 hover:bg-black hover:text-white transition rounded-full p-1"
                >
                  <MdClose size={18} />
                </button>

                {/* Image */}
                <div className="overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-auto h-[280px] object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Content */}
                <div className="pt-3">
                  <h3 className="text-sm font-light tracking-wide text-gray-800 truncate">
                    {item.title}
                  </h3>

                  <p className="text-sm font-medium text-gray-900 mt-1">
                    ₹ {item.price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
