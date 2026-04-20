import { redirect } from "next/navigation";

export default function DashboardIndex() {
    // This is just a redirect page if someone hits /dashboard directly
    redirect("/");
}
