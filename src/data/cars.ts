// src/data/cars.ts

export interface CarOption {
  id: string;
  name: string;
  image: string;
}

import car11 from "../assets/pitstop_car_11.png";
import car12 from "../assets/pitstop_car_12.png";
import car13 from "../assets/pitstop_car_13.png";
import car14 from "../assets/pitstop_car_14.png";
import car15 from "../assets/pitstop_car_15.png";
import car16 from "../assets/pitstop_car_16.png";
import car17 from "../assets/pitstop_car_17.png";
import car18 from "../assets/pitstop_car_18.png";
import car19 from "../assets/pitstop_car_19.png";
import car20 from "../assets/pitstop_car_20.png";

export const CAR_OPTIONS: CarOption[] = [
  { id: "pitstop_car_11", name: "Xe đua 1", image: car11 },
  { id: "pitstop_car_12", name: "Xe đua 2", image: car12 },
  { id: "pitstop_car_13", name: "Xe đua 3", image: car13 },
  { id: "pitstop_car_14", name: "Xe đua 4", image: car14 },
  { id: "pitstop_car_15", name: "Xe đua 5", image: car15 },
  { id: "pitstop_car_16", name: "Xe đua 6", image: car16 },
  { id: "pitstop_car_17", name: "Xe đua 7", image: car17 },
  { id: "pitstop_car_18", name: "Xe đua 8", image: car18 },
  { id: "pitstop_car_19", name: "Xe đua 9", image: car19 },
  { id: "pitstop_car_20", name: "Xe đua 10", image: car20 },
];
