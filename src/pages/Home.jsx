
import React, { useEffect, useState } from "react";
import Layout from "../component/Layout";
import Keychainsproducts from "./keychains/Keychainsproducts";
import OurCollection from "./ourcollection/Ourcollection";
import OfferSlider from "./Offersliders/Offerslider";
import CategoriesClient from "./bestdeals/CategoriesClient";
import Carcollection from "./car/Carcollection";

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
            }))
          : [];

        const collectionsArray = collectionsData
          ? Object.keys(collectionsData).map((key) => ({
              id: key,
              name: collectionsData[key].name || "Collection",
              category: collectionsData[key].category || "Collection",
              image: collectionsData[key].imageUrl || collectionsData[key].image,
              type: "product",
            }))
          : [];

        const bestDealsArray = bestDealsData
          ? Object.keys(bestDealsData).map((key) => ({
              id: key,
              name: bestDealsData[key].title || "Best Deal",
              category: "Best Deals",
              image: bestDealsData[key].bgImage || bestDealsData[key].image,
              type: "best-deal-product",
            }))
          : [];

        const keychainsArray = keychainsData
          ? Object.keys(keychainsData).map((key) => ({
              id: key,
              name: keychainsData[key].name || "Keychain",
              category: "Keychains",
              image: keychainsData[key].gallery?.[0] || "",
              type: "keychain",
            }))
          : [];

        const carsArray = carsData
          ? Object.keys(carsData).map((key) => ({
              id: key,
              name: carsData[key].name || "Car",
              category: "Cars",
              image: carsData[key].gallery?.[0] || "",
              type: "car",
            }))
          : [];

        setAllProducts([
          ...offersArray,
          ...collectionsArray,
          ...bestDealsArray,
          ...keychainsArray,
          ...carsArray,
        ]);

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

  /* 🔹 LUXURY LOGO LOADER */
  // if (isLoading) {
  //   return (
  //     <div className="h-screen flex items-center justify-center bg-white">
  //       <h1 className="text-2xl md:text-3xl tracking-[0.45em] font-light luxury-glow">
  //         STUVELY
  //       </h1>
  //     </div>
  //   );
  // }

  /* 🔹 MAIN CONTENT */
  return (
    <Layout allProducts={allProducts}>
      <OfferSlider />
      <OurCollection />
      <CategoriesClient />
      <Carcollection cars={cars} />
      <Keychainsproducts keychains={keychains} />
    </Layout>
  );
}

export default Home;
