import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getMyProfile } from "@/lib/staff.functions";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    try {
      await getMyProfile();
    } catch {
      throw redirect({ to: "/auth" });
    }
  },
  component: () => <Outlet />,
});
