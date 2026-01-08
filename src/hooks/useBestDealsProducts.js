import { useEffect, useState } from "react";

export default function useBestDealsProducts() {
  const [bestDealsProducts, setBestDealsProducts] = useState([]);

  useEffect(() => {
    const fetchBestDealsProducts = async () => {
      try {
        const res = await fetch(
          "https://stuvely-data-default-rtdb.firebaseio.com/bestdeals.json"
        );
        const data = await res.json();
        if (!data) return;

        let productsArr = [];

        Object.entries(data).forEach(([dealId, deal]) => {
          const prodsObj = deal.products || {};

          Object.entries(prodsObj).forEach(([pid, prod]) => {
            productsArr.push({
              id: pid,
              dealId,
              type: "best-deal-product",
              name: prod.name || prod.title || "No Name",
              image:
                prod.imageUrl ||
                prod.image ||
                (prod.gallery && prod.gallery[0]) ||
                "", // normalize image
              category: deal.title || deal.category || "Best Deals",
              price: prod.price || 0,
              offer: prod.offer || 0,
              finalPrice: prod.offer
                ? Math.round(prod.price - (prod.price * prod.offer) / 100)
                : prod.price,
              ...prod,
            });
          });
        });

        setBestDealsProducts(productsArr);
      } catch (err) {
        console.error("Error loading best deals products:", err);
      }
    };

    fetchBestDealsProducts();
  }, []);

  return bestDealsProducts;
}
