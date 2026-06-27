import { logoutAction } from "@/app/actions/auth";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="text-sm text-gray-500 hover:text-gray-900"
      >
        تسجيل الخروج
      </button>
    </form>
  );
}
