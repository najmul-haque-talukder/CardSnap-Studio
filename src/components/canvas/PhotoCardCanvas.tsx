
"use client";

import React, { useRef, useImperativeHandle, forwardRef } from "react";
import { Stage, Layer, Image as KonvaImage, Text, Group } from "react-konva";
import useImage from "use-image";

interface TemplateConfig {
  backgroundImageUrl?: string;
  photoConfig: {
    shape: "circle" | "square";
    diameter?: number;
    width?: number;
    height?: number;
    borderRadius?: number;
    x: number;
    y: number;
  };
  nameConfig: {
    text: string;
    x: number;
    y: number;
    fontSize: number;
    fontStyle: string;
    color: string;
    align: "left" | "center" | "right";
  };
  designationConfig: {
    text: string;
    x: number;
    y: number;
    fontSize: number;
    fontStyle: string;
    color: string;
    align: "left" | "center" | "right";
  };
  sessionConfig: {
    text: string;
    x: number;
    y: number;
    fontSize: number;
    fontStyle: string;
    color: string;
    align: "left" | "center" | "right";
  };
}

interface PhotoCardCanvasProps {
  config: TemplateConfig;
  userPhotoUrl?: string;
  width?: number;
  height?: number;
}

export const PhotoCardCanvas = forwardRef(({ config, userPhotoUrl, width = 500, height = 500 }: PhotoCardCanvasProps, ref) => {
  const stageRef = useRef<any>(null);
  const [bgImage] = useImage(config.backgroundImageUrl || "https://picsum.photos/seed/bg/500/500");
  const [userPhoto] = useImage(userPhotoUrl || "https://picsum.photos/seed/user/200/200");

  useImperativeHandle(ref, () => ({
    export4K: (filename: string) => {
      if (!stageRef.current) return;
      const dataUrl = stageRef.current.toDataURL({ pixelRatio: 4 });
      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      link.click();
    }
  }));

  const clipFunc = (ctx: any) => {
    const pc = config.photoConfig;
    if (pc.shape === "circle") {
      const radius = (pc.diameter || 150) / 2;
      ctx.arc(pc.x + radius, pc.y + radius, radius, 0, Math.PI * 2, false);
    } else {
      const w = pc.width || 150;
      const h = pc.height || 150;
      const r = pc.borderRadius || 0;
      ctx.roundRect(pc.x, pc.y, w, h, r);
    }
  };

  return (
    <div className="relative aspect-square w-full max-w-[500px] mx-auto shadow-2xl rounded-2xl overflow-hidden border-4 border-muted shadow-primary/20">
      <Stage width={width} height={height} ref={stageRef}>
        <Layer>
          {bgImage && <KonvaImage image={bgImage} width={width} height={height} />}
          
          <Group clipFunc={clipFunc}>
            {userPhoto && (
              <KonvaImage 
                image={userPhoto} 
                x={config.photoConfig.x} 
                y={config.photoConfig.y}
                width={config.photoConfig.shape === "circle" ? config.photoConfig.diameter : config.photoConfig.width}
                height={config.photoConfig.shape === "circle" ? config.photoConfig.diameter : config.photoConfig.height}
              />
            )}
          </Group>

          <Text
            text={config.nameConfig.text}
            x={config.nameConfig.x}
            y={config.nameConfig.y}
            fontSize={config.nameConfig.fontSize}
            fontStyle={config.nameConfig.fontStyle}
            fill={config.nameConfig.color}
            align={config.nameConfig.align}
            width={width}
            fontFamily="Bricolage Grotesque"
          />

          <Text
            text={config.designationConfig.text}
            x={config.designationConfig.x}
            y={config.designationConfig.y}
            fontSize={config.designationConfig.fontSize}
            fontStyle={config.designationConfig.fontStyle}
            fill={config.designationConfig.color}
            align={config.designationConfig.align}
            width={width}
            fontFamily="Bricolage Grotesque"
          />

          <Text
            text={config.sessionConfig.text}
            x={config.sessionConfig.x}
            y={config.sessionConfig.y}
            fontSize={config.sessionConfig.fontSize}
            fontStyle={config.sessionConfig.fontStyle}
            fill={config.sessionConfig.color}
            align={config.sessionConfig.align}
            width={width}
            fontFamily="Bricolage Grotesque"
          />
        </Layer>
      </Stage>
    </div>
  );
});

PhotoCardCanvas.displayName = "PhotoCardCanvas";

export default PhotoCardCanvas;
