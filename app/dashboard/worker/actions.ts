"use server";

import { db } from "@/lib/db";
import { visit, inspection, site } from "@/lib/schema";
import { revalidatePath } from "next/cache";

export async function logVisit(data: { siteId: string, customSiteName?: string, customSiteAddress?: string, kmCovered: number, workerId: string }) {
    let finalSiteId = data.siteId;

    if (data.siteId === "NEW" && data.customSiteName) {
        // Create new site
        const newSiteId = `site-${Date.now()}`;
        await db.insert(site).values({
            id: newSiteId,
            name: data.customSiteName,
            address: data.customSiteAddress || "N/A",
            isActive: true,
        });
        finalSiteId = newSiteId;
    }

    const visitId = `v-${Date.now()}`;
    await db.insert(visit).values({
        id: visitId,
        workerId: data.workerId,
        siteId: finalSiteId,
        visitDate: new Date(),
        kmCovered: data.kmCovered,
    });

    revalidatePath("/dashboard/worker");
    return { success: true, visitId };
}

export async function logInspection(data: { visitId: string, itemName: string, notes: string, status: string }) {
    await db.insert(inspection).values({
        id: `i-${Date.now()}`,
        visitId: data.visitId,
        itemName: data.itemName,
        notes: data.notes,
        status: data.status,
        inspectedAt: new Date()
    });

    revalidatePath("/dashboard/worker");
    return { success: true };
}
