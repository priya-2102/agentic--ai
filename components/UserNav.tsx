"use client";

import { useEffect, useState } from "react";
import { UserButton } from "@clerk/nextjs";

export function UserNav() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-7 w-7 rounded-full bg-white/10 animate-pulse" />;
  }

  return <UserButton />;
}
