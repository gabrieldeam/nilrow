// app/channel/catalog/my/tools/coupon/page.tsx
"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import CouponVisualizationClient from "./CouponVisualizationClient";

export default function CouponPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CouponVisualizationClient />
    </Suspense>
  );
}
