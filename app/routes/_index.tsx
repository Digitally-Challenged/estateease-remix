import type { MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "EstateEase - Estate Planning Management" },
    { name: "description", content: "Comprehensive estate planning management for Nick and Kelsey Coleman" },
  ];
};

export const loader = () => {
  return redirect("/dashboard");
};

export default function Index() {
  return null;
}