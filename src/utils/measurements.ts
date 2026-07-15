export type Point = { x: number; y: number };
export type MeasurementType = 'line' | 'area' | 'assembly';
export type Measurement = {
  id: string;
  type: MeasurementType;
  color: string;
  points: Point[];
  name: string;
  metadata?: any;
};

export { convertLength, convertArea, getAlternateUnit, formatDualMeasurement, type GlobalUnit } from './unitConverter';

export function getDistance(p1: Point, p2: Point) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

export function calculateLength(points: Point[], scalePxPerUnit: number) {
  if (points.length < 2) return 0;
  let len = 0;
  for (let i = 0; i < points.length - 1; i++) {
    len += getDistance(points[i], points[i + 1]);
  }
  return len / scalePxPerUnit;
}

export function calculateArea(points: Point[], scalePxPerUnit: number) {
  if (points.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area / 2) / (scalePxPerUnit * scalePxPerUnit);
}
