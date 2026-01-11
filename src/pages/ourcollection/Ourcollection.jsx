// src/pages/OurCollection.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Grid, Autoplay } from "swiper/modules";
import { Helmet } from "react-helmet-async";

import "swiper/css";
import "swiper/css/grid";

function OurCollection() {
  const [collections, setCollections] = useState([]);
  const navigate = useNavigate();
  const { collectionSlug } = useParams(); // optional, if you want single collection SEO

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await fetch(
          "https://stuvely-data-default-rtdb.firebaseio.com/ourcollections.json"
        );
        const data = await res.json();

        if (data) {
          const arr = Object.keys(data).map((key) => {
            const item = data[key];
            return {
              id: key,
              name: item.name || "Unnamed Collection",
              category: item.category || "Collection",
              imageUrl: item.imageUrl || "/fallback.jpg",
              slug:
                item.slug ||
                item.name?.toLowerCase().replace(/\s+/g, "-") ||
                `collection-${key}`,
              description:
                item.description ||
                `Explore the ${item.name} collection at Stuvely. Premium products with best prices and fast delivery.`,
            };
          });
          setCollections(arr);
        }
      } catch (err) {
        console.error("Error fetching collections:", err);
      }
    };

    fetchCollections();
  }, []);

  if (!collections.length) return null;

  // Optional: dynamic SEO for single collection if slug is present
  const currentCollection = collections.find(
    (col) => col.slug === collectionSlug
  );

  return (
    <section className="relative py-20 bg-white overflow-hidden">
      {/* Dynamic SEO */}
      <Helmet>
        <title>
          {currentCollection
            ? currentCollection.name
            : "Our Collections"}{" "}
          | Shop at Stuvely
        </title>
        <meta
          name="description"
          content={
            currentCollection
              ? currentCollection.description
              : "Explore our curated collections at Stuvely. Premium quality products, best prices, and fast delivery."
          }
        />
        <meta
          name="keywords"
          content={
            currentCollection
              ? `${currentCollection.name}, ${currentCollection.category}, Stuvely collections`
              : "collections, Stuvely, shop online, premium products"
          }
        />
        <link
          rel="canonical"
          href={
            currentCollection
              ? `https://stuvely.com/collections/${currentCollection.slug}`
              : "https://stuvely.com/collections"
          }
        />
      </Helmet>

      {/* Subtle editorial background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-neutral-50 to-white"></div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <div className="mb-12 text-center md:text-left">
          <h2 className="heading-zara text-hm-lg md:text-hm-xl text-black">
            Our Collections
          </h2>
          <div className="w-16 h-px bg-black mt-6 mx-auto md:mx-0"></div>
        </div>

        {/* Slider */}
        <Swiper
          slidesPerView={6}
          spaceBetween={24}
          grid={{ rows: 1 }}
          autoplay={{ delay: 2800, disableOnInteraction: false }}
          modules={[Grid, Autoplay]}
          loop
          breakpoints={{
            320: { slidesPerView: 2, spaceBetween: 14 },
            640: { slidesPerView: 3, spaceBetween: 16 },
            768: { slidesPerView: 4, spaceBetween: 20 },
            1024: { slidesPerView: 6, spaceBetween: 24 },
          }}
        >
          {collections.map((col) => (
            <SwiperSlide key={col.id}>
              <div
                onClick={() => navigate(`/collections/${col.slug}`)}
                className="group cursor-pointer flex flex-col items-center text-center"
              >
                {/* Image */}
                <div
                  className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden
                  border border-neutral-200 transition-all duration-300
                  group-hover:scale-105"
                >
                  <img
                    src={col.imageUrl}
                    alt={col.name}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.target.src = "/fallback.jpg")}
                  />
                </div>

                {/* Text */}
                <h3 className="mt-5 text-hm-sm uppercase tracking-[0.25em] text-black">
                  {col.name}
                </h3>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Editorial text + CTA */}
        <div className="mt-16 text-center max-w-2xl mx-auto">
          <p className="text-hm-md text-neutral-600 leading-relaxed">
            Explore our carefully curated collections inspired by modern
            silhouettes, timeless craftsmanship, and effortless elegance.
          </p>

          <button
            onClick={() => navigate("/collections")}
            className="mt-10 inline-block
              border border-black
              px-12 py-3
              text-hm-sm uppercase tracking-[0.3em]
              hover:bg-black hover:text-white
              transition"
          >
            View all collections
          </button>
        </div>
      </div>
    </section>
  );
}

export default OurCollection;
