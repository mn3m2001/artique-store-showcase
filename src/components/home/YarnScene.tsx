"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import type * as Three from "three";
import { useLanguage } from "@/context/LanguageContext";
import Image from "next/image";

interface YarnSceneProps {
  enabled?: boolean;
  motionIntensity?: "low" | "medium" | "high";
  compact?: boolean;
}

// Dynamic lightweight Canvas loader with robust error boundary & static fallback
export function YarnScene({ enabled = true, motionIntensity = "medium", compact = false }: YarnSceneProps) {
  const { locale } = useLanguage();
  const [paused, setPaused] = useState(false);
  const [canRender3D, setCanRender3D] = useState(false);
  const [hasError, setHasError] = useState(false);
  const handleError = useCallback(() => setHasError(true), []);

  useEffect(() => {
    let active = true;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const checkSupport = async () => {
    await Promise.resolve();
    if (!active) return;
    if (!enabled) {
      setCanRender3D(false);
      return;
    }

    // 1. Check prefers-reduced-motion
    const prefersReducedMotion = preference.matches;
    if (prefersReducedMotion) {
      setCanRender3D(false);
      return;
    }

    // 2. Check WebGL availability
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (gl) {
        setCanRender3D(true);
      } else {
        setCanRender3D(false);
      }
    } catch {
      setHasError(true);
    }
    };
    void checkSupport();
    preference.addEventListener("change", checkSupport);
    return () => { active = false; preference.removeEventListener("change", checkSupport); };
  }, [enabled]);

  if (!enabled || !canRender3D || hasError) {
    return <StaticFallback compact={compact} />;
  }

  return (
    <div data-testid="yarn-scene" className={`relative w-full ${compact ? "h-[280px]" : "h-[420px] md:h-[520px]"} flex items-center justify-center`}>
      <ThreeCanvas onError={handleError} motionIntensity={motionIntensity} paused={paused} />
      <div className={`absolute ${compact ? "bottom-2" : "top-2"} inset-x-4 flex items-center justify-between gap-3 text-[11px] text-[#6E5F50]`}>
        <span>{locale === "ar" ? "حرّك المؤشر • عالم آرتيك ثلاثي الأبعاد" : "Move your pointer • Artique in 3D"}</span>
        <button type="button" aria-pressed={paused} onClick={() => setPaused((value) => !value)} className="shrink-0 rounded-full border border-[#E0D3C1] bg-white/90 px-3 py-2 font-semibold hover:border-[#C8692F]">
          {locale === "ar" ? paused ? "تشغيل الحركة" : "إيقاف الحركة" : paused ? "Play motion" : "Pause motion"}
        </button>
      </div>
    </div>
  );
}

function StaticFallback({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`relative w-full ${compact ? "h-[280px] [&>div]:scale-75" : "h-[420px] md:h-[520px]"} flex items-center justify-center p-6`}>
      <div className="relative w-72 h-72 md:w-96 md:h-96 rounded-full bg-gradient-to-tr from-[#EDE5D5] via-[#FAF7F2] to-[#F5ECE1] p-6 shadow-2xl flex items-center justify-center border-2 border-[#E8DED1]">
        <div className="absolute inset-4 rounded-full border border-dashed border-[#C8692F]/30 pointer-events-none" />
        <div className="relative w-56 h-56 md:w-72 md:h-72">
          <Image
            src="/demo-media/logo-67c9bd5fb43debcf.png"
            alt="Artique Yarn Crafts Logo"
            fill
            sizes="(max-width: 768px) 250px, 350px"
            className="object-contain drop-shadow-md hover:scale-105 transition-transform duration-500"
            priority
          />
        </div>
      </div>
    </div>
  );
}

