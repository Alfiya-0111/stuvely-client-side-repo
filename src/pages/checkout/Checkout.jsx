/* Checkout.jsx – ZARA / H&M Style */

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../../component/Layout";
import { auth } from "../../firebaseConfig";
import { getDatabase, ref, push, set, get, update } from "firebase/database";

const db = getDatabase();
const BNPL_MIN_AMOUNT = 3000;

export default function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { cartItems = [], total = 0 } = state || {};

  const [walletCoins, setWalletCoins] = useState(0);
  const [shipping, setShipping] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  /* ================= WALLET ================= */
  useEffect(() => {
    const fetchWallet = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const snap = await get(ref(db, `wallet/${user.uid}`));
      setWalletCoins(snap.exists() ? snap.val().coins || 0 : 0);
    };
    fetchWallet();
  }, []);

  const addWalletCoins = async (amount) => {
    const user = auth.currentUser;
    if (!user) return;
    const walletRef = ref(db, `wallet/${user.uid}`);
    const snap = await get(walletRef);
    const oldCoins = snap.exists() ? snap.val().coins || 0 : 0;
    const earned = Math.floor(amount * 0.02);
    await update(walletRef, { coins: oldCoins + earned });
    setWalletCoins(oldCoins + earned);
  };

  /* ================= VALIDATION ================= */
  const isValid = () => {
    const { name, phone, address, city, state, pincode } = shipping;
    if (!name || !phone || !address || !city || !state || !pincode) {
      alert("Please fill all shipping details");
      return false;
    }
    return true;
  };

  /* ================= ORDER ================= */
  const createOrder = async (mode) => {
    const user = auth.currentUser;
    if (!user) return alert("Login required");

    const orderRef = push(ref(db, `orders/${user.uid}`));
    await set(orderRef, {
      orderId: orderRef.key,
      items: cartItems,
      total,
      shipping,
      paymentMode: mode,
      status: mode === "COD" ? "Pending" : "Paid",
      date: new Date().toISOString(),
    });

    if (mode !== "COD") await addWalletCoins(total);

    alert("Order placed successfully");
    navigate("/orders");
  };

  /* ================= RAZORPAY ================= */
  const loadRazorpay = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      document.body.appendChild(script);
    });

  const payOnline = async (bnpl = false) => {
    if (!isValid()) return;
    if (bnpl && total < BNPL_MIN_AMOUNT) {
      return alert("BNPL available for ₹3000+");
    }

    await loadRazorpay();

    const user = auth.currentUser;
    const options = {
      key: "rzp_test_RWns7mF99J62t7",
      amount: total * 100,
      currency: "INR",
      name: "Stuvely",
      description: bnpl ? "Pay Later" : "Online Payment",
      handler: async () => {
        await createOrder(bnpl ? "BNPL" : "ONLINE");
      },
      prefill: {
        name: shipping.name,
        email: user?.email,
        contact: shipping.phone,
      },
      method: {
        upi: true,
        card: true,
        emi: true,
        paylater: bnpl,
      },
      theme: { color: "#000000" },
    };

    new window.Razorpay(options).open();
  };

  /* ================= UI ================= */
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-14">
        {/* ================= LEFT ================= */}
        <div className="lg:col-span-2 space-y-12">
          <h1 className="text-3xl font-semibold tracking-wide">
            Checkout
          </h1>

          {/* Wallet */}
          <div className="border p-4 text-sm">
            <strong>Wallet Coins:</strong>{" "}
            <span className="font-semibold">{walletCoins}</span>
            <p className="text-gray-500 mt-1">
              Earn 2% coins on Online & BNPL payments
            </p>
          </div>

          {/* Products */}
          <div className="space-y-6">
            {cartItems.map((item, i) => (
              <div key={i} className="flex gap-6 border-b pb-6">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-32 object-contain bg-gray-100"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Qty {item.quantity}
                  </p>
                </div>
                <div className="font-medium">
                  ₹{item.currentPrice * item.quantity}
                </div>
              </div>
            ))}
          </div>

          {/* Shipping */}
          <div className="space-y-4">
            <h2 className="text-xl font-medium">Shipping Address</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.keys(shipping).map((key) => (
                <input
                  key={key}
                  placeholder={key.toUpperCase()}
                  value={shipping[key]}
                  onChange={(e) =>
                    setShipping({ ...shipping, [key]: e.target.value })
                  }
                  className="border px-4 py-3 focus:outline-none"
                />
              ))}
            </div>
          </div>

          {/* Payment */}
          <div className="space-y-4">
            <h2 className="text-xl font-medium">Payment Method</h2>

            <button
              onClick={() => payOnline(false)}
              className="w-full border py-4 hover:bg-black hover:text-white transition"
            >
              Pay Online / EMI
            </button>

            <button
              onClick={() => payOnline(true)}
              className="w-full border py-4 hover:bg-black hover:text-white transition"
            >
              Buy Now Pay Later (₹3000+)
            </button>

            <button
              onClick={() => isValid() && createOrder("COD")}
              className="w-full border py-4 hover:bg-black hover:text-white transition"
            >
              Cash on Delivery
            </button>
          </div>
        </div>

        {/* ================= RIGHT SUMMARY ================= */}
        <div className="border p-6 h-fit sticky top-24">
          <h3 className="text-lg font-medium mb-6">
            Order Summary
          </h3>

          <div className="flex justify-between mb-3 text-sm">
            <span>Subtotal</span>
            <span>₹{total}</span>
          </div>

          <div className="flex justify-between mb-3 text-sm">
            <span>Shipping</span>
            <span>Free</span>
          </div>

          <div className="flex justify-between border-t pt-4 text-lg font-semibold">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
