import React, { useEffect, useState, useRef } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { FaCartShopping } from "react-icons/fa6";
import { MdPhone } from "react-icons/md";
import { BsFillMicFill } from "react-icons/bs";

import { auth } from "../firebaseConfig";
import { getDatabase, ref, onValue } from "firebase/database";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { HiOutlineMenu } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import useAllProducts from "../hooks/useAllProducts";
import useOfferProducts from "../hooks/useOfferProducts";
import useBestDealsProducts from "../hooks/useBestDealsProducts";
import useKeychainsProducts from "../hooks/useKeychainsProducts";
import useCarsProducts from "../hooks/useCarsProducts";

function Nav() {
  const [data, setData] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [mobileMenu, setMobileMenu] = useState(false);
 
  const db = getDatabase();
  const navigate = useNavigate();
  const searchBoxRef = useRef();
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const allProducts = useAllProducts();
  const offerProducts = useOfferProducts();
  const bestDealsProducts = useBestDealsProducts();
  const keychains = useKeychainsProducts();
  const cars = useCarsProducts();

  const combinedProducts = [
    ...(allProducts || []),
    ...(offerProducts || []),
    ...(bestDealsProducts || []),
    ...(keychains || []),
    ...(cars || []),
  ];

  /* ---------------- LOGO ---------------- */
  useEffect(() => {
    fetch("https://stuvely-data-default-rtdb.firebaseio.com/logodata.json")
      .then((res) => res.json())
      .then((result) => setData(result))
      .catch(console.error);
  }, []);

  /* ---------------- AUTH + CART ---------------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        const cartRef = ref(db, `carts/${user.uid}`);
        onValue(cartRef, (snap) => {
          const cartData = snap.val();
          setCartCount(cartData ? Object.keys(cartData).length : 0);
        });
      } else setCartCount(0);
    });
    return () => unsub();
  }, []);

  /* ---------------- CLICK OUTSIDE ---------------- */
  useEffect(() => {
    const handler = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ---------------- VOICE SEARCH ---------------- */
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window))
      return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";

    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setSearchTerm(text);
      setIsListening(false);
      triggerSearch(text);
    };
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    navigate("/login");
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim()) {
      const filtered = combinedProducts.filter(
        (p) =>
          p.name?.toLowerCase().includes(value.toLowerCase()) ||
          p.category?.toLowerCase().includes(value.toLowerCase())
      );

      setSuggestions(
        filtered.length ? filtered.slice(0, 8) : [{ id: null, name: "No result found" }]
      );
    } else setSuggestions([]);
  };

  const handleClickSuggestion = (item) => {
    if (!item.id) return;

    switch (item.type) {
      case "best-deal-product":
        navigate(`/bestdeals/${item.dealId}/product/${item.id}`);
        break;
      case "offer-product":
        navigate(`/product/${item.sliderSlug}/${item.id}`);
        break;
      case "product":
        item.collectionSlug
          ? navigate(`/collections/${item.collectionSlug}/${item.id}`)
          : navigate("/collections");
        break;
      case "collection":
        navigate(`/collections/${item.slug}`);
        break;
      case "keychain":
        navigate(`/keychains/${item.id}`);
        break;
      case "car":
        navigate(`/cars/${item.id}`);
        break;
      default:
        break;
    }

    setSearchTerm("");
    setSuggestions([]);
  };

  const triggerSearch = (term) => {
    const match = combinedProducts.find((p) =>
      p.name?.toLowerCase().includes(term.toLowerCase())
    );
    match ? handleClickSuggestion(match) : alert("No result found");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    triggerSearch(searchTerm);
  };

  const handleVoiceClick = () => {
    if (!recognitionRef.current) return;
    isListening
      ? recognitionRef.current.stop()
      : recognitionRef.current.start();
    setIsListening(!isListening);
  };

  return (
    <header className="top-0 z-50 bg-white/90 backdrop-blur shadow relative">

      {/* ---------------- DESKTOP HEADER ---------------- */}
      <div className="hidden md:flex items-center justify-between px-10 py-3">

        {/* LOGO */}
        <div onClick={() => navigate("/")} className="cursor-pointer">
          {data?.logo?.type === "text" ? (
            <h1 className="text-3xl bg-black bg-clip-text logo">{data.logo.value || "Stuvely"}</h1>
          ) : (
            <img src={data?.logo?.value} className="h-10" alt="logo" />
          )}
        </div>

        {/* SEARCH */}
        <div
          ref={searchBoxRef}
          className="w-[40%]"
        >
          <form
            onSubmit={handleSearch}
            className="flex items-center bg-gray-100 rounded-full px-4 py-2"
          >
            <IoSearchOutline className="text-xl text-gray-500" />
            <input
              value={searchTerm}
              onChange={handleChange}
              placeholder="Search products..."
              className="bg-transparent w-full px-3 outline-none text-sm"
            />
            <button type="button" onClick={handleVoiceClick} className="text-lg">
              <BsFillMicFill />
            </button>
          </form>

          {suggestions.length > 0 && (
            <ul className="absolute w-full bg-white shadow-xl rounded-xl mt-2 z-50 max-h-96 overflow-y-auto">
              {suggestions.map((p, i) => {
                const img = p.image || p.productImage || (p.gallery && p.gallery[0]);
                return (
                  <li
                    key={i}
                    onClick={() => p.id && handleClickSuggestion(p)}
                    className={`flex items-center gap-3 px-4 py-2 ${
                      p.id ? "hover:bg-gray-100 cursor-pointer" : "text-gray-400"
                    }`}
                  >
                    {img && (
                      <img
                        src={typeof img === "string" ? img : img?.url}
                        className="w-10 h-10 object-cover rounded"
                        alt={p.name}
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      {p.category && <p className="text-xs text-gray-500">{p.category}</p>}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* RIGHT DESKTOP */}
        <div className="flex items-center gap-6 text-sm font-medium">
          {/* ACCOUNT */}
      <div className="relative group">
  <button className="hover:text-indigo-600 px-2 py-1">
    {currentUser
      ? currentUser.displayName || currentUser.email.split("@")[0]
      : "Account"}
  </button>

  <ul
    className="absolute right-0 top-full hidden group-hover:block 
               bg-white shadow-xl rounded-xl w-52 p-2 mt-0"
  >
    {currentUser ? (
      <>
        <Link to="/profile" className="block px-3 py-2 hover:bg-gray-100 rounded-lg">
          My Profile
        </Link>
        <Link to="/orders" className="block px-3 py-2 hover:bg-gray-100 rounded-lg">
          Orders
        </Link>
        <Link to="/wishlist" className="block px-3 py-2 hover:bg-gray-100 rounded-lg">
          Wishlist
        </Link>
        <button
          onClick={handleLogout}
          className="block w-full text-left px-3 py-2 text-red-500 hover:bg-gray-100 rounded-lg"
        >
          Logout
        </button>
      </>
    ) : (
      <>
        <Link to="/login" className="block px-3 py-2 hover:bg-gray-100 rounded-lg">
          Login
        </Link>
        <Link to="/signup" className="block px-3 py-2 hover:bg-gray-100 rounded-lg">
          Sign Up
        </Link>
      </>
    )}
  </ul>
</div>


          {/* CART */}
          <div onClick={() => navigate("/cart")} className="relative cursor-pointer">
            <FaCartShopping className="text-2xl" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs px-1.5 rounded-full">
                {cartCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 cursor-pointer" onClick={() => navigate("/contact")}>
            <MdPhone className="text-2xl" /> Contact
          </div>
        </div>
      </div>

      {/* ---------------- MOBILE HEADER ---------------- */}
      <div className="flex items-center justify-between px-4 py-3 md:hidden">

        {/* LOGO */}
        <div onClick={() => navigate("/")} className="cursor-pointer">
          {data?.logo?.type === "text" ? (
            <h1 className="text-2xl font-bold">{data.logo.value || "Stuvely"}</h1>
          ) : (
            <img src={data?.logo?.value} className="h-8" alt="logo" />
          )}
        </div>

        {/* CART + USER + MENU */}
        <div className="flex items-center gap-4">
          {/* CART */}
          <div onClick={() => navigate("/cart")} className="relative cursor-pointer">
            <FaCartShopping className="text-2xl" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs px-1.5 rounded-full">
                {cartCount}
              </span>
            )}
          </div>

          {/* USER */}
          <div className="cursor-pointer" onClick={() => navigate(currentUser ? "/profile" : "/login")}>
            {currentUser
              ? currentUser.displayName || currentUser.email.split("@")[0]
              : "Account"}
          </div>

          {/* MENU BUTTON */}
          <button onClick={() => setMobileMenu(!mobileMenu)} className="text-2xl">
            {mobileMenu ? <IoClose /> : <HiOutlineMenu/>}
          </button>
        </div>
      </div>

      {/* ---------------- MOBILE MENU ---------------- */}
    


{/* SEARCH BAR BELOW NAVBAR */}
<div className="md:hidden bg-white px-4 py-3 border-b shadow-sm">
  <form onSubmit={handleSearch} className="flex items-center bg-gray-100 rounded-full px-3 py-2">
    <IoSearchOutline className="text-gray-500 text-xl" />
    <input
      value={searchTerm}
      onChange={handleChange}
      placeholder="Search products..."
      className="bg-transparent w-full px-2 outline-none text-sm"
    />
    <button type="button" onClick={handleVoiceClick} className="text-gray-600">
      <BsFillMicFill />
    </button>
  </form>
</div>

{/* MENU DROPDOWN LINKS */}
{mobileMenu && (
  <div className="md:hidden bg-white border-t shadow-lg px-4 py-4 space-y-3">
    <Link to="/collections" className="block px-2 py-2 hover:bg-gray-100 rounded">Collections</Link>
    <Link to="/bestdeals" className="block px-2 py-2 hover:bg-gray-100 rounded">Best Deals</Link>
    <Link to="/offers" className="block px-2 py-2 hover:bg-gray-100 rounded">Offers</Link>
    <div onClick={() => navigate("/contact")} className="flex items-center gap-1 px-2 py-2 hover:bg-gray-100 rounded cursor-pointer">
      <MdPhone /> Contact
    </div>

    {currentUser ? (
      <>
        <Link to="/profile" className="block px-2 py-2 hover:bg-gray-100 rounded">Profile</Link>
        <Link to="/orders" className="block px-2 py-2 hover:bg-gray-100 rounded">Orders</Link>
        <Link to="/wishlist" className="block px-2 py-2 hover:bg-gray-100 rounded">Wishlist</Link>
        <button onClick={handleLogout} className="w-full text-left px-2 py-2 text-red-500 hover:bg-gray-100 rounded">Logout</button>
      </>
    ) : (
      <>
        <Link to="/login" className="block px-2 py-2 hover:bg-gray-100 rounded">Login</Link>
        <Link to="/signup" className="block px-2 py-2 hover:bg-gray-100 rounded">Sign Up</Link>
      </>
    )}
  </div>
)}


    </header>
  );
}

export default Nav;
