"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface SOP {
  id: string;
  title: string;
  users: User[];
}

export default function ManageAccessPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [sops, setSOPs] = useState<SOP[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

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
          title: "Error",
          description: "Failed to load data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

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
        title: "Success",
        description: "Users assigned successfully",
      });

      // Refresh the SOPs data
      const updatedSopsResponse = await fetch("/api/sops");
      const updatedSopsData = await updatedSopsResponse.json();
      setSOPs(updatedSopsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign users",
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