"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export function KineticHeroSpiral({
  scrollProgress = 0,
}: {
  scrollProgress?: number;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(scrollProgress);
  scrollRef.current = scrollProgress;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check WebGL availability
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      return; // Fallback handled gracefully
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 18;

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Group holding the spiral strands and particles
    const spiralGroup = new THREE.Group();
    scene.add(spiralGroup);

    // 1. Create Double Helix / Twisted Yarn Spirals
    const createStrand = (
      radius: number,
      turns: number,
      colorHex: number,
      pointCount: number,
      offsetAngle: number
    ) => {
      const points: THREE.Vector3[] = [];
      const height = 24;

      for (let i = 0; i <= pointCount; i++) {
        const t = (i / pointCount) * Math.PI * 2 * turns;
        const y = (i / pointCount - 0.5) * height;
        // Tapered radius towards top and bottom like a yarn spindle
        const r = radius * (1 - Math.pow((i / pointCount - 0.5) * 1.5, 2));
        const x = Math.cos(t + offsetAngle) * r;
        const z = Math.sin(t + offsetAngle) * r;
        points.push(new THREE.Vector3(x, y, z));
      }

      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeometry = new THREE.TubeGeometry(curve, 180, 0.14, 8, false);
      const material = new THREE.MeshStandardMaterial({
        color: colorHex,
        roughness: 0.35,
        metalness: 0.2,
        emissive: colorHex,
        emissiveIntensity: 0.35,
      });

      return new THREE.Mesh(tubeGeometry, material);
    };

    // Add main signature strands (Artique Neon Red-Orange, Electric Gold, Cream)
    const strand1 = createStrand(4.5, 3.5, 0xff3b1f, 180, 0);
    const strand2 = createStrand(4.5, 3.5, 0xffcc19, 180, Math.PI);
    const strand3 = createStrand(3.2, 4.0, 0xe26a37, 140, Math.PI * 0.5);
    const strand4 = createStrand(5.2, 2.8, 0xfaf7f2, 160, Math.PI * 1.5);

    spiralGroup.add(strand1, strand2, strand3, strand4);

    // 2. Glowing Fiber Particles / Craft Motes
    const particleCount = 280;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorChoices = [
      new THREE.Color(0xff3b1f),
      new THREE.Color(0xffcc19),
      new THREE.Color(0xffb6ef),
      new THREE.Color(0xffffff),
    ];

    for (let i = 0; i < particleCount; i++) {
      // Swirling cylinder distribution
      const theta = Math.random() * Math.PI * 2;
      const radius = 2 + Math.random() * 6.5;
      const y = (Math.random() - 0.5) * 22;

      positions[i * 3] = Math.cos(theta) * radius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(theta) * radius;

      const c = colorChoices[Math.floor(Math.random() * colorChoices.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    spiralGroup.add(particles);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    const redLight = new THREE.PointLight(0xff3b1f, 3.5, 40);
    redLight.position.set(8, 6, 8);
    const goldLight = new THREE.PointLight(0xffcc19, 3.0, 40);
    goldLight.position.set(-8, -6, 6);

    scene.add(ambientLight, redLight, goldLight);

    // Tilt group slightly like WPKoi hero
    spiralGroup.rotation.x = 0.28;
    spiralGroup.rotation.z = -0.15;

    // Mouse coordinates for interactive parallax
    let targetRotY = 0;
    let targetRotX = 0;
    let currentRotY = 0;
    let currentRotX = 0;

    const handlePointerMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      targetRotY = x * 0.45;
      targetRotX = y * 0.35;
    };

    window.addEventListener("mousemove", handlePointerMove, { passive: true });

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      const scroll = scrollRef.current;

      // Base rotation + scroll acceleration
      spiralGroup.rotation.y = elapsed * 0.4 + scroll * Math.PI * 3;
      particles.rotation.y = elapsed * 0.15;

      // Parallax smooth interpolation
      currentRotY += (targetRotY - currentRotY) * 0.05;
      currentRotX += (targetRotX - currentRotX) * 0.05;

      camera.position.x = currentRotY * 3.5;
      camera.position.y = currentRotX * 2.5;
      camera.lookAt(0, 0, 0);

      // Scale spiral based on scroll progression
      const targetScale = 1 + scroll * 0.35;
      spiralGroup.scale.set(targetScale, targetScale, targetScale);

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="kinetic-hero-webgl-bg"
      aria-hidden="true"
    />
  );
}
