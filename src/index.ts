import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import financeiroRoutes from "./routes/financeiroRoutes";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", financeiroRoutes);

app.get("/", (_: Request, res: Response) => {
  res.send("API Fut7Pro SaaS Financial OK");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  // API rodando na porta ${PORT}
});
