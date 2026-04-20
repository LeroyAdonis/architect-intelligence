import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { SetupButton } from "@/components/setup-button";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import { eq } from "drizzle-orm";

export default async function Page() {
  let session = null;
  let adminExists = false;
  try {
    session = await auth.api.getSession({
      headers: await headers()
    });
    
    const count = await db.select().from(user).where(eq(user.email, "admin@example.com"));
    if (count.length > 0) adminExists = true;
  } catch (e) {
    // Suppress error during build or if DB is not configured yet
  }

  if (session?.user) {
    // @ts-ignore
    if (session.user.role === "admin") {
      redirect("/dashboard/admin");
    } else {
      redirect("/dashboard/worker");
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-muted/40">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">FieldFlow</h1>
          <p className="text-muted-foreground mt-2">KPI & Inspection Dashboard</p>
        </div>
        <LoginForm />
        {!adminExists && (
          <div className="mt-8 border-t pt-6 text-center">
            <h2 className="text-sm font-medium text-muted-foreground mb-4">First time setup? Database empty?</h2>
            <SetupButton />
          </div>
        )}
      </div>
    </main>
  );
}
