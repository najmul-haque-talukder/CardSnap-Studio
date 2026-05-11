"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useFirestore, useUser, useStorage } from "@/firebase";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, Save, Upload, Loader2, Sparkles, Image as ImageIcon, Type, Target, MousePointer2, Palette } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { SliderInput } from "@/components/ui/slider-input";
import { ColorPickerInput } from "@/components/ui/color-picker-input";

const PhotoCardCanvas = dynamic(() => import("@/components/canvas/PhotoCardCanvas"), { ssr: false });

const DEFAULT_CONFIG = {
  title: "New Template",
  subtitle: "Event 2024",
  status: "draft",
  category: "events",
  featured: false,
  backgroundImageUrl: "",
  photoConfig: {
    shape: "circle",
    diameter: 180,
    width: 180,
    height: 180,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#ffffff",
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
  const storage = useStorage();
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
      try {
        if (id === "new") {
          setConfig({ ...DEFAULT_CONFIG });
        } else {
          const docRef = doc(db, "templates", id as string);
          const snapshot = await getDoc(docRef);
          if (snapshot.exists()) {
            const data = snapshot.data();
            setConfig({
              ...DEFAULT_CONFIG,
              ...data,
              photoConfig: { ...DEFAULT_CONFIG.photoConfig, ...(data.photoConfig || {}) },
              nameConfig: { ...DEFAULT_CONFIG.nameConfig, ...(data.nameConfig || {}) },
              designationConfig: { ...DEFAULT_CONFIG.designationConfig, ...(data.designationConfig || {}) },
              sessionConfig: { ...DEFAULT_CONFIG.sessionConfig, ...(data.sessionConfig || {}) }
            });
          } else {
            router.push("/admin/dashboard");
          }
        }
      } catch (err: any) {
        // Handled by global listener
      } finally {
        setLoading(false);
      }
    };
    if (!userLoading && user) fetchData();
  }, [id, user, userLoading, router, db]);

  const handleUpdate = (path: string, value: any) => {
    setConfig((prev: any) => {
      const next = JSON.parse(JSON.stringify(prev));
      const parts = path.split(".");
      let current = next;
      for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      return next;
    });
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileName = `backgrounds/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const storageRef = ref(storage, fileName);
    
    uploadBytes(storageRef, file, { contentType: file.type })
      .then((uploadResult) => {
        return getDownloadURL(uploadResult.ref);
      })
      .then((url) => {
        handleUpdate("backgroundImageUrl", url);
        toast({ title: "Background uploaded successfully!" });
      })
      .catch((err: any) => {
        toast({ variant: "destructive", title: "Upload failed", description: "Storage rules might be restricting this." });
      })
      .finally(() => {
        setUploading(false);
      });
  };

  const handleSave = (status: "draft" | "published") => {
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in to save." });
      return;
    }
    setSaving(true);
    const templateId = id === "new" ? `tmp_${Date.now()}` : id as string;
    const docRef = doc(db, "templates", templateId);
    const data = { 
      ...config, 
      id: templateId, 
      status, 
      updatedAt: serverTimestamp(),
      usageCount: config.usageCount || 0
    };

    setDoc(docRef, data, { merge: true })
      .then(() => {
        toast({ title: `Template saved as ${status}` });
        router.push("/admin/dashboard");
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'write',
          requestResourceData: data,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setSaving(false);
      });
  };

  if (loading || userLoading || !config) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <header className="h-16 border-b border-border/50 bg-card px-4 flex items-center justify-between z-50 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/admin/dashboard")}>
            <ChevronLeft />
          </Button>
          <div>
            <h1 className="font-bold text-xl leading-tight">{id === "new" ? "New Template" : config.title}</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Design Mode</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleSave("draft")} disabled={saving}>
            Save Draft
          </Button>
          <Button size="sm" onClick={() => handleSave("published")} disabled={saving} className="gap-2 font-bold">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save & Publish
          </Button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left: Scrollable Sidebar */}
        <div className="w-[450px] overflow-y-auto bg-card/30 border-r border-border/50 p-6 space-y-8 custom-scrollbar h-full shrink-0">
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Base Properties</h2>
            </div>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Admin Title</Label>
                <Input value={config.title} onChange={(e) => handleUpdate("title", e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Public Subtitle</Label>
                <Input value={config.subtitle} onChange={(e) => handleUpdate("subtitle", e.target.value)} className="rounded-xl" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <select 
                    value={config.category} 
                    onChange={(e) => handleUpdate("category", e.target.value)}
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="events">Events</option>
                    <option value="professional">Professional</option>
                    <option value="academic">Academic</option>
                    <option value="social">Social</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Featured</Label>
                  <div className="flex items-center space-x-2 h-10 px-3 border rounded-xl bg-muted/20">
                    <Switch checked={config.featured} onCheckedChange={(val) => handleUpdate("featured", val)} />
                    <span className="text-xs font-medium">Spotlight</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Background Layer</Label>
                <div className="relative h-40 rounded-xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center bg-muted/20 overflow-hidden group">
                  {config.backgroundImageUrl ? (
                    <img src={config.backgroundImageUrl} alt="BG" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-primary/20" />
                  )}
                  {uploading ? (
                    <Loader2 className="animate-spin text-primary w-8 h-8 z-10" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 z-10 p-4">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                      <span className="text-xs font-medium">Upload Card Image</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleBgUpload} className="absolute inset-0 opacity-0 cursor-pointer" disabled={uploading} />
                </div>
              </div>
            </div>
          </section>

          <Tabs defaultValue="photo" className="w-full">
            <TabsList className="grid grid-cols-4 w-full h-12 rounded-xl bg-muted/50 p-1">
              <TabsTrigger value="photo" className="rounded-lg"><ImageIcon className="w-4 h-4" /></TabsTrigger>
              <TabsTrigger value="name" className="rounded-lg"><Type className="w-4 h-4" /></TabsTrigger>
              <TabsTrigger value="designation" className="rounded-lg text-xs">Job</TabsTrigger>
              <TabsTrigger value="session" className="rounded-lg text-xs">Batch</TabsTrigger>
            </TabsList>

            <TabsContent value="photo" className="mt-6 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-primary" />
                <h3 className="font-bold">Photo Configuration</h3>
              </div>
              <div className="space-y-4">
                <Label>Frame Shape</Label>
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
                    <SliderInput label="Frame Diameter" value={config.photoConfig.diameter || 180} min={50} max={400} onChange={(val) => handleUpdate("photoConfig.diameter", val)} />
                  ) : (
                    <>
                      <SliderInput label="Frame Width" value={config.photoConfig.width || 180} min={50} max={450} onChange={(val) => handleUpdate("photoConfig.width", val)} />
                      <SliderInput label="Frame Height" value={config.photoConfig.height || 180} min={50} max={450} onChange={(val) => handleUpdate("photoConfig.height", val)} />
                      <SliderInput label="Corner Radius" value={config.photoConfig.borderRadius || 20} min={0} max={225} onChange={(val) => handleUpdate("photoConfig.borderRadius", val)} />
                    </>
                  )}
                  <SliderInput label="Horizontal (X)" value={config.photoConfig.x} min={0} max={500} onChange={(val) => handleUpdate("photoConfig.x", val)} />
                  <SliderInput label="Vertical (Y)" value={config.photoConfig.y} min={0} max={500} onChange={(val) => handleUpdate("photoConfig.y", val)} />
                  
                  <div className="pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2 mb-4">
                      <Palette className="w-4 h-4 text-primary" />
                      <h4 className="text-sm font-bold">Border Controls</h4>
                    </div>
                    <SliderInput label="Border Width" value={config.photoConfig.borderWidth || 0} min={0} max={20} onChange={(val) => handleUpdate("photoConfig.borderWidth", val)} />
                    <ColorPickerInput label="Border Color" value={config.photoConfig.borderColor || "#ffffff"} onChange={(val) => handleUpdate("photoConfig.borderColor", val)} />
                  </div>
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
                  <SliderInput label="Horizontal (X)" value={config[`${layer}Config`].x} min={-250} max={500} onChange={(val) => handleUpdate(`${layer}Config.x`, val)} />
                  <SliderInput label="Vertical (Y)" value={config[`${layer}Config`].y} min={0} max={500} onChange={(val) => handleUpdate(`${layer}Config.y`, val)} />
                  <SliderInput label="Font Size" value={config[`${layer}Config`].fontSize} min={8} max={72} onChange={(val) => handleUpdate(`${layer}Config.fontSize`, val)} />
                  <div className="space-y-2">
                    <Label>Font Style</Label>
                    <select value={config[`${layer}Config`].fontStyle} onChange={(e) => handleUpdate(`${layer}Config.fontStyle`, e.target.value)} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
                      <option value="normal">Normal</option>
                      <option value="bold">Bold</option>
                      <option value="italic">Inter</option>
                      <option value="bold italic">Bold Italic</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Alignment</Label>
                    <div className="flex bg-muted/30 p-1 rounded-xl">
                      {["left", "center", "right"].map(align => (
                        <Button key={align} variant={config[`${layer}Config`].align === align ? "default" : "ghost"} className="flex-1 h-8 rounded-lg capitalize text-xs" onClick={() => handleUpdate(`${layer}Config.align`, align)}>{align}</Button>
                      ))}
                    </div>
                  </div>
                  <ColorPickerInput label="Text Color" value={config[`${layer}Config`].color} onChange={(val) => handleUpdate(`${layer}Config.color`, val)} />
                </div>
              </TabsContent>
            ))}
          </Tabs>
          <div className="h-24" />
        </div>

        {/* Right: Fixed Preview Section */}
        <div className="flex-1 bg-muted/5 flex items-center justify-center p-12 overflow-hidden relative h-full">
          <div className="w-full max-w-[500px] space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Live Preview Canvas</h3>
              </div>
              <Badge variant="outline" className="border-primary text-primary bg-primary/5">Interactive</Badge>
            </div>
            
            <div className="w-full shadow-2xl rounded-2xl overflow-hidden bg-muted/20 border-4 border-muted/50">
               <PhotoCardCanvas 
                config={{
                  ...config,
                  nameConfig: { ...config.nameConfig, text: "Preview Full Name" },
                  designationConfig: { ...config.designationConfig, text: "Department/Designation" },
                  sessionConfig: { ...config.sessionConfig, text: "Session 2021-22" }
                }} 
                userPhotoUrl="https://picsum.photos/seed/admin-placeholder/600/600"
                onLayerTransform={(layerName, x, y) => {
                  handleUpdate(`${layerName}.x`, x);
                  handleUpdate(`${layerName}.y`, y);
                }}
              />
            </div>
            <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground italic">
              <MousePointer2 className="w-3 h-3" />
              Tip: Drag elements directly in the preview to position them.
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--muted)); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: hsl(var(--primary) / 0.4); }
      `}</style>
    </div>
  );
}