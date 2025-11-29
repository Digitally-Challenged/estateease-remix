import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { logout } from "~/lib/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  return logout(request);
}

export async function action({ request }: ActionFunctionArgs) {
  return logout(request);
}
