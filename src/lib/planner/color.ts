function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h;
}

export function subjectColor(maMH: string) {
  const h = hash(maMH) % 360;
  return {
    bg: `hsl(${h} 70% 92%)`,
    border: `hsl(${h} 55% 70%)`,
    text: `hsl(${h} 45% 28%)`,
    dot: `hsl(${h} 60% 55%)`,
  };
}
