"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, getStorage } from "firebase/storage";
import { useFirestore, useAuth, useUser, useFirebaseApp } from "@/firebase";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SliderInput } from "@/components/ui/slider-input";
import { ColorPickerInput } from "@/components/ui/color-picker-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, Save, Upload, Loader2, Sparkles, Image as ImageIcon, Type, Target, Layout } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const PhotoCardCanvas = dynamic(() => import("@/components/canvas/PhotoCardCanvas"), { ssr: false });

const DEFAULT_CONFIG = {
  title: "New Template",
  subtitle: "Event 2024",
  status: "draft",
  category: "events",
  featured: false,
  backgroundImageUrl: "https://picsum.photos/seed/bg/500/500",
  photoConfig: {
    shape: "circle",
    diameter: 180,
    width: 180,
    height: 180,
    borderRadius: 20,
    x: 160,
    y: 80
  },
  nameConfig: {
    x: 0,
    y: 320,
    fontSize: 32,
    fontStyle: "bold",
    color: "#ffffff",
    align: "center"
  },
  designationConfig: {
    x: 0,
    y: 365,
    fontSize: 18,
    fontStyle: "normal",
    color: "#cccccc",
    align: "center"
  },
  sessionConfig: {
    x: 0,
    y: 400,
    fontSize: 14,
    fontStyle: "italic",
    color: "#aaaaaa",
    align: "center"
  }
};

