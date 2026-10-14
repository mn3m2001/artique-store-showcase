"use client";

import { useEffect, useRef } from "react";
import type * as Three from "three";
import type { Product } from "@/types";

export function AtelierScene({ products, progress, night, paused, onSelect, onReady, onError }: {
  products: Product[]; progress: number; night: boolean; paused: boolean;
  onSelect: (product: Product) => void; onReady: () => void; onError: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const live = useRef({ progress, night, paused });
  useEffect(() => { live.current = { progress, night, paused }; }, [progress, night, paused]);

  useEffect(() => {
    let disposed = false;
    let disposeScene: (() => void) | undefined;
    async function build() {
      try {
        const THREE = await import("three");
        const container = host.current;
        if (!container || disposed) return;
        const scene = new THREE.Scene();
        scene.background = new THREE.Color("#eadfce");
        scene.fog = new THREE.Fog("#eadfce", 16, 34);
        const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "low-power" });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 700 ? 1.25 : 1.6));
        renderer.shadowMap.enabled = window.innerWidth > 700;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.35;
        container.appendChild(renderer.domElement);
        renderer.domElement.setAttribute("aria-hidden", "true");
        const camera = new THREE.PerspectiveCamera(42, 1, .1, 60);
        const textures = new Set<Three.Texture>();
        const makeMat = (color: string, roughness = .8, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
        const plaster = makeMat("#e2d1b9"), wood = makeMat("#8a5a3e"), oak = makeMat("#bf9469"), clay = makeMat("#be704b"), linen = makeMat("#d4c5a9"), brass = makeMat("#a98346", .4, .65);
        const place = (geometry: Three.BufferGeometry, material: Three.Material, x: number, y: number, z: number, parent: Three.Object3D = scene) => {
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true;
          parent.add(mesh); return mesh;
        };
        const box = (w: number, h: number, d: number, mat: Three.Material, x: number, y: number, z: number, parent: Three.Object3D = scene) => place(new THREE.BoxGeometry(w, h, d), mat, x, y, z, parent);
        // Quiet architectural room with a branded arch on the left wall.
        box(18, .16, 20, linen, 0, -.08, -3);
        box(18, 8, .3, plaster, 0, 4, -7.5);
        box(.25, 8, 20, plaster, -7.5, 4, -3);
        for (let i = 0; i < 17; i++) box(.018, .006, 20, oak, -7.2 + i * .85, .01, -3);
        const brandWindow = new THREE.Group();
        brandWindow.name = "artique-left-logo-window";
        brandWindow.position.set(-7.24, 1.55, -4);
        brandWindow.rotation.y = Math.PI / 2;
        scene.add(brandWindow);
        const radius = 1.9, archSpring = 3.05;
        const windowShape = new THREE.Shape();
        windowShape.moveTo(-radius, 0);
        windowShape.lineTo(radius, 0);
        windowShape.lineTo(radius, archSpring);
        windowShape.absarc(0, archSpring, radius, 0, Math.PI, false);
        windowShape.lineTo(-radius, 0);
        const panelGeometry = new THREE.ShapeGeometry(windowShape, 48);
        const positions = panelGeometry.getAttribute("position");
        const uv = panelGeometry.getAttribute("uv");
        // Square, undistorted artwork inside the taller arch; its outer margin
        // fills the crown so the logo remains one continuous panel.
        for (let i = 0; i < positions.count; i++) {
          uv.setXY(i, positions.getX(i) / (radius * 2) + .5, (positions.getY(i) - 2.2) / (radius * 2) + .5);
        }
        uv.needsUpdate = true;
        const logoMat = makeMat("#f0ecd9");
        const logo = place(panelGeometry, logoMat, 0, 0, .03, brandWindow);
        logo.name = "artique-enlarged-logo-panel";
        logo.castShadow = false;
        const arch = place(new THREE.TorusGeometry(radius, .10, 12, 64, Math.PI), oak, 0, archSpring, .09, brandWindow);
        arch.name = "artique-left-window-arch";
        box(.15, archSpring, .20, oak, -radius, archSpring / 2, .09, brandWindow);
        box(.15, archSpring, .20, oak, radius, archSpring / 2, .09, brandWindow);
        box(radius * 2 + .20, .14, .35, oak, 0, .03, .12, brandWindow);
        new THREE.TextureLoader().load("/demo-media/logo-67c9bd5fb43debcf.png", (texture) => {
          if (disposed) { texture.dispose(); return; }
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.repeat.set(.72, .72);
          texture.offset.set(.14, .14);
          textures.add(texture); logoMat.map = texture; logoMat.color.set("white"); logoMat.needsUpdate = true;
        });
        // Low workshop table, bench and carefully composed craft objects.
        box(4.5, .20, 2.1, oak, -1.85, 1.15, -.9);
        for (const x of [-3.65, -.05]) for (const z of [-1.65, -.15]) box(.13, 1.13, .13, wood, x, .56, z);
        box(3.1, .18, .7, wood, -1.9, .65, .8);
        for (const x of [-3.1, -.7]) box(.12, .65, .45, wood, x, .3, .8);
        const craft = new THREE.Group(); scene.add(craft); craft.position.set(-2.1, 1.28, -.8);
        const wool = (color: string, radius: number, x: number, y: number, z: number) => {
          const ball = place(new THREE.SphereGeometry(radius, 28, 22), makeMat(color), x, y, z, craft);
          const strand = makeMat(color === "#c76e48" ? "#d08b63" : "#e3c6ab");
          for (let n = 0; n < 11; n++) {
            const loop = place(new THREE.TorusGeometry(radius * 1.015, .013, 5, 48), strand, 0, 0, 0, ball);
            loop.rotation.set(n * .63, n * .41, n * .29);
          }
          return ball;
        };
        wool("#c76e48", .47, -.55, .46, 0);
        wool("#d5b191", .35, .23, .35, -.28);
        wool("#858465", .29, .7, .29, .13);
        const needle = place(new THREE.CylinderGeometry(.018, .018, 1.9, 8), brass, -.55, .7, -.15, craft); needle.rotation.z = -.7;
        const needle2 = place(new THREE.CylinderGeometry(.018, .018, 1.7, 8), brass, -.4, .7, -.2, craft); needle2.rotation.z = .5;
        const thread = new THREE.CatmullRomCurve3([new THREE.Vector3(-2.5, 1.75, -.5), new THREE.Vector3(-2.6, 1.28, .08), new THREE.Vector3(-2, 1.27, .16), new THREE.Vector3(-1.5, .8, .22), new THREE.Vector3(-1.3, .08, .45), new THREE.Vector3(-.1, .05, .8)]);
        place(new THREE.TubeGeometry(thread, 72, .018, 5, false), clay, 0, 0, 0);
        const basket = place(new THREE.CylinderGeometry(.65, .45, .8, 36, 1, true), makeMat("#b19464"), -4.5, .4, .05);
        for (let i = 0; i < 13; i++) {
          const ring = place(new THREE.TorusGeometry(.47 + i * .014, .023, 6, 40), oak, 0, -.36 + i * .06, 0, basket); ring.rotation.x = Math.PI / 2;
        }
        // Product photography lives inside the space, in real clickable frames.
        const frames: Three.Mesh[] = [];
        const loader = new THREE.TextureLoader();
        const loadPicture = (product: Product, mat: Three.MeshStandardMaterial, width: number, height: number) => {
          const url = product.images?.find((image) => image.is_cover)?.url || product.images?.[0]?.url;
          if (!url) return;
          loader.load(url, (texture) => {
            if (disposed) { texture.dispose(); return; }
            texture.colorSpace = THREE.SRGBColorSpace;
            const aspect = texture.image.width / texture.image.height, frameAspect = width / height;
            if (aspect > frameAspect) { texture.repeat.x = frameAspect / aspect; texture.offset.x = (1 - texture.repeat.x) / 2; }
            else { texture.repeat.y = aspect / frameAspect; texture.offset.y = (1 - texture.repeat.y) / 2; }
            textures.add(texture); mat.map = texture; mat.color.set("white"); mat.needsUpdate = true;
          });
        };
        products.slice(0, 5).forEach((product, index) => {
          const x = -4.7 + index * 2.18;
          const z = index === 0 ? -6.93 : -7.05;
          const width = 1.65, height = 2.05;
          const displayY = 5.15;
          box(width + .13, height + .13, .10, wood, x, displayY, z);
          const mat = makeMat("#eee3d1");
          const picture = place(new THREE.PlaneGeometry(width, height), mat, x, displayY, z + .061);
          picture.userData.product = product; frames.push(picture);
          loadPicture(product, mat, width, height);
          box(1.85, .11, .7, oak, x, displayY - 1.34, -6.9);
          const pot = place(new THREE.CylinderGeometry(.17, .11, .38, 20), index % 2 ? linen : clay, x + .6, displayY - 1.1, -6.88);
          pot.rotation.z = -.06;
        });
        if (products[0]) {
          box(1.65, .1, .65, wood, -.45, 1.3, -.75);
          box(1.65, 1.95, .1, oak, -.45, 2.28, -.75);
          const featuredMat = makeMat("#eee3d1");
          const featured = place(new THREE.PlaneGeometry(1.5, 1.8), featuredMat, -.45, 2.28, -.69);
          featured.userData.product = products[0]; frames.push(featured);
          loadPicture(products[0], featuredMat, 1.5, 1.8);
        }
        // Soft room lighting without a hanging ceiling fixture.
        const ambient = new THREE.HemisphereLight("#fff1dc", "#87674c", 2.5); scene.add(ambient);
        const sun = new THREE.DirectionalLight("#ffe6c2", 3.4); sun.position.set(-4, 7, 6); sun.castShadow = true;
        sun.shadow.mapSize.set(1024, 1024); sun.shadow.camera.left = -9; sun.shadow.camera.right = 9; sun.shadow.camera.top = 9; sun.shadow.camera.bottom = -9; sun.shadow.bias = -.001;
        scene.add(sun);
        const fillLight = new THREE.PointLight("#ffc77c", 4, 12, 2); fillLight.position.set(-1.8, 4.5, -1); scene.add(fillLight);
        const ray = new THREE.Raycaster(), pointer = new THREE.Vector2();
        const mouse = { x: 0, y: 0 };
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
        const pointerPosition = (event: PointerEvent) => {
          const bounds = container.getBoundingClientRect();
          pointer.set(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -((event.clientY - bounds.top) / bounds.height) * 2 + 1);
          mouse.x = pointer.x; mouse.y = pointer.y;
        };
        const move = (event: PointerEvent) => {
          pointerPosition(event); ray.setFromCamera(pointer, camera);
          container.style.cursor = ray.intersectObjects(frames).length ? "pointer" : "default";
        };
        const click = (event: PointerEvent) => {
          pointerPosition(event); ray.setFromCamera(pointer, camera);
          const hit = ray.intersectObjects(frames)[0];
          if (hit) onSelect(hit.object.userData.product as Product);
        };
        const resize = () => {
          const width = container.clientWidth, height = container.clientHeight;
          renderer.setSize(width, height); camera.aspect = width / height; camera.updateProjectionMatrix();
        };
        const observer = new ResizeObserver(resize); observer.observe(container); resize();
        container.addEventListener("pointermove", move); container.addEventListener("pointerup", click);
        let frame = 0, eased = 0, elapsed = 0, lastFrameTime = 0;
        const look = new THREE.Vector3();
        camera.position.set(3.8, 3.3, 10.5);
        const render = (now = 0) => {
          frame = requestAnimationFrame(render);
          if (document.hidden) return;
          const bounds = container.getBoundingClientRect();
          if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) return;
          const mobile = container.clientWidth < 700;
          if (mobile && now - lastFrameTime < 1000 / 30) return;
          lastFrameTime = now;
          const motion = !reduced.matches && !live.current.paused;
          if (motion) { eased += (live.current.progress - eased) * (mobile ? .1 : .055); elapsed += mobile ? .016 : .008; }
          const x = THREE.MathUtils.lerp(3.8, -1.8, eased);
          const z = THREE.MathUtils.lerp(mobile ? 14 : 10.5, 2.8, eased);
          camera.position.set(x + (motion ? mouse.x * .12 : 0), 3.3 - eased * .8 + (motion ? mouse.y * .07 : 0), z);
          look.set(mobile ? -.8 : .7 - eased * 2, 2.1 + eased * .9, -4.2 - eased * 2);
          camera.lookAt(look);
          if (motion) craft.rotation.y = Math.sin(elapsed * .5) * .025;
          const dark = live.current.night;
          ambient.intensity += ((dark ? .75 : 2.5) - ambient.intensity) * .06;
          sun.intensity += ((dark ? .25 : 3.4) - sun.intensity) * .06;
          fillLight.intensity += ((dark ? 18 : 4) - fillLight.intensity) * .06;
          renderer.toneMappingExposure += ((dark ? .95 : 1.35) - renderer.toneMappingExposure) * .06;
          renderer.render(scene, camera);

        };
        disposeScene = () => {
          cancelAnimationFrame(frame); observer.disconnect();
          container.removeEventListener("pointermove", move); container.removeEventListener("pointerup", click);
          scene.traverse((object) => { if (object instanceof THREE.Mesh) { object.geometry.dispose(); const mats = Array.isArray(object.material) ? object.material : [object.material]; mats.forEach((mat) => mat.dispose()); } });
          textures.forEach((texture) => texture.dispose()); renderer.dispose(); renderer.domElement.remove();
        };
        render(); onReady();
      } catch { if (!disposed) onError(); }
    }
    void build();
    return () => { disposed = true; disposeScene?.(); };
  }, [products, onSelect, onReady, onError]);
  return <div ref={host} className="atelier-webgl" data-testid="atelier-scene" />;
}
