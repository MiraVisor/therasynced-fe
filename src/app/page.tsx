"use client";

import LandingPage from "@/components/core/LandingPage/page";
import { useAuth } from "@/redux/hooks/useAppHooks";
import { useState, useEffect } from "react";

export default function Home() {
  const { isAuthenticated, token } = useAuth();
  const [hasMounted, setHasMounted] = useState(false);
  console.log("isAuthenticated", isAuthenticated);
  console.log("token", token);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;
  return <>{isAuthenticated ? <>Dashboard</> : <LandingPage />}</>;
}
