import * as THREE from "three";

const NIGHT_SKY = new THREE.Color(0x03060f);
const DAWN_SKY = new THREE.Color(0xf2a35c);
const DAY_SKY = new THREE.Color(0x8fd0ff);

function daylightFactor(minute: number): number {
  // 0 at midnight, peaks at 1 around noon, smooth sunrise/sunset near 6:00 and 18:00
  const angle = (minute / (24 * 60)) * Math.PI * 2 - Math.PI / 2;
  return THREE.MathUtils.clamp((Math.sin(angle) + 0.15) / 1.15, 0, 1);
}

export class LightingSystem {
  private readonly scene: THREE.Scene;
  private readonly sun: THREE.DirectionalLight;
  private readonly hemi: THREE.HemisphereLight;
  private readonly skyColor = new THREE.Color();

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    this.hemi = new THREE.HemisphereLight(0x8fd0ff, 0x2f6b3a, 0.6);
    scene.add(this.hemi);

    this.sun = new THREE.DirectionalLight(0xffffff, 1);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.camera.left = -80;
    this.sun.shadow.camera.right = 80;
    this.sun.shadow.camera.top = 80;
    this.sun.shadow.camera.bottom = -80;
    this.sun.shadow.camera.near = 10;
    this.sun.shadow.camera.far = 300;
    scene.add(this.sun);
    scene.add(this.sun.target);

    scene.fog = new THREE.Fog(NIGHT_SKY.getHex(), 60, 220);
    scene.background = NIGHT_SKY.clone();
  }

  update(minute: number): void {
    const daylight = daylightFactor(minute);
    const angle = (minute / (24 * 60)) * Math.PI * 2 - Math.PI / 2;

    const radius = 100;
    this.sun.position.set(Math.cos(angle) * radius, Math.max(Math.sin(angle), 0.05) * radius, 20);
    this.sun.target.position.set(0, 0, 0);
    this.sun.intensity = 0.15 + daylight * 1.35;

    const warmth = 1 - Math.abs(daylight - 0.5) * 2;
    this.sun.color.setHSL(0.11 - warmth * 0.03, 0.6, 0.6 + daylight * 0.3);

    this.hemi.intensity = 0.15 + daylight * 0.7;

    this.skyColor.copy(NIGHT_SKY).lerp(DAWN_SKY, THREE.MathUtils.smoothstep(daylight, 0, 0.35));
    this.skyColor.lerp(DAY_SKY, THREE.MathUtils.smoothstep(daylight, 0.35, 1));

    (this.scene.background as THREE.Color).copy(this.skyColor);
    if (this.scene.fog instanceof THREE.Fog) this.scene.fog.color.copy(this.skyColor);
  }

  isNight(minute: number): boolean {
    return daylightFactor(minute) < 0.3;
  }
}
