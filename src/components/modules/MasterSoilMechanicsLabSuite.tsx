/**
 * MasterSoilMechanicsLabSuite — rebuilt as a HUB over the real lab tools.
 * The old component hardcoded demo values (LL 40.5 "Demo", CBR loads 70/105,
 * shear phi from first/last points only, sieve weights hardcoded) — none of
 * it is kept. This hub links to the real calculators and adds three real
 * mini-calculators (Proctor, UCS/vane, phase relations) backed by pure
 * engines in src/lib/proctorCalc.ts, src/lib/ucsVaneCalc.ts and
 * src/lib/geotechCalc.ts.
 */
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FlaskConical, Beaker, Layers, Activity, Droplet, Mountain } from "lucide-react";
import { proctorFit, dryDensity, coreCutter, PROCTOR_MOULD_CM3 } from "../../lib/proctorCalc";
import { ucs, vaneShear } from "../../lib/ucsVaneCalc";
import { phaseRelations, freeSwell } from "../../lib/geotechCalc";

const REAL_TOOLS = [
  { id: "geotechnical", title: "Geotechnical & Soil Tests", desc: "Water content, specific gravity, Atterberg limits, CBR (IS 2720 Pt 16)." },
  { id: "cbr-test", title: "CBR Test", desc: "Load–penetration curve, origin-shift correction (capped 2.0 mm), Mr correlations." },
  { id: "master-sieve", title: "Sieve Analysis", desc: "Gradation curve, D10/D30/D60, Cu/Cc, fineness modulus, USCS." },
  { id: "direct-shear", title: "Direct Shear Test", desc: "Mohr–Coulomb regression with R² and residuals; labelled Terzaghi SBC." },
  { id: "permeability-test", title: "Permeability Test", desc: "Constant-head / falling-head k with ASTM temperature correction." },
  { id: "aggregate-blending", title: "Aggregate Blending", desc: "Blend % passing, blended Gs, 0.45-power line, batch quantities and cost." },
];

type Tab = "tools" | "proctor" | "ucs" | "phase";

function Num({ label, value, onChange, unit }: { label: string; value: number | ""; onChange: (v: number | "") => void; unit?: string }) {
  return (
    <label className="block text-sm font-medium text-txt-secondary">
      {label} {unit && `(${unit})`}
      <input type="number" inputMode="decimal" value={value}
        onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        className="w-full mt-1 bg-surface-hover border border-ui-borderSubtle p-3 rounded-2xl font-bold text-txt-primary" />
    </label>
  );
}

