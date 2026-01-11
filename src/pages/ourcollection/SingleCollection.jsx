// src/pages/SingleCollection.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../../component/Layout";
import { db, auth } from "../../firebaseConfig";
import { ref, onValue, set, remove } from "firebase/database";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { Helmet } from "react-helmet-async";

function SingleCollection() {
  const { slug } = useParams();
  const [collection, setCollection] = useState(null);
  const [wishlist, setWishlist] = useState({});

  /* ================= Fetch Collection ================= */
  useEffect(() => {
    fetch("https://stuvely-data-default-rtdb.firebaseio.com/ourcollections.json")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          const found = Object.keys(data)
            .map((key) => ({ id: key, ...data[key] }))
            .find((item) => item.slug === slug);
          setCollection(found || null);
        }
      });
  }, [slug]);

  /* ================= Fetch Wishlist ================= */
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const wRef = ref(db, `wishlist/${user.uid}`);
    onValue(wRef, (snap) => setWishlist(snap.val() || {}));
  }, []);

  /* ================= Wishlist Toggle ================= */
  const toggleWishlist = async (prod, id) => {
    const user = auth.currentUser;
    if (!user) return alert("Please login first");

    const wRef = ref(db, `wishlist/${user.uid}/${id}`);

    if (wishlist[id]) {
      await remove(wRef);
    } else {
      await set(wRef, {
        id,
        title: prod.name,
        image: prod.imageUrl,
        price: prod.price,
        offerPrice: prod.offerPercent
          ? prod.price - (prod.price * prod.offerPercent) / 100
          : prod.price,
      });
    }
  };

  /* ================= Price Logic ================= */
  const getCurrentPrice = (prod) => {
    const now = new Date().getTime();

    if (
      prod.offerPercent &&
      prod.offerExpiry &&
      new Date(prod.offerExpiry).getTime() > now
    ) {
      return prod.price - (prod.price * prod.offerPercent) / 100;
    }
    return prod.price;
  };

  /* ================= Skeleton ================= */
  if (!collection) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-6 py-12 animate-pulse">
          <div className="h-6 w-56 bg-gray-300 mb-6"></div>
          <div className="h-64 bg-gray-300 mb-10"></div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-60 bg-gray-300"></div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* ================= Dynamic SEO ================= */}
      <Helmet>
        <title>{collection.name} | Shop Collection at Stuvely</title>
        <meta
          name="description"
          content={
            collection.description ||
            `Explore the ${collection.name} collection at Stuvely. Premium quality products with best prices and fast delivery.`
          }
        />
        <meta
          name="keywords"
          content={`${collection.name}, ${collection.category || "Collection"}, Stuvely collection`}
        />
        <link
          rel="canonical"
          href={`https://stuvely.com/collections/${collection.slug}`}
        />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* ================= Heading ================= */}
        <div className="mb-10">
          <h1 className="heading-zara text-xl sm:text-2xl">
            {collection.name}
          </h1>
          <div className="w-12 h-[1px] bg-black mt-3"></div>
        </div>

        {/* ================= Banner ================= */}
        <div className="mb-14 overflow-hidden rounded-lg">
          <img
            src={collection.imageUrl}
            alt={collection.name}
            className="w-full h-[220px] sm:h-[320px] lg:h-[420px] object-cover hover:scale-[1.03] transition duration-500"
          />
        </div>

        {/* ================= Products Grid ================= */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
          {collection.products &&
            Object.keys(collection.products).map((id) => {
              const prod = collection.products[id];
              const isWishlisted = wishlist[id];

              return (
                <div
                  key={id}
                  className="group relative card-luxury"
                >
                  {/* Wishlist */}
                  <button
                    onClick={() => toggleWishlist(prod, id)}
                    className="absolute top-3 right-3 z-10 text-xl opacity-70 hover:opacity-100"
                  >
                    {isWishlisted ? (
                      <AiFillHeart className="text-black" />
                    ) : (
                      <AiOutlineHeart />
                    )}
                  </button>

                  <Link to={`/collections/${slug}/product/${id}`}>
                    {/* Image */}
                    <div className="overflow-hidden bg-gray-100">
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="w-full h-[170px] sm:h-[220px] object-cover transition-transform duration-500 group-hover:translate-y-[-6px]"
                      />
                    </div>

                    {/* Info */}
                    <div className="mt-4 text-center">
                      <p className="text-hm-sm uppercase tracking-widest">
                        {prod.name}
                      </p>

                      <div className="mt-1 text-hm-md">
                        {prod.offerPercent ? (
                          <>
                            <span className="line-through text-gray-400 mr-2">
                              ₹{prod.price}
                            </span>
                            <span className="font-medium">
                              ₹{getCurrentPrice(prod)}
                            </span>
                          </>
                        ) : (
                          <span className="font-medium">
                            ₹{getCurrentPrice(prod)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
        </div>
      </div>
    </Layout>
  );
}

export default SingleCollection;
