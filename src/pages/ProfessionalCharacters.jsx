
import { useEffect, useState } from "react";

/* ── shared keyframes injected once ── */
const STYLES = `
  @keyframes avatarFloat  { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-10px)} }
  @keyframes bubblePop    { 0%{opacity:0;transform:scale(0.7) translateY(8px)} 60%{transform:scale(1.06) translateY(-2px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes blink        { 0%,92%,100%{scaleY:1} 96%{scaleY:0.05} }
  @keyframes typingDot    { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }
  .av-float { animation: avatarFloat 4.5s ease-in-out infinite; }
  .av-float-delay { animation: avatarFloat 4.5s ease-in-out 1.4s infinite; }
`;

function injectStyles() {
  if (
    typeof document !== "undefined" &&
    !document.getElementById("av-styles")
  ) {
    const s = document.createElement("style");
    s.id = "av-styles";
    s.textContent = STYLES;
    document.head.appendChild(s);
  }
}

/*   SPEECH BUBBLE*/
function Bubble({
  text,
  side = "right",
  color1 = "#3b82f6",
  color2 = "#6366f1",
  delay = 0.3,
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay * 1000);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: "calc(100% + 10px)",
        ...(side === "right" ? { right: -10 } : { left: -10 }),
        opacity: visible ? 1 : 0,
        animation: visible
          ? "bubblePop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards"
          : "none",
        zIndex: 10,
        minWidth: 160,
        maxWidth: 210,
      }}
    >
      <div
        style={{
          background: `linear-gradient(135deg,${color1},${color2})`,
          borderRadius:
            side === "right" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          padding: "10px 14px",
          boxShadow: `0 8px 28px ${color1}55`,
          position: "relative",
        }}
      >
        <p
          style={{
            margin: 0,
            color: "white",
            fontSize: 12.5,
            fontWeight: 600,
            fontFamily: "DM Sans,sans-serif",
            lineHeight: 1.45,
          }}
        >
          {text}
        </p>
        {/* tail */}
        <div
          style={{
            position: "absolute",
            bottom: -7,
            ...(side === "right" ? { right: 14 } : { left: 14 }),
            width: 0,
            height: 0,
            borderLeft: "7px solid transparent",
            borderRight: "7px solid transparent",
            borderTop: `8px solid ${color2}`,
          }}
        />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   PROFESSIONAL MALE  — 3D-style avatar, navy suit
   Used in: Login page (left character)
