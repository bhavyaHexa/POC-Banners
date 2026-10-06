export function fitObjectToCanvas(width, height, aspect, coverage = 0.3) {
  const maxWidth = width * coverage;
  const maxHeight = height * coverage;
  const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 1;
  const objectHeight = Math.min(maxHeight, maxWidth / safeAspect);

  return {
    width: objectHeight * safeAspect,
    height: objectHeight,
  };
}
