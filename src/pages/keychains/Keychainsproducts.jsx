import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ref, onValue, set } from "firebase/database";
import { db, auth } from "../../firebaseConfig";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";

export default function Keychainsproducts() {
  const [keychains, setKeychains] = useState([]);
  const [wishlist, setWishlist] = useState({});

  // Fetch products
  useEffect(() => {
    fetch("https://stuvely-data-default-rtdb.firebaseio.com/keychains.json")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          const arr = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          setKeychains(arr);
        }
      });
  }, []);

  // Fetch wishlist
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const wishlistRef = ref(db, `wishlist/${user.uid}`);
    onValue(wishlistRef, (snapshot) => {
      setWishlist(snapshot.val() || {});
    });
  }, []);

  const toggleWishlist = (product) => {
    const user = auth.currentUser;
    if (!user) return alert("Please login first!");

    const productRef = ref(db, `wishlist/${user.uid}/${product.id}`);
    wishlist[product.id]
      ? set(productRef, null)
      : set(productRef, product);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* HEADING */}
      <h2 className="heading-zara text-hm-xl text-black mb-8">
        Top Deals
      </h2>

      {/* HORIZONTAL SCROLL */}
      <div className="flex gap-6 overflow-x-auto scrollbar-hide">
        {keychains.map((item) => {
          const isWishlisted = wishlist[item.id];

          return (
            <div
              key={item.id}
              className="
                flex-none
                w-48
                bg-white
                relative
                rounded-xl
                card-luxury
              "
            >
              {/* Wishlist */}
              <button
                onClick={() => toggleWishlist(item)}
                className=" absolute top-4 right-4 z-20
                   backdrop-blur
                  p-2 rounded-full
                  transition-transform
                  hover:scale-110"
              >
                {isWishlisted ? (
                  <AiFillHeart className="text-black text-lg" />
                ) : (
                  <AiOutlineHeart className="text-gray-500 text-lg" />
                )}
              </button>

              <Link to={`/keychains/${item.id}`}>
                {/* IMAGE */}
                <div className="h-44 flex items-center justify-center overflow-visible">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="max-h-full max-w-full"
                  />
                </div>

                {/* CONTENT */}
                <div className="pt-4 pb-5 px-3 text-center">
                  <p className="text-hm-sm tracking-wide font-normal text-black truncate">
                    {item.name}
                  </p>

                  <p className="text-sm text-gray-700 mt-1">
                    ₹{item.price}
                  </p>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
