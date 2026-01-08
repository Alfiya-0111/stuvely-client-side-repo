// src/pages/OfferProducts.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../component/Layout";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, set, remove, onValue } from "firebase/database";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";

function OfferProducts() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [offer, setOffer] = useState(null);
  const [productsArr, setProductsArr] = useState([]);
  const [wishlist, setWishlist] = useState({});
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const db = getDatabase();

  /* ================= Wishlist ================= */
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const wRef = ref(db, `wishlist/${user.uid}`);
    return onValue(wRef, (snap) => {
      setWishlist(snap.val() || {});
    });
  }, []);

  /* ================= Fetch Offer ================= */
  useEffect(() => {
    fetchOffer();
    // eslint-disable-next-line
  }, [slug]);

  const fetchOffer = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        "https://stuvely-data-default-rtdb.firebaseio.com/offersliders.json"
      );
      const data = await res.json();

      if (!data) return;

      const entry = Object.entries(data).find(
        ([, o]) =>
          (o.slug || o.title?.toLowerCase()?.replace(/\s+/g, "-")) === slug
      );

      if (!entry) return;

      const [id, o] = entry;
      setOffer({ id, ...o });

      const arr = Object.entries(o.products || {}).map(([pid, val]) => ({
        id: pid,
        ...val,
      }));

      setProductsArr(arr);
    } catch (err) {
      console.error("Error fetching offer:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= Wishlist Toggle ================= */
  const toggleWishlist = async (p) => {
    const user = auth.currentUser;
    if (!user) return alert("Please login to add wishlist ❤️");

    const wRef = ref(db, `wishlist/${user.uid}/${p.id}`);

    wishlist[p.id]
      ? await remove(wRef)
      : await set(wRef, {
          id: p.id,
          sliderId: offer.id,
          name: p.name,
          image: p.imageUrl || p.image || p.gallery?.[0] || "",
          price: p.price,
          offer: p.offer || null,
        });
  };

  /* ================= Loader ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm tracking-widest uppercase text-gray-400">
          Loading
        </p>
      </div>
    );
  }

  /* ================= Offer Not Found ================= */
  if (!offer) {
    return (
      <Layout>
        <p className="text-center mt-24 text-sm tracking-widest uppercase text-gray-400">
          Offer not found
        </p>
      </Layout>
    );
  }

  /* ================= Main UI ================= */
  return (
    <Layout>
      <div className="min-h-screen py-14 px-6">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-lg uppercase tracking-[0.35em] font-normal mb-3">
              {offer.title}
            </h2>
            <p className="text-sm text-gray-500 tracking-wide">
              {offer.subtitle}
            </p>
          </div>

          {productsArr.length === 0 ? (
            <p className="text-center text-sm text-gray-400">
              No products available
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
              {productsArr.map((p) => (
                <div
                  key={p.id}
                  className="group relative"
                >
                  <div className="relative overflow-hidden">

                    {/* Wishlist */}
                    <button
                      onClick={() => toggleWishlist(p)}
                      className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full"
                    >
                      {wishlist[p.id] ? (
                        <AiFillHeart size={18} className="text-red-500" />
                      ) : (
                        <AiOutlineHeart size={18} />
                      )}
                    </button>

                    {/* Image */}
                    <div
                      onClick={() =>
                        navigate(`/product/${offer.slug}/${p.id}`)
                      }
                      className="h-64 cursor-pointer overflow-hidden"
                    >
                      <img
                        src={p.imageUrl || p.image || p.gallery?.[0] || ""}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="mt-5 space-y-2">
                    <h3 className="text-sm uppercase tracking-wide line-clamp-1">
                      {p.name}
                    </h3>

                    <div className="flex items-center justify-between">
                      <span className="text-sm tracking-wide">
                        ₹{p.price}
                      </span>

                      {p.offer && (
                        <span className="text-xs tracking-widest uppercase text-gray-500">
                          {p.offer}% off
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() =>
                        navigate(`/product/${offer.slug}/${p.id}`)
                      }
                      className="mt-3 w-full py-2 text-xs uppercase tracking-[0.3em] border border-black hover:bg-black hover:text-white transition"
                    >
                      View Product
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default OfferProducts;
