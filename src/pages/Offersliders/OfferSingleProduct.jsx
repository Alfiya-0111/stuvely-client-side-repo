// src/pages/OfferSingleProduct.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../../component/Layout";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, set, remove, onValue } from "firebase/database";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";

function OfferSingleProduct() {
  const { sliderSlug, productId } = useParams();
  const [offer, setOffer] = useState(null);
  const [product, setProduct] = useState(null);
  const [activeVariant, setActiveVariant] = useState(null);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [wishlist, setWishlist] = useState({});
  const auth = getAuth();
  const db = getDatabase();

  /* Wishlist */
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const wRef = ref(db, `wishlist/${user.uid}`);
    onValue(wRef, (snap) => setWishlist(snap.val() || {}));
  }, [auth.currentUser]);

  /* Load product */
  useEffect(() => {
    loadProduct();
    // eslint-disable-next-line
  }, [sliderSlug, productId]);

  const loadProduct = async () => {
    const res = await fetch(
      "https://stuvely-data-default-rtdb.firebaseio.com/offersliders.json"
    );
    const data = await res.json();
    if (!data) return;

    const entry = Object.entries(data).find(
      ([, o]) =>
        (o.slug || o.title?.toLowerCase()?.replace(/\s+/g, "-")) === sliderSlug
    );
    if (!entry) return;

    const [offerId, o] = entry;
    setOffer({ id: offerId, ...o });

    const prodObj = o.products?.[productId];
    if (!prodObj) return;

    const galleryNormalized = (prodObj.gallery || []).map((g) =>
      typeof g === "string" ? { type: "image", url: g } : g
    );

    setProduct({ id: productId, ...prodObj, gallery: galleryNormalized });
    setActiveVariant(prodObj.variants?.[0] || null);
  };

  const displayedMedia = () => {
    if (activeVariant?.image) return { type: "image", url: activeVariant.image };
    if (product.gallery?.length)
      return product.gallery[activeGalleryIndex];
    return { type: "image", url: product.imageUrl || "" };
  };

  const addToCart = async () => {
    const user = auth.currentUser;
    if (!user) return alert("Please login");

    const currentPrice = product.offer
      ? product.price - (product.price * product.offer) / 100
      : product.price;

    await fetch(
      `https://stuvely-data-default-rtdb.firebaseio.com/carts/${user.uid}.json`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          sliderId: offer.id,
          name: product.name,
          image:
            activeVariant?.image ||
            product.gallery?.[activeGalleryIndex]?.url ||
            product.imageUrl,
          price: product.price,
          currentPrice,
          variant: activeVariant,
          quantity: 1,
        }),
      }
    );

    alert("Added to cart");
  };

  const toggleWishlist = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const wRef = ref(db, `wishlist/${user.uid}/${product.id}`);
    wishlist[product.id]
      ? await remove(wRef)
      : await set(wRef, {
          id: product.id,
          sliderId: offer.id,
          name: product.name,
          image: activeVariant?.image || product.imageUrl,
          price: product.price,
        });
  };

  if (!product) return null;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

          {/* MEDIA */}
          <div>
            <div className="relative">
              {(() => {
                const m = displayedMedia();
                return m.type === "image" ? (
                  <img
                    src={m.url}
                    alt={product.name}
                    className="w-full max-w-[320px] object-cover"
                  />
                ) : (
                  <video src={m.url} controls className="w-full max-w-[420px]" />
                );
              })()}

              <button
                onClick={toggleWishlist}
                className="absolute top-4 right-4 bg-white p-2 rounded-full"
              >
                {wishlist[product.id] ? (
                  <AiFillHeart size={20} className="text-red-500" />
                ) : (
                  <AiOutlineHeart size={20} />
                )}
              </button>
            </div>

            <div className="flex gap-2 mt-4 overflow-x-auto">
              {product.gallery?.map((g, i) => (
                <div
                  key={i}
                  onClick={() => setActiveGalleryIndex(i)}
                  className="cursor-pointer"
                >
                  <img
                    src={g.url}
                    alt=""
                    className="w-16 h-16 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* INFO */}
          <div>
            <h1 className="text-lg uppercase tracking-[0.25em] font-normal mb-4">
              {product.name}
            </h1>

            <p className="text-sm text-gray-600 leading-relaxed max-w-md">
              {product.description}
            </p>

            <div className="mt-6">
              <p className="text-base tracking-wide">
                ₹{product.price}
              </p>
              {product.offer && (
                <p className="text-xs text-gray-500 tracking-widest mt-1">
                  {product.offer}% OFF
                </p>
              )}
            </div>

            {product.variants?.length > 0 && (
              <div className="mt-8">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-3">
                  Select Variant
                </p>

                <div className="flex gap-2 flex-wrap">
                  {product.variants.map((v, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveVariant(v)}
                      className={`px-4 py-1.5 text-xs tracking-widest border
                        ${
                          activeVariant === v
                            ? "bg-black text-white border-black"
                            : "border-gray-300 hover:border-black"
                        }`}
                    >
                      {v.color || v.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={addToCart}
              className="mt-10 px-12 py-3 text-xs uppercase tracking-[0.3em] bg-black text-white hover:bg-gray-900 transition"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default OfferSingleProduct;
