"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { COOKIE, SESSION_OK } from "@/lib/auth";
import {
  MIN_PASSWORD_LEN,
  checkPassword,
  getPasswordState,
  hashPassword,
} from "@/lib/password";

async function createSession() {
  const jar = await cookies();
  jar.set(COOKIE, SESSION_OK, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function login(formData: FormData) {
  const password = String(formData.get("password") || "");
  if (!(await checkPassword(password))) {
    redirect("/login?error=1");
  }
  await createSession();
  redirect("/");
}

export async function setInitialPassword(formData: FormData) {
  const state = await getPasswordState();
  if (!state.needsSetup) {
    redirect("/login");
  }
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");
  if (password.length < MIN_PASSWORD_LEN) {
    redirect("/login?error=short");
  }
  if (password !== confirm) {
    redirect("/login?error=mismatch");
  }
  await prisma.setting.update({
    where: { id: "default" },
    data: { passwordHash: await hashPassword(password) },
  });
  await createSession();
  redirect("/");
}

export async function changePassword(formData: FormData) {
  const current = String(formData.get("current") || "");
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");
  const state = await getPasswordState();
  if (state.configured && !(await checkPassword(current))) {
    redirect("/settings?pw=current");
  }
  if (password.length < MIN_PASSWORD_LEN) {
    redirect("/settings?pw=short");
  }
  if (password !== confirm) {
    redirect("/settings?pw=mismatch");
  }
  await prisma.setting.update({
    where: { id: "default" },
    data: { passwordHash: await hashPassword(password) },
  });
  revalidatePath("/settings");
  redirect("/settings?pw=ok");
}

export async function logout() {
  const jar = await cookies();
  jar.delete(COOKIE);
  redirect("/login");
}
