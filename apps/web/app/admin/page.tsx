import { redirect } from "next/navigation";

import { appRoutes } from "@/src/shared/config/routes";

export default function AdminPage() {
  redirect(appRoutes.adminLogin);
}
