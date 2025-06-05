"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Users, FileText, Plus, Settings, Edit, Trash2, ListChecks } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AccessGroup {
  id: string;
  name: string;
  description: string;
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
  sops?: Array<{
    sop: {
      id: string;
      title: string;
      category: string;
    };
  }>;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface SOP {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
}

export default function ManageAccessGroupsPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [accessGroups, setAccessGroups] = useState<AccessGroup[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [sops, setSops] = useState<SOP[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<AccessGroup | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSopAssignDialogOpen, setIsSopAssignDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

  // États pour les modifications en attente
  const [pendingUserChanges, setPendingUserChanges] = useState<string[]>([]);
  const [pendingSopChanges, setPendingSopChanges] = useState<string[]>([]);
  const [isSubmittingUsers, setIsSubmittingUsers] = useState(false);
  const [isSubmittingSops, setIsSubmittingSops] = useState(false);

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
        const [groupsResponse, usersResponse, sopsResponse] = await Promise.all([
          fetch("/api/access-groups"),
          fetch("/api/users"),
          fetch("/api/sops")
        ]);

        if (!groupsResponse.ok || !usersResponse.ok || !sopsResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const groupsData = await groupsResponse.json();
        const usersData = await usersResponse.json();
        const sopsData = await sopsResponse.json();

        setAccessGroups(groupsData);
        setUsers(usersData);
        setSops(sopsData);
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

  const handleCreateGroup = async () => {
    try {
      const response = await fetch("/api/access-groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create group");
      }

      toast({
        title: "Succès",
        description: "Le groupe a été créé avec succès",
      });

      // Refresh the data
      const updatedGroupsResponse = await fetch("/api/access-groups");
      const updatedGroupsData = await updatedGroupsResponse.json();
      setAccessGroups(updatedGroupsData);
      setIsCreateDialogOpen(false);
      setFormData({ name: "", description: "" });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le groupe",
        variant: "destructive",
      });
    }
  };

  const handleUpdateGroup = async () => {
    if (!selectedGroup) return;
    
    try {
      const response = await fetch(`/api/access-groups/${selectedGroup.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update group");
      }

      toast({
        title: "Succès",
        description: "Le groupe a été modifié avec succès",
      });

      // Refresh the data
      const updatedGroupsResponse = await fetch("/api/access-groups");
      const updatedGroupsData = await updatedGroupsResponse.json();
      setAccessGroups(updatedGroupsData);
      setIsEditDialogOpen(false);
      setSelectedGroup(null);
      setFormData({ name: "", description: "" });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le groupe",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      const response = await fetch(`/api/access-groups/${groupId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete group");
      }

      toast({
        title: "Succès",
        description: "Le groupe a été supprimé avec succès",
      });

      // Refresh the data
      const updatedGroupsResponse = await fetch("/api/access-groups");
      const updatedGroupsData = await updatedGroupsResponse.json();
      setAccessGroups(updatedGroupsData);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le groupe",
        variant: "destructive",
      });
    }
  };

  // Fonction pour gérer les changements temporaires d'utilisateurs
  const handleUserToggle = (userId: string, isChecked: boolean) => {
    if (isChecked) {
      setPendingUserChanges(prev => [...prev.filter(id => id !== userId), userId]);
    } else {
      setPendingUserChanges(prev => prev.filter(id => id !== userId));
    }
  };

  // Fonction pour valider et envoyer les assignations d'utilisateurs
  const handleValidateUserAssignments = async () => {
    if (!selectedGroup) return;
    
    setIsSubmittingUsers(true);
    try {
      const response = await fetch(`/api/access-groups/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessGroupId: selectedGroup.id,
          userIds: pendingUserChanges,
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
      setPendingUserChanges([]);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'assigner les utilisateurs",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingUsers(false);
    }
  };

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

  // Fonction pour gérer les changements temporaires de SOP
  const handleSopToggle = (sopId: string, isChecked: boolean) => {
    if (isChecked) {
      setPendingSopChanges(prev => [...prev.filter(id => id !== sopId), sopId]);
    } else {
      setPendingSopChanges(prev => prev.filter(id => id !== sopId));
    }
  };

  // Fonction pour valider et envoyer les assignations de SOP
  const handleValidateSopAssignments = async () => {
    if (!selectedGroup) return;
    
    setIsSubmittingSops(true);
    try {
      const response = await fetch(`/api/sop-access/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessGroupId: selectedGroup.id,
          sopIds: pendingSopChanges,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to assign SOPs");
      }

      toast({
        title: "Succès",
        description: "Les SOP ont été assignées avec succès",
      });

      // Refresh the data
      const updatedGroupsResponse = await fetch("/api/access-groups");
      const updatedGroupsData = await updatedGroupsResponse.json();
      setAccessGroups(updatedGroupsData);
      setIsSopAssignDialogOpen(false);
      setPendingSopChanges([]);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'assigner les SOP",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingSops(false);
    }
  };

  const handleAssignSops = async (groupId: string, sopIds: string[]) => {
    try {
      const response = await fetch(`/api/sop-access/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessGroupId: groupId,
          sopIds,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to assign SOPs");
      }

      toast({
        title: "Succès",
        description: "Les SOP ont été assignées avec succès",
      });

      // Refresh the data
      const updatedGroupsResponse = await fetch("/api/access-groups");
      const updatedGroupsData = await updatedGroupsResponse.json();
      setAccessGroups(updatedGroupsData);
      setIsSopAssignDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'assigner les SOP",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (group: AccessGroup) => {
    setSelectedGroup(group);
    setFormData({
      name: group.name,
      description: group.description || ""
    });
    setIsEditDialogOpen(true);
  };

  const openUserAssignDialog = (group: AccessGroup) => {
    setSelectedGroup(group);
    // Initialiser les changements en attente avec les utilisateurs actuellement assignés
    const currentUserIds = group.users?.map(userGroup => userGroup.user.id) || [];
    setPendingUserChanges(currentUserIds);
    setIsAssignDialogOpen(true);
  };

  const openSopAssignDialog = async (group: AccessGroup) => {
    setSelectedGroup(group);
    
    // Fetch group with SOPs
    try {
      const response = await fetch(`/api/access-groups/${group.id}/sops`);
      if (response.ok) {
        const groupWithSops = await response.json();
        setSelectedGroup(groupWithSops);
        // Initialiser les changements en attente avec les SOP actuellement assignées
        const currentSopIds = groupWithSops.sops?.map((sopGroup: any) => sopGroup.sop.id) || [];
        setPendingSopChanges(currentSopIds);
      }
    } catch (error) {
      console.error("Error fetching group SOPs:", error);
    }
    
    setIsSopAssignDialogOpen(true);
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
            Créez et organisez des groupes pour contrôler l'accès aux procédures
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Créer un groupe
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un nouveau groupe d'accès</DialogTitle>
              <DialogDescription>
                Créez un groupe pour organiser l'accès aux procédures. Le nom du groupe définira son type.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nom du groupe</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Marketing, RH, Technique..."
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description du groupe et de ses responsabilités..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateGroup} disabled={!formData.name}>
                  Créer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {accessGroups.map((group) => (
          <Card key={group.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{group.name}</CardTitle>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(group)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action supprimera définitivement le groupe "{group.name}" et toutes ses assignations.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteGroup(group.id)}>
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
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

              <div className="space-y-2">
                <Button
                  onClick={() => openUserAssignDialog(group)}
                  className="w-full"
                  variant="outline"
                  size="sm"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Gérer les utilisateurs
                </Button>
                
                <Button
                  onClick={() => openSopAssignDialog(group)}
                  className="w-full"
                  variant="outline"
                  size="sm"
                >
                  <ListChecks className="h-4 w-4 mr-2" />
                  Gérer les SOP
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog d'assignation des utilisateurs */}
      <Dialog open={isAssignDialogOpen} onOpenChange={(open) => {
        setIsAssignDialogOpen(open);
        if (!open) {
          setPendingUserChanges([]);
        }
      }}>
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
                const isAssigned = pendingUserChanges.includes(user.id);

                return (
                  <div key={user.id} className="flex items-center space-x-2 p-2 rounded border">
                    <Checkbox
                      id={user.id}
                      checked={isAssigned}
                      onCheckedChange={(checked) => {
                        handleUserToggle(user.id, checked as boolean);
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
          
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAssignDialogOpen(false);
                setPendingUserChanges([]);
              }}
              disabled={isSubmittingUsers}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleValidateUserAssignments}
              disabled={isSubmittingUsers}
            >
              {isSubmittingUsers ? "Validation..." : "Valider"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog d'édition de groupe */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le groupe d'accès</DialogTitle>
            <DialogDescription>
              Modifiez les informations du groupe "{selectedGroup?.name}".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nom du groupe</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Marketing, RH, Technique..."
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description du groupe..."
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleUpdateGroup} disabled={!formData.name}>
                Modifier
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog d'assignation des SOP */}
      <Dialog open={isSopAssignDialogOpen} onOpenChange={(open) => {
        setIsSopAssignDialogOpen(open);
        if (!open) {
          setPendingSopChanges([]);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Gérer les SOP - {selectedGroup?.name}
            </DialogTitle>
            <DialogDescription>
              Sélectionnez les procédures qui seront accessibles à ce groupe.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-96">
            <div className="space-y-2">
              {sops.map((sop) => {
                const isAssigned = pendingSopChanges.includes(sop.id);

                return (
                  <div key={sop.id} className="flex items-center space-x-2 p-3 rounded border">
                    <Checkbox
                      id={`sop-${sop.id}`}
                      checked={isAssigned}
                      onCheckedChange={(checked) => {
                        handleSopToggle(sop.id, checked as boolean);
                      }}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {sop.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {sop.description}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {sop.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {sop.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsSopAssignDialogOpen(false);
                setPendingSopChanges([]);
              }}
              disabled={isSubmittingSops}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleValidateSopAssignments}
              disabled={isSubmittingSops}
            >
              {isSubmittingSops ? "Validation..." : "Valider"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}