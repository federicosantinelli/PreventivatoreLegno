import { useEffect, useRef } from "react";
import * as THREE from "three";

import woodColorTexture from "./assets/Wood095_1K-JPG_Color.jpg";
import woodRoughnessTexture from "./assets/Wood095_1K-JPG_Roughness.jpg";
import woodNormalTexture from "./assets/Wood095_1K-JPG_NormalDX.jpg";

function ThreeViewer({ width, height, depth, shelves, color, finish }) {
  const mount = useRef(null);

  useEffect(() => {
    const element = mount.current;
    if (!element) return undefined;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f2f1ed");

    const camera = new THREE.PerspectiveCamera(
      32,
      element.clientWidth / element.clientHeight,
      0.1,
      100,
    );
    camera.position.set(9.4, 4.7, 10.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(element.clientWidth, element.clientHeight);
    element.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight("#fff8e9", "#8b765d", 2.4));
    const keyLight = new THREE.DirectionalLight("#fff4d8", 3.1);
    keyLight.position.set(6, 8, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight("#d9cbb3", 1.5);
    fillLight.position.set(-5, 4, -4);
    scene.add(fillLight);

    const textureLoader = new THREE.TextureLoader();
    const baseTexture = textureLoader.load(woodColorTexture);
    const roughnessTexture = textureLoader.load(woodRoughnessTexture);
    const normalTexture = textureLoader.load(woodNormalTexture);

    [baseTexture, roughnessTexture, normalTexture].forEach((texture) => {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    });

    const repeat = 1.8;
    baseTexture.repeat.set(repeat, repeat);
    roughnessTexture.repeat.set(repeat, repeat);
    normalTexture.repeat.set(repeat, repeat);
    baseTexture.colorSpace = THREE.SRGBColorSpace;

    const finishSettings = {
      Grezzo: { roughness: 0.96, clearcoat: 0, tint: -0.06 },
      "Cera naturale": { roughness: 0.78, clearcoat: 0.08, tint: -0.02 },
      "Verniciato opaco": { roughness: 0.52, clearcoat: 0.12, tint: 0.02 },
      Laccato: { roughness: 0.28, clearcoat: 0.48, tint: 0.08 },
    }[finish] || { roughness: 0.78, clearcoat: 0.08, tint: 0 };

    const woodColor = new THREE.Color(color).offsetHSL(0, 0, finishSettings.tint);
    const shellMaterial = new THREE.MeshPhysicalMaterial({
      color: woodColor,
      map: baseTexture,
      roughnessMap: roughnessTexture,
      normalMap: normalTexture,
      normalScale: new THREE.Vector2(0.9, 0.9),
      roughness: finishSettings.roughness,
      metalness: 0.05,
      clearcoat: finishSettings.clearcoat,
      clearcoatRoughness: Math.min(1, finishSettings.roughness + 0.18),
      envMapIntensity: 0.75,
    });

    const innerMaterial = new THREE.MeshPhysicalMaterial({
      color: woodColor.clone().offsetHSL(0, 0, -0.06),
      map: baseTexture,
      roughnessMap: roughnessTexture,
      normalMap: normalTexture,
      normalScale: new THREE.Vector2(1.05, 1.05),
      roughness: Math.min(1, finishSettings.roughness + 0.12),
      metalness: 0.05,
      clearcoat: finishSettings.clearcoat,
      clearcoatRoughness: Math.min(1, finishSettings.roughness + 0.28),
      envMapIntensity: 0.7,
    });

    const group = new THREE.Group();
    const displaySize = 7.4;
    const maxDimension = Math.max(width, height, depth);
    const scale = displaySize / maxDimension;

    const w = width * scale;
    const h = height * scale;
    const d = depth * scale;

    const thickness = Math.max(0.08, Math.min(0.22, Math.min(w, h, d) * 0.035));
    const addPanel = (x, y, z, sx, sy, sz, material) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), material);
      mesh.position.set(x, y, z);
      group.add(mesh);
      return mesh;
    };

    const leftX = -(w / 2) + thickness / 2;
    const rightX = w / 2 - thickness / 2;
    const topY = h / 2 - thickness / 2;
    const bottomY = -(h / 2) + thickness / 2;
    const backZ = -(d / 2) + thickness / 2;

    addPanel(leftX, 0, 0, thickness, h, d, shellMaterial);
    addPanel(rightX, 0, 0, thickness, h, d, shellMaterial);
    addPanel(0, topY, 0, w, thickness, d, shellMaterial);
    addPanel(0, bottomY, 0, w, thickness, d, shellMaterial);
    addPanel(0, 0, backZ, w - thickness * 2, h - thickness * 2, thickness, innerMaterial);

    const shelfCount = Math.max(1, shelves);
    for (let index = 0; index < shelfCount; index += 1) {
      const shelfY = -h / 2 + (h / (shelfCount + 1)) * (index + 1);
      const shelfDepth = d - thickness * 1.4;
      addPanel(0, shelfY, 0, w - thickness * 2, thickness * 0.82, shelfDepth, innerMaterial);
    }

    const frontFrameThickness = thickness * 0.85;
    const frontFrameHeight = h - thickness * 1.8;
    const frontFrameWidth = w - thickness * 1.4;
    const frontZ = d / 2 - frontFrameThickness / 2;
    addPanel(
      -(frontFrameWidth / 2) + frontFrameThickness / 2,
      0,
      frontZ,
      frontFrameThickness,
      frontFrameHeight,
      frontFrameThickness,
      shellMaterial,
    );
    addPanel(
      +(frontFrameWidth / 2) - frontFrameThickness / 2,
      0,
      frontZ,
      frontFrameThickness,
      frontFrameHeight,
      frontFrameThickness,
      shellMaterial,
    );
    addPanel(0, topY, frontZ, frontFrameWidth, frontFrameThickness, frontFrameThickness, shellMaterial);
    addPanel(0, bottomY, frontZ, frontFrameWidth, frontFrameThickness, frontFrameThickness, shellMaterial);

    group.rotation.set(0, Math.PI / 5.8, 0);
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
      const targetY = Math.PI / 5.8 + pointer.x * 0.22;
      group.rotation.y += (targetY - group.rotation.y) * 0.08;
      group.rotation.x += (pointer.y * 0.1 - group.rotation.x) * 0.08;
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
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });

      baseTexture.dispose();
      roughnessTexture.dispose();
      normalTexture.dispose();
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