export default function TemplateEditorPage() {
  const { id } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const app = useFirebaseApp();
  const storage = getStorage(app);
  const { user, loading: userLoading } = useUser();
  
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/admin/login");
      return;
    }

    const fetchData = async () => {
      if (id === "new") {
        setConfig(DEFAULT_CONFIG);
      } else {
        const docRef = doc(db, "templates", id as string);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          setConfig({ ...DEFAULT_CONFIG, ...snapshot.data() });
        } else {
          router.push("/admin/dashboard");
        }
      }
      setLoading(false);
    };
    if (!userLoading && user) fetchData();
  }, [id, user, userLoading, router, db]);

  const handleUpdate = (path: string, value: any) => {
    setConfig((prev: any) => {
      const next = { ...prev };
      const parts = path.split(".");
      let current = next;
      for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      return next;
    });
  };

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const storageRef = ref(storage, `backgrounds/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      handleUpdate("backgroundImageUrl", url);
      toast({ title: "Background uploaded" });
    } catch (err) {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (status: "draft" | "published") => {
    setSaving(true);
    try {
      const templateId = id === "new" ? doc(collection(db, "templates")).id : id as string;
      const data = { ...config, status, updatedAt: serverTimestamp() };
      await setDoc(doc(db, "templates", templateId), data, { merge: true });
      toast({ title: "Template Saved Successfully" });
      router.push("/admin/dashboard");
    } catch (err: any) {
      toast({ title: "Failed to save", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading || userLoading || !config) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border/50 bg-card p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/admin/dashboard")}>
            <ChevronLeft />
          </Button>
          <div className="hidden md:block">
            <h1 className="font-bold text-xl">{id === "new" ? "New Template" : config.title}</h1>
            <p className="text-xs text-muted-foreground">Editor Mode</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSave("draft")} disabled={saving}>
            Save Draft
          </Button>
          <Button onClick={() => handleSave("published")} disabled={saving} className="gap-2 font-bold shadow-lg shadow-primary/20">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save & Publish
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row h-[calc(100vh-73px)] overflow-hidden">
        <div className="w-full md:w-[450px] overflow-y-auto bg-background/50 border-r border-border/50 p-6 space-y-8">
          
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Template Basics</h2>
            </div>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Admin Title</Label>
                <Input value={config.title} onChange={(e) => handleUpdate("title", e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Subtitle (Public)</Label>
                <Input value={config.subtitle} onChange={(e) => handleUpdate("subtitle", e.target.value)} className="rounded-xl" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={config.category} onValueChange={(val) => handleUpdate("category", val)}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="events">Events</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Featured</Label>
                  <div className="flex items-center space-x-2 h-10 px-3 border rounded-xl bg-muted/20">
                    <Switch 
                      checked={config.featured} 
                      onCheckedChange={(val) => handleUpdate("featured", val)}
                    />
                    <span className="text-xs font-medium">Highlight</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Background Image</Label>
                <div className="relative h-24 rounded-xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center bg-muted/20 overflow-hidden group">
                  {config.backgroundImageUrl ? (
                    <img src={config.backgroundImageUrl} alt="BG" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                  ) : null}
                  {uploading ? (
                    <Loader2 className="animate-spin text-primary" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                      <span className="text-xs font-medium">Change background</span>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleBgUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>
            </div>
          </section>

          <Tabs defaultValue="photo" className="w-full">
            <TabsList className="grid grid-cols-4 w-full h-12 rounded-xl bg-muted/50 p-1">
              <TabsTrigger value="photo" className="rounded-lg"><ImageIcon className="w-4 h-4" /></TabsTrigger>
              <TabsTrigger value="name" className="rounded-lg"><Type className="w-4 h-4" /></TabsTrigger>
              <TabsTrigger value="designation" className="rounded-lg text-xs">Job</TabsTrigger>
              <TabsTrigger value="session" className="rounded-lg text-xs">Sess</TabsTrigger>
            </TabsList>

            <TabsContent value="photo" className="mt-6 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-primary" />
                <h3 className="font-bold">Photo Layer</h3>
              </div>
              <div className="space-y-4">
                <Label>Shape Type</Label>
                <RadioGroup value={config.photoConfig.shape} onValueChange={(val) => handleUpdate("photoConfig.shape", val)} className="flex gap-4">
                  <div className="flex items-center space-x-2 bg-muted/30 p-3 rounded-lg flex-1 border border-border/50">
                    <RadioGroupItem value="circle" id="circle" />
                    <Label htmlFor="circle">Circle</Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-muted/30 p-3 rounded-lg flex-1 border border-border/50">
                    <RadioGroupItem value="square" id="square" />
                    <Label htmlFor="square">Square</Label>
                  </div>
                </RadioGroup>

                <div className="grid gap-4">
                  {config.photoConfig.shape === "circle" ? (
                    <SliderInput label="Diameter" value={config.photoConfig.diameter} min={50} max={400} onChange={(val) => handleUpdate("photoConfig.diameter", val)} />
                  ) : (
                    <>
                      <SliderInput label="Width" value={config.photoConfig.width} min={50} max={450} onChange={(val) => handleUpdate("photoConfig.width", val)} />
                      <SliderInput label="Height" value={config.photoConfig.height} min={50} max={450} onChange={(val) => handleUpdate("photoConfig.height", val)} />
                      <SliderInput label="Border Radius" value={config.photoConfig.borderRadius} min={0} max={225} onChange={(val) => handleUpdate("photoConfig.borderRadius", val)} />
                    </>
                  )}
                  <SliderInput label="X Position" value={config.photoConfig.x} min={0} max={500} onChange={(val) => handleUpdate("photoConfig.x", val)} />
                  <SliderInput label="Y Position" value={config.photoConfig.y} min={0} max={500} onChange={(val) => handleUpdate("photoConfig.y", val)} />
                </div>
              </div>
            </TabsContent>

            {["name", "designation", "session"].map((layer) => (
              <TabsContent key={layer} value={layer} className="mt-6 space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Type className="w-5 h-5 text-primary" />
                  <h3 className="font-bold capitalize">{layer} Layer</h3>
                </div>
                <div className="grid gap-4">
                  <SliderInput label="X Position" value={config[`${layer}Config`].x} min={0} max={500} onChange={(val) => handleUpdate(`${layer}Config.x`, val)} />
                  <SliderInput label="Y Position" value={config[`${layer}Config`].y} min={0} max={500} onChange={(val) => handleUpdate(`${layer}Config.y`, val)} />
                  <SliderInput label="Font Size" value={config[`${layer}Config`].fontSize} min={8} max={72} onChange={(val) => handleUpdate(`${layer}Config.fontSize`, val)} />
                  
                  <div className="space-y-2">
                    <Label>Font Style</Label>
                    <Select value={config[`${layer}Config`].fontStyle} onValueChange={(val) => handleUpdate(`${layer}Config.fontStyle`, val)}>
                      <SelectTrigger className="rounded-xl h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="bold">Bold</SelectItem>
                        <SelectItem value="italic">Italic</SelectItem>
                        <SelectItem value="bold italic">Bold Italic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Alignment</Label>
                    <div className="flex bg-muted/30 p-1 rounded-xl border border-border/50">
                      {["left", "center", "right"].map(align => (
                        <Button 
                          key={align} 
                          variant={config[`${layer}Config`].align === align ? "default" : "ghost"} 
                          className="flex-1 h-8 rounded-lg capitalize text-xs"
                          onClick={() => handleUpdate(`${layer}Config.align`, align)}
                        >
                          {align}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <ColorPickerInput label="Text Color" value={config[`${layer}Config`].color} onChange={(val) => handleUpdate(`${layer}Config.color`, val)} />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <div className="flex-1 bg-muted/10 flex items-center justify-center p-8 overflow-auto">
          <div className="space-y-6 w-full max-w-[500px]">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Live Preview</h3>
              <Badge variant="outline" className="border-primary text-primary">Designer Active</Badge>
            </div>
            <PhotoCardCanvas 
              config={{
                ...config,
                nameConfig: { ...config.nameConfig, text: "Admin Example" },
                designationConfig: { ...config.designationConfig, text: "Senior Administrator" },
                sessionConfig: { ...config.sessionConfig, text: "2024-2025" }
              }} 
            />
            <div className="p-4 bg-muted/20 border border-border/50 rounded-2xl">
              <p className="text-xs text-center text-muted-foreground">
                Dummy data is used for preview. Changes are reflected instantly.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
