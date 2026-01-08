import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../component/Layout";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, set, onValue } from "firebase/database";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

const FIREBASE_DB_URL =
  "https://stuvely-data-default-rtdb.firebaseio.com/bestdeals.json";

export default function CategoryProducts() {
  const { offerId } = useParams();
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getDatabase();

  const [products, setProducts] = useState([]);
  const [offerTitle, setOfferTitle] = useState("");
  const [wishlist, setWishlist] = useState({});
  const [productReviews, setProductReviews] = useState({});

  /* ---------------- WISHLIST ---------------- */
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const wRef = ref(db, `wishlist/${user.uid}`);
    onValue(wRef, (snap) => {
      setWishlist(snap.val() || {});
    });
  }, [auth, db]);

  /* ---------------- PRODUCTS ---------------- */
  useEffect(() => {
    const fetchProducts = async () => {
      const res = await fetch(FIREBASE_DB_URL);
      const data = await res.json();
      if (!data || !data[offerId]) return;

      setOfferTitle(data[offerId].title || "");

      const formatted = Object.entries(
        data[offerId].products || {}
      ).map(([id, val]) => {
        const price = Number(val.price || 0);
        const offer = Number(val.offer || 0);
        const finalPrice = offer
          ? Math.round(price - (price * offer) / 100)
          : price;

        return {
          id,
          ...val,
          finalPrice,
          image:
            val.imageUrl ||
            val.image ||
            "https://via.placeholder.com/600x800?text=No+Image",
        };
      });

      setProducts(formatted);

      /* -------- REVIEWS -------- */
      formatted.forEach((p) => {
        const rRef = ref(db, `reviews/${p.id}`);
        onValue(rRef, (snap) => {
          const rev = snap.val() || {};
          const ratings = Object.values(rev).map((r) =>
            Number(r.rating || 0)
          );

          const avg =
            ratings.length > 0
              ? ratings.reduce((a, b) => a + b, 0) / ratings.length
              : 0;

          setProductReviews((prev) => ({
            ...prev,
            [p.id]: { avg, total: ratings.length },
          }));
        });
      });
    };

    fetchProducts();
  }, [offerId, db]);

  /* ---------------- WISHLIST ADD ONLY ---------------- */
  const toggleWishlist = async (p) => {
    const user = auth.currentUser;
    if (!user) {
      toast.error("Please login first");
      return;
    }

    // already added → sirf alert
    if (wishlist[p.id]) {
      toast("Already in wishlist 🤍", { icon: "⚠️" });
      return;
    }

    const wRef = ref(db, `wishlist/${user.uid}/${p.id}`);

    await set(wRef, {
      id: p.id,
      name: p.name,
      image: p.image,
      price: p.price,
      finalPrice: p.finalPrice,
    });

    // 🔥 INSTANT UI UPDATE (heart black)
    setWishlist((prev) => ({
      ...prev,
      [p.id]: true,
    }));

    toast.success("Added to wishlist ❤️");
  };

  /* ---------------- STARS ---------------- */
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) stars.push(<FaStar key={i} />);
      else if (i - rating < 1) stars.push(<FaStarHalfAlt key={i} />);
      else stars.push(<FaRegStar key={i} />);
    }
    return stars;
  };

  return (
    <Layout>
      {/* 🔥 Toast Container */}
      <Toaster position="top-center" />

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* ---------- HEADING ---------- */}
        <h1 className="heading-zara text-2xl md:text-3xl mb-10 text-center">
          {offerTitle}
        </h1>

        {/* ---------- GRID ---------- */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="group cursor-pointer"
              onClick={() =>
                navigate(`/bestdeals/${offerId}/product/${p.id}`)
              }
            >
              {/* IMAGE */}
              <div className="relative overflow-hidden bg-gray-100">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-[280px] object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* WISHLIST */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(p);
                  }}
                  className="absolute top-3 right-3 bg-white/90 p-2 rounded-full shadow hover:scale-110 transition"
                >
                  {wishlist[p.id] ? (
                    <AiFillHeart
                      size={20}
                      className="text-black transition"
                    />
                  ) : (
                    <AiOutlineHeart
                      size={20}
                      className="text-gray-500 transition"
                    />
                  )}
                </button>
              </div>

              {/* INFO */}
              <div className="pt-3 space-y-1">
                <h3 className="text-hm-sm uppercase tracking-wide truncate">
                  {p.name}
                </h3>

                {/* PRICE */}
                {p.offer ? (
                  <div className="text-hm-md">
                    <span className="line-through text-gray-400 mr-2">
                      ₹{p.price}
                    </span>
                    <span className="price-hm">
                      ₹{p.finalPrice}
                    </span>
                  </div>
                ) : (
                  <div className="price-hm">₹{p.price}</div>
                )}

                {/* RATING */}
                {productReviews[p.id]?.total > 0 && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <div className="flex text-black">
                      {renderStars(productReviews[p.id].avg)}
                    </div>
                    ({productReviews[p.id].total})
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
