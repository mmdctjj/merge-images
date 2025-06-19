[![NPM version](https://img.shields.io/npm/v/vite-plugin-merge-images.svg?style=flat)](https://npmjs.com/package/vite-plugin-merge-images)
[![NPM downloads](http://img.shields.io/npm/dm/vite-plugin-merge-images.svg?style=flat)](https://npmjs.com/package/vite-plugin-merge-images)

# vite-plugin-merge-images

Automatically merges multiple images into a single sprite image and generates corresponding styles and coordinate data, making it easy to efficiently use sprite technology in Vite projects.

## ✨ Features

- Automatically scans PNG images in the specified directory and merges them into a single sprite image.
- Generates coordinate JSON and style objects simultaneously for easy on-demand loading.
- Provides the `getImageStyle` utility function for quickly locating images in the sprite.
- Generates a virtual module `virtual:merge-images-runtime` that can be directly used in the project.

## 📦 Installation

```bash
pnpm add -D vite-plugin-merge-images
# or
npm install -D vite-plugin-merge-images
```

## 🛠️ Usage

### 1. Configure the plugin

Import and use the plugin in `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import vitePluginSpritesmith from "vite-plugin-merge-images";

export default defineConfig({
  plugins: [
    vitePluginSpritesmith({
      src: "./src/icons", // Source directory of images
      output: "./public/sprites", // Output path for sprite image and coordinates
      spriteName: "sprite.png", // Sprite image file name
      coordsName: "sprite.json", // Coordinate JSON file name
      glob: "**/*.png", // Glob pattern for matching images
    }),
  ],
});
```

### 2. Import sprite resources in your project

You can directly import the virtual module anywhere:

```ts
import {
  sprite,
  style,
  coords,
  getImageStyle,
} from "virtual:merge-images-runtime";

console.log(sprite); // => "/public/sprites/sprite.png"
console.log(style["icon-name"]); // => Style object
console.log(coords["icon-name"]); // => Precise coordinate information

// Use getImageStyle in a component
const myStyle = getImageStyle(coords, "icon-name", 0.5); // Scale to 0.5x
```

### 3. Use in a component

```tsx
export function Icon({ name }: { name: string }) {
  const style = getImageStyle(coords, name, 1); // Or pass a scale ratio
  return <img src={sprite} style={style} alt={name} />;
}
```

## 📁 Output Structure

The generated output directory structure is as follows:

```
public/sprites/
  ├── sprite.png          // Merged sprite image
  └── sprite.json         // Coordinate data
```

## 🧩 Virtual Module Exports

```ts
export const sprite: string; // Sprite image path (Vite resource path)
export const style: SpriteStyle; // Style object for all images
export const coords: SpriteCoords; // Precise coordinates for all images
export const getImageStyle: (coords, name, scale) => React.CSSProperties;
```

## 📌 Type Definitions

```ts
export interface SpritePluginOptions {
  src?: string;
  output?: string;
  spriteName?: string;
  coordsName?: string;
  glob?: string;
}

export interface SpriteCoord {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SpriteCoords {
  [key: string]: SpriteCoord;
}

export interface SpriteStyle {
  [key: string]: {
    objectFit: "none";
    objectPosition: string;
    width: string;
    height: string;
    display: string;
  };
}
```

## 🧪 TODO

- [ ] Support JPG, SVG, and other image formats
- [ ] Support multiple sprite outputs

## 🤝 Acknowledgements

This plugin is built based on [spritesmith](https://github.com/Ensighten/spritesmith).

## LICENSE

MIT
