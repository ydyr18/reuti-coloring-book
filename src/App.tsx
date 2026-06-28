import { ColoringReader } from "./ColoringReader";

const PAGES = [
  { id: "01", title: "בים 🏖️",         image_url: "/01_beach.jpg" },
  { id: "02", title: "גלידה 🍦",        image_url: "/02_icecream.jpg" },
  { id: "03", title: "קולנוע 🎬",       image_url: "/03_cinema.jpg" },
  { id: "04", title: "טיול הר ⛰️",     image_url: "/04_mountain.jpg" },
  { id: "05", title: "ירושלים 🕍",      image_url: "/05_jerusalem.jpg" },
  { id: "06", title: "שוק 🧆",          image_url: "/06_market.jpg" },
  { id: "07", title: "באוטו 🚗",        image_url: "/07_car.jpg" },
  { id: "08", title: "ווטרפארק 💦",    image_url: "/08_waterpark.jpg" },
  { id: "09", title: "מדורה 🔥",        image_url: "/09_campfire.jpg" },
  { id: "10", title: "חמניות 🌻",       image_url: "/10_sunflowers.jpg" },
  { id: "11", title: "עפיפון 🪁",       image_url: "/11_kite.jpg" },
  { id: "12", title: "יריד 🎡",         image_url: "/12_fair.jpg" },
  { id: "13", title: "כדורעף 🏐",      image_url: "/13_volleyball.jpg" },
  { id: "14", title: "אופניים 🚲",      image_url: "/14_bicycle.jpg" },
  { id: "15", title: "חווה 🐄",         image_url: "/15_farm.jpg" },
  { id: "16", title: "מפל 💧",          image_url: "/16_waterfall.jpg" },
  { id: "17", title: "מסיבת לילה 🎉",  image_url: "/17_nightparty.jpg" },
  { id: "18", title: "חוג ציור 🎨",    image_url: "/18_artclass.jpg" },
  { id: "19", title: "שקיעה 🌅",       image_url: "/19_sunset.jpg" },
  { id: "20", title: "נרדמת 😴",        image_url: "/20_sleeping.jpg" },
];

export default function App() {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f5f3ff 0%, #fdf4ff 100%)" }}>
      <ColoringReader pages={PAGES} />
    </div>
  );
}
