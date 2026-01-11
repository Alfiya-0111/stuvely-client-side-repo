import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Layout from "../../component/Layout";
import { auth, db } from "../../firebaseConfig";
import { ref, onValue, set, remove, get } from "firebase/database";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { Helmet } from "react-helmet-async";

/* ---------------- PRICE HELPER ---------------- */
const priceAfterOffer = (p) => {
  const base = Number(p.price || 0);
  const off = Number(p.offerPercent || 0);
  const exp = p.offerExpiry;

  if (off && exp && new Date(exp).getTime() > Date.now()) {
    return Math.floor(base - (base * off) / 100);
  }
  return base;
};

/* ---------------- IMAGE NORMALIZER ---------------- */
const normalizeProduct = (data = {}) => {
  const gallery =
    Array.isArray(data.gallery) && data.gallery.length
      ? data.gallery
      : Array.isArray(data.images) && data.images.length
      ? data.images
      : data.imageUrl
      ? [data.imageUrl]
      : data.image
      ? [data.image]
      : [];

  return {
    ...data,
    gallery: gallery.filter(Boolean),
    image: gallery[0] || "",
    highlights: Array.isArray(data.highlights) ? data.highlights : [],
    specs: data.specs || {},
    shortDescription: data.shortDescription || "",
    description: data.description || "",
    price: Number(data.price || 0),
    offerPercent: Number(data.offerPercent || 0),
    offerExpiry: data.offerExpiry || null,
  };
};

const getImages = (item) =>
  item?.gallery?.length
    ? item.gallery
    : item?.image
    ? [item.image]
    : ["/placeholder-product.jpg"];

export default function SingleCollectionProduct() {
  const { slug, productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [collection, setCollection] = useState(null);
  const [related, setRelated] = useState([]);
  const [wishlist, setWishlist] = useState({});
  const [adding, setAdding] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  /* ---------------- WISHLIST ---------------- */
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const wRef = ref(db, `wishlist/${user.uid}`);
    onValue(wRef, (snap) => setWishlist(snap.val() || {}));
  }, []);

  const toggleWishlist = async (item, id) => {
    const user = auth.currentUser;
    if (!user) return navigate("/login");

    const wRef = ref(db, `wishlist/${user.uid}/${id}`);
    wishlist[id]
      ? await remove(wRef)
      : await set(wRef, {
          id,
          title: item.name,
          image: getImages(item)[0],
          price: priceAfterOffer(item),
          addedAt: Date.now(),
        });
  };

  /* ---------------- FETCH PRODUCT ---------------- */
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(
        "https://stuvely-data-default-rtdb.firebaseio.com/ourcollections.json"
      );
      const data = await res.json();
      if (!data) return;

      const collections = Object.keys(data).map((k) => ({
        id: k,
        ...data[k],
      }));

      const coll = collections.find((c) => c.slug === slug);
      if (!coll || !coll.products) return;

      const prodData = coll.products[productId];
      if (!prodData) return;

      const prod = normalizeProduct(prodData);
      setProduct(prod);
      setCollection(coll);
      setActiveImage(0);

      const others = Object.keys(coll.products)
        .filter((id) => id !== productId)
        .map((id) =>
          normalizeProduct({ id, ...coll.products[id] })
        );

      setRelated(others);
    };

    fetchData();
  }, [slug, productId]);

  /* ---------------- ADD TO CART ---------------- */
  const addToCart = async () => {
    const user = auth.currentUser;
    if (!user) return navigate("/login");

    setAdding(true);
    const cartRef = ref(db, `carts/${user.uid}/${productId}`);
    const snap = await get(cartRef);

    if (snap.exists()) {
      alert("Already in cart");
    } else {
      await set(cartRef, {
        ...product,
        image: getImages(product)[activeImage],
        quantity: 1,
        currentPrice: priceAfterOffer(product),
        category: "collections",
        addedAt: Date.now(),
      });
      navigate("/cart");
    }
    setAdding(false);
  };

  if (!product || !collection) {
    return (
      <Layout>
        <div className="p-12 text-center text-gray-400">Loading…</div>
      </Layout>
    );
  }

  const images = getImages(product);

  return (
    <Layout>
      {/* ---------------- SEO ---------------- */}
      <Helmet>
        <title>{product.name} | {collection.name} Collection | Stuvely</title>
        <meta
          name="description"
          content={
            product.shortDescription ||
            `Buy ${product.name} from ${collection.name} collection at Stuvely. Premium quality with best prices and fast delivery.`
          }
        />
        <meta
          name="keywords"
          content={`${product.name}, ${collection.name}, ${collection.slug}, Stuvely product`}
        />
        <link
          rel="canonical"
          href={`https://stuvely.com/collections/${slug}/product/${productId}`}
        />
      </Helmet>

      {/* PRODUCT */}
      <div className="max-w-6xl mx-auto p-6 grid lg:grid-cols-2 gap-12">
        {/* IMAGES */}
        <div className="p-6">
          <img
            src={images[activeImage]}
            alt={product.name}
            className="w-auto h-[320px]  transition-transform duration-300 hover:scale-105"
          />

          {images.length > 1 && (
            <div className="flex gap-3 mt-6 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border
                    ${
                      activeImage === i
                        ? "border-black"
                        : "border-gray-300 hover:border-gray-600"
                    }`}
                >
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* DETAILS */}
        <div className="space-y-6">
          <h1 className="text-3xl font-semibold tracking-wide">
            {product.name}
          </h1>

          {product.shortDescription && (
            <p className="text-gray-600 leading-relaxed">
              {product.shortDescription}
            </p>
          )}

          <div className="text-3xl font-semibold">
            ₹{priceAfterOffer(product)}
          </div>

          <div className="flex gap-4">
            <button
              onClick={addToCart}
              disabled={adding}
              className="flex-1 py-4 bg-black text-white uppercase tracking-wider text-sm hover:bg-gray-900 transition"
            >
              {adding ? "Adding..." : "Add to Bag"}
            </button>

            <button
              onClick={() => toggleWishlist(product, productId)}
              className="w-14 flex items-center justify-center border hover:bg-gray-100"
            >
              {wishlist[productId] ? (
                <AiFillHeart size={22} />
              ) : (
                <AiOutlineHeart size={22} />
              )}
            </button>
          </div>

          {/* DESCRIPTION */}
          {product.description && (
            <div>
              <h3 className="font-semibold mb-2">Details</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* SPECS */}
          {product.specs &&
            Object.keys(product.specs).some((k) => product.specs[k]) && (
              <div>
                <h3 className="font-semibold mb-2">Specifications</h3>
                <table className="w-full text-sm">
                  <tbody>
                    {Object.entries(product.specs).map(
                      ([key, value]) =>
                        value && (
                          <tr key={key} className="border-t">
                            <td className="py-2 capitalize text-gray-500">
                              {key}
                            </td>
                            <td className="py-2">{value}</td>
                          </tr>
                        )
                    )}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      {related.length > 0 && (
        <div className="max-w-6xl mx-auto p-6">
          <h2 className="text-2xl font-semibold mb-6">
            You may also like
          </h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {related.map((item) => (
              <Link
                key={item.id}
                to={`/collections/${slug}/product/${item.id}`}
                className="group"
              >
                <div className="bg-gray-50 rounded-xl overflow-hidden">
                  <img
                    src={getImages(item)[0]}
                    className="w-full h-72 object-cover group-hover:scale-105 transition"
                  />
                </div>

                <h3 className="mt-3 font-medium">{item.name}</h3>
                <p className="text-gray-600">
                  ₹{priceAfterOffer(item)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
