import { EventEmitter } from "events";
import { Experience } from "./Experience";
import gsap from "gsap";

export class Preloader extends EventEmitter {
  constructor() {
    super();
    this.experience = Experience.getInstance();
    this.resources  = this.experience.resources;

    this.preloaderEl   = document.getElementById("preloader");
    this.percentEl     = document.getElementById("loading-percent");
    this.introEl       = document.getElementById("preloader-intro");
    this.loadingTextEl = document.querySelector(".loading-text");

    document.getElementById("enter-btn").addEventListener("click", () => this._dismiss());
    document.getElementById("enter-silent-btn").addEventListener("click", () => this._dismiss());

    this.resources.on("progress", (value) => this._onProgress(value));
    this.resources.on("ready",    () => this._onReady());

    this._initDock();
  }

  _onProgress(value) {
    const pct = Math.round(Math.min(value, 1) * 100);
    if (this.percentEl) this.percentEl.textContent = pct + "%";
  }

  _onReady() {
    if (this.percentEl) this.percentEl.textContent = "100%";

    gsap.to(this.loadingTextEl, { opacity: 0, duration: 0.5, delay: 0.6 });
    gsap.to(this.percentEl, {
      opacity: 0, duration: 0.5, delay: 0.6,
      onComplete: () => {
        if (this.loadingTextEl) this.loadingTextEl.style.display = "none";
        if (this.percentEl) this.percentEl.style.display = "none";
        if (this.introEl) {
          this.introEl.style.display = "flex";
          gsap.fromTo(this.introEl, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" });
        }
      }
    });
  }

  _dismiss() {
    gsap.to(this.preloaderEl, {
      opacity: 0, duration: 0.7, ease: "power2.inOut",
      onComplete: () => {
        if (this.preloaderEl) this.preloaderEl.remove();
        this.emit("preloaderfinished");
      }
    });
  }

  _initDock() {
    const dock = document.querySelector(".preloader__dock");
    if (!dock) return;
    const items = Array.from(dock.querySelectorAll(".dock-item"));
    dock.addEventListener("mousemove", (e) => {
      items.forEach(item => {
        const rect = item.getBoundingClientRect();
        const dist = Math.abs(e.clientX - (rect.left + rect.width / 2));
        const scale = dist < 160 ? 1 + 0.6 * (1 - dist / 160) : 1;
        gsap.to(item, { scale, y: -(scale - 1) * 14, duration: 0.25, ease: "power2.out", overwrite: "auto" });
      });
    });
    dock.addEventListener("mouseleave", () => {
      gsap.to(items, { scale: 1, y: 0, duration: 0.5, ease: "elastic.out(1,0.5)", overwrite: "auto" });
    });
  }
}
