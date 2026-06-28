import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/db/index.js";
import userRoutes from "./src/routes/user.routes.js";
import articleRoutes from "./src/routes/article.route.js";

const app = express();

dotenv.config();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));




app.use("/api/v1/users", userRoutes);
app.use("/api/v1/articles", articleRoutes);




connectDB()
.then(() => {
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server running on port : ${process.env.PORT}`);
    })
})
.catch((error) => {
    console.log("MongoDB connection error", error);
    process.exit(1);
})