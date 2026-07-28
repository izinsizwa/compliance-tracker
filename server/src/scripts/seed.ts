import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/auth";

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  const email = "demo@compliancetracker.dev";
  const passwordHash = await hashPassword("demo1234");

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: "Demo user", passwordHash },
  });

  const businesses = [
    { name: "Khaya Landscaping", registration: "2019/123456/07" },
    { name: "Vukani Transport", registration: "2021/098765/07" },
    { name: "Thando Hair Studio", registration: "2020/456789/07" },
    { name: "Mzansi Bakery", registration: "2018/321654/07" },
  ];

  for (const b of businesses) {
    await prisma.business.deleteMany({ where: { name: b.name, ownerId: user.id } });
  }

  const [khaya, vukani, thando, mzansi] = await Promise.all(
    businesses.map((b) => prisma.business.create({ data: { ...b, ownerId: user.id } }))
  );

  await prisma.requirement.createMany({
    data: [
      {
        businessId: khaya.id,
        type: "CIPC_ANNUAL_RETURN",
        label: "CIPC annual return",
        dueDate: daysFromNow(-4),
        recurrenceUnit: "YEARLY",
      },
      {
        businessId: vukani.id,
        type: "BEE_CERTIFICATE",
        label: "BEE certificate renewal",
        dueDate: daysFromNow(5),
        recurrenceUnit: "YEARLY",
      },
      {
        businessId: thando.id,
        type: "UIF_DECLARATION",
        label: "UIF declaration",
        dueDate: daysFromNow(18),
        recurrenceUnit: "MONTHLY",
      },
      {
        businessId: mzansi.id,
        type: "POPIA_REVIEW",
        label: "POPIA policy review",
        dueDate: daysFromNow(32),
        recurrenceUnit: "YEARLY",
      },
      {
        businessId: mzansi.id,
        type: "COIDA_RETURN",
        label: "COIDA return of earnings",
        dueDate: daysFromNow(60),
        recurrenceUnit: "YEARLY",
      },
    ],
  });

  console.log("Seeded demo data. Log in with:");
  console.log(`  email:    ${email}`);
  console.log("  password: demo1234");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
