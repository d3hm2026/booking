import { requireRole } from "@/lib/require-role";
import { AdminShell } from "./admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole(["admin"]);

  return <AdminShell fullName={session.fullName}>{children}</AdminShell>;
}
