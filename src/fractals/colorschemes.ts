interface ColorSchemeFn {
  (iter: number, maxIterations: number): [number, number, number];
}

// Helper function to convert HSL to RGB
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = h % 360;
  s = Math.max(0, Math.min(1, s));
  l = Math.max(0, Math.min(1, l));

  if (s === 0) {
    // Achromatic (gray)
    const gray = Math.round(l * 255);
    return [gray, gray, gray];
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const hueToRgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const r = Math.round(hueToRgb(p, q, h / 360 + 1 / 3) * 255);
  const g = Math.round(hueToRgb(p, q, h / 360) * 255);
  const b = Math.round(hueToRgb(p, q, h / 360 - 1 / 3) * 255);

  return [r, g, b];
}

const firePalette: ColorSchemeFn = (iter, maxIterations) => {
  if (iter === maxIterations) return [0, 0, 0];

  const ratio = iter / maxIterations;
  // From black to red to yellow to white
  if (ratio < 0.2) {
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

const psychedelicSwirl: ColorSchemeFn = (iter, maxIterations) => {
  if (iter === maxIterations) return [0, 0, 0];

  const angle = iter * 0.1;
  const hue = ((angle * 180) / Math.PI) % 360;
  const saturation = 0.8;
  const lightness = 0.5;

  return hslToRgb(hue, saturation, lightness);
};

const cosmicDust: ColorSchemeFn = (iter, maxIterations) => {
  if (iter === maxIterations) return [0, 0, 0];

  const log_zn = Math.log(iter) / Math.log(maxIterations);
  const hue = 360 * log_zn;
  const saturation = 0.7;
  const lightness = 0.5;

  return hslToRgb(hue, saturation, lightness);
};

const monochromeGradient: ColorSchemeFn = (iter, maxIterations) => {
  if (iter === maxIterations) return [0, 0, 0];

  const intensity = Math.round((iter / maxIterations) * 255);
  return [intensity, intensity, intensity];
};

export const celestialNebula: ColorSchemeFn = (iter, maxIterations) => {
  if (iter === maxIterations) return [0, 0, 0];

  // Create a smooth value with logarithmic scaling for more detail in lower iterations
  const v = (5 * Math.log(iter)) / Math.log(maxIterations);

  // Create a complex color pattern with multiple sine waves
  const r = Math.sin(v * 0.6) * 0.5 + 0.5;
  const g = Math.sin(v * 0.8 + 2.0) * 0.5 + 0.5;
  const b = Math.sin(v * 0.9 + 4.0) * 0.5 + 0.5;

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

export const auroraBorealis: ColorSchemeFn = (iter, maxIterations) => {
  if (iter === maxIterations) return [0, 0, 0];

  // Smooth iteration count for better gradients
  const smoothed = iter + 1 - Math.log(Math.log(Math.abs(iter))) / Math.log(2);
  const t = smoothed / maxIterations;

  // Green to blue to purple, like the northern lights
  let hue;
  let saturation;
  let lightness;

  if (t < 0.5) {
    // Green to blue
    hue = 120 - t * 2 * 60;
    saturation = 0.8;
    lightness = 0.2 + t * 0.4;
  } else {
    // Blue to purple
    hue = 240 - (t - 0.5) * 2 * 60;
    saturation = 0.8;
    lightness = 0.4 - (t - 0.5) * 0.2;
  }

  return hslToRgb(hue, saturation, lightness);
};

export const quantumFluctuations: ColorSchemeFn = (iter, maxIterations) => {
  if (iter === maxIterations) return [0, 0, 0];

  // Use the golden ratio for color distribution
  const phi = (1 + Math.sqrt(5)) / 2;
  const n = iter / maxIterations;

  // Create a fractal-like pattern in the color space itself
  const hue = (n * 360 * phi) % 360;
  const saturation = 0.8;
  const lightness = 0.5 * Math.sin(n * Math.PI * 8) + 0.5;

  return hslToRgb(hue, saturation, lightness);
};

export const deepSeaBioluminescence: ColorSchemeFn = (iter, maxIterations) => {
  if (iter === maxIterations) return [0, 0, 15]; // Very dark blue for the deep

  const ratio = iter / maxIterations;
  const phase = ratio * Math.PI * 2;

  // Dark blues with occasional bioluminescent highlights
  let r = Math.round(Math.pow(Math.sin(phase * 5), 2) * 100);
  let g = Math.round(20 + Math.pow(Math.sin(phase * 7), 4) * 200);
  let b = Math.round(50 + ratio * 100);

  // Add occasional bright spots
  if (Math.sin(phase * 13) > 0.97) {
    r = Math.min(255, r + 100);
    g = Math.min(255, g + 150);
    b = Math.min(255, b + 50);
  }

  return [r, g, b];
};

export const galacticCore: ColorSchemeFn = (iter, maxIterations) => {
  if (iter === maxIterations) return [0, 0, 0];

  // Logarithmic scaling for better detail distribution
  const v = Math.log(iter) / Math.log(maxIterations);

  // Create a spiral pattern with multiple color bands
  const angle = v * Math.PI * 20;
  const distance = v;

  // Use polar coordinates for spiral effect
  const r = Math.round((0.5 + 0.5 * Math.cos(angle)) * 255);
  const g = Math.round((0.5 + 0.5 * Math.sin(angle + distance * 5)) * 200);
  const b = Math.round((0.5 + 0.5 * Math.cos(angle * 3)) * 255);

  return [r, g, b];
};

export const bismuthCrystal: ColorSchemeFn = (iter, maxIterations) => {
  if (iter === maxIterations) return [0, 0, 0];

  // Inspired by the rainbow oxidation patterns of bismuth crystals
  const ratio = iter / maxIterations;
  const stepped = Math.floor(ratio * 12) / 12; // Create distinct "steps"

  // Create metallic rainbow effect with sharp transitions
  const hue = stepped * 360;
  const saturation = 0.7;
  const lightness = 0.4 + Math.sin(ratio * Math.PI * 2) * 0.2;

  return hslToRgb(hue, saturation, lightness);
};

export const volcanicInferno: ColorSchemeFn = (iter, maxIterations) => {
  if (iter === maxIterations) return [0, 0, 0];

  const ratio = iter / maxIterations;

  // Create a palette from deep red to bright orange with black accents
  let r, g, b;

  if (ratio < 0.3) {
    // Deep red to bright red
    r = Math.round(128 + ratio * 3.33 * 127);
    g = Math.round(ratio * 3.33 * 80);
    b = Math.round(ratio * 3.33 * 20);
  } else if (ratio < 0.8) {
    // Red to orange with fluctuations
    const flicker = Math.sin(ratio * 40) * 0.1 + 0.9;
    r = Math.round(255 * flicker);
    g = Math.round((80 + (ratio - 0.3) * 2 * 175) * flicker);
    b = Math.round(20 * flicker);
  } else {
    // Bright orange to yellow at the edges
    r = 255;
    g = Math.round(255 - (1 - ratio) * 5 * 100);
    b = Math.round(ratio * 100);
  }

  return [r, g, b];
};

export const prismaticRefraction: ColorSchemeFn = (iter, maxIterations) => {
  if (iter === maxIterations) return [0, 0, 0];

  // Create a spectrum that repeats with increasing frequency
  const frequency = 10;
  const phase = iter / maxIterations;
  const angle = phase * Math.PI * 2 * frequency;

  // Create a rainbow that gets more compressed as iterations increase
  const hue = ((angle * 180) / Math.PI) % 360;
  const saturation = 1;
  const lightness = 0.5;

  const [r, g, b] = hslToRgb(hue, saturation, lightness);

  // Add white highlights at regular intervals
  const highlight = Math.sin(phase * Math.PI * 2 * frequency * 3);
  if (highlight > 0.9) {
    return [
      Math.min(255, r + Math.round((1 - phase) * 200)),
      Math.min(255, g + Math.round((1 - phase) * 200)),
      Math.min(255, b + Math.round((1 - phase) * 200)),
    ];
  }

  return [r, g, b];
};

export const midnightOasis: ColorSchemeFn = (iter, maxIterations) => {
  if (iter === maxIterations) return [0, 0, 0];

  const ratio = iter / maxIterations;

  // Create a dark desert night palette with occasional bright spots
  let r = Math.round(20 + ratio * 40);
  let g = Math.round(20 + ratio * 60);
  let b = Math.round(50 + ratio * 100);

  // Add "stars" and oasis highlights
  const starPattern = Math.sin(ratio * 100) * Math.sin(ratio * 50) * Math.sin(ratio * 25);
  if (starPattern > 0.9) {
    r = Math.min(255, r + 200);
    g = Math.min(255, g + 200);
    b = Math.min(255, b + 150);
  }

  // Add blue-green "water" highlights
  const oasisPattern = Math.sin(ratio * 20) * Math.cos(ratio * 10);
  if (oasisPattern > 0.8) {
    r = Math.round(r * 0.5);
    g = Math.min(255, g + 100);
    b = Math.min(255, b + 50);
  }

  return [r, g, b];
};

export const fractalIridescence: ColorSchemeFn = (iter, maxIterations) => {
  if (iter === maxIterations) return [0, 0, 0];

  // Create an iridescent effect like a soap bubble or oil slick
  const ratio = iter / maxIterations;
  const phase = ratio * 20;

  // Use interference patterns for iridescence
  const r = Math.sin(phase) * Math.sin(phase * 1.3) * 127 + 128;
  const g = Math.sin(phase + 2) * Math.sin(phase * 0.8) * 127 + 128;
  const b = Math.sin(phase + 4) * Math.sin(phase * 1.5) * 127 + 128;

  return [Math.round(r), Math.round(g), Math.round(b)];
};

export const quantumEntanglement: ColorSchemeFn = (iter, maxIterations) => {
  if (iter === maxIterations) return [0, 0, 0];

  // Create pairs of complementary colors that appear to be "entangled"
  const ratio = iter / maxIterations;
  const section = Math.floor(ratio * 10) % 2; // Alternating sections

  // Base hue that rotates through the spectrum
  const baseHue = (ratio * 360) % 360;

  // Create complementary color pairs (180 degrees apart on color wheel)
  const hue = section === 0 ? baseHue : (baseHue + 180) % 360;
  const saturation = 0.9;
  const lightness = 0.5;

  return hslToRgb(hue, saturation, lightness);
};

export const frozenCrystalline: ColorSchemeFn = (iter, maxIterations) => {
  if (iter === maxIterations) return [0, 0, 0];

  const ratio = iter / maxIterations;

  // Create an icy blue-white palette with crystalline structure
  let r, g, b;

  // Base colors are pale blue to white
  r = Math.round(200 + ratio * 55);
  g = Math.round(220 + ratio * 35);
  b = 255;

  // Add crystalline patterns
  const pattern = Math.sin(ratio * 30) * Math.cos(ratio * 20) * Math.sin(ratio * 10);
  if (pattern > 0.7) {
    // Add deep blue accents
    r = Math.round(r * 0.7);
    g = Math.round(g * 0.8);
    b = Math.round(b * 0.9);
  } else if (pattern < -0.7) {
    // Add bright white highlights
    r = 255;
    g = 255;
    b = 255;
  }

  return [r, g, b];
};

export const hyperbolicTessellation: ColorSchemeFn = (iter, maxIterations) => {
  if (iter === maxIterations) return [0, 0, 0];

  // Create a pattern inspired by hyperbolic geometry and Escher-like tessellations
  // const ratio = iter / maxIterations;

  // Use modular arithmetic to create repeating patterns
  const pattern = (iter % 16) / 16;
  const section = Math.floor(iter / 16) % 6;

  // Create different color for each section of the tessellation
  let hue;
  switch (section) {
    case 0:
      hue = 330;
      break; // Magenta
    case 1:
      hue = 270;
      break; // Purple
    case 2:
      hue = 210;
      break; // Blue
    case 3:
      hue = 150;
      break; // Green
    case 4:
      hue = 90;
      break; // Yellow-green
    case 5:
      hue = 30;
      break; // Orange
    default:
      hue = 0;
  }

  // Vary the saturation and lightness within each section
  const saturation = 0.7 + pattern * 0.3;
  const lightness = 0.3 + pattern * 0.4;

  return hslToRgb(hue, saturation, lightness);
};

export const abyssalGradient: ColorSchemeFn = (iter, maxIterations) => {
  if (iter === maxIterations) return [0, 0, 0];

  // Create a deep, rich gradient that feels like looking into an abyss
  const ratio = Math.pow(iter / maxIterations, 0.5); // Square root for more detail in darker areas

  // From deep purple to dark blue to black
  let r, g, b;

  if (ratio < 0.5) {
    // Deep purple to dark blue
    r = Math.round(50 - ratio * 2 * 50);
    g = 0;
    b = Math.round(80 - ratio * 2 * 30);
  } else if (ratio < 0.8) {
    // Dark blue to darker blue
    r = 0;
    g = 0;
    b = Math.round(50 - (ratio - 0.5) * 3.33 * 50);
  } else {
    // Nearly black with hints of color
    r = 0;
    g = 0;
    b = Math.round((1 - ratio) * 5 * 10);
  }

  // Add occasional distant "stars"
  const starChance = Math.sin(ratio * 100) * Math.cos(ratio * 63) * Math.sin(ratio * 42);
  if (starChance > 0.9) {
    r = Math.min(255, r + 150);
    g = Math.min(255, g + 150);
    b = Math.min(255, b + 150);
  }

  return [r, g, b];
};

export const mandelbrotIlluminated: ColorSchemeFn = (iter, maxIterations) => {
  if (iter === maxIterations) return [0, 0, 0];

  // This scheme is designed specifically to highlight the structure of the Mandelbrot set
  // with a lighting effect as if light is shining on the fractal

  // Smooth iteration count
  const smoothed = iter + 1 - Math.log(Math.log(Math.abs(iter))) / Math.log(2);
  const ratio = smoothed / maxIterations;

  // Create a base color that rotates through the spectrum
  const hue = (ratio * 360 + 120) % 360; // Start at green (120)

  // Calculate "lighting" based on rate of escape
  const escapeRate = Math.log(iter + 1) / Math.log(maxIterations);
  const lighting = Math.pow(escapeRate, 0.5); // Square root for more dramatic lighting

  // Apply lighting to create a 3D-like effect
  const saturation = 0.9;
  const lightness = 0.1 + lighting * 0.6;

  // Get base color
  let [r, g, b] = hslToRgb(hue, saturation, lightness);

  // Add highlights at the "edges" of the set
  const edgeHighlight = Math.pow(Math.sin(ratio * Math.PI * 20), 20); // Sharp peaks
  if (edgeHighlight > 0.5) {
    const intensity = (edgeHighlight - 0.5) * 2; // 0 to 1
    r = Math.min(255, r + Math.round(intensity * (255 - r)));
    g = Math.min(255, g + Math.round(intensity * (255 - g)));
    b = Math.min(255, b + Math.round(intensity * (255 - b)));
  }

  return [r, g, b];
};

// 1. Electric Spectrum - Vibrant rainbow with electric blue highlights
function electricSpectrum(iter: number, maxIter: number): [number, number, number] {
  if (iter === maxIter) return [0, 0, 0]; // Black for the set itself

  const normalized = iter / maxIter;
  const hue = 260 * normalized; // Purple to blue range
  const saturation = 0.8 + 0.2 * Math.sin(normalized * Math.PI * 4);
  const lightness = 0.5 + 0.3 * Math.sin(normalized * Math.PI * 8);

  return hslToRgb(hue, saturation, lightness);
}

// 4. Cosmic Swirl - Space-like colors with purple and blue
function cosmicSwirl(iter: number, maxIter: number): [number, number, number] {
  if (iter === maxIter) return [0, 0, 0];

  const t = iter / maxIter;
  const phase = t * 20;

  const r = Math.floor(127.5 + 127.5 * Math.cos(phase));
  const g = Math.floor(127.5 + 127.5 * Math.sin(phase * 0.7));
  const b = Math.floor(127.5 + 127.5 * Math.sin(phase * 0.5 + 2));

  return [r, g, b];
}

// 5. Neon Lights - Bright, high-contrast neon colors
function neonLights(iter: number, maxIter: number): [number, number, number] {
  if (iter === maxIter) return [0, 0, 0];

  const t = Math.pow(iter / maxIter, 0.5);
  const hue = 360 * t;
  const saturation = 0.9;
  const lightness = 0.6 + 0.3 * Math.sin(t * Math.PI * 10);

  return hslToRgb(hue, saturation, lightness);
}

// 7. Psychedelic Swirl - Rapidly changing, high-saturation colors
function psychedelicSwirl2(iter: number, maxIter: number): [number, number, number] {
  if (iter === maxIter) return [0, 0, 0];

  const logIter = Math.log(iter + 1);
  const phase = logIter * 0.5;

  const r = Math.floor(127.5 + 127.5 * Math.sin(phase * 5.0));
  const g = Math.floor(127.5 + 127.5 * Math.sin(phase * 4.1 + 2.0));
  const b = Math.floor(127.5 + 127.5 * Math.sin(phase * 3.2 + 4.0));

  return [r, g, b];
}

// 8. Monochrome Elegance - Sophisticated black and white gradient
function monochromeElegance(iter: number, maxIter: number): [number, number, number] {
  if (iter === maxIter) return [0, 0, 0];

  // Use a sine wave to create bands
  const t = iter / maxIter;
  const value = Math.floor(255 * (0.5 + 0.5 * Math.sin(Math.PI * 20 * t)));

  return [value, value, value];
}

// 9. Emerald Dream - Green-focused palette with blue accents
function emeraldDream(iter: number, maxIter: number): [number, number, number] {
  if (iter === maxIter) return [0, 0, 0];

  const t = Math.pow(iter / maxIter, 0.4);
  const phase = t * Math.PI * 4;

  const r = Math.floor(t * 100 * (1 + Math.sin(phase * 1.3) * 0.5));
  const g = Math.floor(t * 200 * (1 + Math.sin(phase * 0.7) * 0.5));
  const b = Math.floor(t * 150 * (1 + Math.sin(phase + 2.0) * 0.5));

  return [r, g, b];
}

// 10. Bernstein Polynomial - Smooth, mathematically elegant coloring
function bernsteinPolynomial(iter: number, maxIter: number): [number, number, number] {
  if (iter === maxIter) return [0, 0, 0];

  const t = iter / maxIter;

  // Bernstein polynomials for smooth color transitions
  const b0 = Math.pow(1 - t, 3);
  const b1 = 3 * t * Math.pow(1 - t, 2);
  const b2 = 3 * t * t * (1 - t);
  const b3 = t * t * t;

  // Color control points
  const c0: [number, number, number] = [20, 10, 95]; // Deep blue
  const c1: [number, number, number] = [120, 60, 170]; // Purple
  const c2: [number, number, number] = [220, 40, 60]; // Red
  const c3: [number, number, number] = [255, 200, 60]; // Yellow

  // Blend colors using Bernstein polynomials
  const r = Math.floor(b0 * c0[0] + b1 * c1[0] + b2 * c2[0] + b3 * c3[0]);
  const g = Math.floor(b0 * c0[1] + b1 * c1[1] + b2 * c2[1] + b3 * c3[1]);
  const b = Math.floor(b0 * c0[2] + b1 * c1[2] + b2 * c2[2] + b3 * c3[2]);

  return [r, g, b];
}

// Advanced helper functions for more sophisticated coloring

// // Helper function for smooth coloring
// function smoothValue(iter: number, maxIter: number, z: { x: number; y: number }): number {
//   if (iter === maxIter) return 1;

//   // Smooth coloring formula
//   const log_zn = Math.log(z.x * z.x + z.y * z.y) / 2;
//   const nu = Math.log(log_zn / Math.log(2)) / Math.log(2);
//   return (iter + 1 - nu) / maxIter;
// }
// Smoothstep function for better transitions
function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

// // Improved smooth coloring with logarithmic scaling
// function advancedSmoothValue(iter: number, maxIter: number, z: { x: number; y: number }): number {
//   if (iter === maxIter) return 1;

//   const modulus = Math.sqrt(z.x * z.x + z.y * z.y);
//   const mu = iter - Math.log(Math.log(modulus)) / Math.log(2);
//   return mu / maxIter;
// }

// // Perlin-like noise function for adding texture
// function noise(x: number, y: number): number {
//   const X = Math.floor(x) & 255;
//   const Y = Math.floor(y) & 255;

//   x -= Math.floor(x);
//   y -= Math.floor(y);

//   const u = fade(x);
//   const v = fade(y);

//   const A = (perm[X] + Y) & 255;
//   const B = (perm[X + 1] + Y) & 255;

//   return lerp(
//     v,
//     lerp(u, grad(perm[A], x, y), grad(perm[B], x - 1, y)),
//     lerp(u, grad(perm[A + 1], x, y - 1), grad(perm[B + 1], x - 1, y - 1))
//   );
// }

// function fade(t: number): number {
//   return t * t * t * (t * (t * 6 - 15) + 10);
// }

function lerp(t: number, a: number, b: number): number {
  return a + t * (b - a);
}

// function grad(hash: number, x: number, y: number): number {
//   const h = hash & 15;
//   const u = h < 8 ? x : y;
//   const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
//   return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
// }

// // Permutation table for noise
// const perm = Array(512)
//   .fill(0)
//   .map((_, i) => {
//     return i < 256 ? Math.floor(Math.random() * 256) : i - 256;
//   });

// Color space conversions for more sophisticated color manipulation
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return [h * 360, s, l];
}

function oklabToRgb(L: number, a: number, b: number): [number, number, number] {
  // Convert from Oklab to linear RGB
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  // Convert from LMS to linear RGB
  let r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  let g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  let b2 = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  // Apply gamma correction and clamp
  r = Math.min(255, Math.max(0, Math.floor(255 * Math.pow(Math.max(0, r), 1 / 2.2))));
  g = Math.min(255, Math.max(0, Math.floor(255 * Math.pow(Math.max(0, g), 1 / 2.2))));
  b2 = Math.min(255, Math.max(0, Math.floor(255 * Math.pow(Math.max(0, b2), 1 / 2.2))));

  return [r, g, b2];
}

// // Cubic spline interpolation for smoother color transitions
// function cubicInterpolate(y0: number, y1: number, y2: number, y3: number, mu: number): number {
//   const mu2 = mu * mu;
//   const a0 = y3 - y2 - y0 + y1;
//   const a1 = y0 - y1 - a0;
//   const a2 = y2 - y0;
//   const a3 = y1;

//   return a0 * mu * mu2 + a1 * mu2 + a2 * mu + a3;
// }

// 1. Quantum Fluctuation - Complex oscillating patterns with phase shifts
function quantumFluctuation(iter: number, maxIter: number): [number, number, number] {
  if (iter === maxIter) return [0, 0, 0];

  // Non-linear scaling with logarithmic compression
  const t = Math.log(1 + iter) / Math.log(1 + maxIter);

  // Multiple frequency oscillations with phase shifts
  const frequency = 15.0;
  const phase1 = t * frequency;
  const phase2 = t * frequency * 1.5 + 2.0;
  const phase3 = t * frequency * 0.75 + 4.0;

  // Apply non-linear transformations to create complex patterns
  const r = Math.sin(phase1) * Math.cos(phase2 * 0.7) * 0.5 + 0.5;
  const g = Math.sin(phase2) * Math.cos(phase3 * 0.5) * 0.5 + 0.5;
  const b = Math.sin(phase3) * Math.cos(phase1 * 0.9) * 0.5 + 0.5;

  // Apply gamma correction for perceptual smoothness
  const gamma = 0.8;
  return [
    Math.floor(255 * Math.pow(r, gamma)),
    Math.floor(255 * Math.pow(g, gamma)),
    Math.floor(255 * Math.pow(b, gamma)),
  ];
}

// 2. Fractal Terrain - Colors inspired by topographic maps with noise
function fractalTerrain(iter: number, maxIter: number): [number, number, number] {
  if (iter === maxIter) return [0, 0, 0];

  // Apply non-linear scaling with sigmoid function
  const normalized = 1.0 / (1.0 + Math.exp(-10 * (iter / maxIter - 0.5)));

  // Use noise to create terrain-like variations
  const noiseValue = 0.5 + 0.5 * Math.sin(normalized * 50 + normalized * normalized * 20);

  // Define terrain color bands with smooth transitions
  let r, g, b;

  if (normalized < 0.2) {
    // Deep water
    const t = normalized / 0.2;
    r = lerp(t, 0, 30);
    g = lerp(t, 20, 50);
    b = lerp(t, 70, 120);
  } else if (normalized < 0.4) {
    // Shallow water
    const t = (normalized - 0.2) / 0.2;
    r = lerp(t, 30, 70);
    g = lerp(t, 50, 120);
    b = lerp(t, 120, 150);
  } else if (normalized < 0.6) {
    // Lowlands
    const t = (normalized - 0.4) / 0.2;
    r = lerp(t, 70, 100);
    g = lerp(t, 120, 150);
    b = lerp(t, 150, 70);
  } else if (normalized < 0.8) {
    // Highlands
    const t = (normalized - 0.6) / 0.2;
    r = lerp(t, 100, 150);
    g = lerp(t, 150, 100);
    b = lerp(t, 70, 50);
  } else {
    // Mountains
    const t = (normalized - 0.8) / 0.2;
    r = lerp(t, 150, 255);
    g = lerp(t, 100, 255);
    b = lerp(t, 50, 255);
  }

  // Apply noise variation for texture
  const noiseInfluence = 0.2;
  r = Math.min(255, Math.max(0, Math.floor(r * (1 + noiseInfluence * (noiseValue - 0.5)))));
  g = Math.min(255, Math.max(0, Math.floor(g * (1 + noiseInfluence * (noiseValue - 0.5)))));
  b = Math.min(255, Math.max(0, Math.floor(b * (1 + noiseInfluence * (noiseValue - 0.5)))));

  return [r, g, b];
}

// 3. Chromatic Aberration - Simulates lens distortion with color separation
function chromaticAberration(iter: number, maxIter: number): [number, number, number] {
  if (iter === maxIter) return [0, 0, 0];

  // Apply non-linear mapping with exponential function
  const base = 1 - Math.pow(iter / maxIter, 2.2);

  // Create phase shifts for each color channel to simulate chromatic aberration
  const phaseR = 12.0 * base;
  const phaseG = 12.0 * base + 2.0;
  const phaseB = 12.0 * base + 4.0;

  // Apply different frequency modulations to each channel
  const r = Math.sin(phaseR) * Math.sin(phaseR * 3.0) * 0.5 + 0.5;
  const g = Math.sin(phaseG) * Math.sin(phaseG * 2.7) * 0.5 + 0.5;
  const b = Math.sin(phaseB) * Math.sin(phaseB * 2.3) * 0.5 + 0.5;

  // Apply smoothstep for better transitions
  return [
    Math.floor(255 * smoothstep(0.1, 0.9, r)),
    Math.floor(255 * smoothstep(0.1, 0.9, g)),
    Math.floor(255 * smoothstep(0.1, 0.9, b)),
  ];
}

// 4. Quantum Wave Function - Inspired by quantum mechanics visualizations
function quantumWaveFunction(iter: number, maxIter: number): [number, number, number] {
  if (iter === maxIter) return [0, 0, 0];

  // Apply logarithmic scaling for better detail in low iteration areas
  const t = Math.log(1 + iter) / Math.log(1 + maxIter);

  // Create wave patterns with interference
  const wave1 = Math.sin(t * Math.PI * 20);
  const wave2 = Math.sin(t * Math.PI * 35 + 1.5);
  const wave3 = Math.sin(t * Math.PI * 50 + 3.0);

  // Combine waves with different weights
  const interference = (wave1 * 0.5 + wave2 * 0.3 + wave3 * 0.2) * 0.5 + 0.5;

  // Apply probability density-like coloring
  const probability = Math.pow(interference, 2);

  // Map to a quantum-inspired color palette
  const hue = 240 + 120 * probability; // Blue to purple to red
  const saturation = 0.8 + 0.2 * Math.sin(t * Math.PI * 10);
  const lightness = 0.2 + 0.6 * probability;

  // Convert to RGB
  return hslToRgb(hue, saturation, lightness);
}

// 5. Biome Gradient - Complex ecosystem-inspired coloring with multiple biomes
function biomeGradient(iter: number, maxIter: number): [number, number, number] {
  if (iter === maxIter) return [0, 0, 0];

  // Apply sigmoid function for non-linear mapping
  const t = 1.0 / (1.0 + Math.exp(-12 * (iter / maxIter - 0.5)));

  // Create multiple biome regions with smooth transitions
  const biomeCount = 6;
  const biomeWidth = 1.0 / biomeCount;
  const biomeIndex = Math.floor(t * biomeCount);
  const biomePosition = (t - biomeIndex * biomeWidth) / biomeWidth;

  // Define biome color palettes (start and end colors for each biome)
  const biomes = [
    // Deep ocean
    { start: [10, 30, 70], end: [30, 60, 120] },
    // Shallow water
    { start: [30, 60, 120], end: [70, 120, 180] },
    // Coastal
    { start: [70, 120, 180], end: [210, 200, 120] },
    // Forest
    { start: [210, 200, 120], end: [20, 120, 40] },
    // Mountain
    { start: [20, 120, 40], end: [120, 100, 80] },
    // Snow
    { start: [120, 100, 80], end: [250, 250, 255] },
  ];

  // Get current biome colors
  const currentBiome = biomes[Math.min(biomeIndex, biomeCount - 1)];

  // Apply cubic interpolation for smoother transitions
  const smoothPos = smoothstep(0, 1, biomePosition);

  // Interpolate between biome colors
  const r = Math.floor(lerp(smoothPos, currentBiome.start[0], currentBiome.end[0]));
  const g = Math.floor(lerp(smoothPos, currentBiome.start[1], currentBiome.end[1]));
  const b = Math.floor(lerp(smoothPos, currentBiome.start[2], currentBiome.end[2]));

  // Add subtle texture variation
  const textureAmount = 0.05;
  const texture = Math.sin(t * 100) * Math.cos(t * 50) * textureAmount;

  return [
    Math.min(255, Math.max(0, Math.floor(r * (1 + texture)))),
    Math.min(255, Math.max(0, Math.floor(g * (1 + texture)))),
    Math.min(255, Math.max(0, Math.floor(b * (1 + texture)))),
  ];
}

// 6. Spectral Analysis - Based on spectral decomposition with wavelength mapping
function spectralAnalysis(iter: number, maxIter: number): [number, number, number] {
  if (iter === maxIter) return [0, 0, 0];

  // Apply non-linear mapping with power function
  const t = Math.pow(iter / maxIter, 0.5);

  // Create spectral components with different frequencies
  const components = 5;
  let r = 0,
    g = 0,
    b = 0;

  for (let i = 0; i < components; i++) {
    const frequency = 2 + i * 3;
    const phase = (i * Math.PI) / components;
    const amplitude = 1.0 / (i + 1);

    // Each component affects colors differently
    r += amplitude * Math.sin(t * frequency * Math.PI + phase);
    g += amplitude * Math.sin(t * frequency * Math.PI + phase + 2.0);
    b += amplitude * Math.sin(t * frequency * Math.PI + phase + 4.0);
  }

  // Normalize and map to color range
  r = 0.5 + 0.5 * r;
  g = 0.5 + 0.5 * g;
  b = 0.5 + 0.5 * b;

  // Apply color correction for visual appeal
  const saturationBoost = 1.3;
  const [h, s, l] = rgbToHsl(r * 255, g * 255, b * 255);

  return hslToRgb(h, Math.min(1, s * saturationBoost), l);
}

// 7. Perceptual Gradient - Uses Oklab color space for perceptually uniform gradients
function perceptualGradient(iter: number, maxIter: number): [number, number, number] {
  if (iter === maxIter) return [0, 0, 0];

  // Apply easing function for non-linear mapping
  const t = 3 * Math.pow(iter / maxIter, 2) - 2 * Math.pow(iter / maxIter, 3);

  // Define control points in Oklab space for perceptually uniform transitions
  const controlPoints = [
    { L: 0.2, a: 0.1, b: -0.1 }, // Deep blue
    { L: 0.4, a: 0.1, b: -0.2 }, // Blue
    { L: 0.6, a: -0.15, b: 0.05 }, // Teal
    { L: 0.7, a: -0.1, b: 0.2 }, // Green
    { L: 0.8, a: 0.1, b: 0.2 }, // Yellow
    { L: 0.9, a: 0.2, b: 0.05 }, // Orange-red
  ];

  // Find the two control points to interpolate between
  const segment = t * (controlPoints.length - 1);
  const index = Math.min(Math.floor(segment), controlPoints.length - 2);
  const segmentPosition = segment - index;

  // Get the control points
  const c1 = controlPoints[index];
  const c2 = controlPoints[index + 1];

  // Apply cubic easing to the segment position
  const easedPosition = smoothstep(0, 1, segmentPosition);

  // Interpolate in Oklab space
  const L = lerp(easedPosition, c1.L, c2.L);
  const a = lerp(easedPosition, c1.a, c2.a);
  const b = lerp(easedPosition, c1.b, c2.b);

  // Convert back to RGB
  return oklabToRgb(L, a, b);
}

// 8. Harmonic Resonance - Based on harmonic series with phase modulation
function harmonicResonance(iter: number, maxIter: number): [number, number, number] {
  if (iter === maxIter) return [0, 0, 0];

  // Apply logarithmic mapping for better detail distribution
  const t = Math.log(1 + iter) / Math.log(1 + maxIter);

  // Number of harmonics to use
  const harmonics = 6;

  // Base frequency and phase modulation
  const baseFreq = 5.0;
  const phaseModulation = t * Math.PI * 2;

  // Accumulate harmonic contributions
  let r = 0,
    g = 0,
    b = 0;
  let totalWeight = 0;

  for (let i = 1; i <= harmonics; i++) {
    // Each harmonic has decreasing influence
    const weight = 1.0 / i;
    totalWeight += weight;

    // Different phase for each color channel
    const phaseR = phaseModulation + i * 0.1;
    const phaseG = phaseModulation + i * 0.2;
    const phaseB = phaseModulation + i * 0.3;

    // Frequency increases with harmonic number
    const freq = baseFreq * i;

    // Add harmonic contribution
    r += weight * Math.sin(t * freq + phaseR);
    g += weight * Math.sin(t * freq + phaseG);
    b += weight * Math.sin(t * freq + phaseB);
  }

  // Normalize by total weight
  r = r / totalWeight;
  g = g / totalWeight;
  b = b / totalWeight;

  // Map to [0,1] range
  r = r * 0.5 + 0.5;
  g = g * 0.5 + 0.5;
  b = b * 0.5 + 0.5;

  // Apply gamma correction for perceptual smoothness
  const gamma = 0.8;
  return [
    Math.floor(255 * Math.pow(r, gamma)),
    Math.floor(255 * Math.pow(g, gamma)),
    Math.floor(255 * Math.pow(b, gamma)),
  ];
}

// 9. Domain Warping - Uses domain distortion for complex patterns
function domainWarping(iter: number, maxIter: number): [number, number, number] {
  if (iter === maxIter) return [0, 0, 0];

  // Base mapping with sigmoid function
  const base = 1.0 / (1.0 + Math.exp(-10 * (iter / maxIter - 0.5)));

  // Apply domain warping by distorting the parameter space
  const warp1 = Math.sin(base * 12.0) * 0.2;
  const warp2 = Math.cos(base * 18.0) * 0.15;

  // Warped parameter
  const warped = base + warp1 + warp2;

  // Apply multiple color bands with smooth transitions
  const bands = 5;
  const bandWidth = 1.0 / bands;

  // Determine which band we're in
  const bandIndex = Math.floor(warped * bands);
  const bandPosition = (warped - bandIndex * bandWidth) / bandWidth;

  // Define color palette for bands
  const palette = [
    [20, 10, 40], // Deep purple
    [70, 10, 90], // Violet
    [150, 20, 130], // Magenta
    [200, 50, 80], // Pink
    [255, 100, 50], // Orange
  ];

  // Get colors for current and next band
  const color1 = palette[Math.min(bandIndex, bands - 1)];
  const color2 = palette[Math.min(bandIndex + 1, bands - 1)];

  // Apply smoothstep for better transitions
  const t = smoothstep(0, 1, bandPosition);

  // Interpolate between band colors
  const r = Math.floor(lerp(t, color1[0], color2[0]));
  const g = Math.floor(lerp(t, color1[1], color2[1]));
  const b = Math.floor(lerp(t, color1[2], color2[2]));

  return [r, g, b];
}

// 10. Fractal Dimension - Colors based on local fractal dimension estimation
function fractalDimension(iter: number, maxIter: number): [number, number, number] {
  if (iter === maxIter) return [0, 0, 0];

  // Apply non-linear mapping with cubic function
  const t = Math.pow(iter / maxIter, 3);

  // Estimate "local fractal dimension" (simulated)
  const localDimension = 1.0 + Math.sin(t * 30) * Math.cos(t * 15) * 0.5 + 0.5;

  // Map dimension to color using a complex scheme
  let r, g, b;

  if (localDimension < 1.3) {
    // Low dimension - blues and purples
    const factor = localDimension / 1.3;
    r = lerp(factor, 20, 50);
    g = lerp(factor, 10, 30);
    b = lerp(factor, 80, 150);
  } else if (localDimension < 1.6) {
    // Medium dimension - greens and teals
    const factor = (localDimension - 1.3) / 0.3;
    r = lerp(factor, 50, 30);
    g = lerp(factor, 30, 120);
    b = lerp(factor, 150, 100);
  } else {
    // High dimension - yellows and reds
    const factor = (localDimension - 1.6) / 0.4;
    r = lerp(factor, 30, 200);
    g = lerp(factor, 120, 100);
    b = lerp(factor, 100, 30);
  }

  // Add oscillating pattern based on iteration count
  const oscillation = Math.sin(t * Math.PI * 20) * 0.1;

  return [
    Math.min(255, Math.max(0, Math.floor(r * (1 + oscillation)))),
    Math.min(255, Math.max(0, Math.floor(g * (1 + oscillation)))),
    Math.min(255, Math.max(0, Math.floor(b * (1 + oscillation)))),
  ];
}

const colorSchemes: Record<string, ColorSchemeFn> = {
  "Fire Palette": firePalette,
  "Volcanic Inferno": volcanicInferno,
  "Hyperbolic Tessellation": hyperbolicTessellation,
  "Monochrome Gradient": monochromeGradient,
  "Monochrome Elegance": monochromeElegance,
  "Psychedelic Swirl": psychedelicSwirl,
  "Psychedelic Swirl 2": psychedelicSwirl2,
  "Cosmic Dust": cosmicDust,
  "Aurora Borealis": auroraBorealis,
  "Quantum Fluctuations": quantumFluctuations,
  "Deep Sea Bioluminescence": deepSeaBioluminescence,
  "Galactic Core": galacticCore,
  "Bismuth Crystal": bismuthCrystal,
  "Fractal Iridescence": fractalIridescence,
  "Quantum Entanglement": quantumEntanglement,
  "Mandelbrot Illuminated": mandelbrotIlluminated,
  "Electric Spectrum": electricSpectrum,
  "Cosmic Swirl": cosmicSwirl,
  "Neon Lights": neonLights,
  "Emerald Dream": emeraldDream,
  "Bernstein Polynomial": bernsteinPolynomial,
  "Quantum Fluctuation": quantumFluctuation,
  "Fractal Terrain": fractalTerrain,
  "Chromatic Abberation": chromaticAberration,
  "Quantum Wave Function": quantumWaveFunction,
  "Biome Gradient": biomeGradient,
  "Spectral Analysis": spectralAnalysis,
  "Perceptual Gradient": perceptualGradient,
  "Harmonic Resonance": harmonicResonance,
  "Domain Warping": domainWarping,
  "Fractal Dimension": fractalDimension,
};

export default colorSchemes;
export type { ColorSchemeFn };