function createProceduralYarnTexture(
  THREE: typeof Three,
  baseHex: string,
  strandHex: string,
  highlightHex: string
) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Base wool color
  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 512, 512);

  // Woven strand ridges
  ctx.strokeStyle = strandHex;
  ctx.lineWidth = 2.5;
  ctx.globalAlpha = 0.45;
  for (let i = -50; i < 562; i += 10) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.bezierCurveTo(170, i + 14, 340, i - 14, 512, i);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.bezierCurveTo(i + 14, 170, i - 14, 340, i, 512);
    ctx.stroke();
  }

  // Diagonal cross-thread accents
  ctx.strokeStyle = highlightHex;
  ctx.lineWidth = 1.2;
  ctx.globalAlpha = 0.3;
  for (let d = -200; d < 700; d += 16) {
    ctx.beginPath();
    ctx.moveTo(d, 0);
    ctx.lineTo(d + 512, 512);
    ctx.stroke();
  }

  // Micro-wool fiber flecks
  ctx.globalAlpha = 0.12;
  for (let f = 0; f < 1800; f++) {
    const fx = Math.random() * 512;
    const fy = Math.random() * 512;
    ctx.fillStyle = f % 2 === 0 ? "#ffffff" : "#1a120b";
    ctx.fillRect(fx, fy, 2, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

function ThreeCanvas({
  onError,
  motionIntensity,
  paused,
}: {
  onError: () => void;
  motionIntensity: "low" | "medium" | "high";
  paused: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const pausedRef = useRef(paused);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  useEffect(() => {
    let animationFrameId: number;
    let renderer: Three.WebGLRenderer | undefined;
    let disposed = false;
    let cleanup: (() => void) | undefined;

    async function initThree() {
      try {
        const THREE = await import("three");
        if (disposed || !containerRef.current) return;

        const width = containerRef.current.clientWidth || 400;
        const height = containerRef.current.clientHeight || 480;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
        camera.position.set(0, 0, 7.4);

        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          powerPreference: "low-power",
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.shadowMap.enabled = false;

        containerRef.current.replaceChildren(renderer.domElement);

        // --- Studio Lighting Setup ---
        // Warm ambient for craft studio glow
        const ambientLight = new THREE.AmbientLight(0xfff7ed, 1.45);
        scene.add(ambientLight);

        // Key light: crisp, slightly warm directional light
        const dirLight = new THREE.DirectionalLight(0xfffaee, 1.7);
        dirLight.position.set(4.5, 5.5, 5);
        scene.add(dirLight);

        // Fill / Bounce light: terracotta warmth from underneath
        const bounceLight = new THREE.DirectionalLight(0xc8692f, 0.75);
        bounceLight.position.set(-4, -3, 2);
        scene.add(bounceLight);

        // Subtle olive / gold rim light
        const rimLight = new THREE.DirectionalLight(0xb8862b, 0.45);
        rimLight.position.set(1.5, -4, -3);
        scene.add(rimLight);

        // Master Group for whole artisan arrangement
        const group = new THREE.Group();
        scene.add(group);

        // Procedural tactile textures
        const texTerracotta = createProceduralYarnTexture(THREE, "#C8692F", "#A9511F", "#F6D0B3");
        const texRose = createProceduralYarnTexture(THREE, "#D98A93", "#B56670", "#FBE3E6");
        const texWheat = createProceduralYarnTexture(THREE, "#C9B775", "#9E8E4F", "#FAF1D3");

        // --- 1. Main Terracotta Yarn Ball with Layered Wound Ribs ---
        const geoMain = new THREE.SphereGeometry(1.28, 36, 36);
        const matTerracotta = new THREE.MeshStandardMaterial({
          color: 0xc8692f,
          map: texTerracotta || undefined,
          bumpMap: texTerracotta || undefined,
          bumpScale: 0.04,
          roughness: 0.9,
          metalness: 0.02,
        });
        const ballMain = new THREE.Mesh(geoMain, matTerracotta);
        ballMain.position.set(-0.35, -0.15, 0);
        group.add(ballMain);

        // Physical Winding Strands: 16 realistic overlapping wraps around the main ball
        const windingMat = new THREE.MeshStandardMaterial({
          color: 0xdb773c,
          roughness: 0.92,
        });

        const windingAngles = [
          [0.3, 0.2, 0.1],
          [0.9, 0.8, -0.4],
          [-0.6, 1.1, 0.5],
          [1.4, -0.3, 0.8],
          [-1.1, -0.7, 0.3],
          [0.2, 1.5, -0.6],
          [0.7, -1.2, 0.4],
          [-0.4, 0.6, 1.3],
          [1.2, 0.4, -1.1],
          [-0.8, -0.5, -0.7],
          [0.5, 1.0, 0.9],
          [-1.3, 0.3, -0.5],
        ];

        windingAngles.forEach(([rx, ry, rz], idx) => {
          const radiusScale = 1.28 + (idx % 3) * 0.015;
          const tube = 0.038 + (idx % 2) * 0.008;
          const ringGeo = new THREE.TorusGeometry(radiusScale, tube, 10, 48);
          const ring = new THREE.Mesh(ringGeo, windingMat);
          ring.rotation.set(rx, ry, rz);
          ballMain.add(ring);
        });

        // Loose tail thread unspooling downwards
        const curvePoints = [
          new THREE.Vector3(-0.35, -1.4, 0),
          new THREE.Vector3(-0.6, -1.8, 0.2),
          new THREE.Vector3(-0.2, -2.1, 0.3),
          new THREE.Vector3(0.2, -2.3, 0.1),
        ];
        const tailCurve = new THREE.CatmullRomCurve3(curvePoints);
        const tailGeo = new THREE.TubeGeometry(tailCurve, 32, 0.04, 8, false);
        const tailMesh = new THREE.Mesh(tailGeo, windingMat);
        group.add(tailMesh);

        // --- 2. Soft Rose Yarn Ball with Cross Windings ---
        const geoSmall1 = new THREE.SphereGeometry(0.85, 32, 32);
        const matRose = new THREE.MeshStandardMaterial({
          color: 0xd98a93,
          map: texRose || undefined,
          bumpMap: texRose || undefined,
          bumpScale: 0.04,
          roughness: 0.92,
          metalness: 0.02,
        });
        const ballRose = new THREE.Mesh(geoSmall1, matRose);
        ballRose.position.set(1.2, 0.7, 0.2);
        group.add(ballRose);

        const roseWindingMat = new THREE.MeshStandardMaterial({
          color: 0xe599a2,
          roughness: 0.92,
        });
        for (let i = 0; i < 6; i++) {
          const rGeo = new THREE.TorusGeometry(0.86, 0.032, 8, 36);
          const rMesh = new THREE.Mesh(rGeo, roseWindingMat);
          rMesh.rotation.set(i * 0.7, i * 0.5, i * 0.3);
          ballRose.add(rMesh);
        }

        // --- 3. Warm Wheat / Gold Yarn Ball ---
        const geoSmall2 = new THREE.SphereGeometry(0.72, 28, 28);
        const matWheat = new THREE.MeshStandardMaterial({
          color: 0xc9b775,
          map: texWheat || undefined,
          bumpMap: texWheat || undefined,
          bumpScale: 0.04,
          roughness: 0.88,
          metalness: 0.02,
        });
        const ballWheat = new THREE.Mesh(geoSmall2, matWheat);
        ballWheat.position.set(-1.25, 1.05, -0.3);
        group.add(ballWheat);

        const wheatWindingMat = new THREE.MeshStandardMaterial({
          color: 0xd8c886,
          roughness: 0.88,
        });
        for (let j = 0; j < 5; j++) {
          const wGeo = new THREE.TorusGeometry(0.73, 0.028, 8, 36);
          const wMesh = new THREE.Mesh(wGeo, wheatWindingMat);
          wMesh.rotation.set(-j * 0.6, j * 0.8, -j * 0.4);
          ballWheat.add(wMesh);
        }

        // --- 4. Layered Crochet Rosette / Flower ---
        const flowerGroup = new THREE.Group();
        flowerGroup.position.set(0.65, -0.95, 0.5);
        flowerGroup.rotation.x = -0.25;
        flowerGroup.rotation.y = 0.35;
        group.add(flowerGroup);

        // Flower center: honey spiral knot core
        const centerGeo = new THREE.SphereGeometry(0.34, 20, 20);
        const centerMat = new THREE.MeshStandardMaterial({
          color: 0xe6a863,
          roughness: 0.9,
        });
        const center = new THREE.Mesh(centerGeo, centerMat);
        flowerGroup.add(center);

        // Spiral cord loop on center
        const centerLoopGeo = new THREE.TorusGeometry(0.35, 0.04, 8, 24);
        const centerLoop = new THREE.Mesh(centerLoopGeo, centerMat);
        centerLoop.rotation.x = Math.PI / 4;
        center.add(centerLoop);

        // Outer Tier: 5 sculpted petals with scalloped stitch edges
        const petalMatOuter = new THREE.MeshStandardMaterial({
          color: 0xf6e3d5, // warm creamy pink
          roughness: 0.86,
        });

        for (let p = 0; p < 5; p++) {
          const angle = (p * Math.PI * 2) / 5;
          const petalGeo = new THREE.SphereGeometry(0.32, 16, 16);
          petalGeo.scale(1.45, 0.42, 0.88);
          const petal = new THREE.Mesh(petalGeo, petalMatOuter);
          petal.position.set(Math.cos(angle) * 0.56, Math.sin(angle) * 0.56, -0.06);
          petal.rotation.z = angle;
          petal.rotation.y = 0.15;
          flowerGroup.add(petal);

          // Scallop stitch ridge along petal edge
          const rimGeo = new THREE.TorusGeometry(0.32, 0.024, 6, 24);
          rimGeo.scale(1.4, 0.4, 0.8);
          const rim = new THREE.Mesh(rimGeo, petalMatOuter);
          petal.add(rim);
        }

        // Inner Tier: 5 smaller offset petals
        const petalMatInner = new THREE.MeshStandardMaterial({
          color: 0xedd0c0,
          roughness: 0.88,
        });
        for (let q = 0; q < 5; q++) {
          const angle = (q * Math.PI * 2) / 5 + Math.PI / 5;
          const petalInnerGeo = new THREE.SphereGeometry(0.24, 14, 14);
          petalInnerGeo.scale(1.3, 0.4, 0.8);
          const petalInner = new THREE.Mesh(petalInnerGeo, petalMatInner);
          petalInner.position.set(Math.cos(angle) * 0.38, Math.sin(angle) * 0.38, 0.08);
          petalInner.rotation.z = angle;
          flowerGroup.add(petalInner);
        }

        // --- 5. Natural Wooden Knitting Needles ---
        const needleGeo = new THREE.CylinderGeometry(0.044, 0.044, 4.3, 16);
        const needleMat = new THREE.MeshStandardMaterial({
          color: 0xd2aa72, // Warm natural smooth cedar
          roughness: 0.35,
          metalness: 0.08,
        });

        const needle1 = new THREE.Mesh(needleGeo, needleMat);
        needle1.position.set(0.35, 0.25, -0.25);
        needle1.rotation.z = Math.PI / 3.8;
        needle1.rotation.x = 0.2;
        group.add(needle1);

        const needle2 = new THREE.Mesh(needleGeo, needleMat);
        needle2.position.set(0.12, 0.35, -0.35);
        needle2.rotation.z = -Math.PI / 4.2;
        needle2.rotation.x = -0.15;
        group.add(needle2);

        // Wooden stopper beads at top of needles
        const beadGeo = new THREE.SphereGeometry(0.1, 16, 16);
        const beadMat = new THREE.MeshStandardMaterial({ color: 0x9c6644, roughness: 0.4 });
        const bead1 = new THREE.Mesh(beadGeo, beadMat);
        bead1.position.set(0, 2.15, 0);
        needle1.add(bead1);

        const bead2 = new THREE.Mesh(beadGeo, beadMat);
        bead2.position.set(0, 2.15, 0);
        needle2.add(bead2);

        // Motion parameters based on motionIntensity setting
        const speedMultiplier =
          motionIntensity === "low" ? 0.35 : motionIntensity === "high" ? 1.35 : 0.9;
        const tiltIntensity =
          motionIntensity === "low" ? 0.08 : motionIntensity === "high" ? 0.35 : 0.22;

        // Pointer move event for interactive parallax
        const handlePointerMove = (e: MouseEvent) => {
          if (!containerRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
          mouseRef.current.targetX = Math.max(-1, Math.min(1, x)) * tiltIntensity;
          mouseRef.current.targetY = Math.max(-1, Math.min(1, y)) * tiltIntensity;
        };

        const handlePointerLeave = () => {
          mouseRef.current.targetX = 0;
          mouseRef.current.targetY = 0;
        };

        const containerEl = containerRef.current;
        containerEl.addEventListener("mousemove", handlePointerMove);
        containerEl.addEventListener("mouseleave", handlePointerLeave);

        // Gentle floating animation loop with mouse follow
        let clock = 0;
        const animate = () => {
          animationFrameId = requestAnimationFrame(animate);
          if (pausedRef.current || document.hidden || containerEl.getBoundingClientRect().bottom < 0 || containerEl.getBoundingClientRect().top > window.innerHeight) return;
          clock += 0.007 * speedMultiplier;

          // Smooth lerp mouse parallax
          mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
          mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

          const floatY = Math.sin(clock * 1.1) * (0.12 * speedMultiplier);
          const floatRotY = Math.sin(clock * 0.7) * (0.18 * speedMultiplier);

          group.position.y = floatY;
          group.rotation.y = floatRotY + mouseRef.current.x;
          group.rotation.x = -mouseRef.current.y * 0.8;

          // Gentle flower sway
          flowerGroup.rotation.z = Math.sin(clock * 1.4) * 0.08;

          renderer?.render(scene, camera);
        };
        animate();

        // Resize handler
        const handleResize = () => {
          if (!containerRef.current || !renderer) return;
          const w = containerRef.current.clientWidth;
          const h = containerRef.current.clientHeight;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        };
        window.addEventListener("resize", handleResize);

        cleanup = () => {
          window.removeEventListener("resize", handleResize);
          if (containerEl) {
            containerEl.removeEventListener("mousemove", handlePointerMove);
            containerEl.removeEventListener("mouseleave", handlePointerLeave);
          }
          cancelAnimationFrame(animationFrameId);
          scene.traverse((object) => {
            if (object instanceof THREE.Mesh) {
              object.geometry.dispose();
              const materials = Array.isArray(object.material) ? object.material : [object.material];
              materials.forEach((material: Three.Material) => material.dispose());
            }
          });
          [texTerracotta, texRose, texWheat].forEach((texture) => texture?.dispose());
          renderer?.dispose();
          containerEl.replaceChildren();
        };
      } catch (err) {
        console.error("Three.js init error:", err);
        onError();
      }
    }

    initThree();

    return () => {
      disposed = true;
      cleanup?.();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (renderer) renderer.dispose();
    };
  }, [onError, motionIntensity]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing select-none transition-transform"
      title="حرّك المؤشر للتفاعل مع تكوين خيوط وورد آرتيك"
    />
  );
}
