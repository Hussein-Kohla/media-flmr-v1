import { Suspense } from "react";
import ClientDetailClient from "./client-detail-client";

export default function ClientDetailPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
    <ClientDetailClient />
    </Suspense>
  );
}
