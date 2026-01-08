import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../../component/Layout";
import { getAuth } from "firebase/auth";

const KEYCHAINS_DB_URL =
  "https://stuvely-data-default-rtdb.firebaseio.com/keychains";

export default function KeychainsProductInfo() {
  const { carId } = useParams();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [adding, setAdding] = useState(false);

  /* ================= FETCH PRODUCT ================= */
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${KEYCHAINS_DB_URL}/${carId}.json`);
        const data = await res.json();
        if (!data) return;

        setProduct({
          ...data,
          gallery: data.gallery?.length ? data.gallery : [data.image],
          highlights: data.highlights || [],
          specs: data.specs || {},
        });
        setActiveImage(0);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProduct();
  }, [carId]);

  const getUser = () => getAuth().currentUser;

  /* ================= ADD TO CART ================= */
  const addToCart = async () => {
    const user = getUser();
    if (!user) return alert("Please login to continue");

    setAdding(true);

    const cartItem = {
      carId,
      name: product.name,
      image: product.gallery[activeImage],
      price: Number(product.price) || 0,
      quantity: 1,
      category: "keychains",
      addedAt: new Date().toISOString(),
    };

    try {
      await fetch(
        `https://stuvely-data-default-rtdb.firebaseio.com/carts/${user.uid}.json`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cartItem),
        }
      );
      alert("Added to cart 🖤");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }

    setAdding(false);
  };

  if (!product) {
    return (
      <Layout>
        <div className="py-20 text-center text-gray-400">
          Loading keychain...
        </div>
      </Layout>
    );
  }

  /* ================= UI ================= */
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-16">
        {/* ================= IMAGES ================= */}
        <div className="sticky top-24">
          <div className="flex items-center justify-center overflow-hidden">
            <img
              src={product.gallery[activeImage]}
              alt={product.name}
              className="w-auto h-[320px]  transition-transform duration-500 hover:scale-105"
            />
          </div>

          {/* THUMBNAILS */}
          <div className="flex gap-3 mt-4 overflow-x-auto">
            {product.gallery.map((img, i) => (
              <img
                key={i}
                src={img}
                onClick={() => setActiveImage(i)}
                className={`w-20 h-20   cursor-pointer border transition ${
                  activeImage === i
                    ? "border-black"
                    : "border-transparent hover:border-gray-400"
                }`}
              />
            ))}
          </div>
        </div>

        {/* ================= DETAILS ================= */}
        <div className="space-y-6">
          <h1 className="text-3xl font-semibold tracking-wide">
            {product.name}
          </h1>

          {product.description && (
            <p className="text-gray-600 leading-relaxed">
              {product.description}
            </p>
          )}

          <div className="text-2xl font-medium">
            ₹{Number(product.price).toLocaleString()}
            <span className="text-sm text-gray-500 ml-2">
              Inclusive of all taxes
            </span>
          </div>

          {/* CTA */}
          <button
            onClick={addToCart}
            disabled={adding}
            className="w-full bg-black text-white py-3 uppercase tracking-widest hover:bg-gray-900 transition disabled:opacity-60"
          >
            {adding ? "Adding..." : "Add to Cart"}
          </button>

          {/* EXTERNAL STORES */}
          <div className="flex flex-wrap gap-3 text-sm">
            {[
              "flipkart",
              "amazon",
              "myntra",
              "ajio",
              "meesho",
              "tatacliq",
              "snapdeal",
              "nykaa",
            ].map(
              (store) =>
                product[store] && (
                  <a
                    key={store}
                    href={product[store]}
                    target="_blank"
                    rel="noreferrer"
                    className="border px-4 py-2 rounded-full hover:bg-black hover:text-white transition"
                  >
                    Buy on {store}
                  </a>
                )
            )}
          </div>

          {/* HIGHLIGHTS */}
          {product.highlights.length > 0 && (
            <div className="pt-6 border-t">
              <h3 className="font-semibold mb-3 uppercase tracking-wide text-sm">
                Highlights
              </h3>
              <ul className="space-y-2 text-gray-700 list-disc ml-5">
                {product.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          )}

          {/* SPECS */}
          {Object.keys(product.specs).length > 0 && (
            <div className="pt-6 border-t">
              <h3 className="font-semibold mb-3 uppercase tracking-wide text-sm">
                Specifications
              </h3>
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(product.specs).map(([k, v]) =>
                    v ? (
                      <tr key={k} className="border-b">
                        <td className="py-3 font-medium capitalize w-1/3">
                          {k}
                        </td>
                        <td className="py-3 text-gray-600">{v}</td>
                      </tr>
                    ) : null
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ================= MOBILE STICKY BAR ================= */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-between items-center z-50">
        <div>
          <div className="text-sm text-gray-500">Price</div>
          <div className="font-semibold">
            ₹{Number(product.price).toLocaleString()}
          </div>
        </div>
        <button
          onClick={addToCart}
          className="bg-black text-white px-6 py-2 uppercase tracking-wide"
        >
          Add
        </button>
      </div>
    </Layout>
  );
}
