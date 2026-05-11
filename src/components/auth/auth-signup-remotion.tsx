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

function CyclePreviewComposition() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = interpolate(frame, [0, 150], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.24, 0.7, 0.22, 1),
  });

  const pulseScale = spring({
    fps,
    frame: frame % 44,
    config: {
      damping: 14,
      stiffness: 120,
      mass: 0.8,
    },
    durationInFrames: 34,
  });

  const cardSpring = (delay: number) =>
    spring({
      fps,
      frame: frame - delay,
      config: {
        damping: 16,
        stiffness: 100,
        mass: 0.95,
      },
    });

  const cards = [
    {
      x: 42,
      label: "Dodo",
      meta: "Checkout event",
      icon: "$",
      step: "01",
      delay: 0,
    },
    {
      x: 204,
      label: "Routing",
      meta: "Policy compile",
      icon: "%",
      step: "02",
      delay: 8,
    },
    {
      x: 366,
      label: "Solana",
      meta: "Signed payout",
      icon: "◎",
      step: "03",
      delay: 16,
    },
  ];

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 100%, rgba(150,234,99,0.10), transparent 0 42%), linear-gradient(180deg, rgba(10,12,19,0.985) 0%, rgba(8,10,16,0.985) 100%)",
        borderRadius: 24,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.028) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.024) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
          opacity: 0.28,
          maskImage: "linear-gradient(180deg, rgba(0,0,0,0.8), transparent 92%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 22,
          borderRadius: 20,
          border: "1px solid rgba(255,255,255,0.05)",
          background:
            "linear-gradient(180deg, rgba(23,30,48,0.22) 0%, rgba(9,12,20,0.10) 100%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 42,
          right: 42,
          top: 38,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 20,
          fontFamily: "var(--font-heading-sans), sans-serif",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(166,167,173,0.82)",
            }}
          >
            StableFlow cycle
          </div>
          <div
            style={{
              marginTop: 12,
              fontSize: 23,
              lineHeight: 1.02,
              fontWeight: 700,
              color: "#ffffff",
            }}
          >
            One payment. Three rails.
          </div>
          <div
            style={{
              marginTop: 10,
              maxWidth: 280,
              fontSize: 11,
              lineHeight: 1.55,
              color: "rgba(166,167,173,0.92)",
            }}
          >
            Collection, routing, and settlement stay linked in one operator workspace.
          </div>
        </div>

        <div
          style={{
            borderRadius: 999,
            border: "1px solid rgba(150,234,99,0.18)",
            background: "rgba(150,234,99,0.08)",
            padding: "8px 12px",
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#d8f7b8",
            whiteSpace: "nowrap",
          }}
        >
          Workspace preview
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 42,
          right: 42,
          top: 136,
          height: 1,
          background: "linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
          opacity: 0.6,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 86,
          right: 86,
          top: 214,
          height: 2,
          borderRadius: 999,
          background:
            "linear-gradient(90deg, rgba(150,234,99,0.08), rgba(150,234,99,0.42), rgba(150,234,99,0.08))",
          opacity: 0.68,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 86 + progress * 426,
          top: 205,
          width: 18,
          height: 18,
          borderRadius: 999,
          background: "#96ea63",
          boxShadow: "0 0 0 7px rgba(150,234,99,0.10), 0 0 28px rgba(150,234,99,0.34)",
          transform: `translateX(-50%) scale(${0.94 + pulseScale * 0.12})`,
        }}
      />

      {cards.map((card) => {
        const reveal = cardSpring(card.delay);
        const activeThreshold = card.label === "Dodo" ? 0.16 : card.label === "Routing" ? 0.5 : 0.84;
        const activeGlow = Math.max(0, 1 - Math.min(1, Math.abs(progress - activeThreshold) / 0.22));
        const borderOpacity = 0.07 + activeGlow * 0.2;
        const lift = activeGlow * 10;

        return (
          <div
            key={card.label}
            style={{
              position: "absolute",
              left: card.x,
              top: 172,
              width: 132,
              height: 118,
              borderRadius: 20,
              border: `1px solid rgba(150,234,99,${borderOpacity})`,
              background:
                activeGlow > 0.18
                  ? "linear-gradient(180deg, rgba(21,30,24,0.98) 0%, rgba(12,16,18,0.98) 100%)"
                  : "linear-gradient(180deg, rgba(17,19,28,0.97) 0%, rgba(12,14,21,0.98) 100%)",
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.03), 0 0 ${18 + activeGlow * 24}px rgba(150,234,99,${activeGlow * 0.16})`,
              padding: "14px 15px 14px",
              fontFamily: "var(--font-heading-sans), sans-serif",
              transform: `translateY(${(1 - reveal) * 16 - lift}px) scale(${0.985 + reveal * 0.015 + activeGlow * 0.01})`,
              opacity: 0.46 + reveal * 0.54,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 12,
                  border: `1px solid rgba(150,234,99,${0.16 + activeGlow * 0.18})`,
                  background: `rgba(150,234,99,${0.08 + activeGlow * 0.14})`,
                  boxShadow: activeGlow > 0.18 ? `0 0 18px rgba(150,234,99,${activeGlow * 0.2})` : "none",
                  display: "grid",
                  placeItems: "center",
                  color: "#d8f7b8",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {card.icon}
              </div>
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: activeGlow > 0.18 ? "#d8f7b8" : "rgba(166,167,173,0.58)",
                }}
              >
                {card.step}
              </div>
            </div>

            <div
              style={{
                marginTop: 14,
                fontSize: 17,
                lineHeight: 1.05,
                fontWeight: 700,
                color: "#ffffff",
              }}
            >
              {card.label}
            </div>

            <div
              style={{
                marginTop: 7,
                fontSize: 11,
                lineHeight: 1.45,
                color: "rgba(166,167,173,0.94)",
              }}
            >
              {card.meta}
            </div>
          </div>
        );
      })}

    </AbsoluteFill>
  );
}

function AuthSignupRemotionInner() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setFrame((current) => (current + 2) % 180);
    }, 90);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="overflow-hidden rounded-[1.05rem] border border-white/8 bg-[#0a0c13]">
      <Thumbnail
        component={CyclePreviewComposition}
        frameToDisplay={frame}
        durationInFrames={180}
        fps={30}
        compositionWidth={540}
        compositionHeight={320}
        noSuspense
        renderLoading={() => (
          <div className="flex h-full min-h-[280px] w-full items-center justify-center bg-[#0a0c13] text-sm text-slate-500">
            Loading preview...
          </div>
        )}
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          aspectRatio: "540 / 320",
        }}
      />
    </div>
  );
}

export const AuthSignupRemotion = memo(AuthSignupRemotionInner);
