import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/signout-button";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    redirect("/");
  }

  // @ts-ignore
  const role = session.user.role;
  const targetHome = role === "admin" ? "/dashboard/admin" : "/dashboard/worker";

  return (
    <div className="bg-slate-50 text-slate-900 font-sans min-h-screen flex flex-col">
      <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white rounded-sm rotate-45"></div>
          </div>
          <Link href={targetHome}>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">
              FieldForce <span className="text-blue-600 italic">KPI</span>
            </h1>
          </Link>
          <span className="hidden sm:inline-block ml-4 px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider">{role} Panel</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold">{session.user.name}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">{role} Account</span>
          </div>
          <SignOutButton />
        </div>
      </header>
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 flex flex-col">
        {children}
      </main>
      <footer className="h-10 bg-white border-t border-slate-200 px-8 flex items-center justify-between flex-shrink-0 text-[10px] text-slate-400 uppercase tracking-widest mt-auto">
        <div className="flex gap-4">
          <span>DB: Connected (Neon PostgreSQL)</span>
        </div>
        <div className="flex gap-4">
          <span className="text-blue-600 font-bold">System Normal</span>
        </div>
      </footer>
    </div>
  );
}
