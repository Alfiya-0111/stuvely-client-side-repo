import React, { useEffect, useState } from "react";
import { ref, get, remove, update } from "firebase/database";
import { auth, db } from "../../firebaseConfig";
import Layout from "../../component/Layout";
import { useNavigate } from "react-router-dom";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  /* ================= LOAD CART ================= */
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        alert("Please login first");
        navigate("/login");
        return;
      }

      const cartRef = ref(db, `carts/${user.uid}`);
      get(cartRef)
        .then((snap) => {
          if (snap.exists()) {
            const items = Object.entries(snap.val()).map(([id, data]) => ({
              id,
              ...data,
            }));
            setCartItems(items);
          } else {
            setCartItems([]);
          }
        })
        .catch(console.error);
    });

    return () => unsubscribe();
  }, [navigate]);

  /* ================= QUANTITY ================= */
  const updateQty = (id, qty) => {
    if (qty < 1) return;
    const user = auth.currentUser;
    if (!user) return;

    update(ref(db, `carts/${user.uid}/${id}`), { quantity: qty });
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: qty } : item
      )
    );
  };

  /* ================= REMOVE ================= */
  const removeItem = (id) => {
    const user = auth.currentUser;
    if (!user) return;

    remove(ref(db, `carts/${user.uid}/${id}`));
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  /* ================= CHECKOUT ================= */
  const totalPrice = cartItems.reduce(
    (sum, i) => sum + i.currentPrice * i.quantity,
    0
  );

  const checkoutAll = () => {
    if (!cartItems.length) return;
    navigate("/checkout", { state: { cartItems, total: totalPrice } });
  };

  /* ================= UI ================= */
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-wide mb-10">
          Shopping Bag
        </h1>

        {cartItems.length === 0 ? (
          <p className="text-gray-500 text-lg">Your bag is empty</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* ================= ITEMS ================= */}
            <div className="lg:col-span-2 space-y-10">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-6 border-b pb-8"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-28 h-30"
                  />

                  <div className="flex-1 space-y-2">
                    <h2 className="font-medium tracking-wide">
                      {item.name}
                    </h2>

                    {item.variant?.color && (
                      <p className="text-sm text-gray-500">
                        Color: {item.variant.color}
                      </p>
                    )}

                    <p className="font-medium">
                      ₹{item.currentPrice}
                    </p>

                    {/* QUANTITY */}
                    <div className="flex items-center gap-4 mt-4">
                      <button
                        onClick={() =>
                          updateQty(item.id, item.quantity - 1)
                        }
                        className="border px-3 py-1 hover:bg-black hover:text-white transition"
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQty(item.id, item.quantity + 1)
                        }
                        className="border px-3 py-1 hover:bg-black hover:text-white transition"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-sm text-gray-500 underline mt-2"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="text-right font-medium">
                    ₹{item.currentPrice * item.quantity}
                  </div>
                </div>
              ))}
            </div>

            {/* ================= SUMMARY ================= */}
            <div className="border p-6 h-fit sticky top-24">
              <h3 className="text-lg font-medium mb-6">
                Order Summary
              </h3>

              <div className="flex justify-between mb-4 text-sm">
                <span>Subtotal</span>
                <span>₹{totalPrice}</span>
              </div>

              <div className="flex justify-between mb-4 text-sm">
                <span>Shipping</span>
                <span>Free</span>
              </div>

              <div className="flex justify-between text-lg font-semibold border-t pt-4">
                <span>Total</span>
                <span>₹{totalPrice}</span>
              </div>

              <button
                onClick={checkoutAll}
                className="w-full mt-6 bg-black text-white py-3 uppercase tracking-widest hover:bg-gray-900 transition"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= MOBILE STICKY ================= */}
      {cartItems.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-between items-center z-50">
          <div>
            <p className="text-sm text-gray-500">Total</p>
            <p className="font-semibold">₹{totalPrice}</p>
          </div>
          <button
            onClick={checkoutAll}
            className="bg-black text-white px-6 py-2 uppercase"
          >
            Checkout
          </button>
        </div>
      )}
    </Layout>
  );
}

export default Cart;
