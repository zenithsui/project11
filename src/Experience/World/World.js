import * as THREE from "three/webgpu";
import { Experience } from "../Experience";
import { Environment } from "./Environment";
import { Room } from "./Room";

export class World {
  constructor() {
    this.experience = Experience.getInstance();

    this.experience.resources.on("ready", () => {
      // Soft ambient so every surface of the horror model is at least visible
      const ambient = new THREE.AmbientLight(0xffffff, 1.8);
      this.experience.scene.add(ambient);

      this.room = new Room();
      this.environment = new Environment();
    });

    this.init();
  }

  init() {}
  resize() {}

  update() {
    this.environment?.update();
  }
}
