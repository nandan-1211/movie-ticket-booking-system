import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Booking from "./models/Booking.js";

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

const movies = [
  { id: "m1", title: "The Last Orbit", genre: "Sci-Fi", duration: "2h 08m", price: 180 },
  { id: "m2", title: "Monsoon Letters", genre: "Drama", duration: "1h 54m", price: 150 },
  { id: "m3", title: "Midnight Chase", genre: "Thriller", duration: "2h 01m", price: 200 }
];

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.get("/api/movies", (_req, res) => res.json(movies));

app.get("/api/bookings", async (_req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 }).limit(100);
    res.json(bookings);
  } catch {
    res.status(500).json({ message: "Could not fetch bookings." });
  }
});

app.post("/api/bookings", async (req, res) => {
  const { movieId, movieTitle, customerName, seat, showTime } = req.body || {};
  if (![movieId, movieTitle, customerName, seat, showTime].every(
    value => typeof value === "string" && value.trim()
  )) {
    return res.status(400).json({ message: "All booking fields are required." });
  }

  try {
    const booking = await Booking.create({
      movieId, movieTitle, customerName: customerName.trim(),
      seat: seat.trim().toUpperCase(), showTime
    });
    res.status(201).json({ message: "Booking created.", booking });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "That seat is already booked for this show." });
    }
    res.status(500).json({ message: "Could not create booking. Check MongoDB connection." });
  }
});

const port = Number(process.env.PORT || 5000);
try {
  if (process.env.MONGODB_URI) {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
  } else {
    console.warn("MONGODB_URI is missing. Set it in backend/.env");
  }
} catch (error) {
  console.error("MongoDB connection failed:", error.message);
}

app.listen(port, () => console.log(`API running at http://localhost:${port}`));
