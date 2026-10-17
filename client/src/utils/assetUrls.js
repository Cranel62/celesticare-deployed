const imageAssets = import.meta.glob('../**/*.{png,jpg,jpeg,gif,svg,webp,avif,PNG,JPG,JPEG,GIF,SVG,WEBP,AVIF}', {
  eager: true,
  import: 'default',
  query: '?url',
});

const normalizedImageAssets = Object.entries(imageAssets).map(([path, url]) => ({
  path: path.slice(3).replace(/\\/g, '/').toLowerCase(),
  url,
}));

export function assetUrl(sourcePath) {
  const normalizedPath = sourcePath
    .replace(/\\/g, '/')
    .replace(/^\/?src\//i, '')
    .replace(/^\/+/, '')
    .toLowerCase();
  const asset = normalizedImageAssets.find(({ path }) => path === normalizedPath);

  if (!asset) {
    console.warn(`Image asset not found: ${sourcePath}`);
    return sourcePath;
  }

  return asset.url;
}
