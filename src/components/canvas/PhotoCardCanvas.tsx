
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
  userPhotoScale?: number;
  width?: number;
  height?: number;
  onUserPhotoTransform?: (x: number, y: number) => void;
}

export const PhotoCardCanvas = forwardRef(({ 
  config, 
  userPhotoUrl, 
  userPhotoScale = 1,
  width = 500, 
  height = 500,
  onUserPhotoTransform
}: PhotoCardCanvasProps, ref) => {
  const stageRef = useRef<any>(null);
  
  const [bgImage] = useImage(config.backgroundImageUrl || "https://picsum.photos/seed/bg-placeholder/500/500", "anonymous");
  const [userPhoto] = useImage(userPhotoUrl || "", "anonymous");

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
    ctx.beginPath();
    if (pc.shape === "circle") {
      const radius = (pc.diameter || 150) / 2;
      ctx.arc(pc.x + radius, pc.y + radius, radius, 0, Math.PI * 2, false);
    } else {
      const w = pc.width || 150;
      const h = pc.height || 150;
      const r = pc.borderRadius || 0;
      ctx.roundRect(pc.x, pc.y, w, h, r);
    }
    ctx.closePath();
  };

  const frameWidth = config.photoConfig.shape === "circle" ? (config.photoConfig.diameter || 150) : (config.photoConfig.width || 150);
  const frameHeight = config.photoConfig.shape === "circle" ? (config.photoConfig.diameter || 150) : (config.photoConfig.height || 150);

  return (
    <div className="relative aspect-square w-full max-w-[500px] mx-auto shadow-2xl rounded-2xl overflow-hidden border-4 border-muted shadow-primary/20 bg-muted/20">
      <Stage width={width} height={height} ref={stageRef}>
        <Layer>
          {bgImage && (
            <KonvaImage 
              image={bgImage} 
              width={width} 
              height={height} 
              key={`bg-${config.backgroundImageUrl}`} 
            />
          )}
          
          <Group clipFunc={clipFunc}>
            {userPhoto && (
              <KonvaImage 
                image={userPhoto} 
                x={config.photoConfig.x + (frameWidth / 2)} 
                y={config.photoConfig.y + (frameHeight / 2)}
                width={userPhoto.width}
                height={userPhoto.height}
                scaleX={(frameWidth / userPhoto.width) * userPhotoScale}
                scaleY={(frameWidth / userPhoto.width) * userPhotoScale}
                offsetX={userPhoto.width / 2}
                offsetY={userPhoto.height / 2}
                draggable
                onDragEnd={(e) => {
                  if (onUserPhotoTransform) {
                    onUserPhotoTransform(e.target.x(), e.target.y());
                  }
                }}
                key={`photo-${userPhotoUrl}`}
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
