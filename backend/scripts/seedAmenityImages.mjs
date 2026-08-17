import mongoose from "mongoose";
import { env } from "../src/config/env.js";
import { Amenity } from "../src/models/amenity.model.js";

const IMAGE_IDS = {
  "Community Clubhouse": "1613490493576-7fde63acd811",
  "Rooftop Sky Lounge": "1544161515-4ab6ce6db874",
  "Gymnasium": "1534438327276-14e5300c3a48",
  "Swimming Pool": "1519315901367-f34ff9154487",
  "Kids Play Area": "1503454537195-1dcabb73ffb9",
  "Tennis Court": "1554068865-24cecd4e34b8",
  "Badminton Court": "1626224583764-f87db24ac4ea",
  "Community Hall": "1519167758481-83f550bb49b3",
  "Yoga & Meditation Room": "1545205597-3d9d02c29597",
  "Library & Reading Room": "1521587760476-6c12a4b040da",
  "Guest Parking Bay": "1506521781263-d8422e82f27a",
  "BBQ & Grill Deck": "1555939594-58d7cb561ad1",
  "Squash Court": "1620742820748-87c09249a72a",
  "Table Tennis Room": "1552667466-07770ae110d0",
  "Cricket Practice Net": "1531415074968-036ba1b575da",
  "Jogging Track": "1461896836934-ffe607ba8211",
  "Amphitheater": "1503095396549-807759245b35",
  "Co-working Lounge": "1497215728101-856f4ea42174",
  "Indoor Games Room": "1511512578047-dfb367046420",
  "Banquet Hall": "1519671482749-fd09be7ccebf",
  "Snooker Room": "1531058020387-3be344556be6",
  "Barbeque Garden": "1544025162-d76694265947",
};

async function main() {
  await mongoose.connect(env.MONGO_URI);
  console.log("Connected to MongoDB.");

  let updated = 0;
  for (const [name, photoId] of Object.entries(IMAGE_IDS)) {
    const url = `https://images.unsplash.com/photo-${photoId}?w=800&q=80&auto=format&fit=crop`;
    const res = await Amenity.updateOne({ name }, { $set: { "image.url": url } });
    if (res.matchedCount > 0) updated++;
  }
  console.log(`Amenity images updated: ${updated}/${Object.keys(IMAGE_IDS).length}`);

  await mongoose.connection.close();
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