──────────────────────────────────────────────────────────── */
export function LoginMale() {
  injectStyles();
  return (
    <div
      className="av-float"
      style={{ position: "relative", width: 180, margin: "0 auto" }}
    >
      <Bubble
        text="Welcome back! 👋 Great to see you again."
        side="right"
        color1="#3b82f6"
        color2="#6366f1"
        delay={0.6}
      />
      <svg
        viewBox="0 0 220 420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: "100%",
          filter: "drop-shadow(0 20px 40px rgba(59,130,246,0.35))",
        }}
      >
        <defs>
          <radialGradient id="skinM" cx="50%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#FDDBB4" />
            <stop offset="70%" stopColor="#F5C49A" />
            <stop offset="100%" stopColor="#E8A87C" />
          </radialGradient>
          <radialGradient id="skinDarkM" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#F5C49A" />
            <stop offset="100%" stopColor="#D4956A" />
          </radialGradient>
          <linearGradient id="suitM" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="50%" stopColor="#1e40af" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="suitDarkM" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#172554" />
          </linearGradient>
          <linearGradient id="hairM" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2d1810" />
            <stop offset="100%" stopColor="#1a0e08" />
          </linearGradient>
          <linearGradient id="shirtM" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
          <linearGradient id="tieM" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <filter id="softShadow">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.2" />
          </filter>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── SHADOW ── */}
        <ellipse cx="110" cy="415" rx="62" ry="6" fill="rgba(0,0,0,0.2)" />

        {/* ── LEGS ── */}
        <rect
          x="72"
          y="290"
          width="32"
          height="118"
          rx="12"
          fill="url(#suitDarkM)"
        />
        <rect
          x="116"
          y="290"
          width="32"
          height="118"
          rx="12"
          fill="url(#suitDarkM)"
        />
        {/* trouser crease */}
        <line
          x1="88"
          y1="295"
          x2="88"
          y2="400"
          stroke="#172554"
          strokeWidth="1.5"
          opacity="0.6"
        />
        <line
          x1="132"
          y1="295"
          x2="132"
          y2="400"
          stroke="#172554"
          strokeWidth="1.5"
          opacity="0.6"
        />

        {/* ── SHOES ── */}
        <path
          d="M68 398 Q70 408 82 410 Q96 412 100 408 L104 398Z"
          fill="#0f172a"
        />
        <path
          d="M68 398 Q70 404 84 406 Q96 407 100 404 L104 398Z"
          fill="#1e293b"
        />
        <path
          d="M112 398 Q114 408 126 410 Q140 412 144 408 L148 398Z"
          fill="#0f172a"
        />
        <path
          d="M112 398 Q114 404 128 406 Q140 407 144 404 L148 398Z"
          fill="#1e293b"
        />

        {/* ── SUIT BODY ── */}
        <path
          d="M55 195 Q48 240 46 290 L174 290 Q172 240 165 195 Q155 168 140 162 L110 178 L80 162 Q65 168 55 195Z"
          fill="url(#suitM)"
        />
        {/* suit shading */}
        <path
          d="M55 195 Q50 240 48 290 L72 290 Q70 240 76 195 Q80 175 90 168 L80 162 Q65 168 55 195Z"
          fill="url(#suitDarkM)"
          opacity="0.5"
        />
        <path
          d="M165 195 Q170 240 172 290 L148 290 Q150 240 144 195 Q140 175 130 168 L140 162 Q155 168 165 195Z"
          fill="url(#suitDarkM)"
          opacity="0.5"
        />

        {/* ── LAPELS ── */}
        <path d="M110 178 L93 205 L110 222 L127 205 Z" fill="url(#shirtM)" />
        <path d="M110 178 L80 162 L70 196 L93 205 Z" fill="#1e40af" />
        <path d="M110 178 L140 162 L150 196 L127 205 Z" fill="#1e40af" />
        {/* lapel highlight */}
        <path
          d="M82 168 Q76 190 78 198"
          stroke="#2563eb"
          strokeWidth="1.5"
          fill="none"
          opacity="0.5"
        />
        <path
          d="M138 168 Q144 190 142 198"
          stroke="#2563eb"
          strokeWidth="1.5"
          fill="none"
          opacity="0.5"
        />

        {/* ── SHIRT COLLAR ── */}
        <path
          d="M100 172 L110 176 L120 172 L116 160 L110 165 L104 160Z"
          fill="url(#shirtM)"
        />

        {/* ── TIE ── */}
        <path
          d="M107 176 L104 202 L110 228 L116 202 L113 176Z"
          fill="url(#tieM)"
        />
        <path d="M104 188 L116 188 L114 200 L106 200Z" fill="#1d4ed8" />
        {/* tie knot */}
        <path d="M107 176 L110 183 L113 176 L110 172Z" fill="#60a5fa" />

        {/* ── POCKET SQUARE ── */}
        <path
          d="M58 208 L72 208 L70 220 L56 220Z"
          fill="#93c5fd"
          opacity="0.9"
        />
        <path
          d="M60 208 L64 204 L68 208"
          stroke="white"
          strokeWidth="1"
          fill="none"
        />

        {/* ── SUIT BUTTONS ── */}
        <circle cx="110" cy="238" r="4" fill="#1e3a8a" />
        <circle cx="110" cy="257" r="4" fill="#1e3a8a" />
        <circle cx="110" cy="238" r="2" fill="#2563eb" opacity="0.6" />

        {/* ── LEFT ARM ── */}
        <path
          d="M55 195 Q38 218 34 262 Q32 278 36 290 L58 290 Q60 272 66 248 Q70 220 80 205Z"
          fill="url(#suitM)"
        />
        {/* cuff */}
        <rect
          x="28"
          y="278"
          width="32"
          height="16"
          rx="6"
          fill="url(#shirtM)"
        />
        <rect x="28" y="278" width="32" height="8" rx="4" fill="white" />
        {/* left hand */}
        <ellipse cx="44" cy="304" rx="14" ry="17" fill="url(#skinM)" />
        <path
          d="M32 297 Q28 290 33 287 Q38 284 41 291"
          fill="url(#skinDarkM)"
        />
        <path
          d="M30 303 Q26 296 31 293 Q36 290 39 297"
          fill="url(#skinDarkM)"
        />
        {/* knuckle lines */}
        <path
          d="M34 306 Q40 308 46 306"
          stroke="#D4956A"
          strokeWidth="0.8"
          fill="none"
          opacity="0.5"
        />

        {/* ── RIGHT ARM ── */}
        <path
          d="M165 195 Q182 218 186 262 Q188 278 184 290 L162 290 Q160 272 154 248 Q150 220 140 205Z"
          fill="url(#suitM)"
        />
        {/* cuff */}
        <rect
          x="160"
          y="278"
          width="32"
          height="16"
          rx="6"
          fill="url(#shirtM)"
        />
        <rect x="160" y="278" width="32" height="8" rx="4" fill="white" />
        {/* right hand */}
        <ellipse cx="176" cy="304" rx="14" ry="17" fill="url(#skinM)" />
        <path
          d="M188 297 Q192 290 187 287 Q182 284 179 291"
          fill="url(#skinDarkM)"
        />
        <path
          d="M190 303 Q194 296 189 293 Q184 290 181 297"
          fill="url(#skinDarkM)"
        />
        {/* watch */}
        <rect x="162" y="282" width="14" height="9" rx="3" fill="#334155" />
        <rect x="163" y="283" width="12" height="7" rx="2" fill="#0ea5e9" />
        <circle cx="169" cy="286.5" r="2.5" fill="#7dd3fc" />

        {/* ── NECK ── */}
        <path
          d="M98 155 Q98 176 110 178 Q122 176 122 155 L116 148 L104 148Z"
          fill="url(#skinM)"
        />

        {/* ── HEAD ── */}
        <ellipse
          cx="110"
          cy="112"
          rx="46"
          ry="50"
          fill="url(#skinM)"
          filter="url(#softShadow)"
        />
        {/* jaw shaping */}
        <path
          d="M72 118 Q70 138 80 150 Q94 162 110 163 Q126 162 140 150 Q150 138 148 118"
          fill="url(#skinM)"
        />
        {/* ear */}
        <ellipse cx="64" cy="116" rx="8" ry="11" fill="url(#skinM)" />
        <ellipse
          cx="64"
          cy="116"
          rx="4.5"
          ry="7"
          fill="url(#skinDarkM)"
          opacity="0.5"
        />
        <ellipse cx="156" cy="116" rx="8" ry="11" fill="url(#skinM)" />
        <ellipse
          cx="156"
          cy="116"
          rx="4.5"
          ry="7"
          fill="url(#skinDarkM)"
          opacity="0.5"
        />

        {/* ── HAIR ── */}
        <path
          d="M66 98 Q68 56 110 52 Q152 56 154 98 Q146 70 110 68 Q74 70 66 98Z"
          fill="url(#hairM)"
        />
        <path
          d="M66 98 Q63 82 65 72 Q68 60 74 56"
          stroke="#2d1810"
          strokeWidth="2"
          fill="none"
          opacity="0.7"
        />
        {/* side part */}
        <path
          d="M84 68 Q86 76 88 84"
          stroke="#3d2010"
          strokeWidth="2"
          fill="none"
        />
        {/* hair texture */}
        <path
          d="M90 60 Q92 72 90 84"
          stroke="#3d2010"
          strokeWidth="1.5"
          fill="none"
          opacity="0.4"
        />
        <path
          d="M100 58 Q102 72 100 86"
          stroke="#3d2010"
          strokeWidth="1.5"
          fill="none"
          opacity="0.3"
        />
        {/* sideburn */}
        <path
          d="M66 98 Q63 110 65 122"
          stroke="url(#hairM)"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M154 98 Q157 110 155 122"
          stroke="url(#hairM)"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />

        {/* ── EYEBROWS ── */}
        <path
          d="M80 93 Q90 88 100 91"
          stroke="#2d1810"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M120 91 Q130 88 140 93"
          stroke="#2d1810"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />

        {/* ── EYES ── */}
        {/* whites */}
        <ellipse cx="90" cy="107" rx="12" ry="10" fill="white" />
        <ellipse cx="130" cy="107" rx="12" ry="10" fill="white" />
        {/* iris */}
        <circle cx="90" cy="108" r="8" fill="#3b2010" />
        <circle cx="130" cy="108" r="8" fill="#3b2010" />
        {/* pupil */}
        <circle cx="90" cy="108" r="5.5" fill="#1a0e08" />
        <circle cx="130" cy="108" r="5.5" fill="#1a0e08" />
        {/* iris ring */}
        <circle
          cx="90"
          cy="108"
          r="8"
          fill="none"
          stroke="#5c3a20"
          strokeWidth="1.5"
          opacity="0.5"
        />
        <circle
          cx="130"
          cy="108"
          r="8"
          fill="none"
          stroke="#5c3a20"
          strokeWidth="1.5"
          opacity="0.5"
        />
        {/* main shine */}
        <circle cx="93" cy="104" r="3.5" fill="white" opacity="0.9" />
        <circle cx="133" cy="104" r="3.5" fill="white" opacity="0.9" />
        {/* secondary shine */}
        <circle cx="95" cy="106" r="1.5" fill="white" opacity="0.5" />
        <circle cx="135" cy="106" r="1.5" fill="white" opacity="0.5" />
        {/* upper eyelid */}
        <path
          d="M78 103 Q90 97 102 103"
          stroke="#2d1810"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M118 103 Q130 97 142 103"
          stroke="#2d1810"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        {/* lower eyelid */}
        <path
          d="M79 112 Q90 116 101 112"
          stroke="#E8A87C"
          strokeWidth="1"
          fill="none"
          opacity="0.6"
        />
        <path
          d="M119 112 Q130 116 141 112"
          stroke="#E8A87C"
          strokeWidth="1"
          fill="none"
          opacity="0.6"
        />

        {/* ── NOSE ── */}
        <path
          d="M110 115 Q106 126 104 130 Q110 133 116 130 Q114 126 110 115Z"
          fill="#E8A87C"
          opacity="0.7"
        />
        {/* nostrils */}
        <ellipse
          cx="105"
          cy="130"
          rx="5"
          ry="4"
          fill="#D4956A"
          opacity="0.45"
        />
        <ellipse
          cx="115"
          cy="130"
          rx="5"
          ry="4"
          fill="#D4956A"
          opacity="0.45"
        />
        <path
          d="M107 132 Q110 134 113 132"
          stroke="#C07850"
          strokeWidth="0.8"
          fill="none"
        />

        {/* ── MOUTH / SMILE ── */}
        <path
          d="M96 142 Q110 154 124 142"
          stroke="#C07850"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        {/* teeth */}
        <path
          d="M98 143 Q110 152 122 143 Q110 148 98 143Z"
          fill="white"
          opacity="0.85"
        />
        {/* lower lip */}
        <path d="M98 147 Q110 153 122 147" fill="#D4956A" opacity="0.25" />
        {/* cheeks */}
        <ellipse cx="76" cy="128" rx="13" ry="9" fill="#f87171" opacity="0.1" />
        <ellipse
          cx="144"
          cy="128"
          rx="13"
          ry="9"
          fill="#f87171"
          opacity="0.1"
        />
        {/* philtrum */}
        <path
          d="M107 135 Q110 139 113 135"
          stroke="#D4956A"
          strokeWidth="1"
          fill="none"
        />
      </svg>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   PROFESSIONAL FEMALE — 3D-style avatar, grey-lavender blazer
   Used in: Login page (right character)
