import { Experience } from "../Experience";
import { Environment } from "./Environment";
import { Room } from "./Room";

export class World {
  constructor() {
    this.experience = Experience.getInstance();

    this.experience.resources.on("ready", () => {
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
