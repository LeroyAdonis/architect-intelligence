"use client";
import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function SignOutButton() {
    const router = useRouter();
    return (
        <button 
            className="w-10 h-10 rounded-full bg-slate-100 border-2 border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
            title="Sign Out"
            onClick={async () => {
                await signOut();
                router.push("/");
                router.refresh();
            }}
        >
            <LogOut className="h-4 w-4" />
        </button>
    )
}