──────────────────────────────────────────────────────────── */
export function LoginFemale() {
  injectStyles();
  return (
    <div
      className="av-float-delay"
      style={{ position: "relative", width: 180, margin: "0 auto" }}
    >
      <Bubble
        text="Track your wealth smartly 💜"
        side="left"
        color1="#a855f7"
        color2="#7c3aed"
        delay={0.9}
      />
      <svg
        viewBox="0 0 220 420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: "100%",
          filter: "drop-shadow(0 20px 40px rgba(168,85,247,0.35))",
        }}
      >
        <defs>
          <radialGradient id="skinF" cx="50%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#FDDBB4" />
            <stop offset="70%" stopColor="#F5C49A" />
            <stop offset="100%" stopColor="#E8A87C" />
          </radialGradient>
          <radialGradient id="skinDarkF" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#F5C49A" />
            <stop offset="100%" stopColor="#D4956A" />
          </radialGradient>
          <linearGradient id="blazerF" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b8fb8" />
            <stop offset="50%" stopColor="#7b7fac" />
            <stop offset="100%" stopColor="#6b6f9c" />
          </linearGradient>
          <linearGradient id="blazerDarkF" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6b6f9c" />
            <stop offset="100%" stopColor="#4a4e7a" />
          </linearGradient>
          <linearGradient id="shirtF" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fefefe" />
            <stop offset="100%" stopColor="#f0f4f8" />
          </linearGradient>
          <linearGradient id="hairF" x1="0%" y1="0%" x2="40%" y2="100%">
            <stop offset="0%" stopColor="#5c3010" />
            <stop offset="40%" stopColor="#3d1e08" />
            <stop offset="100%" stopColor="#2a1406" />
          </linearGradient>
          <linearGradient id="hairHighF" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c4a20" />
            <stop offset="50%" stopColor="#6b3e18" />
            <stop offset="100%" stopColor="#5c3010" />
          </linearGradient>
          <filter id="softShadowF">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* ── SHADOW ── */}
        <ellipse cx="110" cy="415" rx="62" ry="6" fill="rgba(0,0,0,0.2)" />

        {/* ── LEGS ── */}
        <rect x="74" y="295" width="28" height="112" rx="10" fill="#4a4e7a" />
        <rect x="118" y="295" width="28" height="112" rx="10" fill="#4a4e7a" />

        {/* ── HEELS / SHOES ── */}
        <path
          d="M68 402 Q70 412 80 413 Q92 414 96 410 L100 402Z"
          fill="#6d28d9"
        />
        <path
          d="M68 402 Q70 408 82 409 Q92 410 96 406 L100 402Z"
          fill="#7c3aed"
        />
        <rect x="86" y="402" width="5" height="14" rx="2" fill="#5b21b6" />
        <path
          d="M120 402 Q122 412 132 413 Q144 414 148 410 L152 402Z"
          fill="#6d28d9"
        />
        <path
          d="M120 402 Q122 408 134 409 Q144 410 148 406 L152 402Z"
          fill="#7c3aed"
        />
        <rect x="138" y="402" width="5" height="14" rx="2" fill="#5b21b6" />

        {/* ── BLAZER BODY ── */}
        <path
          d="M58 198 Q50 242 48 295 L172 295 Q170 242 162 198 Q152 170 136 163 L110 180 L84 163 Q68 170 58 198Z"
          fill="url(#blazerF)"
        />
        {/* shading sides */}
        <path
          d="M58 198 Q52 242 50 295 L74 295 Q72 242 78 198 Q82 176 92 168 L84 163 Q68 170 58 198Z"
          fill="url(#blazerDarkF)"
          opacity="0.45"
        />
        <path
          d="M162 198 Q168 242 170 295 L146 295 Q148 242 142 198 Q138 176 128 168 L136 163 Q152 170 162 198Z"
          fill="url(#blazerDarkF)"
          opacity="0.45"
        />

        {/* ── LAPELS ── */}
        <path d="M110 180 L94 205 L110 223 L126 205 Z" fill="url(#shirtF)" />
        <path d="M110 180 L84 163 L73 198 L94 205 Z" fill="#7b7fac" />
        <path d="M110 180 L136 163 L147 198 L126 205 Z" fill="#7b7fac" />
        <path
          d="M86 170 Q80 192 82 200"
          stroke="#9fa3cc"
          strokeWidth="1.5"
          fill="none"
          opacity="0.6"
        />
        <path
          d="M134 170 Q140 192 138 200"
          stroke="#9fa3cc"
          strokeWidth="1.5"
          fill="none"
          opacity="0.6"
        />

        {/* ── SHIRT / BLOUSE ── */}
        <path
          d="M100 172 L110 177 L120 172 L118 160 L110 166 L102 160Z"
          fill="url(#shirtF)"
        />
        {/* blouse V detail */}
        <path
          d="M104 166 L110 175 L116 166"
          stroke="#dde4ec"
          strokeWidth="1"
          fill="none"
        />

        {/* ── NECKLACE ── */}
        <path
          d="M95 162 Q110 170 125 162"
          stroke="#fbbf24"
          strokeWidth="1.5"
          fill="none"
        />
        <circle cx="110" cy="168" r="3" fill="#fbbf24" />
        <circle cx="110" cy="168" r="1.5" fill="#fef08a" />

        {/* ── BLAZER BUTTONS ── */}
        <circle cx="110" cy="238" r="4.5" fill="#4a4e7a" />
        <circle cx="110" cy="258" r="4.5" fill="#4a4e7a" />
        <circle cx="110" cy="238" r="2" fill="#8b8fb8" opacity="0.7" />

        {/* ── LEFT ARM ── */}
        <path
          d="M58 198 Q40 222 36 266 Q33 282 37 295 L60 295 Q62 276 68 252 Q72 225 84 208Z"
          fill="url(#blazerF)"
        />
        <rect
          x="28"
          y="282"
          width="34"
          height="16"
          rx="6"
          fill="url(#shirtF)"
        />
        <rect x="28" y="282" width="34" height="8" rx="4" fill="white" />
        {/* left hand */}
        <ellipse cx="45" cy="307" rx="13" ry="16" fill="url(#skinF)" />
        <path
          d="M33 300 Q29 293 34 290 Q39 287 42 294"
          fill="url(#skinDarkF)"
        />
        <path
          d="M31 306 Q27 299 32 296 Q37 293 40 300"
          fill="url(#skinDarkF)"
        />
        {/* bracelet */}
        <rect
          x="35"
          y="296"
          width="20"
          height="5"
          rx="2.5"
          fill="#a855f7"
          opacity="0.85"
        />

        {/* ── RIGHT ARM ── */}
        <path
          d="M162 198 Q180 222 184 266 Q187 282 183 295 L160 295 Q158 276 152 252 Q148 225 136 208Z"
          fill="url(#blazerF)"
        />
        <rect
          x="158"
          y="282"
          width="34"
          height="16"
          rx="6"
          fill="url(#shirtF)"
        />
        <rect x="158" y="282" width="34" height="8" rx="4" fill="white" />
        {/* right hand */}
        <ellipse cx="175" cy="307" rx="13" ry="16" fill="url(#skinF)" />
        <path
          d="M187 300 Q191 293 186 290 Q181 287 178 294"
          fill="url(#skinDarkF)"
        />
        <path
          d="M189 306 Q193 299 188 296 Q183 293 180 300"
          fill="url(#skinDarkF)"
        />

        {/* ── NECK ── */}
        <path
          d="M100 157 Q100 178 110 180 Q120 178 120 157 L116 150 L104 150Z"
          fill="url(#skinF)"
        />

        {/* ── HEAD ── */}
        <ellipse
          cx="110"
          cy="108"
          rx="44"
          ry="48"
          fill="url(#skinF)"
          filter="url(#softShadowF)"
        />
        <path
          d="M74 115 Q72 136 82 148 Q96 160 110 161 Q124 160 138 148 Q148 136 146 115"
          fill="url(#skinF)"
        />
        {/* ears */}
        <ellipse cx="66" cy="112" rx="8" ry="10" fill="url(#skinF)" />
        <ellipse
          cx="66"
          cy="112"
          rx="4.5"
          ry="6.5"
          fill="url(#skinDarkF)"
          opacity="0.4"
        />
        <ellipse cx="154" cy="112" rx="8" ry="10" fill="url(#skinF)" />
        <ellipse
          cx="154"
          cy="112"
          rx="4.5"
          ry="6.5"
          fill="url(#skinDarkF)"
          opacity="0.4"
        />
        {/* earrings */}
        <circle cx="66" cy="120" r="5.5" fill="#a855f7" />
        <circle cx="66" cy="120" r="3" fill="#d8b4fe" />
        <circle cx="154" cy="120" r="5.5" fill="#a855f7" />
        <circle cx="154" cy="120" r="3" fill="#d8b4fe" />

        {/* ── HAIR — professional bob cut ── */}
        {/* back */}
        <path
          d="M68 100 Q66 62 110 56 Q154 62 152 100 Q144 72 110 70 Q76 72 68 100Z"
          fill="url(#hairF)"
        />
        {/* sides */}
        <path
          d="M68 100 Q64 122 66 148 Q70 158 78 160"
          stroke="url(#hairF)"
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M152 100 Q156 122 154 148 Q150 158 142 160"
          stroke="url(#hairF)"
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
        />
        {/* top volume */}
        <path
          d="M74 100 Q78 72 110 70 Q142 72 146 100 Q138 80 110 78 Q82 80 74 100Z"
          fill="url(#hairHighF)"
          opacity="0.6"
        />
        {/* hair highlight */}
        <path
          d="M90 72 Q96 92 92 112"
          stroke="#8b5a30"
          strokeWidth="3"
          fill="none"
          opacity="0.4"
        />
        <path
          d="M100 70 Q106 90 103 112"
          stroke="#8b5a30"
          strokeWidth="2"
          fill="none"
          opacity="0.3"
        />
        {/* part */}
        <path
          d="M110 70 Q112 82 110 96"
          stroke="#5c3010"
          strokeWidth="2"
          fill="none"
        />

        {/* ── EYEBROWS — arched feminine ── */}
        <path
          d="M78 90 Q88 85 98 88"
          stroke="#3d1e08"
          strokeWidth="2.8"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M122 88 Q132 85 142 90"
          stroke="#3d1e08"
          strokeWidth="2.8"
          fill="none"
          strokeLinecap="round"
        />

        {/* ── EYES — large, defined ── */}
        <ellipse cx="88" cy="103" rx="13" ry="11" fill="white" />
        <ellipse cx="132" cy="103" rx="13" ry="11" fill="white" />
        {/* iris */}
        <circle cx="88" cy="104" r="9" fill="#5c3010" />
        <circle cx="132" cy="104" r="9" fill="#5c3010" />
        <circle cx="88" cy="104" r="6.5" fill="#2d1406" />
        <circle cx="132" cy="104" r="6.5" fill="#2d1406" />
        {/* iris ring */}
        <circle
          cx="88"
          cy="104"
          r="9"
          fill="none"
          stroke="#7c4a20"
          strokeWidth="1.5"
          opacity="0.4"
        />
        <circle
          cx="132"
          cy="104"
          r="9"
          fill="none"
          stroke="#7c4a20"
          strokeWidth="1.5"
          opacity="0.4"
        />
        {/* shine */}
        <circle cx="91" cy="100" r="4" fill="white" opacity="0.92" />
        <circle cx="135" cy="100" r="4" fill="white" opacity="0.92" />
        <circle cx="93" cy="102" r="1.8" fill="white" opacity="0.5" />
        <circle cx="137" cy="102" r="1.8" fill="white" opacity="0.5" />
        {/* upper lashes */}
        <path
          d="M75 99 Q88 93 101 99"
          stroke="#1a0a00"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M119 99 Q132 93 145 99"
          stroke="#1a0a00"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        {/* individual lash lines */}
        {[78, 82, 86, 90, 94, 98].map((x, i) => (
          <line
            key={i}
            x1={x}
            y1={99}
            x2={x - 1 + (i % 2)}
            y2={94}
            stroke="#1a0a00"
            strokeWidth="1.2"
          />
        ))}
        {[122, 126, 130, 134, 138, 142].map((x, i) => (
          <line
            key={i + 10}
            x1={x}
            y1={99}
            x2={x - 1 + (i % 2)}
            y2={94}
            stroke="#1a0a00"
            strokeWidth="1.2"
          />
        ))}
        {/* eyeliner flick */}
        <path
          d="M75 99 Q72 97 70 94"
          stroke="#1a0a00"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M145 99 Q148 97 150 94"
          stroke="#1a0a00"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        {/* lower lash line */}
        <path
          d="M76 110 Q88 114 100 110"
          stroke="#E8A87C"
          strokeWidth="1"
          fill="none"
          opacity="0.5"
        />
        <path
          d="M120 110 Q132 114 144 110"
          stroke="#E8A87C"
          strokeWidth="1"
          fill="none"
          opacity="0.5"
        />

        {/* ── NOSE ── */}
        <path
          d="M110 110 Q106 120 104 124 Q110 127 116 124 Q114 120 110 110Z"
          fill="#E8A87C"
          opacity="0.6"
        />
        <ellipse
          cx="105"
          cy="124"
          rx="4"
          ry="3"
          fill="#D4956A"
          opacity="0.35"
        />
        <ellipse
          cx="115"
          cy="124"
          rx="4"
          ry="3"
          fill="#D4956A"
          opacity="0.35"
        />

        {/* ── LIPS — full, feminine ── */}
        {/* upper lip */}
        <path
          d="M96 135 Q101 130 110 131 Q119 130 124 135 Q118 133 110 133 Q102 133 96 135Z"
          fill="#dc2626"
          opacity="0.75"
        />
        {/* lower lip */}
        <path
          d="M96 135 Q110 144 124 135 Q118 142 110 143 Q102 142 96 135Z"
          fill="#b91c1c"
          opacity="0.75"
        />
        {/* lip gloss */}
        <ellipse
          cx="107"
          cy="135"
          rx="5"
          ry="2.5"
          fill="white"
          opacity="0.22"
        />
        <ellipse cx="113" cy="138" rx="4" ry="2" fill="white" opacity="0.14" />
        {/* smile line */}
        <path
          d="M96 135 Q94 133 93 130"
          stroke="#D4956A"
          strokeWidth="1"
          fill="none"
          opacity="0.5"
        />
        <path
          d="M124 135 Q126 133 127 130"
          stroke="#D4956A"
          strokeWidth="1"
          fill="none"
          opacity="0.5"
        />

        {/* ── CHEEKS ── */}
        <ellipse cx="76" cy="122" rx="14" ry="9" fill="#fda4af" opacity="0.2" />
        <ellipse
          cx="144"
          cy="122"
          rx="14"
          ry="9"
          fill="#fda4af"
          opacity="0.2"
        />

        {/* ── PHILTRUM ── */}
        <path
          d="M107 128 Q110 131 113 128"
          stroke="#D4956A"
          strokeWidth="1"
          fill="none"
        />
      </svg>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   SIGNUP MALE — pointing / welcoming pose
   Used in: Signup page (left character)
