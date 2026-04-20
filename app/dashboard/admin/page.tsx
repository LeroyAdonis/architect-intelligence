import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { user, visit, site } from "@/lib/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { startOfDay, endOfDay } from "date-fns";
import { AdminDashboardClient } from "./client";

export default async function AdminDashboard() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/");
  
  // @ts-ignore
  if (session.user.role !== "admin") redirect("/dashboard/worker");

  // Fetch all workers
  const workers = await db.select().from(user).where(eq(user.role, "worker"));
  const allSites = await db.select().from(site);

  const now = new Date();
  const start = startOfDay(now);
  const end = endOfDay(now);

  // Fetch today's visits for all workers
  const todayVisits = await db.query.visit.findMany({
      where: and(
          gte(visit.visitDate, start),
          lte(visit.visitDate, end)
      )
  });

  // Calculate worker stats
  const workerStats = workers.map(w => {
      const v = todayVisits.filter(tv => tv.workerId === w.id);
      const km = v.reduce((sum, item) => sum + item.kmCovered, 0);

      const targetVisits = 12;
      const targetKm = w.dailyKmTarget;

      const visitsPercent = Math.min(100, Math.round((v.length / targetVisits) * 100));
      
      const hour = new Date().getHours();
      const expectedPercent = Math.max(0, Math.min(100, ((hour - 8) / 8) * 100));
      
      let flag = "on_track";
      // simplified logic
      if (visitsPercent < expectedPercent - 20) flag = "at_risk";
      if (hour >= 16 && visitsPercent < 100) flag = "missing_target";

      return {
          id: w.id,
          name: w.name,
          email: w.email,
          dailyVisits: v.length,
          targetVisits,
          visitsPercent,
          dailyKm: km,
          targetKm,
          flag
      };
  });

  // Sort by flag severity (missing first, then risk, then track)
  workerStats.sort((a, b) => {
      const rank = { on_track: 2, at_risk: 1, missing_target: 0 };
      return rank[a.flag as keyof typeof rank] - rank[b.flag as keyof typeof rank];
  });

  return (
    <AdminDashboardClient workerStats={workerStats} allSites={allSites} />
  );
}
