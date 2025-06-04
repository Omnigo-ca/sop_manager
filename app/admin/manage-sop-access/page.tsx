"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";

interface User {
  id: string;
  name: string;
  role?: string;
}

interface SOP {
  id: string;
  title: string;
  users: User[];
}

export default function ManageSOPAccessPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [sops, setSOPs] = useState<SOP[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("/api/user");
        if (!response.ok) {
          throw new Error("Failed to fetch current user");
        }
        const userData = await response.json();
        setCurrentUser(userData);
        
        // Redirect if not admin
        if (userData.role !== "ADMIN") {
          redirect("/");
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
        redirect("/");
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sopsResponse, usersResponse] = await Promise.all([
          fetch("/api/sops"),
          fetch("/api/users")
        ]);

        if (!sopsResponse.ok || !usersResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const sopsData = await sopsResponse.json();
        const usersData = await usersResponse.json();

        setSOPs(sopsData);
        setUsers(usersData);
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les données",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.role === "ADMIN") {
      fetchData();
    }
  }, [toast, currentUser]);

  const handleAssignUsers = async (sopId: string, userIds: string[]) => {
    try {
      const response = await fetch(`/api/sop-access/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sopId,
          userIds,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to assign users");
      }

      toast({
        title: "Succès",
        description: "Les utilisateurs ont été assignés avec succès",
      });

      // Refresh the SOPs data
      const updatedSopsResponse = await fetch("/api/sops");
      const updatedSopsData = await updatedSopsResponse.json();
      setSOPs(updatedSopsData);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'assigner les utilisateurs",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-8">Associer les procédures</h1>
      <DataTable
        columns={columns(users, handleAssignUsers)}
        data={sops}
      />
    </div>
  );
} 