──────────────────────────────────────────────────────────── */
export function SignupMale() {
  injectStyles();
  return (
    <div
      className="av-float"
      style={{ position: "relative", width: 180, margin: "0 auto" }}
    >
      <Bubble
        text="Welcome to Finance.ai! 🚀 Let's get started."
        side="right"
        color1="#3b82f6"
        color2="#6366f1"
        delay={0.7}
      />
      <svg
        viewBox="0 0 220 420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: "100%",
          filter: "drop-shadow(0 20px 40px rgba(59,130,246,0.35))",
        }}
      >
        <defs>
          <radialGradient id="skinMS" cx="50%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#FDDBB4" />
            <stop offset="70%" stopColor="#F5C49A" />
            <stop offset="100%" stopColor="#E8A87C" />
          </radialGradient>
          <radialGradient id="skinDMS" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#F5C49A" />
            <stop offset="100%" stopColor="#D4956A" />
          </radialGradient>
          <linearGradient id="suitMS" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f4c75" />
            <stop offset="50%" stopColor="#1b6ca8" />
            <stop offset="100%" stopColor="#1e90cc" />
          </linearGradient>
          <linearGradient id="suitDMS" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0c3d61" />
            <stop offset="100%" stopColor="#082d48" />
          </linearGradient>
          <linearGradient id="hairMS" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a0a00" />
            <stop offset="100%" stopColor="#0d0500" />
          </linearGradient>
          <linearGradient id="tieMS" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#4338ca" />
          </linearGradient>
        </defs>

        <ellipse cx="110" cy="415" rx="62" ry="6" fill="rgba(0,0,0,0.2)" />

        {/* legs */}
        <rect
          x="72"
          y="290"
          width="32"
          height="118"
          rx="12"
          fill="url(#suitDMS)"
        />
        <rect
          x="116"
          y="290"
          width="32"
          height="118"
          rx="12"
          fill="url(#suitDMS)"
        />
        <line
          x1="88"
          y1="295"
          x2="88"
          y2="400"
          stroke="#082d48"
          strokeWidth="1.5"
          opacity="0.6"
        />
        <line
          x1="132"
          y1="295"
          x2="132"
          y2="400"
          stroke="#082d48"
          strokeWidth="1.5"
          opacity="0.6"
        />

        {/* shoes */}
        <path
          d="M68 398 Q70 408 82 410 Q96 412 100 408 L104 398Z"
          fill="#0f172a"
        />
        <path
          d="M68 398 Q70 404 84 406 Q96 407 100 404 L104 398Z"
          fill="#1e293b"
        />
        <path
          d="M112 398 Q114 408 126 410 Q140 412 144 408 L148 398Z"
          fill="#0f172a"
        />
        <path
          d="M112 398 Q114 404 128 406 Q140 407 144 404 L148 398Z"
          fill="#1e293b"
        />

        {/* suit body */}
        <path
          d="M55 195 Q48 240 46 290 L174 290 Q172 240 165 195 Q155 168 140 162 L110 178 L80 162 Q65 168 55 195Z"
          fill="url(#suitMS)"
        />
        <path
          d="M55 195 Q50 240 48 290 L72 290 Q70 240 76 195 Q80 175 90 168 L80 162 Q65 168 55 195Z"
          fill="url(#suitDMS)"
          opacity="0.45"
        />
        <path
          d="M165 195 Q170 240 172 290 L148 290 Q150 240 144 195 Q140 175 130 168 L140 162 Q155 168 165 195Z"
          fill="url(#suitDMS)"
          opacity="0.45"
        />

        {/* lapels */}
        <path d="M110 178 L93 205 L110 222 L127 205 Z" fill="white" />
        <path d="M110 178 L80 162 L70 196 L93 205 Z" fill="#1b6ca8" />
        <path d="M110 178 L140 162 L150 196 L127 205 Z" fill="#1b6ca8" />
        <path
          d="M100 172 L110 176 L120 172 L116 160 L110 165 L104 160Z"
          fill="white"
        />

        {/* tie */}
        <path
          d="M107 176 L104 202 L110 228 L116 202 L113 176Z"
          fill="url(#tieMS)"
        />
        <path d="M104 188 L116 188 L114 200 L106 200Z" fill="#4338ca" />
        <path d="M107 176 L110 183 L113 176 L110 172Z" fill="#818cf8" />

        {/* buttons */}
        <circle cx="110" cy="238" r="4" fill="#0c3d61" />
        <circle cx="110" cy="238" r="2" fill="#1b6ca8" opacity="0.6" />
        <circle cx="110" cy="257" r="4" fill="#0c3d61" />

        {/* LEFT ARM — pointing forward/out */}
        <path
          d="M55 195 Q38 218 34 262 Q32 278 36 290 L58 290 Q60 272 66 248 Q70 220 80 205Z"
          fill="url(#suitMS)"
        />
        <rect x="28" y="278" width="32" height="16" rx="6" fill="white" />
        <ellipse cx="44" cy="304" rx="14" ry="17" fill="url(#skinMS)" />
        <path d="M32 297 Q28 290 33 287 Q38 284 41 291" fill="url(#skinDMS)" />
        <path d="M30 303 Q26 296 31 293 Q36 290 39 297" fill="url(#skinDMS)" />

        {/* RIGHT ARM — raised, pointing up */}
        <path
          d="M165 195 Q188 175 196 148 Q200 132 194 122 L178 128 Q182 138 180 152 Q176 168 162 182Z"
          fill="url(#suitMS)"
        />
        <rect x="176" y="112" width="24" height="18" rx="6" fill="white" />
        {/* pointing hand */}
        <ellipse cx="188" cy="105" rx="12" ry="15" fill="url(#skinMS)" />
        {/* index finger pointing */}
        <rect x="184" y="84" width="8" height="24" rx="4" fill="url(#skinMS)" />
        <path d="M184 92 Q188 88 192 92" fill="url(#skinDMS)" opacity="0.5" />
        {/* other fingers curled */}
        <path
          d="M179 102 Q176 96 180 94 Q184 92 185 98"
          fill="url(#skinDMS)"
          opacity="0.5"
        />
        <path
          d="M196 100 Q200 94 196 93 Q192 92 191 98"
          fill="url(#skinDMS)"
          opacity="0.5"
        />

        {/* neck */}
        <path
          d="M98 155 Q98 176 110 178 Q122 176 122 155 L116 148 L104 148Z"
          fill="url(#skinMS)"
        />

        {/* head */}
        <ellipse
          cx="110"
          cy="112"
          rx="46"
          ry="50"
          fill="url(#skinMS)"
          filter="url(#softShadow)"
        />
        <path
          d="M72 118 Q70 138 80 150 Q94 162 110 163 Q126 162 140 150 Q150 138 148 118"
          fill="url(#skinMS)"
        />
        <ellipse cx="64" cy="116" rx="8" ry="11" fill="url(#skinMS)" />
        <ellipse
          cx="64"
          cy="116"
          rx="4.5"
          ry="7"
          fill="url(#skinDMS)"
          opacity="0.5"
        />
        <ellipse cx="156" cy="116" rx="8" ry="11" fill="url(#skinMS)" />
        <ellipse
          cx="156"
          cy="116"
          rx="4.5"
          ry="7"
          fill="url(#skinDMS)"
          opacity="0.5"
        />

        {/* hair */}
        <path
          d="M66 98 Q68 56 110 52 Q152 56 154 98 Q146 70 110 68 Q74 70 66 98Z"
          fill="url(#hairMS)"
        />
        <path
          d="M66 98 Q63 112 65 124"
          stroke="url(#hairMS)"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M154 98 Q157 112 155 124"
          stroke="url(#hairMS)"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M84 68 Q86 76 88 84"
          stroke="#2d1810"
          strokeWidth="2"
          fill="none"
        />

        {/* face — happy/excited expression */}
        <path
          d="M80 93 Q90 88 100 91"
          stroke="#2d1810"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M120 91 Q130 88 140 93"
          stroke="#2d1810"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />

        {/* eyes — wider, more excited */}
        <ellipse cx="90" cy="106" rx="13" ry="11" fill="white" />
        <ellipse cx="130" cy="106" rx="13" ry="11" fill="white" />
        <circle cx="90" cy="107" r="8.5" fill="#3b2010" />
        <circle cx="130" cy="107" r="8.5" fill="#3b2010" />
        <circle cx="90" cy="107" r="6" fill="#1a0e08" />
        <circle cx="130" cy="107" r="6" fill="#1a0e08" />
        <circle cx="93" cy="103" r="4" fill="white" opacity="0.92" />
        <circle cx="133" cy="103" r="4" fill="white" opacity="0.92" />
        <circle cx="95" cy="105" r="1.8" fill="white" opacity="0.5" />
        <circle cx="135" cy="105" r="1.8" fill="white" opacity="0.5" />
        <path
          d="M77 102 Q90 96 103 102"
          stroke="#2d1810"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M117 102 Q130 96 143 102"
          stroke="#2d1810"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />

        {/* nose */}
        <path
          d="M110 115 Q106 126 104 130 Q110 133 116 130 Q114 126 110 115Z"
          fill="#E8A87C"
          opacity="0.65"
        />
        <ellipse cx="105" cy="130" rx="5" ry="4" fill="#D4956A" opacity="0.4" />
        <ellipse cx="115" cy="130" rx="5" ry="4" fill="#D4956A" opacity="0.4" />

        {/* big smile */}
        <path
          d="M92 142 Q110 158 128 142"
          stroke="#C07850"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M93 143 Q110 156 127 143 Q110 150 93 143Z"
          fill="white"
          opacity="0.9"
        />
        <path d="M93 147 Q110 155 127 147" fill="#D4956A" opacity="0.2" />
        <ellipse
          cx="76"
          cy="128"
          rx="13"
          ry="9"
          fill="#f87171"
          opacity="0.12"
        />
        <ellipse
          cx="144"
          cy="128"
          rx="13"
          ry="9"
          fill="#f87171"
          opacity="0.12"
        />
      </svg>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   SIGNUP FEMALE — welcoming, arms slightly open
   Used in: Signup page (right character)
