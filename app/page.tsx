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

// Map icon name to audio file name (by convention)
const ICON_AUDIO_MAP: Record<string, string> = {
  "arrows.jpeg": "arrows.mp3",
  "camera.jpeg": "camera.mp3",
  "dialog.jpeg": "dialog.mp3",
  "heart.jpeg": "heart.mp3",
  "music.jpeg": "music.mp3",
  "smile.jpeg": "risa.mp3", // smile = risa (spanish for laugh)
  "songs.jpeg": "song.mp3",  // closest match
  "start.jpeg": "start.mp3",
  "turn-off-button.jpeg": "turn-off-button.mp3",
};

const initialPositions = ICONS.map((_, i) => ({
  x: 60 + (i % 3) * 200,
  y: 60 + Math.floor(i / 3) * 200,
}));

function DraggableIcons() {
  // Prevent pull-to-refresh on mobile/tablet
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    function preventPullToRefresh(e: TouchEvent) {
      if (e.touches.length !== 1) return;
      // Only prevent if at top and dragging down
      if (el!.scrollTop === 0 && e.touches[0].clientY > 0) {
        e.preventDefault();
      }
    }
    el.addEventListener("touchmove", preventPullToRefresh, { passive: false });
    return () => {
      el.removeEventListener("touchmove", preventPullToRefresh);
    };
  }, []);

  const [positions, setPositions] = useState(initialPositions);
  const [dragging, setDragging] = useState<{idx: number; offsetX: number; offsetY: number} | null>(null);
  const [dragMoved, setDragMoved] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);

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
            setDragMoved(false);
          }}
          onMouseMove={() => {
            if (dragging) setDragMoved(true);
          }}
          onMouseUp={e => {
            if (!dragMoved) {
              // Stop all other audios before playing this one
              audioRefs.current.forEach((a, idx) => {
                if (a && idx !== i) {
                  a.pause();
                  a.currentTime = 0;
                }
              });
              const audio = audioRefs.current[i];
              if (audio) {
                audio.currentTime = 0;
                audio.play();
              }
            }
          }}
          onTouchStart={e => {
            const touch = e.touches[0];
            const rect = e.currentTarget.getBoundingClientRect();
            setDragging({
              idx: i,
              offsetX: touch.clientX - rect.left,
              offsetY: touch.clientY - rect.top,
            });
            setDragMoved(false);
          }}
          onTouchMove={() => {
            if (dragging) setDragMoved(true);
          }}
          onTouchEnd={e => {
            if (!dragMoved) {
              // Stop all other audios before playing this one
              audioRefs.current.forEach((a, idx) => {
                if (a && idx !== i) {
                  a.pause();
                  a.currentTime = 0;
                }
              });
              const audio = audioRefs.current[i];
              if (audio) {
                audio.currentTime = 0;
                audio.play();
              }
            }
          }}
        >
          <Image
            src={`/icons/${icon}`}
            alt={icon.replace(/\.jpeg$/, "")}
            width={128}
            height={128}
            style={{ userSelect: "none", pointerEvents: "none" }}
            draggable={false}
            priority
          />
          <audio
            src={`/audios/${ICON_AUDIO_MAP[icon]}`}
            ref={el => { audioRefs.current[i] = el; }}
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
