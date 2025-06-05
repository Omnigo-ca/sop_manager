"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, FileText, Plus, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AccessGroup {
  id: string;
  name: string;
  description: string;
  type: 'INTERNAL' | 'PUBLIC' | 'ADMIN';
  _count: {
    sops: number;
    users: number;
  };
  users: Array<{
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  }>;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function ManageAccessGroupsPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [accessGroups, setAccessGroups] = useState<AccessGroup[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<AccessGroup | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

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
        const [groupsResponse, usersResponse] = await Promise.all([
          fetch("/api/access-groups"),
          fetch("/api/users")
        ]);

        if (!groupsResponse.ok || !usersResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const groupsData = await groupsResponse.json();
        const usersData = await usersResponse.json();

        setAccessGroups(groupsData);
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

  const handleAssignUsers = async (groupId: string, userIds: string[]) => {
    try {
      const response = await fetch(`/api/access-groups/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessGroupId: groupId,
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

      // Refresh the data
      const updatedGroupsResponse = await fetch("/api/access-groups");
      const updatedGroupsData = await updatedGroupsResponse.json();
      setAccessGroups(updatedGroupsData);
      setIsAssignDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'assigner les utilisateurs",
        variant: "destructive",
      });
    }
  };

  const getGroupTypeColor = (type: string) => {
    switch (type) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'INTERNAL':
        return 'bg-blue-100 text-blue-800';
      case 'PUBLIC':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getGroupTypeName = (type: string) => {
    switch (type) {
      case 'ADMIN':
        return 'Administrateurs';
      case 'INTERNAL':
        return 'Internes';
      case 'PUBLIC':
        return 'Publiques';
      default:
        return type;
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Gestion des groupes d'accès</h1>
          <p className="text-muted-foreground">
            Organisez les accès aux procédures par groupes d'utilisateurs
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {accessGroups.map((group) => (
          <Card key={group.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{group.name}</CardTitle>
                <Badge className={getGroupTypeColor(group.type)}>
                  {getGroupTypeName(group.type)}
                </Badge>
              </div>
              <CardDescription>{group.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {group._count.sops} SOPs
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {group._count.users} utilisateurs
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Utilisateurs assignés :</h4>
                <div className="flex flex-wrap gap-1">
                  {group.users.slice(0, 3).map((userGroup) => (
                    <Badge key={userGroup.user.id} variant="outline" className="text-xs">
                      {userGroup.user.name || userGroup.user.email}
                    </Badge>
                  ))}
                  {group.users.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{group.users.length - 3} autres
                    </Badge>
                  )}
                  {group.users.length === 0 && (
                    <span className="text-xs text-muted-foreground">
                      Aucun utilisateur assigné
                    </span>
                  )}
                </div>
              </div>

              <Button
                onClick={() => {
                  setSelectedGroup(group);
                  setIsAssignDialogOpen(true);
                }}
                className="w-full"
                variant="outline"
              >
                <Settings className="h-4 w-4 mr-2" />
                Gérer les utilisateurs
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog d'assignation des utilisateurs */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Gérer les utilisateurs - {selectedGroup?.name}
            </DialogTitle>
            <DialogDescription>
              Sélectionnez les utilisateurs qui auront accès à ce groupe de procédures.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-96">
            <div className="space-y-2">
              {users.map((user) => {
                const isAssigned = selectedGroup?.users.some(
                  (userGroup) => userGroup.user.id === user.id
                ) || false;

                return (
                  <div key={user.id} className="flex items-center space-x-2 p-2 rounded border">
                    <Checkbox
                      id={user.id}
                      checked={isAssigned}
                      onCheckedChange={(checked) => {
                        if (!selectedGroup) return;

                        const currentAssignedIds = selectedGroup.users.map(
                          (userGroup) => userGroup.user.id
                        );
                        
                        let newAssignedIds;
                        if (checked) {
                          newAssignedIds = [...currentAssignedIds, user.id];
                        } else {
                          newAssignedIds = currentAssignedIds.filter(id => id !== user.id);
                        }

                        handleAssignUsers(selectedGroup.id, newAssignedIds);
                      }}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {user.name || "Sans nom"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {user.email}
                      </div>
                      <Badge variant="outline" className="text-xs mt-1">
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
} 