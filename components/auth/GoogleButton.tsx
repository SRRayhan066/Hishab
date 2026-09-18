"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { GoogleIcon } from "@/components/icons/GoogleIcon";

export function GoogleButton({ label }: { label: string }) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const reset = () => setLoading(false);
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);

  const handleClick = () => {
    setLoading(true);
    window.location.assign("/api/auth/google");
  };

  return (
    <Button variant="outline" loading={loading} onClick={handleClick}>
      {!loading && <GoogleIcon className="h-5 w-5 flex-none" />}
      {label}
    </Button>
  );
}
