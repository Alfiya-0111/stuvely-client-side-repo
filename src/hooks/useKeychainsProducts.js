import { useEffect, useState } from "react";

export default function useKeychainsProducts() {
  const [keychains, setKeychains] = useState([]);

  useEffect(() => {
    const fetchKeychains = async () => {
      try {
        const res = await fetch(
          "https://stuvely-data-default-rtdb.firebaseio.com/keychains.json"
        );
        const data = await res.json();
        if (!data) return;

        const keychainsArr = Object.entries(data).map(([id, item]) => ({
          id,
          type: "keychain",
          name: item.name || "Unnamed Keychain",
          image: item.image || (item.gallery && item.gallery[0]) || "",
          price: Number(item.price) || 0,
          ...item,
        }));

        setKeychains(keychainsArr);
      } catch (err) {
        console.error("Error loading keychains:", err);
      }
    };

    fetchKeychains();
  }, []);

  return keychains;
}
