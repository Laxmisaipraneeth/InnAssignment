import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;

        if (!mongoUri) {
            console.error("FATAL ERROR: MONGO_URI is not defined in the environment variables.");
            process.exit(1);
        }
        await mongoose.connect(mongoUri);
        console.log("MongoDB connected successfully.");

    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    }
};
