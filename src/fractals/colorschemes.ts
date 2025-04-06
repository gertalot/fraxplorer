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

const classicBlueYellow: ColorSchemeFn = (iter, maxIterations) => {
  if (iter === maxIterations) return [0, 0, 0]; // Black for points in the set

  const ratio = iter / maxIterations;
  const hue = 240 + ratio * 60; // Blue to yellow (240 to 60)
  return hslToRgb(hue, 0.8, 0.5);
};

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

const electricPlasma: ColorSchemeFn = (iter, maxIterations) => {
  if (iter === maxIterations) return [0, 0, 0];

  const ratio = iter / maxIterations;
  const r = Math.sin(ratio * Math.PI * 2) * 127 + 128;
  const g = Math.sin(ratio * Math.PI * 2 + Math.PI / 2) * 127 + 128;
  const b = Math.sin(ratio * Math.PI * 2 + Math.PI) * 127 + 128;

  return [Math.round(r), Math.round(g), Math.round(b)];
};

const oceanDepths: ColorSchemeFn = (iter, maxIterations) => {
  if (iter === maxIterations) return [0, 0, 0];

  const ratio = iter / maxIterations;
  const r = Math.round(ratio * 30);
  const g = Math.round(70 + ratio * 100);
  const b = Math.round(100 + ratio * 155);

  return [r, g, b];
};

const psychedelicSwirl: ColorSchemeFn = (iter, maxIterations) => {
  if (iter === maxIterations) return [0, 0, 0];

  const angle = iter * 0.1;
  const hue = ((angle * 180) / Math.PI) % 360;
  const saturation = 0.8;
  const lightness = 0.5;

  return hslToRgb(hue, saturation, lightness);
};

const neonNights: ColorSchemeFn = (iter, maxIterations) => {
  if (iter === maxIterations) return [0, 0, 0];

  const ratio = iter / maxIterations;
  const phase = ratio * 6.28;

  const r = Math.round(Math.sin(phase) * 127 + 128);
  const g = Math.round(Math.sin(phase + 2.09) * 127 + 128);
  const b = Math.round(Math.sin(phase + 4.18) * 127 + 128);

  return [r, g, b];
};

const pastelDream: ColorSchemeFn = (iter, maxIterations) => {
  if (iter === maxIterations) return [0, 0, 0];

  const ratio = iter / maxIterations;
  const hue = ratio * 360;
  return hslToRgb(hue, 0.4, 0.8);
};

const cosmicDust: ColorSchemeFn = (iter, maxIterations) => {
  if (iter === maxIterations) return [0, 0, 0];

  const log_zn = Math.log(iter) / Math.log(maxIterations);
  const hue = 360 * log_zn;
  const saturation = 0.7;
  const lightness = 0.5;

  return hslToRgb(hue, saturation, lightness);
};

const primaryContrast: ColorSchemeFn = (iter, maxIterations) => {
  if (iter === maxIterations) return [0, 0, 0];

  // Create a high contrast pattern with only a few colors
  const colorIndex = iter % 4;

  switch (colorIndex) {
    case 0:
      return [255, 255, 255]; // White
    case 1:
      return [255, 0, 0]; // Red
    case 2:
      return [0, 0, 255]; // Blue
    case 3:
      return [0, 255, 0]; // Green
    default:
      return [0, 0, 0]; // Black (shouldn't happen)
  }
};

const twilightGradient: ColorSchemeFn = (iter, maxIterations) => {
  if (iter === maxIterations) return [0, 0, 0];

  const ratio = iter / maxIterations;
  // From deep purple to pink to orange
  const hue = 270 - ratio * 50;
  const saturation = 0.8;
  const lightness = 0.3 + ratio * 0.4;

  return hslToRgb(hue, saturation, lightness);
};

const emeraldCity: ColorSchemeFn = (iter, maxIterations) => {
  if (iter === maxIterations) return [0, 0, 0];

  const ratio = iter / maxIterations;
  // Various shades of green with some blue
  const r = Math.round(ratio * 100);
  const g = Math.round(100 + ratio * 155);
  const b = Math.round(ratio * 100);

  return [r, g, b];
};

const monochromeGradient: ColorSchemeFn = (iter, maxIterations) => {
  if (iter === maxIterations) return [0, 0, 0];

  const intensity = Math.round((iter / maxIterations) * 255);
  return [intensity, intensity, intensity];
};

const sunsetGlow: ColorSchemeFn = (iter, maxIterations) => {
  if (iter === maxIterations) return [0, 0, 0];

  const ratio = iter / maxIterations;
  // From deep purple to red to orange to yellow
  let r, g, b;

  if (ratio < 0.3) {
    // Purple to red
    r = Math.round(128 + ratio * 3.33 * 127);
    g = Math.round(0);
    b = Math.round(128 * (1 - ratio * 3.33));
  } else if (ratio < 0.6) {
    // Red to orange
    r = 255;
    g = Math.round((ratio - 0.3) * 3.33 * 165);
    b = 0;
  } else {
    // Orange to yellow
    r = 255;
    g = Math.round(165 + (ratio - 0.6) * 2.5 * 90);
    b = 0;
  }

  return [r, g, b];
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

const colorSchemes: Record<string, ColorSchemeFn> = {
  "Fire Palette": firePalette,
  "Hyperbolic Tessellation": hyperbolicTessellation,
  "Monochrome Gradient": monochromeGradient,
  "Classic Blue/Yellow": classicBlueYellow,
  "Electric Plasma": electricPlasma,
  "Ocean Depths": oceanDepths,
  "Psychedelic Swirl": psychedelicSwirl,
  "Neon Nights": neonNights,
  "Pastel Dream": pastelDream,
  "Cosmic Dust": cosmicDust,
  "Primary Contrast": primaryContrast,
  "Twilight Gradient": twilightGradient,
  "Emerald City": emeraldCity,
  "Sunset Glow": sunsetGlow,
  "Celestial Nebula": celestialNebula,
  "Aurora Borealis": auroraBorealis,
  "Quantum Fluctuations": quantumFluctuations,
  "Deep Sea Bioluminescence": deepSeaBioluminescence,
  "Galactic Core": galacticCore,
  "Bismuth Crystal": bismuthCrystal,
  "Volcanic Inferno": volcanicInferno,
  "Prismatic Refraction": prismaticRefraction,
  "Midnight Oasis": midnightOasis,
  "Fractal Iridescence": fractalIridescence,
  "Quantum Entanglement": quantumEntanglement,
  "Frozen Crystalline": frozenCrystalline,
  "Abyssal Gradient": abyssalGradient,
  "Mandelbrot Illuminated": mandelbrotIlluminated,
};

export default colorSchemes;
