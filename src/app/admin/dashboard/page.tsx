"use client";

import React, { useMemo } from "react";
import { collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { useFirestore, useAuth, useCollection, useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Edit2, Trash2, Eye, EyeOff, LayoutDashboard, LogOut, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Template {
  id: string;
  title: string;
  status: "draft" | "published";
  backgroundImageUrl: string;
}

export default function AdminDashboard() {
  const db = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  const templatesQuery = useMemo(() => collection(db, "templates"), [db]);
  const { data: templates, loading: templatesLoading } = useCollection<Template>(templatesQuery);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/admin/login");
    }
  }, [user, userLoading, router]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      deleteDoc(doc(db, "templates", id));
      toast({ title: "Template deleted" });
    }
  };

  const togglePublish = async (template: Template) => {
    const newStatus = template.status === "published" ? "draft" : "published";
    updateDoc(doc(db, "templates", template.id), { status: newStatus });
    toast({ title: `Template ${newStatus}` });
  };

  const handleLogout = () => {
    auth.signOut().then(() => {
      router.push("/admin/login");
    });
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
              <LayoutDashboard className="text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage your photocard templates</p>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Button onClick={() => router.push("/admin/editor")} className="flex-1 md:flex-none h-12 rounded-xl gap-2 font-bold">
              <Plus className="w-5 h-5" /> Create Template
            </Button>
            <Button variant="outline" onClick={handleLogout} className="h-12 rounded-xl gap-2 text-destructive hover:text-destructive">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {templatesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-muted animate-pulse rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {templates?.map(template => (
              <Card key={template.id} className="overflow-hidden border-border/50 bg-card/50 hover:bg-card transition-colors rounded-2xl">
                <div className="aspect-video relative bg-muted">
                  <img src={template.backgroundImageUrl} alt={template.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3">
                    <Badge variant={template.status === "published" ? "default" : "secondary"} className="shadow-lg">
                      {template.status === "published" ? "Published" : "Draft"}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-5">
                  <h3 className="font-bold text-lg mb-4 truncate">{template.title}</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-lg" onClick={() => router.push(`/admin/editor/${template.id}`)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-lg" onClick={() => togglePublish(template)}>
                      {template.status === "published" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-lg text-destructive hover:bg-destructive/10" onClick={() => handleDelete(template.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
