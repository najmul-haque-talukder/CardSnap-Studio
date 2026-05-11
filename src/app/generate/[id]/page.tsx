"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ChevronLeft, Download, Camera, Loader2, Sparkles, Move, ZoomIn } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

const PhotoCardCanvas = dynamic(() => import("@/components/canvas/PhotoCardCanvas"), { ssr: false });

const DEFAULT_USER_PLACEHOLDER = "https://picsum.photos/seed/user-placeholder/600/600";

export default function GeneratePage() {
  const { id } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const canvasRef = useRef<any>(null);
  
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [userPhotoUrl, setUserPhotoUrl] = useState<string>("");
  const [userPhotoScale, setUserPhotoScale] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    session: ""
  });

  useEffect(() => {
    const fetchTemplate = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "templates", id as string);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          setTemplate(snapshot.data());
        }
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplate();
  }, [id, db]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUserPhotoUrl(url);
      setUserPhotoScale(1); // Reset scale on new upload
      toast({ title: "Photo attached!", description: "You can now drag and zoom the photo in the preview." });
    }
  };

  const handleDownload = async () => {
    if (canvasRef.current && id) {
      const docRef = doc(db, "templates", id as string);
      updateDoc(docRef, { usageCount: increment(1) })
        .catch(async (err) => {
          const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'update'
          });
          errorEmitter.emit('permission-error', permissionError);
        });
      
      // Export as high quality JPG
      canvasRef.current.export4K(`photocard_${formData.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.jpg`);
      toast({ title: "Card generated!", description: "Check your downloads folder." });
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  if (!template) return (
    <div className="p-10 text-center flex flex-col items-center gap-4">
      <p className="text-muted-foreground">Template not found.</p>
      <Button onClick={() => router.push("/")}>Return Home</Button>
    </div>
  );

  const canvasConfig = {
    ...template,
    nameConfig: { ...template.nameConfig, text: formData.name || "Your Name" },
    designationConfig: { ...template.designationConfig, text: formData.designation || "Department/Designation" },
    sessionConfig: { ...template.sessionConfig, text: formData.session || "Session 2021-22" }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border/50 p-4 sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
              <ChevronLeft />
            </Button>
            <h1 className="font-bold text-lg">{template.title}</h1>
          </div>
          {template.usageCount > 0 && (
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="w-3 h-3 text-primary" /> {template.usageCount} generated
            </Badge>
          )}
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8 items-start justify-center">
          {/* Step 1: Details Sidebar */}
          <div className={`w-full md:w-[350px] space-y-6 ${step === 2 ? "hidden md:block" : "block"}`}>
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm">1</span>
                Customize Details
              </h2>
              
              <div className="space-y-2">
                <Label>Your Photo (Required)</Label>
                <div className="relative group aspect-square rounded-2xl border-2 border-dashed border-border bg-muted/30 hover:bg-muted/50 transition-colors flex flex-col items-center justify-center overflow-hidden">
                  {userPhotoUrl ? (
                    <img src={userPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Camera className="w-10 h-10 text-muted-foreground mb-2" />
                      <span className="text-xs text-muted-foreground">Click to upload photo</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {userPhotoUrl && (
                <div className="p-4 bg-muted/50 rounded-xl space-y-3 border border-border/50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <span className="flex items-center gap-1"><ZoomIn className="w-3 h-3" /> Photo Zoom</span>
                    <span>{Math.round(userPhotoScale * 100)}%</span>
                  </div>
                  <Slider 
                    value={[userPhotoScale]} 
                    min={0.5} 
                    max={3} 
                    step={0.01} 
                    onValueChange={([val]) => setUserPhotoScale(val)}
                  />
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                    <Move className="w-3 h-3" /> Tip: Drag the photo in the preview to reposition.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="rounded-xl h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="designation">Designation / Department</Label>
                <Input
                  id="designation"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="Department/Designation"
                  className="rounded-xl h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="session">Session / Batch</Label>
                <Input
                  id="session"
                  value={formData.session}
                  onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                  placeholder="Session 2021-22"
                  className="rounded-xl h-12"
                />
              </div>
            </div>

            <Button 
              className="w-full h-14 rounded-xl text-lg font-bold gap-2 md:hidden" 
              onClick={() => setStep(2)}
              disabled={!userPhotoUrl || !formData.name}
            >
              Continue to Preview <ChevronLeft className="rotate-180" />
            </Button>
          </div>

          {/* Step 2: Preview & Download */}
          <div className={`flex-1 w-full max-w-[500px] space-y-6 ${step === 1 ? "hidden md:block" : "block"}`}>
            <h2 className="text-xl font-bold hidden md:flex items-center gap-2">
              <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm">2</span>
              Live Preview
            </h2>
            
            <div className="w-full">
              <PhotoCardCanvas 
                config={canvasConfig} 
                userPhotoUrl={userPhotoUrl || DEFAULT_USER_PLACEHOLDER} 
                userPhotoScale={userPhotoScale}
                ref={canvasRef} 
              />
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <Button 
                  variant="outline" 
                  className="flex-1 h-14 rounded-xl md:hidden" 
                  onClick={() => setStep(1)}
                >
                  ← Edit Details
                </Button>
                <Button 
                  className="flex-1 h-14 rounded-xl text-lg font-bold bg-secondary hover:bg-secondary/90 gap-2 shadow-xl shadow-secondary/20"
                  onClick={handleDownload}
                  disabled={!userPhotoUrl || !formData.name}
                >
                  <Download className="w-5 h-5" /> Download 4K JPG
                </Button>
              </div>
              
              <p className="text-center text-xs text-muted-foreground italic md:block hidden">
                Hint: {userPhotoUrl ? "Use the mouse to drag your photo within the frame." : "Upload your photo to start customizing."}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}