"use client";

import React, { useRef, useImperativeHandle, forwardRef } from "react";
import { Stage, Layer, Image as KonvaImage, Text, Group, Circle, Rect } from "react-konva";
import useImage from "use-image";

interface LayerConfig {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontStyle: string;
  color: string;
  align: "left" | "center" | "right";
}

interface TemplateConfig {
  backgroundImageUrl?: string;
  photoConfig: {
    shape: "circle" | "square";
    diameter?: number;
    width?: number;
    height?: number;
    borderRadius?: number;
    borderWidth?: number;
    borderColor?: string;
    x: number;
    y: number;
  };
  nameConfig: LayerConfig;
  designationConfig: LayerConfig;
  sessionConfig: LayerConfig;
}

interface PhotoCardCanvasProps {
  config: TemplateConfig;
  userPhotoUrl?: string;
  userPhotoScale?: number;
  width?: number;
  height?: number;
  onUserPhotoTransform?: (x: number, y: number) => void;
  onLayerTransform?: (layer: string, x: number, y: number) => void;
}

export const PhotoCardCanvas = forwardRef(({ 
  config, 
  userPhotoUrl, 
  userPhotoScale = 1,
  width = 500, 
  height = 500,
  onUserPhotoTransform,
  onLayerTransform
}: PhotoCardCanvasProps, ref) => {
  const stageRef = useRef<any>(null);
  
  const [bgImage] = useImage(config.backgroundImageUrl || "https://placehold.co/600x600?text=No+Background", "anonymous");
  const [userPhoto] = useImage(userPhotoUrl || "", "anonymous");

  useImperativeHandle(ref, () => ({
    export4K: (filename: string) => {
      if (!stageRef.current) return;
      // Use image/jpeg with high quality (1.0) for 4K JPG export
      const dataUrl = stageRef.current.toDataURL({ 
        pixelRatio: 4,
        mimeType: 'image/jpeg',
        quality: 1.0
      });
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

  const renderTextLayer = (layerName: string, layerConfig: LayerConfig) => {
    return (
      <Text
        text={layerConfig.text}
        x={layerConfig.x}
        y={layerConfig.y}
        fontSize={layerConfig.fontSize}
        fontStyle={layerConfig.fontStyle}
        fill={layerConfig.color}
        align={layerConfig.align}
        width={width}
        fontFamily="Bricolage Grotesque"
        draggable
        onDragEnd={(e) => {
          if (onLayerTransform) {
            onLayerTransform(layerName, e.target.x(), e.target.y());
          }
        }}
      />
    );
  };

  const renderBorder = () => {
    const pc = config.photoConfig;
    const bw = pc.borderWidth || 0;
    if (bw <= 0) return null;

    if (pc.shape === "circle") {
      const radius = (pc.diameter || 150) / 2;
      return (
        <Circle
          x={pc.x + radius}
          y={pc.y + radius}
          radius={radius}
          stroke={pc.borderColor || "#ffffff"}
          strokeWidth={bw}
          listening={false}
        />
      );
    } else {
      return (
        <Rect
          x={pc.x}
          y={pc.y}
          width={pc.width || 150}
          height={pc.height || 150}
          cornerRadius={pc.borderRadius || 0}
          stroke={pc.borderColor || "#ffffff"}
          strokeWidth={bw}
          listening={false}
        />
      );
    }
  };

  return (
    <div className="relative aspect-square w-full max-w-[500px] mx-auto overflow-hidden bg-muted/20 rounded-xl shadow-inner border border-border/50">
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

          {renderBorder()}

          {renderTextLayer("nameConfig", config.nameConfig)}
          {renderTextLayer("designationConfig", config.designationConfig)}
          {renderTextLayer("sessionConfig", config.sessionConfig)}
        </Layer>
      </Stage>
    </div>
  );
});

PhotoCardCanvas.displayName = "PhotoCardCanvas";

export default PhotoCardCanvas;