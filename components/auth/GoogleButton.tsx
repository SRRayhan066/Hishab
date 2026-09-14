"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { fakeRequest } from "@/lib/utils";

export function GoogleButton({ label }: { label: string }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    await fakeRequest();
    console.log("google sign in requested");
    setLoading(false);
  };

  return (
    <Button variant="outline" loading={loading} onClick={handleClick}>
      {!loading && <GoogleIcon className="h-5 w-5 flex-none" />}
      {label}
    </Button>
  );
}
