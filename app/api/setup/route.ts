import { db } from "@/lib/db";
import { user, site, visit, inspection } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const adminExists = await db.query.user.findFirst({
        where: eq(user.email, "admin@example.com")
    });

    if (adminExists) {
        return NextResponse.json({ message: "Already seeded" });
    }

    // 1. Create Admin
    const adminRes = await auth.api.signUpEmail({
        body: {
            email: "admin@example.com",
            password: "password123",
            name: "System Admin"
        }
    });

    if (adminRes.user) {
        await db.update(user).set({ role: "admin" }).where(eq(user.id, adminRes.user.id));
    }

    // 2. Create Workers
    const w1Res = await auth.api.signUpEmail({
        body: {
            email: "worker1@example.com",
            password: "password123",
            name: "John Worker"
        }
    });
    
    const w2Res = await auth.api.signUpEmail({
        body: {
            email: "worker2@example.com",
            password: "password123",
            name: "Sarah Field"
        }
    });

    const worker1Id = w1Res.user!.id;
    const worker2Id = w2Res.user!.id;

    // Set worker roles and targets
    await db.update(user).set({ role: "worker", dailyKmTarget: 40 }).where(eq(user.id, worker1Id));
    await db.update(user).set({ role: "worker", dailyKmTarget: 60 }).where(eq(user.id, worker2Id));

    // 3. Create Sites
    const siteNames = [
        ["Northside Plaza", "100 North Rd"],
        ["Westend Mall", "200 West St"],
        ["Downtown Office", "300 Center Blvd"],
        ["Southpark Retail", "400 South Ave"],
        ["Eastside Industrial", "500 East Way"],
        ["Central Hub", "600 Main St"],
        ["Riverside Complex", "700 River Dr"],
        ["Hilltop Station", "800 Hill Ct"],
        ["Valley Forge", "900 Valley Ln"],
        ["Airport Logistics", "1000 Airport Rd"],
    ];

    const siteRecords = await db.insert(site).values(
        siteNames.map((s, i) => ({
            id: `site-${i}`,
            name: s[0],
            address: s[1],
            isActive: true,
        }))
    ).returning();

    // 4. Sample Visits & Inspections
    // Worker 1: 5 visits today (falling behind 12/day)
    // Worker 2: 10 visits today (on track)
    const today = new Date();
    
    for (let i = 0; i < 5; i++) {
        const v = await db.insert(visit).values({
            id: `v1-${i}`,
            workerId: worker1Id,
            siteId: siteRecords[i].id,
            visitDate: today,
            kmCovered: 5,
        }).returning();

        await db.insert(inspection).values({
            id: `i1-${i}`,
            visitId: v[0].id,
            itemName: "Fire Safety Equipment",
            notes: i % 2 === 0 ? "All clear" : "Missing extinguisher tag",
            status: i % 2 === 0 ? "ok" : "issue"
        });
    }

    for (let i = 0; i < 10; i++) {
        const v = await db.insert(visit).values({
            id: `v2-${i}`,
            workerId: worker2Id,
            siteId: siteRecords[i].id,
            visitDate: today,
            kmCovered: 4,
        }).returning();

        await db.insert(inspection).values({
            id: `i2-${i}`,
            visitId: v[0].id,
            itemName: "HVAC System",
            notes: "Routine check passed",
            status: "ok"
        });
    }

    return NextResponse.json({ message: "Seed successful!" });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
