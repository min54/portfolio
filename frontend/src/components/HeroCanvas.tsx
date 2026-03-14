"use client";

import { useEffect, useRef } from "react";

interface Node {
  x: number; y: number;
  baseX: number; baseY: number;
  vx: number; vy: number;
  radius: number; phase: number;
  isJunction: boolean;
}
interface Pulse {
  fromIdx: number; toIdx: number;
  progress: number; speed: number;
}
interface TileDisp { dx: number; dy: number; }

const NODE_COUNT   = 200;
const CONNECT_DIST = 130;
const MOUSE_RADIUS = 150;
const TILE_COLS    = 20;
const TILE_ROWS    = 28;

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    // ── 캔버스 크기 (DPR 없이 CSS 픽셀 기준) ────────
    function resize() {
      canvas!.width  = canvas!.offsetWidth;
      canvas!.height = canvas!.offsetHeight;
    }
    resize();
    const W = () => canvas!.width;
    const H = () => canvas!.height;

    // ── 영상 ────────────────────────────────────────
    const video = document.createElement("video");
    video.src         = "/cyborg.mp4";
    video.loop        = true;
    video.muted       = true;
    video.playsInline = true;
    video.autoplay    = true;
    // 프레임 부드럽게 — 낮은 해상도로 디코딩
    video.style.display = "none";
    document.body.appendChild(video);
    let videoReady = false;
    video.addEventListener("canplay", () => { video.play(); videoReady = true; });

    // ── 타일 변위 ────────────────────────────────────
    const tiles: TileDisp[][] = Array.from({ length: TILE_ROWS }, () =>
      Array.from({ length: TILE_COLS }, () => ({ dx: 0, dy: 0 })),
    );

    // ── 노드 ────────────────────────────────────────
    function makeNodes(): Node[] {
      return Array.from({ length: NODE_COUNT }, () => {
        const x = Math.random() * W();
        const y = Math.random() * H();
        const isJunction = Math.random() < 0.12;
        return { x, y, baseX: x, baseY: y, vx: 0, vy: 0,
          radius: isJunction ? 3 + Math.random() * 2 : 1 + Math.random(),
          phase: Math.random() * Math.PI * 2, isJunction };
      });
    }
    let nodes = makeNodes();

    // ── 펄스 ────────────────────────────────────────
    const pulses: Pulse[] = [];
    function spawnPulse() {
      const from = Math.floor(Math.random() * NODE_COUNT);
      const a = nodes[from]!;
      const neighbors: number[] = [];
      for (let i = 0; i < NODE_COUNT; i++) {
        if (i === from) continue;
        const b = nodes[i]!;
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < CONNECT_DIST) neighbors.push(i);
      }
      if (!neighbors.length) return;
      const to = neighbors[Math.floor(Math.random() * neighbors.length)]!;
      pulses.push({ fromIdx: from, toIdx: to, progress: 0, speed: 0.008 + Math.random() * 0.012 });
    }

    // ── 마우스 ──────────────────────────────────────
    let mx = -9999, my = -9999;
    const onMove  = (e: MouseEvent) => { const r = canvas.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; };
    const onLeave = () => { mx = -9999; my = -9999; };
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);

    // ── 영상 표시 영역 — 캔버스를 꽉 채우도록 ────────
    function getVideoRect() {
      const vw = video.videoWidth  || 9;
      const vh = video.videoHeight || 16;
      const aspect = vw / vh;
      // 높이 기준으로 맞추되, 너비가 캔버스보다 크면 너비 기준
      let dh = H() * 1.0;
      let dw = dh * aspect;
      if (dw > W() * 0.6) { dw = W() * 0.6; dh = dw / aspect; }
      return { x: (W() - dw) / 2, y: (H() - dh) / 2, w: dw, h: dh };
    }

    // ── 루프 ────────────────────────────────────────
    let animId: number;
    let t = 0, lastPulse = 0;

    function draw() {
      animId = requestAnimationFrame(draw);
      t += 0.012;

      ctx.clearRect(0, 0, W(), H());
      ctx.fillStyle = "#0d0d0d";
      ctx.fillRect(0, 0, W(), H());

      // ── 영상 타일 ─────────────────────────────────
      if (videoReady && video.readyState >= 2) {
        const vr   = getVideoRect();
        const tileW = vr.w / TILE_COLS;
        const tileH = vr.h / TILE_ROWS;
        const srcW  = video.videoWidth  / TILE_COLS;
        const srcH  = video.videoHeight / TILE_ROWS;

        for (let row = 0; row < TILE_ROWS; row++) {
          for (let col = 0; col < TILE_COLS; col++) {
            const tile = tiles[row]![col]!;
            const cx   = vr.x + col * tileW + tileW / 2;
            const cy   = vr.y + row * tileH + tileH / 2;
            const dx   = cx - mx, dy = cy - my;
            const dist = Math.hypot(dx, dy);
            let tdx = 0, tdy = 0;
            if (dist < MOUSE_RADIUS && dist > 0) {
              const force = ((MOUSE_RADIUS - dist) / MOUSE_RADIUS) * 20;
              tdx = (dx / dist) * force;
              tdy = (dy / dist) * force;
            }
            tile.dx = tile.dx * 0.80 + tdx * 0.20;
            tile.dy = tile.dy * 0.80 + tdy * 0.20;

            ctx.drawImage(
              video,
              col * srcW, row * srcH, srcW + 0.5, srcH + 0.5,
              vr.x + col * tileW + tile.dx,
              vr.y + row * tileH + tile.dy,
              tileW + 0.8, tileH + 0.8,
            );
          }
        }

        // ── 영상 테두리 4면 비네트 ─────────────────────
        const fade = vr.w * 0.28; // 페이드 폭

        // 왼쪽
        const gL = ctx.createLinearGradient(vr.x, 0, vr.x + fade, 0);
        gL.addColorStop(0, "rgba(13,13,13,1)");
        gL.addColorStop(1, "rgba(13,13,13,0)");
        ctx.fillStyle = gL;
        ctx.fillRect(vr.x, vr.y, fade, vr.h);

        // 오른쪽
        const gR = ctx.createLinearGradient(vr.x + vr.w - fade, 0, vr.x + vr.w, 0);
        gR.addColorStop(0, "rgba(13,13,13,0)");
        gR.addColorStop(1, "rgba(13,13,13,1)");
        ctx.fillStyle = gR;
        ctx.fillRect(vr.x + vr.w - fade, vr.y, fade, vr.h);

        // 위
        const fadeV = vr.h * 0.32;
        const gT = ctx.createLinearGradient(0, vr.y, 0, vr.y + fadeV);
        gT.addColorStop(0, "rgba(13,13,13,1)");
        gT.addColorStop(1, "rgba(13,13,13,0)");
        ctx.fillStyle = gT;
        ctx.fillRect(vr.x, vr.y, vr.w, fadeV);

        // 아래
        const gB = ctx.createLinearGradient(0, vr.y + vr.h - fadeV, 0, vr.y + vr.h);
        gB.addColorStop(0, "rgba(13,13,13,0)");
        gB.addColorStop(1, "rgba(13,13,13,1)");
        ctx.fillStyle = gB;
        ctx.fillRect(vr.x, vr.y + vr.h - fadeV, vr.w, fadeV);

        // 영상 외부 전체 덮기 (영상 밖 캔버스 영역)
        ctx.fillStyle = "#0d0d0d";
        ctx.fillRect(0, 0, vr.x, H());                          // 영상 왼쪽
        ctx.fillRect(vr.x + vr.w, 0, W() - vr.x - vr.w, H()); // 영상 오른쪽
        ctx.fillRect(vr.x, 0, vr.w, vr.y);                      // 영상 위
        ctx.fillRect(vr.x, vr.y + vr.h, vr.w, H() - vr.y - vr.h); // 영상 아래
      }

      // ── 노드 물리 ─────────────────────────────────
      for (const n of nodes) {
        const dx = n.x - mx, dy = n.y - my;
        const d  = Math.hypot(dx, dy);
        if (d < MOUSE_RADIUS && d > 0) {
          const f = ((MOUSE_RADIUS - d) / MOUSE_RADIUS) * 1.8;
          n.vx += (dx / d) * f; n.vy += (dy / d) * f;
        }
        n.vx += (n.baseX - n.x) * 0.025; n.vy += (n.baseY - n.y) * 0.025;
        n.vx *= 0.85; n.vy *= 0.85;
        n.x  += n.vx; n.y  += n.vy;
      }

      // ── 연결선 (shadowBlur 제거 → 성능 향상) ────────
      ctx.lineWidth = 0.5;
      for (let i = 0; i < NODE_COUNT; i++) {
        const a = nodes[i]!;
        for (let j = i + 1; j < NODE_COUNT; j++) {
          const b = nodes[j]!;
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d > CONNECT_DIST) continue;
          ctx.strokeStyle = `rgba(220,220,220,${(1 - d / CONNECT_DIST) * 0.28})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }

      // ── 펄스 ──────────────────────────────────────
      if (t - lastPulse > 0.22) { spawnPulse(); lastPulse = t; }
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i]!;
        p.progress += p.speed;
        if (p.progress >= 1) { pulses.splice(i, 1); continue; }
        const a = nodes[p.fromIdx]!, b = nodes[p.toIdx]!;
        ctx.save();
        ctx.shadowColor = "#ff2020"; ctx.shadowBlur = 14;
        ctx.fillStyle = `rgba(255,80,60,${1 - p.progress * 0.5})`;
        ctx.beginPath();
        ctx.arc(a.x + (b.x - a.x) * p.progress, a.y + (b.y - a.y) * p.progress, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // ── 노드 (junction만 shadowBlur 적용) ───────────
      // 일반 노드 — shadowBlur 없이 일괄 처리
      ctx.shadowBlur = 0;
      for (const n of nodes) {
        if (n.isJunction) continue;
        const pulse = Math.sin(t * 1.4 + n.phase) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(200,200,200,${0.35 + pulse * 0.35})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius * (1 + pulse * 0.25), 0, Math.PI * 2);
        ctx.fill();
      }
      // junction 노드 — 붉은 글로우
      for (const n of nodes) {
        if (!n.isJunction) continue;
        const pulse = Math.sin(t * 1.4 + n.phase) * 0.5 + 0.5;
        ctx.save();
        ctx.shadowColor = "#ff2020"; ctx.shadowBlur = 12 + pulse * 10;
        ctx.fillStyle = `rgba(255,${(100 + pulse * 60) | 0},${(80 + pulse * 40) | 0},${0.75 + pulse * 0.25})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius * (1 + pulse * 0.3), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
    draw();

    // ── 리사이즈 ─────────────────────────────────────
    const onResize = () => { resize(); nodes = makeNodes(); };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", onResize);
      video.pause();
      document.body.removeChild(video);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="w-full h-[58vh] block" style={{ background: "#0d0d0d" }} />
  );
}
