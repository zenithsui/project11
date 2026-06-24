import * as THREE from "three/webgpu";
import { Experience } from "../Experience";
import { Environment } from "./Environment";
import { Room } from "./Room";

export class World {
  constructor() {
    this.experience = Experience.getInstance();

    this.experience.resources.on("ready", () => {
      // Dark background for horror theme
      this.experience.scene.background = new THREE.Color(0x080808);

      // Ambient so the model is visible regardless of spot light positions
      const ambient = new THREE.AmbientLight(0xffffff, 2.0);
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
