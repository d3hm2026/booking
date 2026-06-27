import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function Home() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const destination =
    session.role === "admin"
      ? "/admin"
      : session.role === "owner"
      ? "/owner"
      : "/cleaner";

  redirect(destination);
}
