import express, { Express } from "express";
import mongoose, { ConnectOptions } from "mongoose";
import dotenv from "dotenv";
import twilioRoutes from "./routes/twilioRoutes";

const app: Express = express();

// Middlewares
dotenv.config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const mongoUri = process.env.MONGODB_URI!; // Your MongoDB URI
mongoose
  .connect(mongoUri, {
    serverSelectionTimeoutMS: 30000,
  } as ConnectOptions)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Failed to connect to MongoDB: " + err);
  });

// Routes
// app.use('/api', routes);
app.use(twilioRoutes);

export default app;
