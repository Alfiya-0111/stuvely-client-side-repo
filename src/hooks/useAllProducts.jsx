// src/hooks/useAllProducts.js
import { useState, useEffect } from "react";

export default function useAllProducts() {
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const res = await fetch(
          "https://stuvely-data-default-rtdb.firebaseio.com/ourcollections.json"
        );
        const data = await res.json();
        if (!data) return;

        const tempArr = [];

        Object.keys(data).forEach((colKey) => {
          const col = data[colKey];

          // Push collection
          tempArr.push({
            id: colKey,
            name: col.name,
            type: "collection",
            slug: col.slug || col.name.toLowerCase().replace(/\s+/g, "-"),
            image: col.imageUrl,
            category: col.category || "Collection",
          });

          // Push products
          if (col.products) {
            Object.keys(col.products).forEach((prodKey) => {
              const prod = col.products[prodKey];
              tempArr.push({
                id: prodKey,
                name: prod.name,
                type: "product",
                collectionSlug:
                  col.slug || col.name.toLowerCase().replace(/\s+/g, "-"),
                image: prod.imageUrl,
                category: prod.category || col.category || "Product",
                price: prod.price,
                offer: prod.offer,
              });
            });
          }
        });

        setAllProducts(tempArr);
      } catch (err) {
        console.error("Error fetching collections/products:", err);
      }
    };

    fetchAllProducts();
  }, []);

  return allProducts;
}
