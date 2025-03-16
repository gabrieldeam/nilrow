"use client";

export const dynamic = "force-dynamic";
import { Suspense } from "react";
import DeliveryVisualizationClient from "./DeliveryVisualizationClient";

export default function DeliveryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DeliveryVisualizationClient />
    </Suspense>
  );
}
