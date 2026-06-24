import * as THREE from "three/webgpu";

import { EventEmitter } from "events";
import { Loaders } from "./Loaders";
import assets from "./assets";

export class Resources extends EventEmitter {
  constructor() {
    super();

    this.loaders = new Loaders().loaders;
    this.assets = assets;

    this.items = {};
    this.queue = this.assets.length;
    this.loaded = 0;
    this._inProgress = {}; // per-asset download fraction

    this.startLoading();
  }

  startLoading() {
    for (const asset of this.assets) {
      this._loadAsset(asset);
    }
  }

  _emitProgress() {
    // Sum base loaded + any in-progress fractions
    const inProgressTotal = Object.values(this._inProgress).reduce((a, b) => a + b, 0);
    const total = (this.loaded + inProgressTotal) / this.queue;
    this.emit("progress", Math.min(total, 0.99));
  }

  _loadAsset(asset) {
    if (asset.type === "glbModel") {
      const isExternal = asset.path.startsWith("http");
      if (isExternal) {
        // Fetch manually to get real download progress and bypass redirect CORS issues
        this._inProgress[asset.name] = 0;
        fetch(asset.path)
          .then(res => {
            const contentLength = res.headers.get("Content-Length");
            if (!contentLength) return res.arrayBuffer();
            const total = parseInt(contentLength, 10);
            const reader = res.body.getReader();
            const chunks = [];
            let received = 0;
            const pump = () => reader.read().then(({ done, value }) => {
              if (done) return;
              chunks.push(value);
              received += value.length;
              this._inProgress[asset.name] = received / total;
              this._emitProgress();
              return pump();
            });
            return pump().then(() => {
              const blob = new Blob(chunks);
              return blob.arrayBuffer();
            });
          })
          .then(buffer => {
            delete this._inProgress[asset.name];
            this.loaders.gltfLoader.parse(buffer, "", (gltf) => {
              this.singleAssetLoaded(asset.name, gltf);
            }, (err) => {
              console.error("GLB parse error:", err);
              this.queue--;
              if (this.loaded === this.queue) this.emit("ready");
            });
          })
          .catch(err => {
            console.error("Failed to fetch GLB:", asset.path, err);
            delete this._inProgress[asset.name];
            this.queue--;
            if (this.loaded === this.queue) this.emit("ready");
          });
      } else {
        this.loaders.gltfLoader.load(
          asset.path,
          (file) => { this.singleAssetLoaded(asset.name, file); },
          (xhr) => {
            if (xhr.total > 0) {
              this._inProgress[asset.name] = xhr.loaded / xhr.total;
              this._emitProgress();
            }
          },
          (err) => {
            console.error("GLB load error:", asset.path, err);
            this.queue--;
            if (this.loaded === this.queue) this.emit("ready");
          }
        );
      }
    } else if (asset.type === "skybox") {
      this.loaders.cubeTextureLoader.load(asset.path, (file) => {
        this.singleAssetLoaded(asset.name, file);
      });
    } else if (asset.type === "texture") {
      this.loaders.textureLoader.load(asset.path, (file) => {
        file.colorSpace = THREE.SRGBColorSpace;
        this.singleAssetLoaded(asset.name, file);
      }, undefined, (err) => {
        console.error("Texture load error:", asset.path, err);
        this.queue--;
        if (this.loaded === this.queue) this.emit("ready");
      });
    } else if (asset.type === "ktx2") {
      this.loaders.ktx2Loader.load(asset.path, (file) => {
        file.colorSpace = THREE.SRGBColorSpace;
        this.singleAssetLoaded(asset.name, file);
      }, undefined, (err) => {
        console.error("KTX2 load error:", asset.path, err);
        this.queue--;
        if (this.loaded === this.queue) this.emit("ready");
      });
    }
  }

  singleAssetLoaded(asset, file) {
    this.items[asset] = file;
    this.loaded++;
    this.emit("progress", this.loaded / this.queue);
    if (this.loaded === this.queue) {
      this.emit("ready");
    }
  }
}
