"use client";

import { memo, useEffect, useState } from "react";
import { Thumbnail } from "@remotion/player";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type LandingHeroRemotionProps = {
  amountLabel: string;
  network: string;
  mode: string;
  asset: string;
};

function CycleHeroComposition({
  amountLabel,
  network,
  mode,
  asset,
}: LandingHeroRemotionProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = interpolate(frame, [0, 190], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.24, 0.72, 0.22, 1),
  });

  const pulseScale = spring({
    fps,
    frame: frame % 48,
    config: {
      damping: 13,
      stiffness: 130,
      mass: 0.82,
    },
    durationInFrames: 38,
  });

  const stages = [
    {
      label: "Dodo",
      detail: "Checkout paid",
      x: 88,
      step: "01",
      icon: "$",
      threshold: 0.08,
    },
    {
      label: "Webhook",
      detail: "Signature verified",
      x: 284,
      step: "02",
      icon: "✓",
      threshold: 0.34,
    },
    {
      label: "Routing",
      detail: "Policy compiled",
      x: 480,
      step: "03",
      icon: "%",
      threshold: 0.63,
    },
    {
      label: "Solana",
      detail: "Proof attached",
      x: 676,
      step: "04",
      icon: "◎",
      threshold: 0.9,
    },
  ];

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 12% 0%, rgba(150,234,99,0.12), transparent 0 34%), radial-gradient(circle at 88% 82%, rgba(113,137,255,0.08), transparent 0 26%), linear-gradient(180deg, rgba(9,11,18,0.985) 0%, rgba(8,10,15,0.99) 100%)",
        borderRadius: 24,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.022) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          opacity: 0.26,
          maskImage: "linear-gradient(180deg, rgba(0,0,0,0.86), transparent 94%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 20,
          borderRadius: 22,
          border: "1px solid rgba(255,255,255,0.045)",
          background:
            "linear-gradient(180deg, rgba(18,21,32,0.4) 0%, rgba(10,12,18,0.18) 100%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 28,
          right: 28,
          top: 26,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 20,
          fontFamily: "var(--font-heading-sans), sans-serif",
        }}
      >
        <div style={{ maxWidth: 420 }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "rgba(166,167,173,0.78)",
            }}
          >
            StableFlow cycle
          </div>
          <div
            style={{
              marginTop: 10,
              fontSize: 23,
              lineHeight: 1.08,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.035em",
            }}
          >
            Revenue enters. Payout proof leaves.
          </div>
          <div
            style={{
              marginTop: 10,
              fontSize: 11,
              lineHeight: 1.6,
              color: "rgba(166,167,173,0.92)",
            }}
          >
            Every payment stays attached to routing logic, signatures, and the operator desk.
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gap: 10,
            justifyItems: "end",
            minWidth: 196,
          }}
        >
          <div
            style={{
              borderRadius: 999,
              border: "1px solid rgba(150,234,99,0.18)",
              background: "rgba(150,234,99,0.08)",
              padding: "7px 11px",
              fontSize: 10,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#d8f7b8",
              whiteSpace: "nowrap",
            }}
          >
            Live operator preview
          </div>
          <div
            style={{
              display: "grid",
              gap: 6,
              width: "100%",
            }}
          >
            {[
              ["Commercial volume", amountLabel],
              ["Mode", mode],
              ["Network", network],
              ["Asset", asset],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 14,
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.055)",
                  background: "rgba(255,255,255,0.02)",
                  padding: "9px 11px",
                }}
              >
                <span
                  style={{
                    fontSize: 9,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "rgba(166,167,173,0.72)",
                  }}
                >
                  {label}
                </span>
                <span
                  style={{
                    fontSize: 11.5,
                    color: "#e6edf7",
                    fontWeight: 600,
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 28,
          right: 28,
          top: 148,
          height: 1,
          background: "linear-gradient(90deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))",
          opacity: 0.72,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 160,
          width: 528,
          top: 276,
          height: 2,
          borderRadius: 999,
          background:
            "linear-gradient(90deg, rgba(150,234,99,0.08), rgba(150,234,99,0.5), rgba(150,234,99,0.08))",
          opacity: 0.72,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 160 + progress * 528,
          top: 267,
          width: 18,
          height: 18,
          borderRadius: 999,
          background: "#96ea63",
          boxShadow: "0 0 0 8px rgba(150,234,99,0.1), 0 0 30px rgba(150,234,99,0.34)",
          transform: `translateX(-50%) scale(${0.94 + pulseScale * 0.12})`,
        }}
      />

      {stages.map((stage, index) => {
        const activeGlow = Math.max(0, 1 - Math.min(1, Math.abs(progress - stage.threshold) / 0.18));
        const reveal = spring({
          fps,
          frame: frame - index * 6,
          config: {
            damping: 16,
            stiffness: 110,
            mass: 0.9,
          },
        });

        return (
          <div
            key={stage.label}
            style={{
              position: "absolute",
              left: [84, 260, 436, 612][index],
              top: 220,
              width: 150,
              height: 116,
              borderRadius: 18,
              border: `1px solid rgba(150,234,99,${0.06 + activeGlow * 0.22})`,
              background:
                activeGlow > 0.16
                  ? "linear-gradient(180deg, rgba(20,31,25,0.98) 0%, rgba(12,17,18,0.98) 100%)"
                  : "linear-gradient(180deg, rgba(16,18,27,0.97) 0%, rgba(11,13,19,0.985) 100%)",
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.03), 0 0 ${18 + activeGlow * 24}px rgba(150,234,99,${activeGlow * 0.14})`,
              padding: "14px 14px 12px",
              fontFamily: "var(--font-heading-sans), sans-serif",
              transform: `translateY(${(1 - reveal) * 16 - activeGlow * 10}px) scale(${0.985 + reveal * 0.015 + activeGlow * 0.012})`,
              opacity: 0.46 + reveal * 0.54,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  border: `1px solid rgba(150,234,99,${0.16 + activeGlow * 0.18})`,
                  background: `rgba(150,234,99,${0.08 + activeGlow * 0.14})`,
                  boxShadow: activeGlow > 0.16 ? `0 0 18px rgba(150,234,99,${activeGlow * 0.2})` : "none",
                  display: "grid",
                  placeItems: "center",
                  color: "#d8f7b8",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {stage.icon}
              </div>
              <div
                style={{
                fontSize: 10,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: activeGlow > 0.16 ? "#d8f7b8" : "rgba(166,167,173,0.62)",
              }}
            >
              {stage.step}
              </div>
            </div>

            <div
              style={{
                marginTop: 14,
                fontSize: 18,
                lineHeight: 1.06,
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: "-0.03em",
              }}
            >
              {stage.label}
            </div>

            <div
              style={{
                marginTop: 8,
                fontSize: 11,
                lineHeight: 1.5,
                color: "rgba(166,167,173,0.92)",
              }}
            >
              {stage.detail}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
}

function LandingHeroRemotionInner(props: LandingHeroRemotionProps) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setFrame((current) => (current + 2) % 210);
    }, 90);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="overflow-hidden rounded-[1.35rem] border border-white/7 bg-[#090b12]">
      <Thumbnail
        component={CycleHeroComposition}
        inputProps={props}
        frameToDisplay={frame}
        durationInFrames={210}
        fps={30}
        compositionWidth={960}
        compositionHeight={480}
        noSuspense
        renderLoading={() => (
          <div className="flex min-h-[360px] w-full items-center justify-center bg-[#090b12] text-sm text-slate-500">
            Loading cycle preview...
          </div>
        )}
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          aspectRatio: "960 / 480",
        }}
      />
    </div>
  );
}

export const LandingHeroRemotion = memo(LandingHeroRemotionInner);
