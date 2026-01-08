/* Signup.jsx – Email + Google Signup with FCM (H&M / ZARA style) */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, googleProvider } from "../../firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { ref, set, get } from "firebase/database";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { registerFCM } from "../../utils/fcm";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  /* ---------------- EMAIL SIGNUP ---------------- */
  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await set(ref(db, `users/${user.uid}`), {
        email,
        role: "client",
        createdAt: Date.now(),
      });

      await registerFCM();

      toast.success("Signup successful");
      navigate("/");
    } catch (err) {
      toast.error(err.message || "Signup failed");
    }
  };

  /* ---------------- GOOGLE SIGNUP ---------------- */
  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // check if user already exists
      const snapshot = await get(ref(db, `users/${user.uid}`));

      if (!snapshot.exists()) {
        await set(ref(db, `users/${user.uid}`), {
          email: user.email,
          role: "client",
          createdAt: Date.now(),
        });
      }

      await registerFCM();
      toast.success("Signup successful");
      navigate("/");
    } catch (error) {
      toast.error("Google signup failed");
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-light tracking-widest text-center mb-8">
          CREATE ACCOUNT
        </h1>

        <form onSubmit={handleSignup} className="space-y-5">
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-b border-gray-400 py-2 text-sm outline-none focus:border-black"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b border-gray-400 py-2 text-sm outline-none focus:border-black"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-2 text-xs cursor-pointer text-gray-500 hover:text-black"
            >
              {showPassword ? "HIDE" : "SHOW"}
            </span>
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-3 text-sm tracking-widest hover:bg-gray-900 transition"
          >
            CREATE ACCOUNT
          </button>
        </form>

        {/* OR */}
        <div className="my-6 text-center text-xs tracking-widest text-gray-400">
          OR
        </div>

        {/* GOOGLE SIGNUP */}
        <button
          onClick={handleGoogleSignup}
          className="w-full border border-black py-3 text-sm tracking-widest hover:bg-black hover:text-white transition"
        >
          CONTINUE WITH GOOGLE
        </button>

        <p className="text-xs text-gray-400 text-center mt-6 leading-relaxed">
          By creating an account, you agree to our Terms & Conditions and Privacy Policy.
        </p>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </section>
  );
}

export default Signup;