function ProctorTab() {
  const [rows, setRows] = useState([
    { w: 8, m: 1650 }, { w: 10, m: 1750 }, { w: 12, m: 1820 }, { w: 14, m: 1800 }, { w: 16, m: 1720 },
  ]);
  const [mdd, setMdd] = useState<number | "">(1.95);
  const [dia, setDia] = useState<number | "">(10);
  const [height, setHeight] = useState<number | "">(13);
  const [wetMass, setWetMass] = useState<number | "">(2000);
  const [wc, setWc] = useState<number | "">(12);
  let fit: ReturnType<typeof proctorFit> | null = null;
  let fitError: string | null = null;
  try { fit = proctorFit(rows.map((r) => ({ waterPct: r.w, wetMassG: r.m })), PROCTOR_MOULD_CM3); }
  catch (e) { fitError = (e as Error).message; }
  const core = mdd !== "" && dia !== "" && height !== "" && wetMass !== "" && wc !== ""
    ? coreCutter(Number(dia), Number(height), Number(wetMass), Number(wc), Number(mdd)) : null;
  return (
    <div className="space-y-6">
      <p className="text-sm text-txt-secondary">Standard Proctor mould {PROCTOR_MOULD_CM3} cm³. Enter 5 water-content / wet-mass rows; OMC/MDD come from a quadratic fit of the dry-density curve.</p>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {rows.map((r, i) => (
          <div key={i} className="space-y-2 bg-surface-hover rounded-2xl p-3 border border-ui-borderSubtle">
            <Num label={`w${i + 1} %`} value={r.w} onChange={(v) => setRows(rows.map((x, j) => j === i ? { ...x, w: Number(v) || 0 } : x))} />
            <Num label="wet mass g" value={r.m} onChange={(v) => setRows(rows.map((x, j) => j === i ? { ...x, m: Number(v) || 0 } : x))} />
            <p className="text-xs text-txt-tertiary">γd {dryDensity(r.w, r.m, PROCTOR_MOULD_CM3).toFixed(3)} g/cc</p>
          </div>
        ))}
      </div>
      {fitError && <p className="text-sm text-ui-errorText">{fitError}</p>}
      {fit && !fit.warning && (
        <p className="text-lg font-bold text-txt-primary">OMC {fit.omcPct.toFixed(1)}% · MDD {fit.mddGCc.toFixed(3)} g/cc</p>
      )}
      {fit?.warning && <p className="text-sm text-accent-800">{fit.warning}</p>}
      <div className="border-t border-border-color pt-4">
        <h3 className="font-bold text-txt-primary mb-3">Field density — core cutter</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Num label="Cutter dia" unit="cm" value={dia} onChange={setDia} />
          <Num label="Cutter height" unit="cm" value={height} onChange={setHeight} />
          <Num label="Wet mass" unit="g" value={wetMass} onChange={setWetMass} />
          <Num label="Water content" unit="%" value={wc} onChange={setWc} />
          <Num label="MDD" unit="g/cc" value={mdd} onChange={setMdd} />
        </div>
        {core && (
          <p className="mt-3 text-txt-primary">Volume {core.volumeCm3.toFixed(1)} cm³ · bulk {core.bulkDensity.toFixed(3)} g/cc · dry {core.dryDensity.toFixed(3)} g/cc · <strong>relative compaction {core.relativeCompactionPct.toFixed(1)}%</strong></p>
        )}
      </div>
    </div>
  );
}

function UcsTab() {
  const [dia, setDia] = useState<number | "">(38);
  const [load, setLoad] = useState<number | "">(250);
  const [strain, setStrain] = useState<number | "">(15);
  const [torque, setTorque] = useState<number | "">(15);
  const [vaneD, setVaneD] = useState<number | "">(50);
  const [vaneH, setVaneH] = useState<number | "">(100);
  const u = dia !== "" && load !== "" && strain !== "" ? ucs(Number(dia), Number(load), Number(strain)) : null;
  const v = torque !== "" && vaneD !== "" && vaneH !== "" ? vaneShear(Number(torque), Number(vaneD), Number(vaneH)) : null;
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-txt-primary mb-3">Unconfined compressive strength (IS 2720 Pt 10)</h3>
        <div className="grid grid-cols-3 gap-3">
          <Num label="Specimen dia" unit="mm" value={dia} onChange={setDia} />
          <Num label="Failure load" unit="N" value={load} onChange={setLoad} />
          <Num label="Axial strain" unit="%" value={strain} onChange={setStrain} />
        </div>
        {u && <p className="mt-3 text-txt-primary">Ac {u.correctedAreaM2.toFixed(6)} m² · <strong>qu {u.quKpa.toFixed(1)} kPa</strong> · cu {u.cuKpa.toFixed(1)} kPa</p>}
      </div>
      <div className="border-t border-border-color pt-4">
        <h3 className="font-bold text-txt-primary mb-3">Vane shear (IS 2720 Pt 30)</h3>
        <div className="grid grid-cols-3 gap-3">
          <Num label="Torque" unit="N·m" value={torque} onChange={setTorque} />
          <Num label="Vane dia" unit="mm" value={vaneD} onChange={setVaneD} />
          <Num label="Vane height" unit="mm" value={vaneH} onChange={setVaneH} />
        </div>
        {v && <p className="mt-3 text-txt-primary"><strong>cu {v.cuKpa.toFixed(1)} kPa</strong></p>}
      </div>
    </div>
  );
}

