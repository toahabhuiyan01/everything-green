import Moongose from "mongoose";

async function dbConnect() {
    if (Moongose.connection.readyState >= 1) {
        return;
    }

    const dbUrl = process.env.MONGODB_URL!;

    try {
        const conn = await Moongose.connect(dbUrl, { dbName: "green" });
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(error);
    }
}

export default dbConnect;
