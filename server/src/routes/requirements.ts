import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AuthedRequest, requireAuth } from "../middleware/requireAuth";
import { computeStatus } from "../lib/status";

export const requirementsRouter = Router();
requirementsRouter.use(requireAuth);

async function assertOwnsRequirement(requirementId: string, userId: string) {
  return prisma.requirement.findFirst({
    where: { id: requirementId, business: { ownerId: userId } },
  });
}

requirementsRouter.get("/", async (req: AuthedRequest, res) => {
  const { status, type, search } = req.query as Record<string, string | undefined>;

  const requirements = await prisma.requirement.findMany({
    where: {
      type: type ? (type as any) : undefined,
      business: {
        ownerId: req.userId,
        name: search ? { contains: search, mode: "insensitive" } : undefined,
      },
    },
    include: { business: true, nudges: { orderBy: { sentAt: "desc" }, take: 1 } },
    orderBy: { dueDate: "asc" },
  });

  const withStatus = requirements
    .map((r: (typeof requirements)[number]) => ({ ...r, status: computeStatus(r.dueDate, r.completedAt) }))
    .filter((r: { status: string }) => (status ? r.status === status : true));

  res.json(withStatus);
});

const requirementSchema = z.object({
  businessId: z.string().uuid(),
  type: z.enum(["CIPC_ANNUAL_RETURN", "BEE_CERTIFICATE", "UIF_DECLARATION", "COIDA_RETURN", "POPIA_REVIEW", "OTHER"]),
  label: z.string().min(1, "A label is required."),
  dueDate: z.coerce.date(),
  recurrenceUnit: z.enum(["MONTHLY", "YEARLY", "ONCE"]).default("YEARLY"),
  recurrenceEvery: z.number().int().positive().default(1),
});

requirementsRouter.post("/", async (req: AuthedRequest, res) => {
  const parsed = requirementSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input." });
  }

  const business = await prisma.business.findFirst({
    where: { id: parsed.data.businessId, ownerId: req.userId },
  });
  if (!business) return res.status(404).json({ error: "Business not found." });

  const requirement = await prisma.requirement.create({ data: parsed.data });
  res.status(201).json(requirement);
});

requirementsRouter.put("/:id", async (req: AuthedRequest, res) => {
  const existing = await assertOwnsRequirement(req.params.id, req.userId!);
  if (!existing) return res.status(404).json({ error: "Requirement not found." });

  const parsed = requirementSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input." });

  const requirement = await prisma.requirement.update({
    where: { id: existing.id },
    data: parsed.data,
  });
  res.json(requirement);
});

requirementsRouter.post("/:id/complete", async (req: AuthedRequest, res) => {
  const existing = await assertOwnsRequirement(req.params.id, req.userId!);
  if (!existing) return res.status(404).json({ error: "Requirement not found." });

  const requirement = await prisma.requirement.update({
    where: { id: existing.id },
    data: { completedAt: new Date() },
  });
  res.json(requirement);
});

const nudgeSchema = z.object({
  channel: z.enum(["EMAIL", "WHATSAPP"]).default("EMAIL"),
});

requirementsRouter.post("/:id/nudge", async (req: AuthedRequest, res) => {
  const existing = await assertOwnsRequirement(req.params.id, req.userId!);
  if (!existing) return res.status(404).json({ error: "Requirement not found." });

  const parsed = nudgeSchema.safeParse(req.body);
  const channel = parsed.success ? parsed.data.channel : "EMAIL";

  // In production this would call an email provider (e.g. Resend/SES) or the
  // WhatsApp Business API. Logging the intent keeps the demo self-contained.
  const nudge = await prisma.nudge.create({
    data: { requirementId: existing.id, channel, note: "Manually triggered from dashboard." },
  });

  res.status(201).json(nudge);
});

requirementsRouter.delete("/:id", async (req: AuthedRequest, res) => {
  const existing = await assertOwnsRequirement(req.params.id, req.userId!);
  if (!existing) return res.status(404).json({ error: "Requirement not found." });

  await prisma.requirement.delete({ where: { id: existing.id } });
  res.status(204).send();
});
