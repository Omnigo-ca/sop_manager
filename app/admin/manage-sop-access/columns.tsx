"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";

interface User {
  id: string;
  name: string;
}

interface SOP {
  id: string;
  title: string;
  users: User[];
}

interface TableRow {
  original: SOP;
}

export const columns = (users: User[], onAssignUsers: (sopId: string, userIds: string[]) => void): ColumnDef<SOP>[] => [
  {
    accessorKey: "title",
    header: "Titre de la procédure",
  },
  {
    id: "assignedUsers",
    header: "Utilisateurs assignés",
    cell: ({ row }: { row: TableRow }) => {
      const sop = row.original;
      const assignedUsers = sop.users || [];
      
      return (
        <div className="flex flex-wrap gap-1">
          {assignedUsers.map((user: User) => (
            <span
              key={user.id}
              className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm"
            >
              {user.name || 'Sans nom'}
            </span>
          ))}
          {assignedUsers.length === 0 && (
            <span className="text-muted-foreground text-sm">
              Aucun utilisateur assigné
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }: { row: TableRow }) => {
      const sop = row.original;
      const assignedUserIds = new Set((sop.users || []).map((u: User) => u.id));

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Gérer les accès
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuLabel>Sélectionner les utilisateurs</DropdownMenuLabel>
            {users.map((user) => (
              <DropdownMenuItem
                key={user.id}
                className="flex items-center space-x-2"
                onSelect={(e) => {
                  e.preventDefault();
                  const newAssignedUserIds = new Set(assignedUserIds);
                  if (newAssignedUserIds.has(user.id)) {
                    newAssignedUserIds.delete(user.id);
                  } else {
                    newAssignedUserIds.add(user.id);
                  }
                  onAssignUsers(sop.id, Array.from(newAssignedUserIds) as string[]);
                }}
              >
                <Checkbox
                  checked={assignedUserIds.has(user.id)}
                  className="mr-2"
                />
                <span>
                  {user.name || 'Sans nom'}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]; 