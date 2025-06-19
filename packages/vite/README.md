[![NPM version](https://img.shields.io/npm/v/vite-plugin-merge-images.svg?style=flat)](https://npmjs.com/package/vite-plugin-merge-images)
[![NPM downloads](http://img.shields.io/npm/dm/vite-plugin-merge-images.svg?style=flat)](https://npmjs.com/package/vite-plugin-merge-images)

# vite-plugin-merge-images

将多个图片自动合并为一张雪碧图（Sprite），并生成对应的样式与坐标数据，便于在 Vite 项目中高效使用精灵图技术。

## ✨ 特性

- 自动扫描指定目录下的 PNG 图片，合并为一张精灵图
- 同时生成坐标 JSON 与样式对象，方便按需加载
- 提供 `getImageStyle` 工具函数用于快速定位 sprite 中的图片
- 生成虚拟模块 `virtual:merge-images-runtime`，可在项目中直接使用

## 📦 安装

```bash
pnpm add -D vite-plugin-merge-images
# 或者
npm install -D vite-plugin-merge-images
```

## 🛠️ 使用方式

### 1. 配置插件

在 `vite.config.ts` 中引入并使用插件：

```ts
import { defineConfig } from "vite";
import vitePluginSpritesmith from "vite-plugin-merge-images";

export default defineConfig({
  plugins: [
    vitePluginSpritesmith({
      src: "./src/icons", // 图片来源目录
      output: "./public/sprites", // 精灵图和坐标输出路径
      spriteName: "sprite.png", // 精灵图文件名
      coordsName: "sprite.json", // 坐标 JSON 文件名
      glob: "**/*.png", // 匹配图片的 glob 模式
    }),
  ],
});
```

### 2. 在项目中引入精灵图资源

你可以在任何地方直接引入虚拟模块：

```ts
import {
  sprite,
  style,
  coords,
  getImageStyle,
} from "virtual:merge-images-runtime";

console.log(sprite); // => "/public/sprites/sprite.png"
console.log(style["icon-name"]); // => 样式对象
console.log(coords["icon-name"]); // => 精确坐标信息

// 在组件中使用 getImageStyle
const myStyle = getImageStyle(coords, "icon-name", 0.5); // 缩放为 0.5 倍
```

### 3. 在组件中使用

```tsx
export function Icon({ name }: { name: string }) {
  const style = getImageStyle(coords, name, 1); // 或传 scale 缩放比例
  return <img src={sprite} style={style} alt={name} />;
}
```

## 📁 输出结构

生成后的输出目录如下：

```
public/sprites/
  ├── sprite.png          // 合并后的精灵图
  └── sprite.json         // 坐标数据
```

## 🧩 虚拟模块导出内容

```ts
export const sprite: string; // 精灵图路径（vite 资源路径）
export const style: SpriteStyle; // 所有图片的样式对象
export const coords: SpriteCoords; // 所有图片的精确坐标
export const getImageStyle: (coords, name, scale) => React.CSSProperties;
```

## 📌 类型定义

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

- [ ] 支持 JPG、SVG 等图片格式
- [ ] 支持多套 sprite 输出

## 🤝 感谢

本插件基于 [spritesmith](https://github.com/Ensighten/spritesmith) 构建。

## LICENSE

MIT
