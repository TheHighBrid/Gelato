/**
 * Melato World Orb — Shopify drop-in.
 * Loads Three.js from jsDelivr. Theme editor: add section "Melato World Orb".
 */
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.185.0/build/three.module.js";

const IVORY = 0xf6f0e5;
const BEIGE = 0xd8c7a7;
const INK = 0x050505;
const METAL = 0x1c1814;

function latLonToVec(lat, lon, radius) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon);
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function makeGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(246,240,229,1)");
  g.addColorStop(0.18, "rgba(216,199,167,0.72)");
  g.addColorStop(0.42, "rgba(216,199,167,0.22)");
  g.addColorStop(1, "rgba(216,199,167,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function createMelatoWorld(root, options) {
  const stage = root.querySelector("[data-mwo-stage]");
  if (!stage) return { destroy() {}, focus() {}, getSelected() { return null; } };

  const locations = options.locations || [];
  const reduced =
    options.reducedMotion ??
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const panel = root.querySelector("[data-mwo-panel]");
  const panelIndex = root.querySelector("[data-mwo-panel-index]");
  const panelTitle = root.querySelector("[data-mwo-panel-title]");
  const panelBlurb = root.querySelector("[data-mwo-panel-blurb]");
  const panelLink = root.querySelector("[data-mwo-panel-link]");
  const statusEl = root.querySelector("[data-mwo-orbit]");
  const listButtons = Array.from(root.querySelectorAll("[data-mwo-focus]"));

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(INK, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.touchAction = "none";
  renderer.domElement.setAttribute("aria-hidden", "true");
  stage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(INK, 0.045);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 80);
  const camHomeZ = 4.55;
  const camFocusZ = 2.62;
  camera.position.set(0, 0.22, camHomeZ);

  const world = new THREE.Group();
  scene.add(world);
  scene.add(new THREE.AmbientLight(0x9a8f7e, 0.42));
  scene.add(new THREE.HemisphereLight(0xf6f0e5, 0x1a1410, 0.55));
  const key = new THREE.DirectionalLight(0xfff4e4, 1.35);
  key.position.set(3.2, 4.4, 2.6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xb7c4d4, 0.55);
  rim.position.set(-4.2, 1.2, -3.4);
  scene.add(rim);
  const fill = new THREE.PointLight(0xd8c7a7, 1.1, 12, 2);
  fill.position.set(-1.4, -0.6, 2.8);
  scene.add(fill);

  const coreMat = new THREE.MeshPhysicalMaterial({
    color: METAL,
    metalness: 0.88,
    roughness: 0.28,
    clearcoat: 0.7,
    clearcoatRoughness: 0.22,
    sheen: 0.35,
    sheenColor: new THREE.Color(BEIGE),
  });
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.12, 1), coreMat);
  world.add(core);
  world.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(0.58, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0x2a241c, transparent: true, opacity: 0.9 }),
    ),
  );
  world.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(0.62, 24, 24),
      new THREE.MeshBasicMaterial({
        color: BEIGE,
        transparent: true,
        opacity: 0.07,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    ),
  );
  world.add(
    new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1.145, 1)),
      new THREE.LineBasicMaterial({ color: IVORY, transparent: true, opacity: 0.22 }),
    ),
  );
  const cage = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.DodecahedronGeometry(1.62, 0)),
    new THREE.LineBasicMaterial({ color: BEIGE, transparent: true, opacity: 0.16 }),
  );
  world.add(cage);

  const ringMat = new THREE.MeshBasicMaterial({
    color: IVORY,
    transparent: true,
    opacity: 0.28,
    side: THREE.DoubleSide,
  });
  const rings = [0.22, 1.12, -0.74].map((tilt, i) => {
    const mesh = new THREE.Mesh(new THREE.TorusGeometry(1.78 + i * 0.08, 0.006, 8, 160), ringMat);
    mesh.rotation.x = Math.PI / 2 + tilt;
    mesh.rotation.y = i * 0.55;
    world.add(mesh);
    return mesh;
  });

  const glowTex = makeGlowTexture();
  const glowMat = new THREE.SpriteMaterial({
    map: glowTex,
    color: IVORY,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const diamondGeo = new THREE.OctahedronGeometry(0.055, 0);
  const diamondMat = new THREE.MeshPhysicalMaterial({
    color: IVORY,
    emissive: new THREE.Color(BEIGE),
    emissiveIntensity: 0.85,
    metalness: 0.4,
    roughness: 0.18,
    clearcoat: 1,
  });
  const haloGeo = new THREE.TorusGeometry(0.11, 0.006, 8, 48);
  const haloMat = new THREE.MeshBasicMaterial({ color: IVORY, transparent: true, opacity: 0.7 });
  const hitGeo = new THREE.SphereGeometry(0.16, 12, 12);
  const hitMat = new THREE.MeshBasicMaterial({ visible: false });

  const markers = [];
  const raycastTargets = [];
  const labelLayer = document.createElement("div");
  labelLayer.className = "mwo__labels";
  stage.appendChild(labelLayer);
  const pinEls = new Map();

  let selected = null;
  let hovered = null;
  let spinning = !reduced;
  let pointerDown = false;
  let dragged = false;
  let lastX = 0;
  let lastY = 0;
  let resumeAt = 0;
  let spinY = 0.35;
  let tiltX = 0.18;
  let velY = 0;
  let velX = 0;
  let anim = null;

  function syncHud(id) {
    const loc = locations.find((l) => l.id === id) || null;
    listButtons.forEach((btn) => {
      btn.classList.toggle("is-on", btn.getAttribute("data-mwo-focus") === id);
    });
    if (statusEl) statusEl.textContent = id ? "held" : "live";
    if (!panel) return;
    if (!loc) {
      panel.classList.remove("is-open");
      return;
    }
    if (panelIndex) panelIndex.textContent = loc.index + " / " + loc.kicker;
    if (panelTitle) panelTitle.textContent = loc.title;
    if (panelBlurb) panelBlurb.textContent = loc.blurb;
    if (panelLink) {
      panelLink.href = loc.href;
      panelLink.textContent = loc.cta || "Enter this room";
    }
    panel.classList.add("is-open");
  }

  function focus(id) {
    selected = id;
    syncHud(id);
    if (typeof options.onSelect === "function") options.onSelect(id);
    const fromY = world.rotation.y;
    const fromX = world.rotation.x;
    const fromZ = camera.position.z;
    let toY = fromY;
    let toX = 0.16;
    let toZ = camHomeZ;
    if (id) {
      const marker = markers.find((m) => m.id === id);
      if (marker) {
        const p = marker.local;
        const yaw = Math.atan2(p.x, p.z);
        const hyp = Math.hypot(p.x, p.z);
        const pitch = Math.atan2(p.y, hyp);
        toY = -yaw;
        toX = -pitch * 0.68;
        toZ = camFocusZ;
      }
    }
    anim = {
      t: 0,
      dur: reduced ? 0.01 : 0.92,
      fromY,
      fromX,
      fromZ,
      toY,
      toX,
      toZ,
    };
    spinning = false;
    resumeAt = id ? Number.POSITIVE_INFINITY : performance.now() + 1600;
  }

  locations.forEach((loc) => {
    const local = latLonToVec(Number(loc.lat) || 0, Number(loc.lon) || 0, 1.38);
    const group = new THREE.Group();
    group.position.copy(local);
    group.lookAt(0, 0, 0);
    group.rotateY(Math.PI);
    const coreMesh = new THREE.Mesh(diamondGeo, diamondMat);
    const glow = new THREE.Sprite(glowMat.clone());
    glow.scale.set(0.55, 0.55, 0.55);
    const halo = new THREE.Mesh(haloGeo, haloMat.clone());
    const hit = new THREE.Mesh(hitGeo, hitMat);
    hit.userData.id = loc.id;
    group.add(glow, halo, coreMesh, hit);
    world.add(group);
    markers.push({ id: loc.id, group, local, hit, glow, core: coreMesh, halo });
    raycastTargets.push(hit);

    const pin = document.createElement("button");
    pin.type = "button";
    pin.className = "mwo__pin";
    pin.innerHTML = "<span>" + loc.index + "</span>" + loc.title;
    pin.addEventListener("click", (e) => {
      e.stopPropagation();
      focus(loc.id);
    });
    labelLayer.appendChild(pin);
    pinEls.set(loc.id, pin);
  });

  const dustCount = reduced ? 80 : 420;
  const dustPos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    const r = 2.2 + Math.random() * 6.5;
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    dustPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    dustPos[i * 3 + 1] = r * Math.cos(phi) * 0.7;
    dustPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
  const dust = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({
      color: BEIGE,
      size: 0.018,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
      sizeAttenuation: true,
    }),
  );
  scene.add(dust);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const clock = new THREE.Timer();
  clock.connect(document);

  function pointerToNdc(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  function hitTest() {
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(raycastTargets, false);
    return hits.length ? String(hits[0].object.userData.id) : null;
  }

  function onPointerDown(event) {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    pointerDown = true;
    dragged = false;
    lastX = event.clientX;
    lastY = event.clientY;
    velX = 0;
    velY = 0;
    spinning = false;
    renderer.domElement.setPointerCapture(event.pointerId);
    stage.style.cursor = "grabbing";
  }

  function onPointerMove(event) {
    pointerToNdc(event);
    if (pointerDown) {
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      if (Math.abs(dx) + Math.abs(dy) > 3) dragged = true;
      lastX = event.clientX;
      lastY = event.clientY;
      velY = dx * 0.0052;
      velX = dy * 0.0052;
      spinY += velY;
      tiltX = THREE.MathUtils.clamp(tiltX + velX, -0.72, 0.72);
      anim = null;
      if (selected) {
        selected = null;
        syncHud(null);
      }
      resumeAt = performance.now() + 2200;
      return;
    }
    const id = hitTest();
    if (hovered !== id) {
      hovered = id;
      stage.style.cursor = id ? "pointer" : "grab";
    }
  }

  function onPointerUp(event) {
    if (!pointerDown) return;
    pointerDown = false;
    try {
      renderer.domElement.releasePointerCapture(event.pointerId);
    } catch (err) {
      /* ignore */
    }
    stage.style.cursor = hovered ? "pointer" : "grab";
    if (!dragged) {
      pointerToNdc(event);
      const id = hitTest();
      if (id) focus(id);
    }
    resumeAt = performance.now() + 2200;
  }

  function onWheel(event) {
    event.preventDefault();
    camera.position.z = THREE.MathUtils.clamp(camera.position.z + event.deltaY * 0.0022, 2.2, 6.2);
    spinning = false;
    resumeAt = performance.now() + 1800;
  }

  function resize() {
    const w = stage.clientWidth || window.innerWidth;
    const h = stage.clientHeight || window.innerHeight;
    camera.aspect = w / Math.max(h, 1);
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(stage);
  resize();
  renderer.domElement.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  renderer.domElement.addEventListener("wheel", onWheel, { passive: false });
  stage.style.cursor = "grab";

  listButtons.forEach((btn) => {
    btn.addEventListener("click", () => focus(btn.getAttribute("data-mwo-focus")));
  });
  const closer = root.querySelector("[data-mwo-close]");
  if (closer) closer.addEventListener("click", () => focus(null));

  let raf = 0;
  const proj = new THREE.Vector3();
  const toCam = new THREE.Vector3();
  const outward = new THREE.Vector3();

  function frame() {
    raf = requestAnimationFrame(frame);
    clock.update();
    const dt = Math.min(clock.getDelta(), 0.1);
    const t = clock.getElapsed();

    if (anim) {
      anim.t += dt;
      const u = easeInOutCubic(Math.min(1, anim.t / anim.dur));
      world.rotation.y = THREE.MathUtils.lerp(anim.fromY, anim.toY, u);
      world.rotation.x = THREE.MathUtils.lerp(anim.fromX, anim.toX, u);
      camera.position.z = THREE.MathUtils.lerp(anim.fromZ, anim.toZ, u);
      spinY = world.rotation.y;
      tiltX = world.rotation.x;
      if (u >= 1) anim = null;
    } else {
      if (!pointerDown) {
        spinY += velY;
        tiltX = THREE.MathUtils.clamp(tiltX + velX, -0.72, 0.72);
        velY *= 0.94;
        velX *= 0.94;
        if (Math.abs(velY) < 0.00005) velY = 0;
        if (Math.abs(velX) < 0.00005) velX = 0;
      }
      if (spinning && !pointerDown && !selected && !reduced && performance.now() > resumeAt) {
        spinY += dt * 0.18;
      } else if (!pointerDown && !selected && !reduced && performance.now() > resumeAt) {
        spinning = true;
      }
      world.rotation.y = spinY;
      world.rotation.x = tiltX;
    }

    cage.rotation.y -= dt * 0.05;
    cage.rotation.x += dt * 0.02;
    rings[0].rotation.z += dt * 0.08;
    rings[1].rotation.z -= dt * 0.05;
    rings[2].rotation.z += dt * 0.03;
    dust.rotation.y += dt * 0.01;

    for (const marker of markers) {
      const active = marker.id === selected;
      const hot = active || marker.id === hovered;
      const pulse = 1 + Math.sin(t * 2.2 + marker.local.x) * (hot ? 0.12 : 0.05);
      marker.core.scale.setScalar(hot ? 1.35 * pulse : pulse);
      marker.glow.scale.setScalar(hot ? 0.92 : 0.52 + pulse * 0.08);
      marker.glow.material.opacity = hot ? 0.95 : 0.55;
      marker.halo.material.opacity = hot ? 0.95 : 0.45;
      marker.core.material.emissiveIntensity = hot ? 1.4 : 0.7;
    }

    camera.lookAt(0, 0.02, 0);
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    world.updateMatrixWorld();
    for (const marker of markers) {
      const pin = pinEls.get(marker.id);
      if (!pin) continue;
      proj.copy(marker.local).applyMatrix4(world.matrixWorld);
      outward.copy(proj).normalize();
      toCam.copy(camera.position).sub(proj).normalize();
      const facing = toCam.dot(outward);
      proj.project(camera);
      const x = (proj.x * 0.5 + 0.5) * w;
      const y = (-proj.y * 0.5 + 0.5) * h;
      const show = proj.z <= 1 && facing > -0.15;
      pin.classList.toggle("is-on", marker.id === selected);
      pin.classList.toggle("is-hot", marker.id === hovered);
      pin.style.opacity = show ? (facing > 0.15 ? "1" : "0.35") : "0";
      pin.style.pointerEvents = show ? "auto" : "none";
      pin.style.transform = "translate3d(" + x + "px," + y + "px,0) translate(-50%,-120%)";
    }
    renderer.render(scene, camera);
  }
  frame();

  return {
    destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      clock.dispose();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("wheel", onWheel);
      diamondGeo.dispose();
      haloGeo.dispose();
      hitGeo.dispose();
      glowTex.dispose();
      dustGeo.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      labelLayer.remove();
    },
    focus,
    getSelected() {
      return selected;
    },
  };
}

function boot(root) {
  if (!root || root.dataset.mwoReady === "true") return;
  root.dataset.mwoReady = "true";
  const cfgNode = root.querySelector("[data-mwo-config]");
  let locations = [];
  try {
    locations = JSON.parse(cfgNode ? cfgNode.textContent : "[]");
  } catch (err) {
    locations = [];
  }
  const handle = createMelatoWorld(root, { locations });
  root._mwo = handle;
}

function bootAll(scope) {
  (scope || document).querySelectorAll("[data-mwo]").forEach(boot);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => bootAll(document), { once: true });
} else {
  bootAll(document);
}
document.addEventListener("shopify:section:load", (event) => bootAll(event.target));
document.addEventListener("shopify:section:unload", (event) => {
  const root = event.target && event.target.querySelector("[data-mwo]");
  if (root && root._mwo) root._mwo.destroy();
});
