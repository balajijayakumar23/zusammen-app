import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required for seeding");
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("Seeding database...");

  const hashedPw = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@zusammen.app" },
    update: {},
    create: {
      email: "demo@zusammen.app",
      name: "Demo User",
      password: hashedPw,
    } as any,
  });

  const group = await prisma.group.upsert({
    where: { inviteCode: "demo-group-2026" },
    update: {},
    create: {
      name: "The Core Squad",
      inviteCode: "demo-group-2026",
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { groupId: group.id },
  });

  const today = new Date();

  const friends = [
    {
      name: "Priya Sharma",
      dateOfBirth: new Date(1994, today.getMonth(), today.getDate() + 18),
      hobby: "hiking and outdoor photography",
      city: "Austin, TX",
      notes: "Loves spicy food and anything outdoors",
      addPlan: true,
      planDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 18),
    },
    {
      name: "Marcus Lee",
      dateOfBirth: new Date(1991, (today.getMonth() + 3) % 12, 15),
      hobby: "board games and tabletop RPGs",
      city: "Chicago, IL",
      notes: "Huge fantasy fan, recently into Dungeons & Dragons",
      addPlan: false,
      planDate: null,
    },
    {
      name: "Sofia Reyes",
      dateOfBirth: new Date(1996, (today.getMonth() + 6) % 12, 22),
      hobby: "cooking and food blogging",
      city: "San Francisco, CA",
      notes: "Vegetarian, loves trying new cuisines",
      addPlan: false,
      planDate: null,
    },
  ];

  for (const { addPlan, planDate, ...f } of friends) {
    const existing = await prisma.friend.findFirst({
      where: { groupId: group.id, name: f.name },
    });
    if (!existing) {
      const friend = await prisma.friend.create({
        data: { ...f, groupId: group.id },
      });
      if (addPlan && planDate) {
        await prisma.plan.create({
          data: {
            friendId: friend.id,
            year: today.getFullYear(),
            title: "Sunset Hike + Picnic at Barton Creek",
            description:
              "A scenic sunset hike along Barton Creek Greenbelt followed by a group picnic.",
            location: "Barton Creek Greenbelt, Austin TX",
            plannedDate: planDate,
            status: "confirmed",
            createdById: user.id,
          },
        });
      }
    }
  }

  console.log("Seed complete!");
  console.log("  Demo login: demo@zusammen.app / password123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
