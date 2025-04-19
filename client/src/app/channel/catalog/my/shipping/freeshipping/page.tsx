// app/channel/catalog/my/freeshipping/page.tsx
"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import FreeShippingVisualizationClient from "./FreeShippingVisualizationClient";

export default function FreeShippingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FreeShippingVisualizationClient />
    </Suspense>
  );
}
