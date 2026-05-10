
"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function CreateTemplatePage() {
  const router = useRouter();
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (!user) router.push("/admin/login");
      else router.push("/admin/editor/new");
    });
  }, []);
  return null;
}
