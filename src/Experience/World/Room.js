import * as THREE from "three/webgpu";
import { Experience } from "../Experience";

export class Room {
  constructor() {
    this.experience = Experience.getInstance();
    this.model = this.experience.resources.items.room.scene;
    this.init();
  }

  init() {
    const box    = new THREE.Box3().setFromObject(this.model);
    const center = box.getCenter(new THREE.Vector3());
    const size   = box.getSize(new THREE.Vector3());
    this.model.position.sub(center);
    this.experience.scene.add(this.model);

    // Auto-fit camera regardless of model scale
    const cam     = this.experience.camera;
    const maxDim  = Math.max(size.x, size.y, size.z);
    const fov     = cam.instance.fov * (Math.PI / 180);
    const dist    = (maxDim / 2) / Math.tan(fov / 2) * 2.2;
    const targetY = size.y * 0.15;

    cam.instance.position.set(0, targetY, dist);
    cam.instance.lookAt(0, targetY, 0);
    cam.basePosition.set(0, targetY, dist);
    cam.homePosition.copy(cam.basePosition);
    cam.baseRotation.set(0, 0, 0);

    if (cam.controls) {
      cam.controls.target.set(0, targetY, 0);
      cam.controls.update();
    }
  }

  toggleDayNight() {}
  resize() {}
  update() {}
  destroy() { this.experience.scene.remove(this.model); }
}