──────────────────────────────────────────────────────────── */
export function SignupFemale() {
  injectStyles();
  return (
    <div
      className="av-float-delay"
      style={{ position: "relative", width: 180, margin: "0 auto" }}
    >
      <Bubble
        text="Your financial journey starts here ✨"
        side="left"
        color1="#a855f7"
        color2="#ec4899"
        delay={1.0}
      />
      <svg
        viewBox="0 0 220 420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: "100%",
          filter: "drop-shadow(0 20px 40px rgba(168,85,247,0.35))",
        }}
      >
        <defs>
          <radialGradient id="skinFS" cx="50%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#FDDBB4" />
            <stop offset="70%" stopColor="#F5C49A" />
            <stop offset="100%" stopColor="#E8A87C" />
          </radialGradient>
          <radialGradient id="skinDFS" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#F5C49A" />
            <stop offset="100%" stopColor="#D4956A" />
          </radialGradient>
          <linearGradient id="blazerFS" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7e22ce" />
            <stop offset="50%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <linearGradient id="blazerDFS" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6b21a8" />
            <stop offset="100%" stopColor="#4a1772" />
          </linearGradient>
          <linearGradient id="hairFS" x1="0%" y1="0%" x2="40%" y2="100%">
            <stop offset="0%" stopColor="#1a0a00" />
            <stop offset="60%" stopColor="#0d0500" />
            <stop offset="100%" stopColor="#080200" />
          </linearGradient>
        </defs>

        <ellipse cx="110" cy="415" rx="62" ry="6" fill="rgba(0,0,0,0.2)" />

        {/* legs */}
        <rect x="74" y="295" width="28" height="112" rx="10" fill="#4a1772" />
        <rect x="118" y="295" width="28" height="112" rx="10" fill="#4a1772" />

        {/* heels */}
        <path
          d="M68 402 Q70 412 80 413 Q92 414 96 410 L100 402Z"
          fill="#7e22ce"
        />
        <path
          d="M68 402 Q70 408 82 409 Q92 410 96 406 L100 402Z"
          fill="#9333ea"
        />
        <rect x="86" y="402" width="5" height="14" rx="2" fill="#6b21a8" />
        <path
          d="M120 402 Q122 412 132 413 Q144 414 148 410 L152 402Z"
          fill="#7e22ce"
        />
        <path
          d="M120 402 Q122 408 134 409 Q144 410 148 406 L152 402Z"
          fill="#9333ea"
        />
        <rect x="138" y="402" width="5" height="14" rx="2" fill="#6b21a8" />

        {/* blazer */}
        <path
          d="M58 198 Q50 242 48 295 L172 295 Q170 242 162 198 Q152 170 136 163 L110 180 L84 163 Q68 170 58 198Z"
          fill="url(#blazerFS)"
        />
        <path
          d="M58 198 Q52 242 50 295 L74 295 Q72 242 78 198 Q82 176 92 168 L84 163 Q68 170 58 198Z"
          fill="url(#blazerDFS)"
          opacity="0.4"
        />
        <path
          d="M162 198 Q168 242 170 295 L146 295 Q148 242 142 198 Q138 176 128 168 L136 163 Q152 170 162 198Z"
          fill="url(#blazerDFS)"
          opacity="0.4"
        />

        {/* lapels */}
        <path d="M110 180 L94 205 L110 223 L126 205 Z" fill="white" />
        <path d="M110 180 L84 163 L73 198 L94 205 Z" fill="#9333ea" />
        <path d="M110 180 L136 163 L147 198 L126 205 Z" fill="#9333ea" />
        <path
          d="M100 172 L110 177 L120 172 L118 160 L110 166 L102 160Z"
          fill="white"
        />
        <path
          d="M104 166 L110 175 L116 166"
          stroke="#e9d5ff"
          strokeWidth="1"
          fill="none"
        />

        {/* necklace */}
        <path
          d="M95 162 Q110 170 125 162"
          stroke="#fbbf24"
          strokeWidth="1.5"
          fill="none"
        />
        <circle cx="110" cy="168" r="3" fill="#fbbf24" />
        <circle cx="110" cy="168" r="1.5" fill="#fef08a" />

        {/* buttons */}
        <circle cx="110" cy="238" r="4.5" fill="#6b21a8" />
        <circle cx="110" cy="238" r="2" fill="#a855f7" opacity="0.7" />
        <circle cx="110" cy="258" r="4.5" fill="#6b21a8" />

        {/* LEFT ARM — wide open/welcoming */}
        <path
          d="M58 198 Q28 215 18 248 Q12 268 18 285 L38 282 Q38 268 46 250 Q56 228 76 208Z"
          fill="url(#blazerFS)"
        />
        <rect x="10" y="272" width="32" height="16" rx="6" fill="white" />
        <ellipse cx="26" cy="296" rx="13" ry="16" fill="url(#skinFS)" />
        <path d="M14 290 Q10 283 15 280 Q20 277 23 284" fill="url(#skinDFS)" />
        <rect
          x="17"
          y="278"
          width="16"
          height="5"
          rx="2.5"
          fill="#a855f7"
          opacity="0.85"
        />

        {/* RIGHT ARM — wide open/welcoming */}
        <path
          d="M162 198 Q192 215 202 248 Q208 268 202 285 L182 282 Q182 268 174 250 Q164 228 144 208Z"
          fill="url(#blazerFS)"
        />
        <rect x="178" y="272" width="32" height="16" rx="6" fill="white" />
        <ellipse cx="194" cy="296" rx="13" ry="16" fill="url(#skinFS)" />
        <path
          d="M206 290 Q210 283 205 280 Q200 277 197 284"
          fill="url(#skinDFS)"
        />

        {/* neck */}
        <path
          d="M100 157 Q100 178 110 180 Q120 178 120 157 L116 150 L104 150Z"
          fill="url(#skinFS)"
        />

        {/* head */}
        <ellipse cx="110" cy="108" rx="44" ry="48" fill="url(#skinFS)" />
        <path
          d="M74 115 Q72 136 82 148 Q96 160 110 161 Q124 160 138 148 Q148 136 146 115"
          fill="url(#skinFS)"
        />
        <ellipse cx="66" cy="112" rx="8" ry="10" fill="url(#skinFS)" />
        <ellipse
          cx="66"
          cy="112"
          rx="4.5"
          ry="6.5"
          fill="url(#skinDFS)"
          opacity="0.4"
        />
        <ellipse cx="154" cy="112" rx="8" ry="10" fill="url(#skinFS)" />
        <ellipse
          cx="154"
          cy="112"
          rx="4.5"
          ry="6.5"
          fill="url(#skinDFS)"
          opacity="0.4"
        />
        {/* earrings */}
        <circle cx="66" cy="120" r="5.5" fill="#ec4899" />
        <circle cx="66" cy="120" r="3" fill="#fbcfe8" />
        <circle cx="154" cy="120" r="5.5" fill="#ec4899" />
        <circle cx="154" cy="120" r="3" fill="#fbcfe8" />

        {/* hair — sleek updo / bun */}
        <path
          d="M68 100 Q66 62 110 56 Q154 62 152 100 Q144 72 110 70 Q76 72 68 100Z"
          fill="url(#hairFS)"
        />
        <path
          d="M68 100 Q64 120 66 146 Q68 156 74 158"
          stroke="url(#hairFS)"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M152 100 Q156 120 154 146 Q152 156 146 158"
          stroke="url(#hairFS)"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
        />
        {/* bun */}
        <circle cx="110" cy="62" r="18" fill="url(#hairFS)" />
        <circle cx="110" cy="62" r="14" fill="#1a0a00" />
        <path
          d="M98 58 Q110 52 122 58 Q118 62 110 63 Q102 62 98 58Z"
          fill="#2d1810"
          opacity="0.5"
        />
        {/* bun pin */}
        <line
          x1="104"
          y1="55"
          x2="116"
          y2="70"
          stroke="#a855f7"
          strokeWidth="2"
        />
        <circle cx="104" cy="55" r="2.5" fill="#d8b4fe" />
        {/* part */}
        <path
          d="M110 70 Q112 82 110 96"
          stroke="#2a1406"
          strokeWidth="2"
          fill="none"
        />

        {/* eyebrows */}
        <path
          d="M78 90 Q88 85 98 88"
          stroke="#1a0a00"
          strokeWidth="2.8"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M122 88 Q132 85 142 90"
          stroke="#1a0a00"
          strokeWidth="2.8"
          fill="none"
          strokeLinecap="round"
        />

        {/* eyes — warm excited */}
        <ellipse cx="88" cy="103" rx="13" ry="11" fill="white" />
        <ellipse cx="132" cy="103" rx="13" ry="11" fill="white" />
        <circle cx="88" cy="104" r="9" fill="#5c3010" />
        <circle cx="132" cy="104" r="9" fill="#5c3010" />
        <circle cx="88" cy="104" r="6.5" fill="#2d1406" />
        <circle cx="132" cy="104" r="6.5" fill="#2d1406" />
        <circle cx="91" cy="100" r="4" fill="white" opacity="0.92" />
        <circle cx="135" cy="100" r="4" fill="white" opacity="0.92" />
        <circle cx="93" cy="102" r="1.8" fill="white" opacity="0.5" />
        <circle cx="137" cy="102" r="1.8" fill="white" opacity="0.5" />
        <path
          d="M75 99 Q88 93 101 99"
          stroke="#1a0a00"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M119 99 Q132 93 145 99"
          stroke="#1a0a00"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        {[78, 82, 86, 90, 94, 98].map((x, i) => (
          <line
            key={i}
            x1={x}
            y1={99}
            x2={x - 1 + (i % 2)}
            y2={94}
            stroke="#1a0a00"
            strokeWidth="1.2"
          />
        ))}
        {[122, 126, 130, 134, 138, 142].map((x, i) => (
          <line
            key={i + 10}
            x1={x}
            y1={99}
            x2={x - 1 + (i % 2)}
            y2={94}
            stroke="#1a0a00"
            strokeWidth="1.2"
          />
        ))}
        <path
          d="M75 99 Q72 97 70 94"
          stroke="#1a0a00"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M145 99 Q148 97 150 94"
          stroke="#1a0a00"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* nose */}
        <path
          d="M110 110 Q106 120 104 124 Q110 127 116 124 Q114 120 110 110Z"
          fill="#E8A87C"
          opacity="0.6"
        />
        <ellipse
          cx="105"
          cy="124"
          rx="4"
          ry="3"
          fill="#D4956A"
          opacity="0.35"
        />
        <ellipse
          cx="115"
          cy="124"
          rx="4"
          ry="3"
          fill="#D4956A"
          opacity="0.35"
        />

        {/* lips — big warm smile */}
        <path
          d="M94 135 Q102 130 110 131 Q118 130 126 135 Q120 133 110 133 Q100 133 94 135Z"
          fill="#dc2626"
          opacity="0.8"
        />
        <path
          d="M94 135 Q110 146 126 135 Q120 143 110 144 Q100 143 94 135Z"
          fill="#b91c1c"
          opacity="0.8"
        />
        <ellipse
          cx="107"
          cy="135"
          rx="5"
          ry="2.5"
          fill="white"
          opacity="0.25"
        />
        <path
          d="M94 135 Q92 133 90 130"
          stroke="#D4956A"
          strokeWidth="1"
          fill="none"
          opacity="0.5"
        />
        <path
          d="M126 135 Q128 133 130 130"
          stroke="#D4956A"
          strokeWidth="1"
          fill="none"
          opacity="0.5"
        />

        {/* cheeks */}
        <ellipse
          cx="75"
          cy="122"
          rx="14"
          ry="9"
          fill="#fda4af"
          opacity="0.25"
        />
        <ellipse
          cx="145"
          cy="122"
          rx="14"
          ry="9"
          fill="#fda4af"
          opacity="0.25"
        />
      </svg>
    </div>
  );
}
