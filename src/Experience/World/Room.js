import * as THREE from "three/webgpu";
import { Experience } from "../Experience";

export class Room {
  constructor() {
    this.experience = Experience.getInstance();
    this.model = this.experience.resources.items.room.scene;
    this.init();
  }

  init() {
    // Center and scale the model to fit the scene
    const box = new THREE.Box3().setFromObject(this.model);
    const center = box.getCenter(new THREE.Vector3());
    this.model.position.sub(center);

    this.experience.scene.add(this.model);
  }

  toggleDayNight() {}
  resize() {}
  update() {}
  destroy() {
    this.experience.scene.remove(this.model);
  }
}
