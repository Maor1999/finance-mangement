import "dotenv/config";
import authRoutes from "./routes/authRoutes.js";
import express from "express";
import errorHandler  from "./errorHandler.js";

const app = express();
app.use(express.json());

app.use('/auth', authRoutes);

app.get('/health', (req, res) => {
res.status(200).send('OK');
});

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
console.log(`Server is running on port ${PORT}`);
});