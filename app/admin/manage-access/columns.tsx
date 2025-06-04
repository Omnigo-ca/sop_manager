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
  email: string;
  firstName: string;
  lastName: string;
}

interface SOP {
  id: string;
  title: string;
  users: User[];
}

export const columns = (users: User[], onAssignUsers: (sopId: string, userIds: string[]) => void): ColumnDef<SOP>[] => [
  {
    accessorKey: "title",
    header: "Titre de la procédure",
  },
  {
    id: "assignedUsers",
    header: "Utilisateurs assignés",
    cell: ({ row }) => {
      const sop = row.original;
      const assignedUsers = sop.users || [];
      
      return (
        <div className="flex flex-wrap gap-1">
          {assignedUsers.map((user) => (
            <span
              key={user.id}
              className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm"
            >
              {user.firstName} {user.lastName}
            </span>
          ))}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const sop = row.original;
      const assignedUserIds = new Set((sop.users || []).map(u => u.id));

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Gérer les accès</Button>
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
                  onAssignUsers(sop.id, Array.from(newAssignedUserIds));
                }}
              >
                <Checkbox
                  checked={assignedUserIds.has(user.id)}
                  className="mr-2"
                />
                <span>
                  {user.firstName} {user.lastName}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]; 