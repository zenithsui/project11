import * as THREE from "three/webgpu";

import { EventEmitter } from "events";
import { Experience } from "./Experience";

import gsap from "gsap";

export class Preloader extends EventEmitter {
  constructor() {
    super();
    this.experience = Experience.getInstance();
    this.resources = this.experience.resources;

    this.preloader = document.querySelector(".preloader");
    this.progressBar = document.querySelector(".preloader__progress-bar");
    this.percentText = document.querySelector(".preloader__percent");
    this.progressWrapper = document.querySelector(
      ".preloader__progress-wrapper",
    );
    this.introEl = document.querySelector(".preloader__intro");

    document.getElementById("enter-btn").addEventListener("click", () => {
      this.experience.world.raycaster?.toggleMusic();
      this._dismiss();
    });

    document.getElementById("enter-silent-btn").addEventListener("click", () => {
      this._dismiss();
    });

    this.resources.on("progress", (value) => {
      this.onLoad(value);
    });

    this.resources.on("ready", () => {
      this.playOutro();
    });

    this._initDock();
  }

  _initDock() {
    const dock = document.querySelector('.preloader__dock');
    if (!dock) return;
    const items = Array.from(dock.querySelectorAll('.dock-item'));
    const magneticDist = 160;
    const maxScale = 1.6;

    dock.addEventListener('mousemove', (e) => {
      items.forEach(item => {
        const rect = item.getBoundingClientRect();
        const center = rect.left + rect.width / 2;
        const dist = Math.abs(e.clientX - center);
        const scale = dist < magneticDist ? 1 + (maxScale - 1) * (1 - dist / magneticDist) : 1;
        gsap.to(item, { scale, y: -(scale - 1) * 14, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
      });
    });

    dock.addEventListener('mouseleave', () => {
      gsap.to(items, { scale: 1, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' });
    });
  }

  onLoad(value) {
    const pct = Math.round(value * 100);
    this.progressBar.style.width = `${pct}%`;
    this.percentText.textContent = `${pct}%`;
  }

  playOutro() {
    gsap.to([this.progressWrapper, this.percentText], {
      opacity: 0,
      duration: 0.3,
      delay: 0.5,
      onComplete: () => {
        this.progressWrapper.style.display = "none";
        this.percentText.style.display = "none";
        this.introEl.style.display = "flex";
        gsap.fromTo(
          this.introEl,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
        );
      },
    });
  }

  _dismiss() {
    gsap.to(this.preloader, {
      opacity: 0,
      duration: 0.6,
      ease: "power2.inOut",
      onComplete: () => {
        this.preloader.remove();
        this.emit("preloaderfinished");
      },
    });
  }
}
