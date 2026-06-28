import { ColoringReader } from "./ColoringReader";

const BASE = import.meta.env.BASE_URL;

const PAGES = [
  { id: "01", title: "בים 🏖️",         image_url: `${BASE}01_beach.jpg` },
  { id: "02", title: "גלידה 🍦",        image_url: `${BASE}02_icecream.jpg` },
  { id: "03", title: "קולנוע 🎬",       image_url: `${BASE}03_cinema.jpg` },
  { id: "04", title: "טיול הר ⛰️",     image_url: `${BASE}04_mountain.jpg` },
  { id: "05", title: "ירושלים 🕍",      image_url: `${BASE}05_jerusalem.jpg` },
  { id: "06", title: "שוק 🧆",          image_url: `${BASE}06_market.jpg` },
  { id: "07", title: "באוטו 🚗",        image_url: `${BASE}07_car.jpg` },
  { id: "08", title: "ווטרפארק 💦",    image_url: `${BASE}08_waterpark.jpg` },
  { id: "09", title: "מדורה 🔥",        image_url: `${BASE}09_campfire.jpg` },
  { id: "10", title: "חמניות 🌻",       image_url: `${BASE}10_sunflowers.jpg` },
  { id: "11", title: "עפיפון 🪁",       image_url: `${BASE}11_kite.jpg` },
  { id: "12", title: "יריד 🎡",         image_url: `${BASE}12_fair.jpg` },
  { id: "13", title: "כדורעף 🏐",      image_url: `${BASE}13_volleyball.jpg` },
  { id: "14", title: "אופניים 🚲",      image_url: `${BASE}14_bicycle.jpg` },
  { id: "15", title: "חווה 🐄",         image_url: `${BASE}15_farm.jpg` },
  { id: "16", title: "מפל 💧",          image_url: `${BASE}16_waterfall.jpg` },
  { id: "17", title: "מסיבת לילה 🎉",  image_url: `${BASE}17_nightparty.jpg` },
  { id: "18", title: "חוג ציור 🎨",    image_url: `${BASE}18_artclass.jpg` },
  { id: "19", title: "שקיעה 🌅",       image_url: `${BASE}19_sunset.jpg` },
  { id: "20", title: "נרדמת 😴",        image_url: `${BASE}20_sleeping.jpg` },
];

export default function App() {
  return <ColoringReader pages={PAGES} />;
}
