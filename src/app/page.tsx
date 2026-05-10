
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight } from "lucide-react";
import Image from "next/image";

interface Template {
  id: string;
  title: string;
  subtitle: string;
  backgroundImageUrl: string;
  status: string;
}

export default function HomePage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      const q = query(collection(db, "templates"), where("status", "==", "published"));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Template[];
      setTemplates(items);
      setLoading(false);
    };
    fetchTemplates();
  }, []);

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <header className="relative py-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-primary/20 blur-[120px] rounded-full -z-10" />
        <div className="container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-6 border-primary/50 text-primary py-1 px-4 gap-2">
            <Sparkles className="w-4 h-4" /> Professional Photocards
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Design Your <span className="text-primary italic">Signature</span> Card
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Create high-quality 4K photocards for your events, sessions, or professional needs in seconds.
          </p>
        </div>
      </header>

      {/* Templates Grid */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Latest Templates</h2>
          <Link href="/admin/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Admin Access
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[300px] bg-muted animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : templates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {templates.map(template => (
              <Link key={template.id} href={`/generate/${template.id}`}>
                <Card className="group relative overflow-hidden border-border/50 bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10">
                  <div className="aspect-[4/3] relative">
                    <Image
                      src={template.backgroundImageUrl}
                      alt={template.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <CardContent className="p-6">
                    <CardTitle className="text-xl mb-1 group-hover:text-primary transition-colors">
                      {template.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{template.subtitle}</p>
                    <div className="mt-4 flex items-center gap-2 text-primary font-semibold text-sm opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                      Customize now <ArrowRight className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border">
            <p className="text-muted-foreground">No published templates yet.</p>
          </div>
        )}
      </section>

      <footer className="mt-40 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} CardSnap Studio. All rights reserved.
      </footer>
    </div>
  );
}
