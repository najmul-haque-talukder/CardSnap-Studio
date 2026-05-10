
"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
}

export function SliderInput({ label, value, min, max, step = 1, unit = "px", onChange }: SliderInputProps) {
  return (
    <div className="space-y-3 p-4 bg-muted/30 rounded-xl border border-border/50">
      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium text-foreground/80">{label}</Label>
        <span className="text-xs font-semibold text-primary px-2 py-1 bg-primary/10 rounded-md">
          {value}{unit}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onInput={(e) => onChange(Number(e.currentTarget.value))}
          className="flex-1"
        />
        <Input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-20 h-8 text-center bg-background border-border/50 focus:ring-primary/50"
        />
      </div>
    </div>
  );
}
