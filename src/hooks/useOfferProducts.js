import { useEffect, useState } from "react";

export default function useOfferProducts() {
  const [offerProducts, setOfferProducts] = useState([]);

  useEffect(() => {
    const fetchOfferProducts = async () => {
      try {
        const res = await fetch(
          "https://stuvely-data-default-rtdb.firebaseio.com/offersliders.json"
        );
        const data = await res.json();
        if (!data) return;

        let productsArr = [];

        Object.entries(data).forEach(([sliderId, slider]) => {
          const prodsObj = slider.products || {};
          const sliderSlug = slider.slug || slider.title?.toLowerCase().replace(/\s+/g, "-");

          Object.keys(prodsObj).forEach((pid) => {
            const prod = prodsObj[pid];
            productsArr.push({
              id: pid,
              sliderSlug,
              type: "offer-product",
              name: prod.name || prod.title || "No Name",
              image: prod.image || prod.imageUrl || (prod.gallery && prod.gallery[0]) || "", // <--- normalize image
              category: prod.category || slider.title || "",
              ...prod,
            });
          });
        });

        setOfferProducts(productsArr);
      } catch (err) {
        console.error("Error loading offer products:", err);
      }
    };

    fetchOfferProducts();
  }, []);

  return offerProducts;
}
