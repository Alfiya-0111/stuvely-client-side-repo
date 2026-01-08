import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";

import "swiper/css";
import "swiper/css/pagination";

function OfferSlider() {
  const [offers, setOffers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await fetch(
          "https://stuvely-data-default-rtdb.firebaseio.com/offersliders.json"
        );
        const data = await res.json();

        if (data) {
          const arr = Object.keys(data).map((key) => {
            const o = data[key] || {};
            const productImage =
              o.productImage ||
              o.bgImage ||
              (o.products
                ? o.products[Object.keys(o.products)[0]]?.imageUrl
                : "");

            return {
              id: key,
              title: o.title || "Special Offer",
              subtitle: o.subtitle || "",
              offerPercent: o.offerPercent || null,
              bgColor: o.bgColor || "",
              bgImage: o.bgImage || "",
              productImage: productImage || "/fallback.jpg",
              slug:
                o.slug ||
                o.title?.toLowerCase().replace(/\s+/g, "-") ||
                `offer-${key}`,
            };
          });

          setOffers(arr);
        }
      } catch (err) {
        console.error("Error fetching offers:", err);
      }
    };

    fetchOffers();
  }, []);

  if (!offers.length) return null;

  return (
    <section className="relative my-8">
      {/* Arrows */}
      <button className="custom-prev hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-20
        w-11 h-11 rounded-full bg-white/20 backdrop-blur
        items-center justify-center text-white
        hover:bg-black hover:scale-110 transition">
        <HiOutlineChevronLeft size={20} />
      </button>

      <button className="custom-next hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-20
        w-11 h-11 rounded-full bg-white/20 backdrop-blur
        items-center justify-center text-white
        hover:bg-black hover:scale-110 transition">
        <HiOutlineChevronRight size={20} />
      </button>

      <Swiper
        spaceBetween={30}
        centeredSlides
        loop
        autoplay={{ delay: 4500, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation={{ prevEl: ".custom-prev", nextEl: ".custom-next" }}
        modules={[Autoplay, Pagination, Navigation]}
        className="rounded-2xl overflow-hidden"
      >
        {offers.map((offer) => (
          <SwiperSlide key={offer.id}>
            <div
              onClick={() => navigate(`/offers/${offer.slug}`)}
              className="relative w-full h-[65vh] max-h-[520px]
              flex items-center cursor-pointer"
              style={{
                background: offer.bgColor
                  ? offer.bgColor
                  : offer.bgImage
                  ? `url(${offer.bgImage}) center/cover no-repeat`
                  : "#000",
              }}
            >
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/20" />

              {/* Content */}
              <div className="relative z-10 w-[90%] max-w-7xl mx-auto
                grid md:grid-cols-2 gap-10 items-center text-white">

                {/* Text */}
                <div className="text-center md:text-left">
                  <h2 className="heading-zara text-hm-xl md:text-[40px]">
                    {offer.title}
                  </h2>

                  {offer.subtitle && (
                    <p className="text-hm-sm text-gray-300 mt-4 max-w-md">
                      {offer.subtitle}
                    </p>
                  )}

                  {offer.offerPercent && (
                    <p className="mt-6 text-hm-md tracking-widest uppercase">
                      Up to {offer.offerPercent}% off
                    </p>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/offers/${offer.slug}`);
                    }}
                    className="mt-8 inline-block
                    border border-white
                    px-10 py-3
                    text-hm-sm uppercase tracking-[0.3em]
                    hover:bg-white hover:text-black
                    transition"
                  >
                    Shop now
                  </button>
                </div>

                {/* Image */}
                <div className="flex justify-center">
                  <img
                    src={offer.productImage}
                    alt={offer.title}
                    className="h-64 md:h-80 object-contain
                    drop-shadow-2xl
                    hover:scale-110 transition duration-300"
                    onError={(e) => (e.target.src = "/fallback.jpg")}
                  />
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}

export default OfferSlider;
