"use client";

import React from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Client } from "@/types";
import { useAuthQuery as useQuery } from "@/lib/auth-context";
import { api } from "@/convex/_generated/api";

interface ClientProfileProps {
  client: Client;
}

export function ClientProfile({ client }: ClientProfileProps) {
  // Only fetch if proofImageId exists, otherwise skip query
  const proofImageUrl = useQuery(
    api.storage.getFileUrl,
    client.proofImageId ? { storageId: client.proofImageId } : "skip"
  );

  // Guard against missing client
  if (!client) return null;

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border">
            {proofImageUrl ? (
              <Image
                src={(proofImageUrl as any) as string}
                alt={client.name || "Client avatar"}
                className="object-cover"
                fill
                sizes="64px"
              />
            ) : (
              <User className="h-8 w-8 text-primary" />
            )}
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">{client.name}</CardTitle>
            <p className="text-muted-foreground">
              {client.company || "No company specified"}
            </p>
          </div>
        </div>
        <Badge
          variant={client.status === "active" ? "default" : "secondary"}
          className="capitalize"
        >
          {client.status}
        </Badge>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center gap-3">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{client.email || "N/A"}</span>
        </div>
        <div className="flex items-center gap-3">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{client.phone || "N/A"}</span>
        </div>
        <div className="flex items-center gap-3">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{client.address || "N/A"}</span>
        </div>
      </CardContent>
    </Card>
  );
}