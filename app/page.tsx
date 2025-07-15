"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const ICONS = [
  "arrows.jpeg",
  "camera.jpeg",
  "dialog.jpeg",
  "heart.jpeg",
  "music.jpeg",
  "smile.jpeg",
  "songs.jpeg",
  "start.jpeg",
  "turn-off-button.jpeg",
];

const initialPositions = ICONS.map((_, i) => ({
  x: 60 + (i % 3) * 120,
  y: 60 + Math.floor(i / 3) * 120,
}));

function DraggableIcons() {
  const [positions, setPositions] = useState(initialPositions);
  const [dragging, setDragging] = useState<{idx: number; offsetX: number; offsetY: number} | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (dragging) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        setPositions((prev) => prev.map((pos, i) =>
          i === dragging.idx
            ? {
                x: e.clientX - rect.left - dragging.offsetX,
                y: e.clientY - rect.top - dragging.offsetY,
              }
            : pos
        ));
      }
    }
    function handleMouseUp() {
      setDragging(null);
    }
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

  // Touch events for mobile
  useEffect(() => {
    function handleTouchMove(e: TouchEvent) {
      if (dragging && e.touches[0]) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        setPositions((prev) => prev.map((pos, i) =>
          i === dragging.idx
            ? {
                x: e.touches[0].clientX - rect.left - dragging.offsetX,
                y: e.touches[0].clientY - rect.top - dragging.offsetY,
              }
            : pos
        ));
      }
    }
    function handleTouchEnd() {
      setDragging(null);
    }
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [dragging]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        minHeight: 400,
        background: "#f8fafc",
        borderRadius: 16,
        boxShadow: "0 2px 12px #0001",
        overflow: "hidden",
      }}
    >
      {ICONS.map((icon, i) => (
        <div
          key={icon}
          style={{
            position: "absolute",
            left: positions[i].x,
            top: positions[i].y,
            cursor: dragging?.idx === i ? "grabbing" : "grab",
            transition: dragging?.idx === i ? "none" : "box-shadow .2s",
            zIndex: dragging?.idx === i ? 10 : 1,
            boxShadow: dragging?.idx === i ? "0 4px 16px #0002" : "0 1px 4px #0001",
            borderRadius: 12,
            background: "white",
            padding: 6,
          }}
          onMouseDown={e => {
            const rect = e.currentTarget.getBoundingClientRect();
            setDragging({
              idx: i,
              offsetX: e.clientX - rect.left,
              offsetY: e.clientY - rect.top,
            });
          }}
          onTouchStart={e => {
            const touch = e.touches[0];
            const rect = e.currentTarget.getBoundingClientRect();
            setDragging({
              idx: i,
              offsetX: touch.clientX - rect.left,
              offsetY: touch.clientY - rect.top,
            });
          }}
        >
          <Image
            src={`/icons/${icon}`}
            alt={icon.replace(/\.jpeg$/, "")}
            width={64}
            height={64}
            style={{ userSelect: "none", pointerEvents: "none" }}
            draggable={false}
            priority
          />
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <main className="flex justify-center items-center h-screen">
        <DraggableIcons />
    </main>
  );
}
