import { Router } from "express";
import { prisma } from "../lib/prisma";
import { AuthedRequest, requireAuth } from "../middleware/requireAuth";
import { computeStatus } from "../lib/status";

export const dashboardRouter = Router();
dashboardRouter.use(requireAuth);

dashboardRouter.get("/summary", async (req: AuthedRequest, res) => {
  const [businessCount, requirements, nudgeCount] = await Promise.all([
    prisma.business.count({ where: { ownerId: req.userId } }),
    prisma.requirement.findMany({ where: { business: { ownerId: req.userId } } }),
    prisma.nudge.count({ where: { requirement: { business: { ownerId: req.userId } } } }),
  ]);

  const counts = { overdue: 0, due_soon: 0, on_track: 0, completed: 0 };
  for (const r of requirements) {
    counts[computeStatus(r.dueDate, r.completedAt)] += 1;
  }

  res.json({ businessCount, nudgesSent: nudgeCount, ...counts });
});
