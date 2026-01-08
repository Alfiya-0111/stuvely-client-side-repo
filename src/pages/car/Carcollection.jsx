import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db, auth } from "../../firebaseConfig";
import { ref, set, remove, onValue } from "firebase/database";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";

export default function Carcollection() {
  const [cars, setCars] = useState([]);
  const [wishlist, setWishlist] = useState({});

  /* ================= FETCH CARS ================= */
  useEffect(() => {
    fetch("https://stuvely-data-default-rtdb.firebaseio.com/cars.json")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          const arr = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          setCars(arr);
        }
      });
  }, []);

  /* ================= FETCH WISHLIST ================= */
  useEffect(() => {
    const u = auth.currentUser;
    if (!u) return;

    const wRef = ref(db, `wishlist/${u.uid}`);
    return onValue(wRef, (snap) => setWishlist(snap.val() || {}));
  }, []);

  /* ================= TOGGLE WISHLIST ================= */
  const toggleWishlist = (car) => {
    const u = auth.currentUser;
    if (!u) return alert("Please login first");

    const wRef = ref(db, `wishlist/${u.uid}/${car.id}`);
    wishlist[car.id] ? remove(wRef) : set(wRef, car);
  };

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* ================= HEADING ================= */}
        <div className="mb-14 text-center md:text-left">
          <h2 className="uppercase tracking-[0.4em] text-2xl md:text-3xl font-light text-black">
            New Arrivals
          </h2>
          <div className="w-14 h-px bg-black mt-6 mx-auto md:mx-0"></div>
        </div>

        {/* ================= GRID ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
          {cars.map((car) => (
            <div
              key={car.id}
              className="group relative cursor-pointer"
            >
              {/* Wishlist */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist(car);
                }}
                className="
                  absolute top-4 right-4 z-20
                   backdrop-blur
                  p-2 rounded-full
                  transition-transform
                  hover:scale-110
                "
              >
                {wishlist[car.id] ? (
                  <AiFillHeart className="text-black text-lg" />
                ) : (
                  <AiOutlineHeart className="text-gray-500 text-lg" />
                )}
              </button>

              <Link to={`/cars/${car.id}`}>
                {/* IMAGE */}
                <div className="relative h-44 flex items-center justify-center overflow-visible">
                  <img
                    src={car.image}
                    alt={car.name}
                    className="
                      w-56
                      transition-all duration-500 ease-out
                      group-hover:-translate-y-8
                      group-hover:scale-105
                    "
                  />
                </div>

                {/* CONTENT */}
                <div className="pt-6 pb-2 text-center">
                  <h3 className="uppercase tracking-[0.25em] text-sm text-black">
                    {car.name}
                  </h3>
                  <p className="mt-2 text-sm text-neutral-600">
                    ₹{car.price}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
