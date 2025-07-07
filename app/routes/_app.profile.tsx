import { redirect } from "@remix-run/node";

export const loader = () => {
  return redirect("/settings/profile");
};

export default function Profile() {
  return null;
} 