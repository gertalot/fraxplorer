interface ColorSchemeFn {
  (iter: number, maxIterations: number, zr?: number, zi?: number): [number, number, number];
}

// Utility functions for color conversions
function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  // h: 0-360, s: 0-1, v: 0-1
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r = 0,
    g = 0,
    b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  // h: 0-360, s: 0-1, l: 0-1
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

// Helper function for smooth iteration calculation
function getSmoothIteration(iter: number, zr: number, zi: number): number {
  const z = zr * zr + zi * zi;
  return iter + 1 - Math.log(Math.log(z)) / Math.log(2);
}

// 0. Classic red
const firePalette: ColorSchemeFn = (iter, maxIterations) => {
  if (iter === maxIterations) return [0, 0, 0];

  const ratio = iter / maxIterations;
  // From black to red to yellow to white
  if (ratio < 0.1) {
    const r = Math.round(ratio * 5 * 255);
    return [r, 0, 0];
  } else if (ratio < 0.5) {
    const g = Math.round((ratio - 0.2) * 3.33 * 255);
    return [255, g, 0];
  } else {
    const b = Math.round((ratio - 0.5) * 2 * 255);
    const r = 255;
    const g = 255;
    return [r, g, b];
  }
};

// 1. Classic Smooth Rainbow
function smoothRainbow(iter: number, maxIterations: number, zr?: number, zi?: number): [number, number, number] {
  if (iter >= maxIterations) return [0, 0, 0];

  const smoothIter = getSmoothIteration(iter, zr!, zi!);
  const hue = (smoothIter * 10) % 360;

  return hslToRgb(hue, 1, 0.5);
}

// 2. Phase Angle Coloring
function phaseColoring(iter: number, maxIterations: number, zr?: number, zi?: number): [number, number, number] {
  if (iter >= maxIterations) return [0, 0, 0];

  // Get the angle of the final z value
  const angle = Math.atan2(zi!, zr!);
  const hue = ((angle + Math.PI) / (2 * Math.PI)) * 360;

  // Use iteration for brightness
  const smoothIter = getSmoothIteration(iter, zr!, zi!);
  const normalizedIter = Math.min(smoothIter / maxIterations, 1);
  const brightness = 0.7 + 0.3 * normalizedIter;

  return hsvToRgb(hue, 1, brightness);
}

