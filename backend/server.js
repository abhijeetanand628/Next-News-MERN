import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./src/db/index.js";
import userRoutes from "./src/routes/user.routes.js";
import articleRoutes from "./src/routes/article.route.js";
import commentRoutes from "./src/routes/comment.route.js";
import newsRoutes from "./src/routes/news.route.js";

const app = express();


app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));


app.use("/api/v1/users", userRoutes);
app.use("/api/v1/articles", articleRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/news", newsRoutes);


connectDB()
    .then(() => {
        const PORT = process.env.PORT || 3000;

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on port: ${PORT}`);
        });
    })
    .catch((error) => {
        console.log("MongoDB connection error", error);
        process.exit(1);
    });