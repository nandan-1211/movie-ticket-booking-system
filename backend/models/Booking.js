import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  movieId: { type: String, required: true },
  movieTitle: { type: String, required: true },
  customerName: { type: String, required: true, trim: true },
  seat: { type: String, required: true, trim: true, uppercase: true },
  showTime: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

bookingSchema.index({ movieId: 1, seat: 1, showTime: 1 }, { unique: true });

export default mongoose.model("Booking", bookingSchema);
