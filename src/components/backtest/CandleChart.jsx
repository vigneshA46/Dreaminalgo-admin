import React, { useMemo, useRef, useState } from "react";
import { ActionIcon, Box, Group, Text, Tooltip } from "@mantine/core";
import { IconChevronLeft, IconChevronRight, IconRefresh, IconZoomIn, IconZoomOut } from "@tabler/icons-react";

/*
 * Candlestick chart drawn with plain SVG from the candle data the backtest already has: candles, indicator lines,
 * horizontal levels and buy / sell markers. No chart service, no API, nothing stored.
 * spec = { tf, candles: [{ time, end, open, high, low, close }], lines: [{ name, color, values, colors?, dash?, step?, width? }],
 *          levels: [{ name, value, color, dash?, from?, to? }], markers: [{ time, kind, text, price?, at? }] }
 */

const W = 1000;
const H = 360;
const PAD = { l: 8, r: 62, t: 12, b: 24 };
const UP = "#2f9e44";
const DOWN = "#e03131";

const toMin = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
const fmt = (v) => (Math.abs(v) >= 1000 ? v.toFixed(1) : v.toFixed(2));

export const CandleChart = ({ spec }) => {
  const candles = useMemo(() => spec.candles || [], [spec.candles]);
  const n = candles.length;
  const [view, setView] = useState({ start: 0, count: n });
  const [hover, setHover] = useState(null);
  const svgRef = useRef(null);

  const start = Math.max(0, Math.min(view.start, Math.max(n - 1, 0)));
  const count = Math.max(8, Math.min(view.count, n));
  const end = Math.min(n, start + count);
  const vis = end - start;

  // candle index of a time: the candle that contains it, else the nearest end
  const indexOfTime = useMemo(() => {
    const starts = candles.map((c) => toMin(c.time));
    const ends = candles.map((c) => toMin(c.end));
    return (hhmm) => {
      if (!hhmm || !n) return 0;
      const t = toMin(hhmm);
      for (let i = 0; i < n; i++) if (starts[i] <= t && t < ends[i]) return i;
      return t >= ends[n - 1] ? n - 1 : 0;
    };
  }, [candles, n]);

  const markers = useMemo(
    () =>
      (spec.markers || []).map((m) => {
        const i = indexOfTime(m.time);
        const c = candles[i];
        const price = m.price ?? (m.at === "high" ? c?.high : c?.low);
        return { ...m, i, value: price, c };
      }),
    [spec.markers, candles, indexOfTime]
  );

  if (!n) return <Text size="sm" c="dimmed">No candles for this chart.</Text>;

  // price range of what is visible
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = start; i < end; i++) {
    lo = Math.min(lo, candles[i].low);
    hi = Math.max(hi, candles[i].high);
  }
  for (const l of spec.lines || []) {
    for (let i = start; i < end; i++) {
      const v = l.values[i];
      if (v !== null && v !== undefined) {
        lo = Math.min(lo, v);
        hi = Math.max(hi, v);
      }
    }
  }
  for (const m of markers) if (m.price !== undefined && m.i >= start && m.i < end) {
    lo = Math.min(lo, m.price);
    hi = Math.max(hi, m.price);
  }
  const padY = (hi - lo) * 0.06 || 1;
  lo -= padY;
  hi += padY;

  const plotW = W - PAD.l - PAD.r;
  const plotH = H - PAD.t - PAD.b;
  const step = plotW / vis;
  const x = (i) => PAD.l + (i - start + 0.5) * step;
  const y = (v) => PAD.t + ((hi - v) / (hi - lo)) * plotH;
  const bodyW = Math.max(1, Math.min(14, step * 0.7));

  const yTicks = Array.from({ length: 6 }, (_, k) => lo + ((hi - lo) * k) / 5);
  const labelEvery = Math.max(1, Math.ceil(vis / 9));

  // line segments: one colour per segment when the line has per-candle colours
  const lineParts = (l) => {
    const parts = [];
    let cur = null;
    for (let i = start; i < end; i++) {
      const v = l.values[i];
      if (v === null || v === undefined) {
        cur = null;
        continue;
      }
      const color = l.colors ? l.colors[i] || l.color : l.color;
      if (l.step) {
        if (cur && cur.color === color) {
          cur.d += ` H${x(i)} V${y(v)}`;
        } else {
          cur = { color, d: `M${x(i) - step / 2},${y(v)} H${x(i)}` };
          parts.push(cur);
        }
      } else if (l.colors) {
        const pv = i > start ? l.values[i - 1] : null;
        if (pv !== null && pv !== undefined) parts.push({ color, d: `M${x(i - 1)},${y(pv)} L${x(i)},${y(v)}` });
      } else if (cur) {
        cur.d += ` L${x(i)},${y(v)}`;
      } else {
        cur = { color, d: `M${x(i)},${y(v)}` };
        parts.push(cur);
      }
    }
    return parts;
  };

  const zoom = (factor) => {
    const mid = start + vis / 2;
    const c = Math.max(8, Math.min(n, Math.round(vis * factor)));
    setView({ start: Math.max(0, Math.min(n - c, Math.round(mid - c / 2))), count: c });
  };
  const pan = (dir) => {
    const d = Math.max(1, Math.round(vis * 0.3)) * dir;
    setView({ start: Math.max(0, Math.min(n - vis, start + d)), count: vis });
  };

  const onMove = (e) => {
    const r = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const i = Math.max(start, Math.min(end - 1, Math.floor((px - PAD.l) / step) + start));
    setHover(i);
  };

  const hc = hover !== null ? candles[hover] : null;
  const hoverMarkers = hover !== null ? markers.filter((m) => m.i === hover) : [];

  return (
    <Box>
      <Group justify="space-between" mb={4} wrap="wrap" gap="xs">
        <Group gap="md" wrap="wrap">
          {(spec.lines || []).map((l) => (
            <Group key={l.name} gap={5}>
              <Box w={14} h={3} bg={l.color} />
              <Text size="xs" c="dimmed">
                {l.name}
              </Text>
            </Group>
          ))}
          <Group gap={5}>
            <Text size="xs" c={UP}>▲</Text>
            <Text size="xs" c="dimmed">buy</Text>
            <Text size="xs" c={DOWN}>▼</Text>
            <Text size="xs" c="dimmed">sell</Text>
            <Text size="xs" c="orange">◆</Text>
            <Text size="xs" c="dimmed">exit</Text>
          </Group>
        </Group>
        <Group gap={4}>
          <Tooltip label="Pan left"><ActionIcon variant="subtle" size="sm" onClick={() => pan(-1)} aria-label="Pan left"><IconChevronLeft size={16} /></ActionIcon></Tooltip>
          <Tooltip label="Pan right"><ActionIcon variant="subtle" size="sm" onClick={() => pan(1)} aria-label="Pan right"><IconChevronRight size={16} /></ActionIcon></Tooltip>
          <Tooltip label="Zoom in"><ActionIcon variant="subtle" size="sm" onClick={() => zoom(0.6)} aria-label="Zoom in"><IconZoomIn size={16} /></ActionIcon></Tooltip>
          <Tooltip label="Zoom out"><ActionIcon variant="subtle" size="sm" onClick={() => zoom(1.6)} aria-label="Zoom out"><IconZoomOut size={16} /></ActionIcon></Tooltip>
          <Tooltip label="Whole day"><ActionIcon variant="subtle" size="sm" onClick={() => setView({ start: 0, count: n })} aria-label="Reset"><IconRefresh size={16} /></ActionIcon></Tooltip>
        </Group>
      </Group>

      <Box pos="relative">
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block", cursor: "crosshair" }} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
          {/* grid + price labels */}
          {yTicks.map((v) => (
            <g key={v}>
              <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} stroke="#dee2e6" strokeWidth="0.6" />
              <text x={W - PAD.r + 4} y={y(v) + 3} fontSize="10" fill="#868e96">{fmt(v)}</text>
            </g>
          ))}
          {/* time labels */}
          {Array.from({ length: vis }, (_, k) => start + k)
            .filter((i, k) => k % labelEvery === 0)
            .map((i) => (
              <text key={i} x={x(i)} y={H - 7} fontSize="10" textAnchor="middle" fill="#868e96">{candles[i].time}</text>
            ))}

          {/* levels */}
          {(spec.levels || []).map((lv, k) => {
            if (lv.value < lo || lv.value > hi) return null;
            const a = Math.max(start, lv.from ? indexOfTime(lv.from) : 0);
            const b = Math.min(end - 1, lv.to ? indexOfTime(lv.to) : n - 1);
            if (b < a) return null;
            return (
              <g key={k}>
                <line x1={x(a) - step / 2} x2={x(b) + step / 2} y1={y(lv.value)} y2={y(lv.value)} stroke={lv.color} strokeWidth="1.2" strokeDasharray={lv.dash} />
                <text x={x(a) - step / 2 + 3} y={y(lv.value) - 3} fontSize="9" fill={lv.color}>{lv.name}</text>
              </g>
            );
          })}

          {/* candles */}
          {Array.from({ length: vis }, (_, k) => start + k).map((i) => {
            const c = candles[i];
            const up = c.close >= c.open;
            const col = up ? UP : DOWN;
            const top = y(Math.max(c.open, c.close));
            const bh = Math.max(1, Math.abs(y(c.open) - y(c.close)));
            return (
              <g key={i}>
                <line x1={x(i)} x2={x(i)} y1={y(c.high)} y2={y(c.low)} stroke={col} strokeWidth="1" />
                <rect x={x(i) - bodyW / 2} y={top} width={bodyW} height={bh} fill={up ? "#fff" : col} stroke={col} strokeWidth="1" />
              </g>
            );
          })}

          {/* indicator lines */}
          {(spec.lines || []).map((l) =>
            lineParts(l).map((p, k) => (
              <path key={`${l.name}${k}`} d={p.d} fill="none" stroke={p.color} strokeWidth={l.width || 1.5} strokeDasharray={l.dash} strokeLinejoin="round" />
            ))
          )}

          {/* markers */}
          {markers
            .filter((m) => m.i >= start && m.i < end && m.value !== undefined && m.value >= lo && m.value <= hi)
            .map((m, k) => {
              const cx = x(m.i);
              const cy = y(m.value);
              const s = 7;
              let shape;
              if (m.kind === "buy") shape = <path d={`M${cx},${cy + 3} l${-s},${s * 1.6} h${s * 2} z`} fill={UP} stroke="#fff" strokeWidth="0.8" />;
              else if (m.kind === "sell") shape = <path d={`M${cx},${cy - 3} l${-s},${-s * 1.6} h${s * 2} z`} fill={DOWN} stroke="#fff" strokeWidth="0.8" />;
              else if (m.kind === "exit") shape = <path d={`M${cx},${cy - s} l${s},${s} l${-s},${s} l${-s},${-s} z`} fill="#f08c00" stroke="#fff" strokeWidth="0.8" />;
              else shape = <circle cx={cx} cy={cy} r="3" fill="#495057" stroke="#fff" strokeWidth="0.8" />;
              return (
                <g key={k}>
                  {shape}
                  <title>{`${m.time} ${m.text}`}</title>
                </g>
              );
            })}

          {/* crosshair */}
          {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={PAD.t} y2={H - PAD.b} stroke="#868e96" strokeWidth="0.8" strokeDasharray="3 3" />}
        </svg>

        {hc && (
          <Box
            pos="absolute"
            top={6}
            left={10}
            p={6}
            style={{ background: "rgba(255,255,255,0.94)", border: "1px solid #dee2e6", borderRadius: 6, pointerEvents: "none", fontSize: 11, lineHeight: 1.4, maxWidth: 300 }}
          >
            <b>{hc.time} – {hc.end}</b>
            <div>O {fmt(hc.open)} · H {fmt(hc.high)} · L {fmt(hc.low)} · C {fmt(hc.close)}</div>
            {(spec.lines || []).map((l) => (l.values[hover] !== null && l.values[hover] !== undefined ? <div key={l.name} style={{ color: l.colors?.[hover] || l.color }}>{l.name} {fmt(l.values[hover])}</div> : null))}
            {hoverMarkers.map((m, k) => <div key={k} style={{ color: m.kind === "buy" ? UP : m.kind === "sell" ? DOWN : "#495057" }}>{m.text}</div>)}
          </Box>
        )}
      </Box>
    </Box>
  );
};
