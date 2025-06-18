import { generateSprite, GenerateSpriteOptions, GenerateSpriteResult, getImageStyle, SpriteCoords, SpriteStyle } from 'merge-images-core';
import * as path from 'path';
import { Plugin } from 'vite';

export type { GenerateSpriteOptions, GenerateSpriteResult, SpriteCoords, SpriteStyle };

// 插件配置选项
export interface SpritePluginOptions {
  src?: string;
  output?: string;
  spriteName?: string;
  coordsName?: string;
  glob?: string;
}

const VIRTUAL_MODULE_ID = 'virtual:merge-images-runtime';

let isGenerated = false;


export default function vitePluginSpritesmith(options: SpritePluginOptions = {}): Plugin {
  const {
    src = './src/icons',
    output = './dist/assets',
    spriteName = 'sprite.png',
    coordsName = 'sprite-coords.json',
    glob = '**/*.png',
  } = options;

  let spritePath: string;
  let style: SpriteStyle = {};
  let coords: SpriteCoords = {};

  return {
    name: 'vite-plugin-merge-images',
    async buildStart() {
      if (!isGenerated) {
        const result = await generateSprite({ src, output, spriteName, coordsName, glob });
        spritePath = result.spritePath;
        style = result.style;
        coords = result.coords;
        isGenerated = true;
      }
    },
    config() {
      return {
        assetsInclude: [spriteName],
      };
    },
    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) {
        return id;
      }
      return null;
    },
    load(id) {
      if (id === VIRTUAL_MODULE_ID) {
        // 验证 spritePath 是否有效
        if (!spritePath || typeof spritePath !== 'string') {
          throw new Error('spritePath must be a valid string path');
        }

        // 将 spritePath 转换为相对路径，并规范化斜杠
        const relativePath = path
          .relative(process.cwd(), spritePath)
          .replace(/\\/g, '/');

        // 确保 getImageStyle 是函数
        if (typeof getImageStyle !== 'function') {
          throw new Error('getImageStyle must be a function');
        }

        return `
          export const sprite = ${JSON.stringify(`/${relativePath}`)};
          export const style = ${JSON.stringify(style)};
          export const coords = ${JSON.stringify(coords)};
          export const getImageStyle = ${getImageStyle};
        `.trim();
      }
      return null;
    },
  };
}