import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AuthedRequest, requireAuth } from "../middleware/requireAuth";

export const businessesRouter = Router();
businessesRouter.use(requireAuth);

businessesRouter.get("/", async (req: AuthedRequest, res) => {
  const businesses = await prisma.business.findMany({
    where: { ownerId: req.userId },
    orderBy: { name: "asc" },
    include: { _count: { select: { requirements: true } } },
  });
  res.json(businesses);
});

const businessSchema = z.object({
  name: z.string().min(1, "Business name is required."),
  registration: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
});

businessesRouter.post("/", async (req: AuthedRequest, res) => {
  const parsed = businessSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input." });
  }

  const business = await prisma.business.create({
    data: { ...parsed.data, ownerId: req.userId! },
  });
  res.status(201).json(business);
});

businessesRouter.put("/:id", async (req: AuthedRequest, res) => {
  const parsed = businessSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input." });
  }

  const existing = await prisma.business.findFirst({
    where: { id: req.params.id, ownerId: req.userId },
  });
  if (!existing) return res.status(404).json({ error: "Business not found." });

  const business = await prisma.business.update({
    where: { id: existing.id },
    data: parsed.data,
  });
  res.json(business);
});

businessesRouter.delete("/:id", async (req: AuthedRequest, res) => {
  const existing = await prisma.business.findFirst({
    where: { id: req.params.id, ownerId: req.userId },
  });
  if (!existing) return res.status(404).json({ error: "Business not found." });

  await prisma.business.delete({ where: { id: existing.id } });
  res.status(204).send();
});
