import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider, db } from "../../firebaseConfig";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { registerFCM } from "../../utils/fcm";
import { ref, get } from "firebase/database";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  /* ---------------- EMAIL LOGIN ---------------- */
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const snapshot = await get(ref(db, `users/${user.uid}/role`));
      const role = snapshot.val();

      if (role === "client") {
        toast.success("Login successful");
        navigate("/");
        await registerFCM();
      } else {
        toast.error("You are not authorized");
      }
    } catch (error) {
      toast.error(error.message || "Login failed");
    }
  };

  /* ---------------- GOOGLE LOGIN ---------------- */
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const snapshot = await get(ref(db, `users/${user.uid}/role`));
      const role = snapshot.val();

      if (role === "client") {
        toast.success("Login successful");
        navigate("/");
        await registerFCM();
      } else {
        toast.error("You are not authorized");
      }
    } catch (error) {
      toast.error("Google login failed");
    }
  };

  /* ---------------- PASSWORD RESET ---------------- */
/* ---------------- PASSWORD RESET ---------------- */
const handlePasswordReset = async () => {
  if (!email) {
    toast.error("Enter your email first");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email, {
      url: "https://stuvely.netlify.app/reset-password",
      handleCodeInApp: true,
    });

    toast.success("Password reset link sent to your email");
  } catch (error) {
    toast.error("Failed to send reset email");
  }
};


  return (
    <section className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-light tracking-widest text-center mb-8">
          SIGN IN
        </h1>

        <form onSubmit={handleLogin} className="space-y-5">
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

          {/* PASSWORD RESET */}
          <button
            type="button"
            onClick={handlePasswordReset}
            className="text-xs tracking-widest text-gray-500 hover:text-black text-left"
          >
            FORGOT PASSWORD?
          </button>

          <button
            type="submit"
            className="w-full bg-black text-white py-3 text-sm tracking-widest hover:bg-gray-900 transition"
          >
            SIGN IN
          </button>
        </form>

        <div className="my-6 text-center text-xs tracking-widest text-gray-400">
          OR
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full border border-black py-3 text-sm tracking-widest hover:bg-black hover:text-white transition"
        >
          CONTINUE WITH GOOGLE
        </button>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </section>
  );
}

export default Login;
