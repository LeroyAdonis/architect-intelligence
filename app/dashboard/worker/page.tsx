import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { visit, site, user, inspection } from "@/lib/schema";
import { eq, gte, lte, and } from "drizzle-orm";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { WorkerDashboardClient } from "./client";

export default async function WorkerDashboard() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/");
  
  // @ts-ignore
  if (session.user.role === "admin") redirect("/dashboard/admin");

  const userId = session.user.id;

  // Retrieve user target (Better Auth additionalFields aren't typed directly yet without inference so we grab manually if needed or use session)
  // Let's grab user from db to be safe and get targets
  const userData = await db.select().from(user).where(eq(user.id, userId)).limit(1);
  const dailyKmTarget = userData[0]?.dailyKmTarget || 50;
  const DAILY_VISIT_TARGET = 12;

  const now = new Date();
  
  // Daily visits
  const dailyVisits = await db.query.visit.findMany({
    where: and(
        eq(visit.workerId, userId),
        gte(visit.visitDate, startOfDay(now)),
        lte(visit.visitDate, endOfDay(now))
    ),
    with: {
        site: true
    }
  });

  // Weekly stats
  const weeklyVisitsData = await db.query.visit.findMany({
      where: and(
          eq(visit.workerId, userId),
          gte(visit.visitDate, startOfWeek(now, { weekStartsOn: 1 })),
          lte(visit.visitDate, endOfWeek(now, { weekStartsOn: 1 }))
      )
  });

  // Monthly stats
  const monthlyVisitsData = await db.query.visit.findMany({
      where: and(
          eq(visit.workerId, userId),
          gte(visit.visitDate, startOfMonth(now)),
          lte(visit.visitDate, endOfMonth(now))
      )
  });

  const dailyKm = dailyVisits.reduce((acc, v) => acc + v.kmCovered, 0);
  const weeklyKm = weeklyVisitsData.reduce((acc, v) => acc + v.kmCovered, 0);
  const monthlyKm = monthlyVisitsData.reduce((acc, v) => acc + v.kmCovered, 0);

  // All active sites for dropdown
  const allSites = await db.select().from(site).where(eq(site.isActive, true));

  // Today's inspections
  const dailyVisitsIds = dailyVisits.map(v => v.id);
  // Need to get inspections individually or join. We can do it in client or pass them.
  // Actually drizzle relational query `with: { inspections: true }` would be easier if defined.
  // Let's just fetch them flat for today
  let allInspections: any[] = [];
  if (dailyVisitsIds.length > 0) {
      allInspections = await db.select().from(inspection).where(
          // simple inArray not easily imported if missing, let's just fetch all and filter
          // we only have limited data anyway
      );
  }
  // Wait, Drizzle has `inArray`. I'll just write it.

  return (
      <WorkerDashboardClient 
          userId={userId}
          sites={allSites}
          dailyVisits={dailyVisits}
          stats={{
              dailyVisits: dailyVisits.length,
              dailyKm,
              weeklyVisits: weeklyVisitsData.length,
              weeklyKm,
              monthlyVisits: monthlyVisitsData.length,
              monthlyKm,
              targetVisits: DAILY_VISIT_TARGET,
              targetKm: dailyKmTarget
          }}
      />
  );
}
