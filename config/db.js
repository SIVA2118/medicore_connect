import mongoose from "mongoose";

let cached = global.mongoose || { conn: null, promise: null };

export const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("❌ MONGODB_URI is missing");
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false
    });
  }

  cached.conn = await cached.promise;
  global.mongoose = cached;

  console.log("✅ MongoDB Connected");
  return cached.conn;
};
