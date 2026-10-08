/**
 * Domain C: Hotspot Coordinate Mapping, Hit-Box & Spatial Bounds.
 * Percentages describe the displayed image, not necessarily the full viewport.
 */
function calculatePixelPosition(normalizedCoords, viewport) {
  return {
    x: Math.round((normalizedCoords.xPercent / 100) * viewport.width),
    y: Math.round((normalizedCoords.yPercent / 100) * viewport.height)
  };
}

function clampWithinBounds(targetPos, elementDimensions, viewportDimensions) {
  return {
    x: Math.max(0, Math.min(targetPos.x, viewportDimensions.width - elementDimensions.width)),
    y: Math.max(0, Math.min(targetPos.y, viewportDimensions.height - elementDimensions.height))
  };
}

function ensureMinTouchTarget(visibleSize = 16, minSize = 44) {
  const hitBoxSize = Math.max(visibleSize, minSize);
  return { visibleSize, hitBoxSize, paddingOffset: Math.max(0, (hitBoxSize - visibleSize) / 2) };
}

module.exports = { calculatePixelPosition, clampWithinBounds, ensureMinTouchTarget };
