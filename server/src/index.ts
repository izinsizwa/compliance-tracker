import "dotenv/config";
import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth";
import { businessesRouter } from "./routes/businesses";
import { requirementsRouter } from "./routes/requirements";
import { dashboardRouter } from "./routes/dashboard";

const app = express();
const port = process.env.PORT ?? 4000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRouter);
app.use("/api/businesses", businessesRouter);
app.use("/api/requirements", requirementsRouter);
app.use("/api/dashboard", dashboardRouter);

// Centralised error handler so an unexpected exception returns JSON,
// not an HTML stack trace, to the client.
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on our end." });
});

app.listen(port, () => {
  console.log(`Compliance tracker API listening on port ${port}`);
});
