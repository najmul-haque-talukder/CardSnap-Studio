
"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ColorPickerInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
}

export function ColorPickerInput({ label, value, onChange }: ColorPickerInputProps) {
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith("#")) val = "#" + val;
    onChange(val);
  };

  return (
    <div className="space-y-3 p-4 bg-muted/30 rounded-xl border border-border/50">
      <Label className="text-sm font-medium text-foreground/80">{label}</Label>
      <div className="flex items-center gap-4">
        <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-border/50 ring-2 ring-background ring-inset">
          <input
            type="color"
            value={value}
            onInput={(e) => onChange(e.currentTarget.value)}
            className="absolute inset-0 w-[150%] h-[150%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
          />
        </div>
        <Input
          type="text"
          value={value}
          onChange={handleHexChange}
          placeholder="#ffffff"
          className="flex-1 h-10 uppercase font-mono bg-background border-border/50"
        />
      </div>
    </div>
  );
}
