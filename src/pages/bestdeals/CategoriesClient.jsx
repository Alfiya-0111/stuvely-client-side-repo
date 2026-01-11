import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const FIREBASE_DB_URL =
  "https://stuvely-data-default-rtdb.firebaseio.com/bestdeals.json";

export default function CategoriesClient() {
  const [offers, setOffers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await fetch(FIREBASE_DB_URL);
        const data = await res.json();
        if (!data) return setOffers([]);

        const formattedOffers = Object.entries(data).map(([id, val]) => {
          const products = val.products ? Object.values(val.products) : [];
          const prices = products.map(p => Number(p.price)).filter(Boolean);
          const fromPrice = prices.length ? Math.min(...prices) : null;

          return { id, fromPrice, ...val };
        });

        setOffers(formattedOffers);
      } catch (err) {
        console.error(err);
      }
    };

    fetchOffers();
  }, []);

  return (
    <>
      {/* ---------------- SEO ---------------- */}
      <Helmet>
        <title>Best Deals | Stuvely – Limited Offers & Modern Essentials</title>
        <meta
          name="description"
          content="Discover the best deals at Stuvely. Timeless selections, elevated essentials, and limited-time offers crafted for modern wardrobes."
        />
        <meta
          name="keywords"
          content="best deals, limited offers, Stuvely, modern essentials, collections, products"
        />
        <link rel="canonical" href="https://stuvely.com/bestdeals" />
      </Helmet>

      {/* ================= CAMPAIGN BANNER ================= */}
      <section className="bg-white">
        <div className="relative h-[45vh] flex items-center justify-center bg-black text-white mb-20">
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/30"></div>

          <div className="relative z-10 text-center px-6">
            <h1 className="uppercase tracking-[0.45em] text-3xl md:text-5xl font-light">
              Best Deals
            </h1>
            <p className="mt-6 max-w-xl mx-auto text-sm md:text-base text-gray-300">
              Timeless selections. Elevated essentials. Limited offers crafted
              for modern wardrobes.
            </p>
            <div className="w-20 h-px bg-white mx-auto mt-8"></div>
          </div>
        </div>

        {/* ================= GRID ================= */}
        <div className="max-w-7xl mx-auto px-6 pb-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
            {offers.map((o) => (
              <div
                key={o.id}
                onClick={() => navigate(`/bestdeals/${o.id}`)}
                className="group cursor-pointer"
              >
                {/* Image */}
                <div className="relative overflow-hidden aspect-[3/4] bg-neutral-100">
                  {o.bgImage && (
                    <img
                      src={o.bgImage}
                      alt={o.title}
                      className="
                        w-full h-full object-cover
                        grayscale
                        transition-all duration-700
                        group-hover:grayscale-0
                        group-hover:scale-105
                      "
                    />
                  )}

                  {/* Hover Overlay */}
                  <div
                    className="
                      absolute inset-0
                      bg-black/40
                      opacity-0
                      group-hover:opacity-100
                      transition-opacity duration-500
                    "
                  ></div>

                  {/* Hover Text */}
                  <div
                    className="
                      absolute inset-0
                      flex items-end justify-center
                      pb-10
                      text-white
                      opacity-0
                      group-hover:opacity-100
                      transition-all duration-500
                      translate-y-4
                      group-hover:translate-y-0
                    "
                  >
                    <span className="uppercase tracking-[0.3em] text-xs">
                      View Collection
                    </span>
                  </div>
                </div>

                {/* Text */}
                <div className="mt-6 text-center">
                  <h2 className="uppercase tracking-[0.35em] text-sm text-black">
                    {o.title}
                  </h2>

                  {o.fromPrice && (
                    <p className="mt-2 text-sm text-neutral-600">
                      From ₹{o.fromPrice}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
