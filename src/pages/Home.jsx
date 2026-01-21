import React, { useEffect, useState } from "react";
import Layout from "../component/Layout";
import Keychainsproducts from "./keychains/Keychainsproducts";
import OurCollection from "./ourcollection/Ourcollection";
import OfferSlider from "./Offersliders/Offerslider";
import CategoriesClient from "./bestdeals/CategoriesClient";
import Carcollection from "./car/Carcollection";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

function Home() {
  const [allProducts, setAllProducts] = useState([]);
  const [keychains, setKeychains] = useState([]);
  const [cars, setCars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  /* 🔹 Fetch all products */
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [
          offersRes,
          collectionsRes,
          bestDealsRes,
          keychainsRes,
          carsRes,
        ] = await Promise.all([
          fetch("https://stuvely-data-default-rtdb.firebaseio.com/offersliders.json"),
          fetch("https://stuvely-data-default-rtdb.firebaseio.com/ourcollections.json"),
          fetch("https://stuvely-data-default-rtdb.firebaseio.com/bestdeals.json"),
          fetch("https://stuvely-data-default-rtdb.firebaseio.com/keychains.json"),
          fetch("https://stuvely-data-default-rtdb.firebaseio.com/cars.json"),
        ]);

        const [
          offersData,
          collectionsData,
          bestDealsData,
          keychainsData,
          carsData,
        ] = await Promise.all([
          offersRes.json(),
          collectionsRes.json(),
          bestDealsRes.json(),
          keychainsRes.json(),
          carsRes.json(),
        ]);

        const offersArray = offersData
          ? Object.keys(offersData).map((key) => ({
              id: key,
              name: offersData[key].title || "Offer",
              category: "Offers",
              image: offersData[key].bgImage || offersData[key].image,
              type: "offer-product",
              // IMPORTANT: offers route
              route: `/product/${offersData[key].slug || "offer"}/${key}`,
            }))
          : [];

        const collectionsArray = collectionsData
          ? Object.keys(collectionsData).map((key) => ({
              id: key,
              name: collectionsData[key].name || "Collection",
              category: collectionsData[key].category || "Collection",
              image: collectionsData[key].imageUrl || collectionsData[key].image,
              type: "product",
              // IMPORTANT: collections route
              route: `/collections/${collectionsData[key].slug || key}/product/${key}`,
            }))
          : [];

        const bestDealsArray = bestDealsData
          ? Object.keys(bestDealsData).map((key) => ({
              id: key,
              name: bestDealsData[key].title || "Best Deal",
              category: "Best Deals",
              image: bestDealsData[key].bgImage || bestDealsData[key].image,
              type: "best-deal-product",
              // IMPORTANT: best deals route
              route: `/bestdeals/${bestDealsData[key].slug || key}/product/${key}`,
            }))
          : [];

        const keychainsArray = keychainsData
          ? Object.keys(keychainsData).map((key) => ({
              id: key,
              name: keychainsData[key].name || "Keychain",
              category: "Keychains",
              image: keychainsData[key].gallery?.[0] || "",
              type: "keychain",
              // IMPORTANT: keychains route
              route: `/keychains/${key}`,
            }))
          : [];

        const carsArray = carsData
          ? Object.keys(carsData).map((key) => ({
              id: key,
              name: carsData[key].name || "Car",
              category: "Cars",
              image: carsData[key].gallery?.[0] || "",
              type: "car",
              // IMPORTANT: cars route
              route: `/new-arrivals/${key}`,
            }))
          : [];

        const all = [
          ...offersArray,
          ...collectionsArray,
          ...bestDealsArray,
          ...keychainsArray,
          ...carsArray,
        ];

        setAllProducts(all);
        setKeychains(keychainsArray);
        setCars(carsArray);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchAll();
  }, []);

  /* 🔹 Force loader for 5 seconds */
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  /* 🔹 SEARCH FUNCTION */
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = allProducts.filter((p) =>
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    );

    setSearchResults(results);
  }, [searchQuery, allProducts]);

  /* 🔹 MAIN CONTENT */
  return (
    <Layout allProducts={allProducts}>
      <Helmet>
        <title>Stuvely | Online Shopping & E-commerce Store in India</title>
        <meta
          name="description"
          content="Shop latest fashion, gadgets, accessories & more at Stuvely. Best deals, fast delivery across India."
        />
        <meta property="og:title" content="Stuvely - Online Shopping Store in India" />
        <meta
          property="og:description"
          content="Shop latest fashion, gadgets, accessories & more at Stuvely. Best deals, fast delivery across India."
        />
        <meta property="og:image" content="https://stuvely.com/og-image.jpg" />
        <meta property="og:url" content="https://stuvely.com/" />
        <link rel="canonical" href="https://stuvely.com/" />

        {/* JSON-LD Schema */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "Store",
              "name": "Stuvely",
              "url": "https://stuvely.com",
              "description": "Online shopping store in India for fashion, gadgets, accessories & more",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "IN"
              }
            }
          `}
        </script>
      </Helmet>

      {/* SEARCH BAR */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 border rounded-lg px-4 py-3">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full outline-none"
            placeholder="Search for products, brands, categories..."
          />
          <button
            className="bg-black text-white px-5 py-2 rounded-lg"
            onClick={() => setSearchQuery(searchQuery)}
          >
            Search
          </button>
        </div>

        {/* SEARCH RESULTS */}
        {searchResults.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-3">Search Results</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {searchResults.slice(0, 12).map((p) => (
                <Link
                  key={p.id}
                  to={p.route}
                  className="border rounded-lg p-3 hover:shadow-lg transition"
                >
                  <img src={p.image} alt={p.name} className="h-28 w-full object-cover" />
                  <h3 className="mt-2 text-sm font-medium">{p.name}</h3>
                  <p className="text-xs text-gray-500">{p.category}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* DEFAULT HOME SECTIONS */}
      <OfferSlider />
      <OurCollection />
      <CategoriesClient />
      <Carcollection cars={cars} />
      <Keychainsproducts keychains={keychains} />
    </Layout>
  );
}

export default Home;
