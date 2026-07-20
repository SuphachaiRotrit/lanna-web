'use client';

import { Suspense } from "react";
import { StatusView } from "@/modules/status/views/StatusView";

export default function StatusPage() {
  return (
    <Suspense fallback={null}>
      <StatusView />
    </Suspense>
  );
}
