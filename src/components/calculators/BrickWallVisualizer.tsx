import React, { useMemo } from "react";
import type { BondPattern } from "../../lib/brickCalc";

export interface VisualizerOpening {
  kind: "door" | "window" | "other";
  /** opening width in metres */
  lengthM: number;
  /** opening height in metres */
  heightM: number;
  count: number;
}

export interface BrickWallVisualizerProps {
  /** wall length in metres */
  lengthM: number;
  /** wall height in metres */
  heightM: number;
  /** wall thickness in mm */
  thicknessMm: number;
  /** actual brick size in mm (L x W x H) */
  brick: { l: number; w: number; h: number };
  /** mortar joint thickness in mm */
  jointMm: number;
  bond: BondPattern;
  openings: VisualizerOpening[];
  /** accessible description, e.g. "Wall elevation, 10 ft by 10 ft, 9 in thick, English bond, 1 door opening" */
  ariaLabel: string;
}

const W = 400;
const H = 300;
const OX = 56; // elevation origin x
const OY = 44; // elevation origin y
const MAX_W = 300;
const MAX_H = 180;

/** How many brick widths fit across the wall thickness. */
export function bricksAcross(thicknessMm: number, brickWidthMm: number, jointMm: number): number {
  const unit = brickWidthMm + jointMm;
  if (unit <= 0) return 1;
  return Math.max(1, Math.round(thicknessMm / unit));
}

interface BrickRect {
  x: number;
  y: number;
  w: number;
  h: number;
  header: boolean;
}

/**
 * To-scale schematic elevation of one wall: brick courses drawn from the
 * real brick + joint sizes, stretcher/header faces per the selected bond,
 * openings as hatched rectangles. Pure inline SVG — no images, no deps.
 * When the wall is too large to draw every brick legibly the courses are
 * condensed and the drawing says so.
 */