function PhaseTab() {
  const [w, setW] = useState<number | "">(25);
  const [gs, setGs] = useState<number | "">(2.667);
  const [bulk, setBulk] = useState<number | "">(1.8);
  const [init, setInit] = useState<number | "">(10);
  const [fin, setFin] = useState<number | "">(15);
  let phase: ReturnType<typeof phaseRelations> | null = null;
  let phaseError: string | null = null;
  try { if (w !== "" && gs !== "" && bulk !== "") phase = phaseRelations(Number(w), Number(gs), Number(bulk)); }
  catch (e) { phaseError = (e as Error).message; }
  const swell = init !== "" && fin !== "" ? freeSwell(Number(init), Number(fin)) : null;
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-txt-primary mb-3">Phase relations (defaults are physically consistent — S ≤ 100%)</h3>
        <div className="grid grid-cols-3 gap-3">
          <Num label="Water content" unit="%" value={w} onChange={setW} />
          <Num label="Specific gravity Gs" value={gs} onChange={setGs} />
          <Num label="Bulk density" unit="g/cc" value={bulk} onChange={setBulk} />
        </div>
        {phaseError && <p className="text-sm text-ui-errorText mt-2">{phaseError}</p>}
        {phase && <p className="mt-3 text-txt-primary">Dry density {phase.dryDensity.toFixed(3)} g/cc · void ratio {phase.voidRatio.toFixed(3)} · <strong>degree of saturation {phase.saturationPct.toFixed(1)}%</strong></p>}
      </div>
      <div className="border-t border-border-color pt-4">
        <h3 className="font-bold text-txt-primary mb-3">Free swell (IS 1498)</h3>
        <div className="grid grid-cols-2 gap-3">
          <Num label="Initial volume" unit="ml" value={init} onChange={setInit} />
          <Num label="Final volume" unit="ml" value={fin} onChange={setFin} />
        </div>
        {swell && <p className="mt-3 text-txt-primary">Free swell <strong>{swell.swellPct.toFixed(1)}%</strong> — {swell.band}</p>}
      </div>
    </div>
  );
}

export default function MasterSoilMechanicsLabSuite() {
  const [tab, setTab] = useState<Tab>("tools");
  const tabs: { id: Tab; label: string; icon: typeof Beaker }[] = [
    { id: "tools", label: "Lab Tools", icon: FlaskConical },
    { id: "proctor", label: "Proctor & Field Density", icon: Mountain },
    { id: "ucs", label: "UCS & Vane Shear", icon: Activity },
    { id: "phase", label: "Phase Relations & Swell", icon: Droplet },
  ];
  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
      <h2 className="text-2xl font-bold text-txt-primary flex items-center gap-2 mb-2">
        <Beaker className="w-7 h-7 text-accent-800" /> Soil Mechanics Lab Suite
      </h2>
      <p className="text-txt-secondary mb-6 max-w-3xl">Real lab calculators — every number below is computed from your inputs. The old demo values (hardcoded LL, CBR loads and shear points) were removed, not patched.</p>
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-full font-bold text-sm ${tab === t.id ? "bg-ink text-white" : "bg-surface-default border border-border-color text-txt-secondary"}`}>
            <t.icon className="w-4 h-4 inline mr-1" /> {t.label}
          </button>
        ))}
      </div>
      {tab === "tools" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {REAL_TOOLS.map((t) => (
            <Link key={t.id} to={`/${t.id}`} className="block bg-surface-default border border-border-color rounded-2xl p-5 hover:border-accent-300">
              <h3 className="font-semibold text-txt-primary flex items-center gap-2"><Layers className="w-5 h-5 text-accent-800" /> {t.title}</h3>
              <p className="text-sm text-txt-secondary mt-1">{t.desc}</p>
            </Link>
          ))}
        </div>
      )}
      {tab !== "tools" && (
        <div className="bg-surface-default border border-border-color rounded-2xl p-4 sm:p-6">
          {tab === "proctor" && <ProctorTab />}
          {tab === "ucs" && <UcsTab />}
          {tab === "phase" && <PhaseTab />}
        </div>
      )}
    </div>
  );
}
