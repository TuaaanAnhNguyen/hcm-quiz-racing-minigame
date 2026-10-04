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
  { id: "pitstop_car_11", name: "Car 11", image: car11 },
  { id: "pitstop_car_12", name: "Car 12", image: car12 },
  { id: "pitstop_car_13", name: "Car 13", image: car13 },
  { id: "pitstop_car_14", name: "Car 14", image: car14 },
  { id: "pitstop_car_15", name: "Car 15", image: car15 },
  { id: "pitstop_car_16", name: "Car 16", image: car16 },
  { id: "pitstop_car_17", name: "Car 17", image: car17 },
  { id: "pitstop_car_18", name: "Car 18", image: car18 },
  { id: "pitstop_car_19", name: "Car 19", image: car19 },
  { id: "pitstop_car_20", name: "Car 20", image: car20 },
];