export default function BrickWallVisualizer({
  lengthM,
  heightM,
  thicknessMm,
  brick,
  jointMm,
  bond,
  openings,
  ariaLabel,
}: BrickWallVisualizerProps) {
  const model = useMemo(() => {
    if (!(lengthM > 0) || !(heightM > 0)) return null;
    const scale = Math.min(MAX_W / lengthM, MAX_H / heightM);
    const ew = lengthM * scale;
    const eh = heightM * scale;
    const courseHm = (brick.h + jointMm) / 1000;
    const stretcherLm = (brick.l + jointMm) / 1000;
    const headerLm = (brick.w + jointMm) / 1000;
    const rows = Math.max(1, Math.floor(heightM / courseHm));
    const cols = Math.max(1, Math.floor(lengthM / stretcherLm));
    const condensed = rows * cols > 1200;
    const rects: BrickRect[] = [];
    if (!condensed) {
      for (let r = 0; r < rows; r++) {
        const y = OY + eh - (r + 1) * courseHm * scale;
        const isHeaderCourse = bond === "english" && r % 2 === 1;
        const unitLm = isHeaderCourse ? headerLm : stretcherLm;
        const n = Math.max(1, Math.floor(lengthM / unitLm));
        const offset =
          bond === "stretcher" && r % 2 === 1 ? -unitLm / 2 : 0;
        for (let c = 0; c < n; c++) {
          let header = isHeaderCourse;
          let w = unitLm * scale;
          if (bond === "flemish" && !isHeaderCourse) {
            // alternate stretcher / header within the course
            header = c % 2 === 1;
            w = (header ? headerLm : stretcherLm) * scale;
          }
          const x = OX + c * unitLm * scale + offset * scale;
          // clip the half-brick overhang at the edges (stretcher offset)
          const x0 = Math.max(OX, x);
          const x1 = Math.min(OX + ew, x + w);
          if (x1 - x0 < 1) continue;
          rects.push({ x: x0, y, w: x1 - x0, h: courseHm * scale, header });
        }
      }
    }
    // Openings: flatten counts (cap at 6 drawn), spread across the width.
    const flat: { lengthM: number; heightM: number; kind: string }[] = [];
    for (const o of openings) {
      const n = Math.min(Math.max(0, Math.floor(o.count) || 0), 6 - flat.length);
      for (let i = 0; i < n; i++) flat.push({ lengthM: o.lengthM, heightM: o.heightM, kind: o.kind });
      if (flat.length >= 6) break;
    }
    const openingRects = flat.map((o, i) => {
      const ow = Math.min(o.lengthM, lengthM) * scale;
      const oh = Math.min(o.heightM, heightM) * scale;
      const totalOpeningsW = flat.reduce((a, f) => a + Math.min(f.lengthM, lengthM) * scale, 0);
      const gap = Math.max(0, (ew - totalOpeningsW) / (flat.length + 1));
      const xBefore = flat.slice(0, i).reduce((a, f) => a + Math.min(f.lengthM, lengthM) * scale, 0);
      return {
        x: OX + gap * (i + 1) + xBefore,
        y: OY + eh - oh,
        w: ow,
        h: oh,
        kind: o.kind,
      };
    });
    return { scale, ew, eh, rows, cols, condensed, rects, openingRects };
  }, [lengthM, heightM, brick, jointMm, bond, openings]);

  const across = bricksAcross(thicknessMm, brick.w, jointMm);
  const nominal = {
    l: Math.round(brick.l + jointMm),
    w: Math.round(brick.w + jointMm),
    h: Math.round(brick.h + jointMm),
  };

  if (!model) {
    return (
      <div className="rounded-2xl border border-ui-borderSubtle dark:border-ink-600 bg-bg-card p-5 text-sm text-txt-secondary">
        Enter a wall length and height to see the elevation drawing.
      </div>
    );
  }

  return (
    <figure className="rounded-2xl border border-ui-borderSubtle dark:border-ink-600 bg-bg-card overflow-hidden">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto block"
        role="img"
        aria-label={ariaLabel}
      >
        <defs>
          <pattern id="brick-opening-hatch" width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="6" className="stroke-accent-500" strokeWidth="1.5" />
          </pattern>
        </defs>

        {/* dimension lines */}
        <line x1={OX} y1={OY - 14} x2={OX + model.ew} y2={OY - 14} className="stroke-txt-tertiary" strokeWidth="1" />
        <line x1={OX} y1={OY - 18} x2={OX} y2={OY - 10} className="stroke-txt-tertiary" strokeWidth="1" />
        <line x1={OX + model.ew} y1={OY - 18} x2={OX + model.ew} y2={OY - 10} className="stroke-txt-tertiary" strokeWidth="1" />
        <text x={OX + model.ew / 2} y={OY - 20} textAnchor="middle" className="fill-txt-secondary" fontSize="11" fontWeight="600">
          {lengthM.toFixed(2)} m long
        </text>
        <line x1={OX - 14} y1={OY} x2={OX - 14} y2={OY + model.eh} className="stroke-txt-tertiary" strokeWidth="1" />
        <line x1={OX - 18} y1={OY} x2={OX - 10} y2={OY} className="stroke-txt-tertiary" strokeWidth="1" />
        <line x1={OX - 18} y1={OY + model.eh} x2={OX - 10} y2={OY + model.eh} className="stroke-txt-tertiary" strokeWidth="1" />
        <text
          x={OX - 20}
          y={OY + model.eh / 2}
          textAnchor="middle"
          transform={`rotate(-90 ${OX - 20} ${OY + model.eh / 2})`}
          className="fill-txt-secondary"
          fontSize="11"
          fontWeight="600"
        >
          {heightM.toFixed(2)} m high
        </text>

        {/* wall outline */}
        <rect x={OX} y={OY} width={model.ew} height={model.eh} className="fill-accent-100 dark:fill-accent-900/30 stroke-accent-800" strokeWidth="1.5" />

        {/* brick courses */}
        {model.condensed ? (
          <>
            {Array.from({ length: Math.min(model.rows, 24) }, (_, i) => (
              <line
                key={i}
                x1={OX}
                y1={OY + ((i + 1) * model.eh) / Math.min(model.rows, 24)}
                x2={OX + model.ew}
                y2={OY + ((i + 1) * model.eh) / Math.min(model.rows, 24)}
                className="stroke-accent-700"
                strokeWidth="0.7"
                opacity="0.7"
              />
            ))}
          </>
        ) : (
          model.rects.map((r, i) => (
            <rect
              key={i}
              x={r.x}
              y={r.y}
              width={r.w}
              height={r.h}
              className={r.header ? "fill-accent-400/70 stroke-accent-800" : "fill-accent-200/80 stroke-accent-800"}
              strokeWidth="0.6"
            />
          ))
        )}

        {/* openings */}
        {model.openingRects.map((o, i) => (
          <g key={i}>
            <rect
              x={o.x}
              y={o.y}
              width={o.w}
              height={o.h}
              fill="url(#brick-opening-hatch)"
              className="stroke-accent-800"
              strokeWidth="1.2"
            />
            <text x={o.x + o.w / 2} y={o.y + o.h / 2} textAnchor="middle" dominantBaseline="middle" fontSize="9" fontWeight="700" className="fill-txt-primary">
              {o.kind === "door" ? "DOOR" : o.kind === "window" ? "WINDOW" : "OPENING"}
            </text>
          </g>
        ))}

        {/* thickness note */}
        <text x={OX + model.ew / 2} y={OY + model.eh + 20} textAnchor="middle" className="fill-txt-secondary" fontSize="11">
          {`Bricks across ${across} · ${thicknessMm} mm thick · ${bond === "stretcher" ? "Stretcher" : bond === "english" ? "English" : "Flemish"} bond`}
        </text>

        {/* single-brick + joint callout */}
        <g>
          <rect x={OX} y={248} width={64} height={26} className="fill-accent-200/80 stroke-accent-800" strokeWidth="1" />
          <rect x={OX - 4} y={244} width={72} height={34} fill="none" strokeDasharray="3 3" className="stroke-accent-500" strokeWidth="1" />
          <text x={OX + 84} y={258} className="fill-txt-primary" fontSize="11" fontWeight="600">
            {`One brick ${brick.l} × ${brick.w} × ${brick.h} mm + ${jointMm} mm joint`}
          </text>
          <text x={OX + 84} y={272} className="fill-txt-secondary" fontSize="11">
            {`→ ${nominal.l} × ${nominal.w} × ${nominal.h} mm nominal (with mortar)`}
          </text>
        </g>
      </svg>
      <figcaption className="px-4 pb-3 text-xs text-txt-tertiary">
        Schematic elevation — not to scale for construction. Bond changes the drawing, not the
        brick count.
        {model.condensed ? " Courses condensed for legibility." : ""}
        {model.openingRects.length > 0 ? " Opening positions are indicative." : ""}
      </figcaption>
    </figure>
  );
}
