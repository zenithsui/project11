import * as THREE from "three/webgpu";
import { Experience } from "./Experience";

export class Renderer {
  constructor() {
    this.experience = Experience.getInstance();
  }

  async init() {
    this.renderer = new THREE.WebGPURenderer({
      canvas: this.experience.canvasElement,
      antialias: true,
    });

    await this.renderer.init();

    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(
      this.experience.sizes.width,
      this.experience.sizes.height,
    );
    this.renderer.setPixelRatio(this.experience.sizes.pixelratio);

    // Set a dark clear colour directly — avoids the null-background black bug
    this.renderer.setClearColor(new THREE.Color(0x0a0a0a), 1);

    // GUI stubs (kept so Experience.js gui.addFolder calls don't crash)
    this.setupGUI();
  }

  setupGUI() {
    if (!this.experience.gui) return;
    // Post-processing removed; keep empty folders so old GUI calls don't throw
    this.experience.gui.addFolder("Post");
    this.experience.gui.addFolder("Vignette");
  }

  resize() {
    this.renderer.setSize(
      this.experience.sizes.width,
      this.experience.sizes.height,
    );
    this.renderer.setPixelRatio(this.experience.sizes.pixelratio);
  }

  update() {
    this.renderer.render(
      this.experience.scene,
      this.experience.camera.instance,
    );
  }
}
