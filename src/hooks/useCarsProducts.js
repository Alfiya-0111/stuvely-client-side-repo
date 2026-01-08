import { useEffect, useState } from "react";

export default function useCarsProducts() {
  const [cars, setCars] = useState([]);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await fetch(
          "https://stuvely-data-default-rtdb.firebaseio.com/cars.json"
        );
        const data = await res.json();
        if (!data) return;

        const carsArr = Object.entries(data).map(([id, item]) => ({
          id,
          type: "car",
          name: item.name || "Unnamed Car",
          image: item.image || (item.gallery && item.gallery[0]) || "",
          price: Number(item.price) || 0,
          ...item,
        }));

        setCars(carsArr);
      } catch (err) {
        console.error("Error loading cars:", err);
      }
    };

    fetchCars();
  }, []);

  return cars;
}
