"use client";

import SearchBar from "./SearchBar";

const PRODUCTS = [
  { id: "1", name: "iPhone 15 Pro Max", slug: "iphone-15-pro-max", price: 12499, image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400", category: "smartphones", brand: "Apple", tags: ["phone", "apple", "iphone"], rating: 4.9 },
  { id: "2", name: "Samsung Galaxy S24 Ultra", slug: "samsung-galaxy-s24-ultra", price: 10999, image: "https://images.unsplash.com/photo-1614707268917-71c4c5c6bbb6?w=400", category: "smartphones", brand: "Samsung", tags: ["phone", "samsung", "galaxy"], rating: 4.8 },
  { id: "3", name: "MacBook Air M3", slug: "macbook-air-m3", price: 8999, image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400", category: "laptops", brand: "Apple", tags: ["laptop", "apple", "macbook"], rating: 4.9 },
  { id: "4", name: "Sony WH-1000XM5", slug: "sony-wh-1000xm5", price: 2499, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400", category: "audio", brand: "Sony", tags: ["headphones", "sony", "audio", "noise-cancelling"], rating: 4.7 },
  { id: "5", name: "iPad Pro 12.9\"", slug: "ipad-pro-12-9", price: 7499, image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400", category: "tablets", brand: "Apple", tags: ["ipad", "apple", "tablet"], rating: 4.8 },
  { id: "6", name: "Apple Watch Ultra 2", slug: "apple-watch-ultra-2", price: 4499, image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400", category: "wearables", brand: "Apple", tags: ["watch", "apple", "wearable"], rating: 4.9 },
  { id: "7", name: "PlayStation 5", slug: "playstation-5", price: 5499, image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400", category: "gaming", brand: "Sony", tags: ["ps5", "playstation", "gaming", "console"], rating: 4.9 },
  { id: "8", name: "AirPods Pro 2", slug: "airpods-pro-2", price: 1799, image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400", category: "audio", brand: "Apple", tags: ["airpods", "apple", "audio", "earbuds"], rating: 4.8 },
  { id: "9", name: "Dell XPS 15", slug: "dell-xps-15", price: 8999, image: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400", category: "laptops", brand: "Dell", tags: ["laptop", "dell", "xps"], rating: 4.6 },
  { id: "10", name: "Samsung Galaxy Watch 6", slug: "galaxy-watch-6", price: 2299, image: "https://images.unsplash.com/photo-1579586337278-3bef9eb8d38c?w=400", category: "wearables", brand: "Samsung", tags: ["watch", "samsung", "wearable", "galaxy"], rating: 4.7 },
];

export default function SearchBarWrapper() {
  return <SearchBar products={PRODUCTS} />;
}