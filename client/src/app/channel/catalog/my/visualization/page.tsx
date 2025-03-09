"use client";

export const dynamic = 'force-dynamic';
import { Suspense } from 'react';
import VisualizationClient from "./VisualizationClient";

export default function VisualizationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VisualizationClient />
    </Suspense>
  );
}