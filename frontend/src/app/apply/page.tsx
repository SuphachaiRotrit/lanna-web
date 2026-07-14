'use client';

import { Suspense } from "react";
import { ApplyView } from "@/modules/apply/views/ApplyView";

export default function ApplyPage() {
  return (
    <Suspense fallback={null}>
      <ApplyView />
    </Suspense>
  );
}
