"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE, SESSION_OK } from "@/lib/auth";

export async function login(formData: FormData) {
  const password = String(formData.get("password") || "");
  const expected = process.env.APP_PASSWORD || "tiflisi";
  if (password !== expected) {
    redirect("/login?error=1");
  }
  const jar = await cookies();
  jar.set(COOKIE, SESSION_OK, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect("/");
}

export async function logout() {
  const jar = await cookies();
  jar.delete(COOKIE);
  redirect("/login");
}