// 3. Bernstein Polynomial Coloring
function bernsteinColoring(iter: number, maxIterations: number, zr?: number, zi?: number): [number, number, number] {
  if (iter >= maxIterations) return [0, 0, 0];

  const smoothIter = getSmoothIteration(iter, zr!, zi!);
  const t = (smoothIter % 500) / 500;

  // Bernstein polynomials for RGB channels
  const r = 9 * (1 - t) * t * t * t;
  const g = 15 * (1 - t) * (1 - t) * t * t;
  const b = 8.5 * (1 - t) * (1 - t) * (1 - t) * t;

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// 4. Ultra Fractal-inspired
function ultraFractalStyle(iter: number, maxIterations: number, zr?: number, zi?: number): [number, number, number] {
  if (iter >= maxIterations) return [0, 0, 0];

  const smoothIter = getSmoothIteration(iter, zr!, zi!);

  // Use multiple color cycles with different frequencies
  const t1 = (smoothIter * 0.1) % 1;
  const t2 = (smoothIter * 0.05) % 1;
  const t3 = (smoothIter * 0.025) % 1;

  // Create RGB channels with different phases
  const r = Math.sin(t1 * 2 * Math.PI) * 0.5 + 0.5;
  const g = Math.sin(t2 * 2 * Math.PI + 2) * 0.5 + 0.5;
  const b = Math.sin(t3 * 2 * Math.PI + 4) * 0.5 + 0.5;

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// 5. Orbit Trap Coloring
function orbitTrapColoring(iter: number, maxIterations: number, zr?: number, zi?: number): [number, number, number] {
  if (iter >= maxIterations) return [0, 0, 0];

  const dist = Math.sqrt(zr! * zr! + zi! * zi!);
  const normalizedDist = Math.min(dist / 10, 1);

  const smoothIter = getSmoothIteration(iter, zr!, zi!);
  const hue = (smoothIter * 10) % 360;

  // Use distance for saturation and brightness
  const sat = 0.8 + normalizedDist * 0.2;
  const val = 1 - normalizedDist * 0.5;

  return hsvToRgb(hue, sat, val);
}

// 6. Biomorphic Coloring
function biomorphicColoring(iter: number, maxIterations: number, zr?: number, zi?: number): [number, number, number] {
  if (iter >= maxIterations) return [0, 0, 0];

  const smoothIter = getSmoothIteration(iter, zr!, zi!);

  // Use sine waves with different frequencies
  const r = Math.sin(smoothIter * 0.01) * Math.sin(smoothIter * 0.1);
  const g = Math.sin(smoothIter * 0.02) * Math.sin(smoothIter * 0.2);
  const b = Math.sin(smoothIter * 0.03) * Math.sin(smoothIter * 0.3);

  // Map to [0,1] range
  const rNorm = r * 0.5 + 0.5;
  const gNorm = g * 0.5 + 0.5;
  const bNorm = b * 0.5 + 0.5;

  return [Math.round(rNorm * 255), Math.round(gNorm * 255), Math.round(bNorm * 255)];
}

// 7. Electric Blue Fire
function electricBlueFireColoring(
  iter: number,
  maxIterations: number,
  zr?: number,
  zi?: number
): [number, number, number] {
  if (iter >= maxIterations) return [0, 0, 0];

  const smoothIter = getSmoothIteration(iter, zr!, zi!);
  const t = Math.min(smoothIter / 50, 1);

  // Blue fire color palette
  let r, g, b;

  if (t < 0.5) {
    // Dark blue to bright blue
    const u = t * 2;
    r = 0;
    g = u * 0.5;
    b = 0.5 + u * 0.5;
  } else {
    // Bright blue to white hot
    const u = (t - 0.5) * 2;
    r = u;
    g = 0.5 + u * 0.5;
    b = 1;
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function delftBlue(iter: number, maxIterations: number, zr?: number, zi?: number): [number, number, number] {
  if (iter >= maxIterations) return [0, 0, 0];

  const smoothIter = getSmoothIteration(iter, zr!, zi!);

  // Use a cyclic approach with modulo to ensure colors repeat at any zoom level
  const cycleLength = 100; // Adjust this to control how frequently colors cycle
  const cyclePosition = (smoothIter % cycleLength) / cycleLength;

  // Add some variation based on the z values to maintain detail at deep zooms
  const zMagnitude = Math.sqrt(zr! * zr! + zi! * zi!);
  // const zPhase = Math.atan2(zi!, zr!) / Math.PI; // -1 to 1

  // Combine cycle position with z values for more detail
  let t = (cyclePosition + 0.2) % 1.0;

  // Apply a curve to enhance the blue fire effect
  t = Math.pow(t, 0.8);

  // Blue fire color palette
  let r, g, b;

  if (t < 0.5) {
    // Dark blue to bright blue
    const u = t * 2;
    r = 0.1 * u; // Add a tiny bit of red for deeper blues
    g = 0.2 * u * u; // Quadratic for slower green growth
    b = 0.5 + u * 0.5; // Linear blue growth
  } else {
    // Bright blue to white hot
    const u = (t - 0.5) * 2;

    // Create a more dramatic transition to white
    const uCurved = Math.pow(u, 0.7);
    r = uCurved;
    g = 0.5 + uCurved * 0.5;
    b = 1;
  }

  // Add subtle variations based on z magnitude
  const variation = 0.01 * Math.sin(zMagnitude * 10);
  r = Math.max(0, Math.min(1, r + variation));
  g = Math.max(0, Math.min(1, g + variation));
  b = Math.max(0, Math.min(1, b + variation * 0.5)); // Less variation in blue

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// 8. Golden Ratio Coloring
function goldenRatioColoring(iter: number, maxIterations: number, zr?: number, zi?: number): [number, number, number] {
  if (iter >= maxIterations) return [0, 0, 0];

  const smoothIter = getSmoothIteration(iter, zr!, zi!);

  // Golden ratio constant ~= 0.618033988749895
  const phi = (1 + Math.sqrt(5)) / 2;
  const goldenAngle = 1 / phi;

  // Use golden ratio for hue distribution
  const hue = (smoothIter * goldenAngle * 360) % 360;

  // Use z values for saturation and brightness variations
  const angle = Math.atan2(zi!, zr!);
  const sat = 0.8 + 0.2 * Math.sin(angle);
  const val = 0.9 + 0.1 * Math.cos(angle * 2);

  return hsvToRgb(hue, sat, val);
}

// 9. Terrain-like Coloring
function terrainColoring(iter: number, maxIterations: number, zr?: number, zi?: number): [number, number, number] {
  if (iter >= maxIterations) return [0, 0, 0];

  const smoothIter = getSmoothIteration(iter, zr!, zi!);
  const t = Math.min(smoothIter / maxIterations, 0.9999);

  // Terrain color stops
  let r, g, b;

  if (t < 0.2) {
    // Deep blue to light blue (water)
    const u = t / 0.2;
    r = 0;
    g = u * 0.5;
    b = 0.5 + u * 0.5;
  } else if (t < 0.4) {
    // Light blue to yellow (shore)
    const u = (t - 0.2) / 0.2;
    r = u;
    g = 0.5 + u * 0.5;
    b = 1 - u;
  } else if (t < 0.6) {
    // Yellow to green (lowlands)
    const u = (t - 0.4) / 0.2;
    r = 1 - u * 0.5;
    g = 1;
    b = 0;
  } else if (t < 0.8) {
    // Green to brown (highlands)
    const u = (t - 0.6) / 0.2;
    r = 0.5 + u * 0.3;
    g = 1 - u * 0.6;
    b = 0;
  } else {
    // Brown to white (mountains)
    const u = (t - 0.8) / 0.2;
    r = 0.8 + u * 0.2;
    g = 0.4 + u * 0.6;
    b = u;
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// 10. Complex Domain Coloring
function complexDomainColoring(
  iter: number,
  maxIterations: number,
  zr?: number,
  zi?: number
): [number, number, number] {
  if (iter >= maxIterations) return [0, 0, 0];

  const smoothIter = getSmoothIteration(iter, zr!, zi!);

  // Get phase angle
  const angle = Math.atan2(zi!, zr!);
  const phase = (angle + Math.PI) / (2 * Math.PI);

  // Get magnitude (normalized)
  const magnitude = Math.sqrt(zr! * zr! + zi! * zi!);
  const normMagnitude = 1 - Math.exp(-magnitude * 0.1);

  // Use phase for hue, iteration for saturation, magnitude for brightness
  const hue = phase * 360;
  const sat = 0.7 + 0.3 * Math.sin(smoothIter * 0.1);
  const val = 0.6 + 0.4 * normMagnitude;

  return hsvToRgb(hue, sat, val);
}
const colorSchemes: Record<string, ColorSchemeFn> = {
  "Complex Domain": complexDomainColoring,
  "Terrain": terrainColoring,
  "Golden Ratio": goldenRatioColoring,
  "Electric Blue Fire": electricBlueFireColoring,
  "Delft Blue": delftBlue,
  "Biomorphic": biomorphicColoring,
  "Orbit Trap": orbitTrapColoring,
  "Ultra Fractal": ultraFractalStyle,
  "Bernstein Polynomial": bernsteinColoring,
  "Phase Angle": phaseColoring,
  "Smoooth Rainbow": smoothRainbow,
  "Fire Palette": firePalette,
};

export default colorSchemes;
export type { ColorSchemeFn };
