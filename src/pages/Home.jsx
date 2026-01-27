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
