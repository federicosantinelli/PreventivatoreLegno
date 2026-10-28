import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { getPricing, PRICING_STORAGE_KEY } from "./data/pricing";

function ThreeViewer({ width, height, depth, shelves, color, finish }) {
  const mount = useRef(null);
  useEffect(() => {
    const element = mount.current;
    if (!element) return undefined;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f2f1ed");
    const camera = new THREE.PerspectiveCamera(
      28,
      element.clientWidth / element.clientHeight,
      0.1,
      100,
    );
    camera.position.set(5.4, 3.6, 7.4);
    camera.lookAt(0, 0.1, 0);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(element.clientWidth, element.clientHeight);
    element.appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight("#fff8e9", "#8b765d", 2.4));
    const key = new THREE.DirectionalLight("#fff4d8", 3);
    key.position.set(4, 7, 5);
    scene.add(key);
    const group = new THREE.Group();
    const finishSettings = {
      Grezzo: { roughness: 0.95, clearcoat: 0 },
      "Cera naturale": { roughness: 0.72, clearcoat: 0.08 },
      "Verniciato opaco": { roughness: 0.48, clearcoat: 0.18 },
      Laccato: { roughness: 0.22, clearcoat: 0.65 },
    }[finish] || { roughness: 0.72, clearcoat: 0.08 };
    const material = new THREE.MeshPhysicalMaterial({
      color,
      ...finishSettings,
    });
    const backMaterial = new THREE.MeshPhysicalMaterial({
      color,
      ...finishSettings,
      roughness: Math.min(1, finishSettings.roughness + 0.12),
    });
    const w = 3.2;
    const h = Math.max(4.5, (height / width) * w);
    const d = Math.max(1.1, Math.min(2.4, (depth / width) * w));
    const cameraDistance = Math.max(12, h * 3.2);
    camera.position.set(
      cameraDistance * 0.45,
      cameraDistance * 0.22,
      cameraDistance * 0.9,
    );
    camera.lookAt(0, 0, 0);
    const thickness = 0.16;
    const box = (x, y, z, sx, sy, sz, mat = material) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat);
      mesh.position.set(x, y, z);
      group.add(mesh);
    };
    box(0, h / 2, 0, w, thickness, d);
    box(0, -h / 2, 0, w, thickness, d);
    box(-w / 2, 0, 0, thickness, h, d);
    box(w / 2, 0, 0, thickness, h, d);
    box(
      0,
      0,
      -d / 2 + thickness / 2,
      w - thickness,
      h - thickness,
      thickness,
      backMaterial,
    );
    for (let index = 0; index < shelves; index += 1) {
      const y = -h / 2 + (h / (shelves + 1)) * (index + 1);
      box(0, y, 0, w - thickness * 1.5, thickness * 0.85, d - thickness);
    }
    group.rotation.set(0, -0.3, 0);
    scene.add(group);
    const pointer = { x: 0, y: 0 };
    const onPointerMove = (event) => {
      const bounds = element.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.y = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
    };
    const onPointerLeave = () => {
      pointer.x = 0;
      pointer.y = 0;
    };
    element.addEventListener("pointermove", onPointerMove);
    element.addEventListener("pointerleave", onPointerLeave);
    const resize = () => {
      camera.aspect = element.clientWidth / element.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(element.clientWidth, element.clientHeight);
    };
    window.addEventListener("resize", resize);
    let frame;
    const animate = () => {
      group.rotation.y += (-0.3 + pointer.x * 0.18 - group.rotation.y) * 0.08;
      group.rotation.x += (pointer.y * 0.06 - group.rotation.x) * 0.08;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      element.removeEventListener("pointermove", onPointerMove);
      element.removeEventListener("pointerleave", onPointerLeave);
      renderer.dispose();
      if (renderer.domElement.parentNode === element)
        element.removeChild(renderer.domElement);
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) object.material.dispose();
      });
    };
  }, [width, height, depth, shelves, color, finish]);

  return (
    <div className="viewer">
      <div className="viewer-label">
        <span className="dot" /> LIBRERIA / 01 <span>Vista illustrativa</span>
      </div>
      <div className="canvas" ref={mount} />
      <div className="viewer-measure viewer-height">{height} cm</div>
      <div className="viewer-measure viewer-width">{width} cm</div>
      <div className="viewer-caption">
        <strong>
          {width} × {height} × {depth} cm
        </strong>
        <span>{shelves} ripiani</span>
      </div>
    </div>
  );
}

export default ThreeViewer;
