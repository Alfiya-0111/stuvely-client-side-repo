import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { confirmPasswordReset } from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import { ref, get } from "firebase/database";
import { toast, ToastContainer } from "react-toastify";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [logoData, setLogoData] = useState(null);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oobCode = searchParams.get("oobCode");

  /* ---------- FETCH LOGO ---------- */
  useEffect(() => {
    const fetchLogo = async () => {
      const snapshot = await get(ref(db, "settings"));
      if (snapshot.exists()) {
        setLogoData(snapshot.val());
      }
    };
    fetchLogo();
  }, []);

  /* ---------- RESET PASSWORD ---------- */
  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await confirmPasswordReset(auth, oobCode, password);
      toast.success("Password updated successfully");
      setTimeout(() => navigate("/login"), 2000);
    } catch {
      toast.error("Invalid or expired link");
    }
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      
      {/* LOGO – H&M / ZARA STYLE */}
      <div
        className="mb-12 cursor-pointer"
        onClick={() => navigate("/")}
      >
        {logoData?.logo?.type === "text" ? (
          <h1 className="text-3xl tracking-widest font-light">
            {logoData.logo.value || "STUVELY"}
          </h1>
        ) : (
          <img
            src={logoData?.logo?.value}
            alt="logo"
            className="h-10 md:h-12 object-contain"
          />
        )}
      </div>

      {/* CARD */}
      <div className="w-full max-w-md">
        <h2 className="text-2xl tracking-widest text-center mb-8">
          RESET PASSWORD
        </h2>

        <form onSubmit={handleReset} className="space-y-6">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b border-gray-400 py-3 text-sm tracking-wide outline-none focus:border-black transition"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-3 text-xs cursor-pointer text-gray-500 hover:text-black"
            >
              {showPassword ? "HIDE" : "SHOW"}
            </span>
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-3 text-sm tracking-widest hover:bg-gray-900 transition"
          >
            UPDATE PASSWORD
          </button>
        </form>

        <p
          onClick={() => navigate("/login")}
          className="mt-8 text-center text-xs tracking-widest text-gray-400 cursor-pointer hover:text-black"
        >
          BACK TO LOGIN
        </p>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </section>
  );
}
