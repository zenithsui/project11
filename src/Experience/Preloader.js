import { EventEmitter } from "events";
import { Experience } from "./Experience";
import gsap from "gsap";

export class Preloader extends EventEmitter {
  constructor() {
    super();
    this.experience = Experience.getInstance();
    this.resources = this.experience.resources;

    this.preloader   = document.querySelector(".preloader");
    this.percentText = document.querySelector(".preloader__percent");
    this.introEl     = document.querySelector(".preloader__intro");
    this.stickers    = Array.from(document.querySelectorAll(".sticker"));

    document.getElementById("enter-btn").addEventListener("click", () => {
      this.experience.world.raycaster?.toggleMusic?.();
      this._dismiss();
    });
    document.getElementById("enter-silent-btn").addEventListener("click", () => {
      this._dismiss();
    });

    this.resources.on("progress", (value) => this.onLoad(value));
    this.resources.on("ready",    () => this.playOutro());

    this._initDock();
  }

  onLoad(value) {
    const pct = Math.round(value * 100);
    if (this.percentText) this.percentText.textContent = pct + "%";

    // Fan stickers out progressively as load advances
    const toShow = Math.min(Math.ceil(value * this.stickers.length), this.stickers.length);
    this.stickers.forEach((s, i) => {
      if (i < toShow && !s.classList.contains("active")) {
        setTimeout(() => s.classList.add("active"), i * 80);
      }
    });
  }

  playOutro() {
    // All stickers visible
    this.stickers.forEach((s, i) => setTimeout(() => s.classList.add("active"), i * 60));

    gsap.to(this.percentText, {
      opacity: 0, duration: 0.3, delay: 0.6,
      onComplete: () => {
        if (this.percentText) this.percentText.style.display = "none";
        if (this.introEl) {
          this.introEl.style.display = "flex";
          gsap.fromTo(this.introEl, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" });
        }
      }
    });
  }

  _dismiss() {
    gsap.to(this.preloader, {
      opacity: 0, duration: 0.6, ease: "power2.inOut",
      onComplete: () => {
        this.preloader.remove();
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
