import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../../component/Layout";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, set, onValue } from "firebase/database";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import toast, { Toaster } from "react-hot-toast";
import { Helmet } from "react-helmet-async";

const BESTDEALS_DB_URL =
  "https://stuvely-data-default-rtdb.firebaseio.com/bestdeals";
const OFFERS_DB_URL =
  "https://stuvely-data-default-rtdb.firebaseio.com/offersliders";

export default function SingleProducts() {
  const { offerId, productId, sliderSlug } = useParams();
  const [product, setProduct] = useState(null);
  const [activeVariant, setActiveVariant] = useState(null);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [wishlist, setWishlist] = useState({});

  const auth = getAuth();
  const db = getDatabase();

  const getImageUrl = (img) => {
    if (!img) return "";
    if (typeof img === "string") return img;
    if (typeof img === "object") return img.url || img.image || "";
    return "";
  };

  /* ================= WISHLIST (SYNC) ================= */
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const wRef = ref(db, `wishlist/${user.uid}`);
    onValue(wRef, (snap) => setWishlist(snap.val() || {}));
  }, [auth, db]);

  /* ================= FETCH PRODUCT ================= */
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        let prodObj = null;

        if (sliderSlug) {
          const res = await fetch(`${OFFERS_DB_URL}.json`);
          const data = await res.json();
          if (!data) return;

          const entry = Object.entries(data).find(
            ([, o]) =>
              (o.slug ||
                o.title?.toLowerCase().replace(/\s+/g, "-")) === sliderSlug
          );
          if (!entry) return;

          prodObj = entry[1].products?.[productId];
        } else {
          const res = await fetch(
            `${BESTDEALS_DB_URL}/${offerId}/products/${productId}.json`
          );
          prodObj = await res.json();
        }

        if (!prodObj) return;

        const finalPrice = prodObj.offer
          ? Math.round(prodObj.price - (prodObj.price * prodObj.offer) / 100)
          : prodObj.price;

        const normalizedGallery = (prodObj.gallery || []).map((g) =>
          typeof g === "string" ? g : g.url || g.image || ""
        );

        setProduct({
          ...prodObj,
          finalPrice,
          imageUrl: prodObj.imageUrl || prodObj.image || "",
          gallery: normalizedGallery,
        });

        setActiveVariant(prodObj.variants?.[0] || null);
        setActiveGalleryIndex(0);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProduct();
  }, [offerId, productId, sliderSlug]);

  const displayedImage =
    getImageUrl(activeVariant?.image) ||
    product?.gallery?.[activeGalleryIndex] ||
    product?.imageUrl ||
    "/placeholder-product.jpg";

  const toggleWishlist = async () => {
    const user = auth.currentUser;
    if (!user) return toast.error("Please login first");
    if (wishlist[productId])
      return toast("Already in wishlist 🤍", { icon: "⚠️" });

    const wRef = ref(db, `wishlist/${user.uid}/${productId}`);
    await set(wRef, {
      id: productId,
      name: product.name,
      image: displayedImage,
      price: product.price,
      finalPrice: product.finalPrice,
      offer: product.offer || null,
    });

    setWishlist((prev) => ({ ...prev, [productId]: true }));
    toast.success("Added to wishlist ❤️");
  };

  const addToCart = async () => {
    const user = auth.currentUser;
    if (!user) return toast.error("Please login first");

    const cartItem = {
      productId,
      name: product.name,
      image: displayedImage,
      price: product.price,
      currentPrice: product.finalPrice,
      variant: activeVariant || null,
      quantity: 1,
      addedAt: new Date().toISOString(),
    };

    await fetch(
      `https://stuvely-data-default-rtdb.firebaseio.com/carts/${user.uid}.json`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cartItem),
      }
    );

    toast.success("Added to cart 🖤");
  };

  if (!product) {
    return (
      <Layout>
        <div className="py-20 text-center text-gray-400">
          Loading product...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* ---------------- SEO ---------------- */}
      <Helmet>
        <title>{product.name} | Stuvely</title>
        <meta
          name="description"
          content={
            product.shortDescription ||
            `Buy ${product.name} online at best price. ${
              product.offer
                ? `Discounted ₹${product.finalPrice} from ₹${product.price}`
                : ""
            }`
          }
        />
        <meta
          name="keywords"
          content={`Stuvely, ${product.name}, ${product.category || "best deals"}, online shopping, buy online, discount`}
        />
        <link
          rel="canonical"
          href={`https://stuvely.com/bestdeals/${
            sliderSlug || offerId
          }/product/${productId}`}
        />
      </Helmet>

      <Toaster position="top-center" />

      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* IMAGE SECTION */}
        <div className="top-24">
          <div className="relative overflow-hidden flex items-center justify-center">
            <img
              src={displayedImage}
              alt={product.name}
              className="w-auto h-[320px] transition-transform duration-500 hover:scale-105"
            />
            <button
              onClick={toggleWishlist}
              className="absolute top-4 right-4 z-20 backdrop-blur p-2 rounded-full transition-transform hover:scale-110"
            >
              {wishlist[productId] ? (
                <AiFillHeart size={22} className="text-black" />
              ) : (
                <AiOutlineHeart size={22} className="text-gray-500" />
              )}
            </button>
          </div>

          {product.gallery?.length > 0 && (
            <div className="flex gap-3 mt-4 overflow-x-auto">
              {product.gallery.map((img, i) =>
                img ? (
                  <img
                    key={i}
                    src={img}
                    onClick={() => setActiveGalleryIndex(i)}
                    className={`w-20 h-20 cursor-pointer border p-0.5 ${
                      activeGalleryIndex === i
                        ? "border-black"
                        : "border-transparent"
                    }`}
                  />
                ) : null
              )}
            </div>
          )}
        </div>

        {/* INFO SECTION */}
        <div>
          <h1 className="text-2xl font-semibold mb-2">{product.name}</h1>
          <p className="text-gray-600 mb-6">{product.description}</p>

          <div className="text-xl font-medium mb-6">
            {product.offer ? (
              <>
                <span className="line-through text-gray-400 mr-3">
                  ₹{product.price}
                </span>
                <span>₹{product.finalPrice}</span>
              </>
            ) : (
              <span>₹{product.price}</span>
            )}
          </div>

          {product.variants?.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium mb-2">Select option</p>
              <div className="flex gap-2 flex-wrap">
                {product.variants.map((v, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveVariant(v)}
                    className={`px-4 py-1 text-sm border rounded-full ${
                      activeVariant === v
                        ? "border-black text-black"
                        : "border-gray-300 text-gray-500"
                    }`}
                  >
                    {v.color || v.size || `Option ${i + 1}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={addToCart}
            className="w-35 bg-white text-black py-2 uppercase tracking-wide border-2 transition"
          >
            Add to cart
          </button>
        </div>
      </div>
    </Layout>
  );
}
