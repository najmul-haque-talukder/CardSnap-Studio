
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { collection, query, where } from "firebase/firestore";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, ArrowRight, Loader2, Star, ImageIcon } from "lucide-react";
import Image from "next/image";

interface Template {
  id: string;
  title: string;
  subtitle: string;
  backgroundImageUrl: string;
  status: string;
  category?: string;
  featured?: boolean;
}

const CATEGORIES = ["All", "Events", "Professional", "Academic", "Social"];

export default function HomePage() {
  const db = useFirestore();
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  
  const templatesQuery = useMemoFirebase(() => {
    let q = query(collection(db, "templates"), where("status", "==", "published"));
    if (activeCategory !== "All") {
      q = query(q, where("category", "==", activeCategory.toLowerCase()));
    }
    return q;
  }, [db, activeCategory]);

  const { data: templates, loading } = useCollection<Template>(templatesQuery);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <div className="min-h-screen pb-20 overflow-x-hidden">
      <header className="relative py-12 md:py-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] md:w-[1200px] h-[300px] md:h-[600px] bg-primary/20 blur-[80px] md:blur-[120px] rounded-full -z-10" />
        <div className="container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-6 border-primary/50 text-primary py-1 px-4 gap-2 animate-pulse">
            <Sparkles className="w-4 h-4" /> Professional Photocards
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-6 tracking-tight leading-tight">
            Design Your <span className="text-primary italic">Signature</span> Card
          </h1>
          <p className="text-sm md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 px-4">
            Create high-quality 4K photocards for your events, sessions, or professional needs in seconds.
          </p>

          {/* Responsive Category Navigation */}
          <div className="w-full flex justify-center overflow-hidden">
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full max-w-2xl">
              <div className="flex md:justify-center overflow-x-auto no-scrollbar pb-2 px-4">
                <TabsList className="bg-muted/40 rounded-full p-1 border border-border/50 flex h-auto min-w-max md:min-w-0">
                  {CATEGORIES.map(cat => (
                    <TabsTrigger 
                      key={cat} 
                      value={cat} 
                      className="rounded-full px-5 md:px-8 py-2 md:py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs md:text-sm transition-all"
                    >
                      {cat}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </Tabs>
          </div>
        </div>
      </header>

      <section className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            {activeCategory === "All" ? "Latest Templates" : `${activeCategory} Templates`}
          </h2>
          <Link href="/admin/login" className="text-xs md:text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
            Admin Console Access <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-[4/3] bg-muted/50 animate-pulse rounded-2xl flex items-center justify-center border border-border/50">
                <Loader2 className="w-8 h-8 animate-spin text-primary/20" />
              </div>
            ))}
          </div>
        ) : templates && templates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {templates.map(template => (
              <Link key={template.id} href={`/generate/${template.id}`}>
                <Card className="group relative overflow-hidden border-border/50 bg-card transition-all duration-500 hover:border-primary/40 hover:scale-[1.03] hover:shadow-2xl hover:shadow-primary/10">
                  <div className="aspect-[4/3] relative">
                    {template.backgroundImageUrl ? (
                      <Image
                        src={template.backgroundImageUrl}
                        alt={template.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted/30">
                        <ImageIcon className="w-10 h-10 text-muted-foreground/20" />
                      </div>
                    )}
                    {template.featured && (
                      <div className="absolute top-3 right-3 z-10">
                        <Badge className="bg-yellow-500 text-black font-bold gap-1 shadow-lg text-[10px] md:text-xs border-none">
                          <Star className="w-2 h-2 md:w-3 md:h-3 fill-current" /> Featured
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-5 md:p-6">
                    <div className="flex items-start justify-between mb-1 gap-2">
                      <CardTitle className="text-lg md:text-xl font-bold group-hover:text-primary transition-colors truncate">
                        {template.title}
                      </CardTitle>
                      {template.category && (
                        <Badge variant="secondary" className="capitalize text-[8px] md:text-[10px] py-0 px-2 shrink-0 border-border/50">
                          {template.category}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">{template.subtitle}</p>
                    <div className="mt-4 flex items-center gap-2 text-primary font-bold text-xs md:text-sm">
                      Customize template <ArrowRight className="w-3 h-3 md:w-4 md:h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-muted/10 rounded-[2rem] border-2 border-dashed border-border/50 px-6">
            <div className="w-16 h-16 bg-muted/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <h3 className="text-xl font-bold mb-2">No templates available</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">We couldn't find any published templates in the {activeCategory} category. Please check back later.</p>
          </div>
        )}
      </section>

      <footer className="mt-24 md:mt-40 py-10 border-t border-border/30 text-center text-xs md:text-sm text-muted-foreground px-4">
        <p>&copy; {currentYear ?? '...'} CardSnap Studio. Engineered for high-quality professional photocards.</p>
      </footer>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
