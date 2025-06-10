"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, User, FileText, AlertCircle } from "lucide-react";
import Link from "next/link";

interface SOP {
  id: string;
  title: string;
  description: string;
  instructions: string;
  category: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function PublicProcedurePage() {
  const params = useParams();
  const router = useRouter();
  const [sop, setSop] = useState<SOP | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSop = async () => {
      try {
        const response = await fetch(`/api/sops/public/${params.id}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError("Procédure non trouvée");
          } else if (response.status === 403) {
            setError("Accès non autorisé à cette procédure");
          } else {
            setError("Erreur lors du chargement de la procédure");
          }
          return;
        }
        const data = await response.json();
        setSop(data);
      } catch (error) {
        console.error("Error fetching SOP:", error);
        setError("Erreur lors du chargement de la procédure");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchSop();
    }
  }, [params.id]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "destructive";
      case "MEDIUM":
        return "default";
      case "LOW":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "Haute";
      case "MEDIUM":
        return "Moyenne";
      case "LOW":
        return "Faible";
      default:
        return priority;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <p className="font-meutas">Chargement de la procédure...</p>
        </div>
      </div>
    );
  }

  if (error || !sop) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium font-meutas mb-2">
            {error || "Procédure non trouvée"}
          </h3>
          <p className="text-muted-foreground font-meutas mb-4">
            Cette procédure n'existe pas ou n'est plus accessible au public.
          </p>
          <Link href="/public-procedures">
            <Button variant="outline" className="font-meutas">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux procédures publiques
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      {/* Navigation */}
      <div className="mb-6">
        <Link href="/public-procedures">
          <Button variant="outline" size="sm" className="font-meutas">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux procédures publiques
          </Button>
        </Link>
      </div>

      {/* En-tête de la procédure */}
      <Card className="mb-6">
        <CardHeader>
          <div className="space-y-4">
            <div>
              <CardTitle className="text-2xl font-bold font-meutas mb-2">
                {sop.title}
              </CardTitle>
              <p className="text-muted-foreground font-meutas">
                {sop.description}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="font-meutas">
                {sop.category}
              </Badge>
              <Badge 
                variant={getPriorityColor(sop.priority) as any} 
                className="font-meutas"
              >
                Priorité {getPriorityLabel(sop.priority)}
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                <span className="font-meutas">
                  Créé par {sop.user.name}
                </span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span className="font-meutas">
                  Mis à jour le {new Date(sop.updatedAt).toLocaleDateString("fr-FR")}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Contenu de la procédure */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center font-meutas">
            <FileText className="h-5 w-5 mr-2" />
            Contenu de la procédure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="prose prose-sm max-w-none font-meutas"
            dangerouslySetInnerHTML={{ __html: sop.instructions }}
          />
        </CardContent>
      </Card>

      {/* Informations supplémentaires */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="text-xs text-muted-foreground text-center">
            <p className="font-meutas">
              Cette procédure a été créée le {new Date(sop.createdAt).toLocaleDateString("fr-FR")} 
              et mise à jour le {new Date(sop.updatedAt).toLocaleDateString("fr-FR")}.
            </p>
            <p className="font-meutas mt-1">
              Pour toute question, vous pouvez contacter l'auteur : {sop.user.email}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 