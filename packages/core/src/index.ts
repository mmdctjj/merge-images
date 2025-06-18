import glob from 'fast-glob';
import { promises as fs } from 'fs';
import path from 'path';
import Spritesmith from 'spritesmith';

interface SpriteCoord {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SpriteCoords {
  [key: string]: SpriteCoord;
}

interface SpriteStyle {
  [key: string]: {
    objectFit: 'none';
    objectPosition: string;
    width: string;
    height: string;
    display: string;
  };
}

interface GenerateSpriteOptions {
  src?: string;
  output?: string;
  spriteName?: string;
  coordsName?: string;
  glob?: string;
}

interface GenerateSpriteResult {
  spritePath: string;
  coordsPath: string;
  style: SpriteStyle;
  coords: SpriteCoords
}

export type { GenerateSpriteOptions, GenerateSpriteResult, SpriteCoords, SpriteStyle };

export function getImageStyle(imageData: SpriteCoords, imageName: string, scale = 1) {
  const img = imageData[imageName];
  if (!img) {
    throw new Error(`Image ${imageName} not found in data`);
  }

  return {
    width: `${img.width}px`, // 显示区域的宽度
    height: `${img.height}px`, // 显示区域的高度
    objectFit: "none", // 防止图片拉伸
    objectPosition: `-${img.x}px -${img.y}px`, // 定位到缩放后的坐标
    transform: `scale(${scale})`, // 缩放整个图片
    transformOrigin: "top left", // 缩放起点为左上角
    marginBottom: `-${img.height * (1 - scale)}px`,
    marginRight: `-${img.width * (1 - scale)}px`,
  };
}


export async function generateSprite(options: GenerateSpriteOptions = {}): Promise<GenerateSpriteResult> {
  const {
    src = './src/icons',
    output = './dist/assets',
    spriteName = 'sprite.png',
    coordsName = 'sprite-coords.json',
    glob: globPattern = '**/*.png',
  } = options;

  const images = await glob('**/*.png', { cwd: src, absolute: true });

  if (images.length === 0) {
    throw new Error(`[spritesmith] No images matched pattern "${globPattern}" under "${src}".`);
  }

  const spritesmithResult = await new Promise<Spritesmith.SpritesmithResult>((resolve, reject) => {
    Spritesmith.run({ src: images }, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });

  await fs.mkdir(output, { recursive: true });

  const spritePath = path.join(output, spriteName);
  await fs.writeFile(spritePath, spritesmithResult.image);

  const coords: SpriteCoords = Object.entries(spritesmithResult.coordinates).reduce((acc, [file, meta]) => {
    const key = path.basename(file, path.extname(file));
    acc[key] = {
      x: meta.x,
      y: meta.y,
      width: meta.width,
      height: meta.height,
    };
    return acc;
  }, {} as SpriteCoords);

  const coordsPath = path.join(output, coordsName);
  await fs.writeFile(coordsPath, JSON.stringify(coords, null, 2));

  const style: SpriteStyle = {};
  Object.entries(coords).forEach(([key, meta]) => {
    style[key] = {
      objectFit: 'none',
      objectPosition: `-${meta.x}px -${meta.y}px`,
      width: `${meta.width}px`,
      height: `${meta.height}px`,
      display: 'inline-block',
    };
  });

  return { spritePath, coordsPath, style, coords };
}
