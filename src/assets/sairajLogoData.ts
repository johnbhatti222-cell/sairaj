/**
 * High-fidelity vector SVG and data-URI representation of the official
 * Sairaj Glass Centre Medha logo.
 */

export const SAIRAJ_LOGO_SVG_RAW = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <!-- Gold Gradients -->
    <linearGradient id="goldRim" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#C59B27"/>
      <stop offset="25%" stop-color="#FDE894"/>
      <stop offset="50%" stop-color="#AA771C"/>
      <stop offset="75%" stop-color="#FFEDB3"/>
      <stop offset="100%" stop-color="#8B5E14"/>
    </linearGradient>
    <linearGradient id="goldText" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFF3C4"/>
      <stop offset="40%" stop-color="#DFB143"/>
      <stop offset="70%" stop-color="#B8861B"/>
      <stop offset="100%" stop-color="#8E5E0C"/>
    </linearGradient>
    <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="35%" stop-color="#CBD5E1"/>
      <stop offset="70%" stop-color="#64748B"/>
      <stop offset="100%" stop-color="#94A3B8"/>
    </linearGradient>
    <radialGradient id="darkBg" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stop-color="#1E232A"/>
      <stop offset="70%" stop-color="#0F1115"/>
      <stop offset="100%" stop-color="#050608"/>
    </radialGradient>
    <linearGradient id="glassSky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#93C5FD"/>
      <stop offset="50%" stop-color="#60A5FA"/>
      <stop offset="100%" stop-color="#1E3A8A"/>
    </linearGradient>
    <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.8"/>
    </filter>
  </defs>

  <!-- Outer Black Shield Circle with Gold Rim -->
  <circle cx="300" cy="300" r="290" fill="url(#goldRim)" stroke="#5C3E08" stroke-width="4"/>
  <circle cx="300" cy="300" r="274" fill="#0B0D11"/>
  <circle cx="300" cy="300" r="268" fill="url(#darkBg)" stroke="url(#goldRim)" stroke-width="2"/>

  <!-- Upper Graphic Area: Window & Door with SG Monogram -->
  <!-- Left Window (3-Track Sliding Window) -->
  <g transform="translate(85, 105)" filter="url(#goldGlow)">
    <!-- Outer window casing -->
    <rect x="0" y="0" width="115" height="140" rx="4" fill="#1E293B" stroke="#475569" stroke-width="6"/>
    <!-- Window Glass with Reflection -->
    <rect x="8" y="8" width="99" height="124" fill="url(#glassSky)" opacity="0.85"/>
    <!-- Window track panes -->
    <rect x="8" y="8" width="48" height="124" fill="#0F172A" opacity="0.3" stroke="#CBD5E1" stroke-width="3"/>
    <rect x="58" y="8" width="49" height="124" fill="#0F172A" opacity="0.15" stroke="#CBD5E1" stroke-width="3"/>
    <!-- Highlight reflections -->
    <polygon points="12,12 85,12 35,125 12,125" fill="#FFFFFF" opacity="0.25"/>
    <rect x="52" y="60" width="4" height="20" rx="2" fill="#FFFFFF" opacity="0.8"/>
    <rect x="100" y="60" width="4" height="20" rx="2" fill="#FFFFFF" opacity="0.8"/>
  </g>

  <!-- Right Open Aluminium Door -->
  <g transform="translate(385, 95)" filter="url(#goldGlow)">
    <!-- Outer Frame -->
    <rect x="0" y="0" width="105" height="160" fill="none" stroke="#64748B" stroke-width="5"/>
    <!-- Door Panel (Perspective slightly open) -->
    <polygon points="8,10 75,25 75,150 8,155" fill="#1E293B" stroke="#94A3B8" stroke-width="4"/>
    <!-- Inset Door Profile & Glass panel -->
    <polygon points="16,22 65,32 65,85 16,80" fill="url(#glassSky)" opacity="0.6"/>
    <polygon points="16,92 65,97 65,142 16,145" fill="#0F172A"/>
    <!-- Door Handle & Lock -->
    <rect x="58" y="86" width="12" height="4" rx="2" fill="#CBD5E1"/>
    <circle cx="62" cy="95" r="2.5" fill="#CBD5E1"/>
  </g>

  <!-- Central 3D 'SG' Monogram -->
  <!-- Letter 'S' in Gold 3D -->
  <g filter="url(#goldGlow)">
    <path d="M 285 105 C 250 95, 205 110, 205 145 C 205 180, 260 190, 265 215 C 270 235, 245 250, 220 245 C 195 240, 190 220, 190 220 L 170 228 C 170 228, 180 260, 220 265 C 265 270, 295 245, 290 205 C 285 170, 230 160, 230 135 C 230 120, 248 115, 268 120 C 290 125, 295 140, 295 140 L 315 130 C 315 130, 305 110, 285 105 Z" 
          fill="url(#goldRim)" stroke="#784E0B" stroke-width="3"/>
  </g>

  <!-- Letter 'G' in Silver / Chrome 3D -->
  <g filter="url(#goldGlow)">
    <path d="M 380 145 C 375 115, 340 100, 305 110 L 305 130 C 330 122, 355 132, 358 155 C 362 188, 330 205, 305 198 L 305 170 L 335 170 L 335 152 L 285 152 L 285 220 C 325 225, 385 205, 380 145 Z" 
          fill="url(#silverGrad)" stroke="#334155" stroke-width="3"/>
  </g>

  <!-- Star Sparkle on Glass -->
  <polygon points="350,90 353,100 363,103 353,106 350,116 347,106 337,103 347,100" fill="#FFFFFF"/>

  <!-- Curved Gold Arch / Horizon Separator -->
  <path d="M 60 278 Q 300 248 540 278" fill="none" stroke="url(#goldRim)" stroke-width="4"/>
  <path d="M 75 284 Q 300 256 525 284" fill="none" stroke="#FDE894" stroke-width="1.5" opacity="0.8"/>

  <!-- Main Brand Title: SAIRAJ -->
  <text x="300" y="348" text-anchor="middle" font-family="'Plus Jakarta Sans', 'Times New Roman', serif" font-size="64" font-weight="900" letter-spacing="12" fill="url(#goldText)" filter="url(#goldGlow)">
    SAIRAJ
  </text>

  <!-- Subtitle: GLASS CENTRE -->
  <text x="300" y="388" text-anchor="middle" font-family="'Plus Jakarta Sans', 'Segoe UI', sans-serif" font-size="28" font-weight="800" letter-spacing="6" fill="#F8FAFC">
    GLASS CENTRE
  </text>

  <!-- Location: — MEDHA — -->
  <g transform="translate(300, 420)">
    <line x1="-190" y1="-7" x2="-80" y2="-7" stroke="url(#goldRim)" stroke-width="2.5"/>
    <text x="0" y="0" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="24" font-weight="800" letter-spacing="8" fill="url(#goldText)">
      MEDHA
    </text>
    <line x1="80" y1="-7" x2="190" y2="-7" stroke="url(#goldRim)" stroke-width="2.5"/>
  </g>

  <!-- Service Subtitle: GLASS & ALUMINIUM WORK -->
  <g transform="translate(300, 444)">
    <polygon points="-160,-4 -156,0 -160,4 -164,0" fill="#EAB308"/>
    <line x1="-150" y1="0" x2="-115" y2="0" stroke="#CA8A04" stroke-width="1.5"/>
    <text x="0" y="4" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="700" letter-spacing="3" fill="#E2E8F0">
      GLASS &amp; ALUMINIUM WORK
    </text>
    <line x1="115" y1="0" x2="150" y2="0" stroke="#CA8A04" stroke-width="1.5"/>
    <polygon points="160,-4 164,0 160,4 156,0" fill="#EAB308"/>
  </g>

  <!-- 4 Feature Icons in Boxes -->
  <!-- 1. Sliding Windows -->
  <g transform="translate(130, 465)">
    <rect x="-24" y="0" width="48" height="42" rx="3" fill="#111827" stroke="#64748B" stroke-width="1.5"/>
    <rect x="-18" y="5" width="16" height="32" fill="#3B82F6" opacity="0.4" stroke="#CBD5E1" stroke-width="1"/>
    <rect x="-2" y="5" width="16" height="32" fill="#3B82F6" opacity="0.6" stroke="#CBD5E1" stroke-width="1"/>
    <text x="0" y="54" text-anchor="middle" font-family="sans-serif" font-size="8.5" font-weight="700" fill="#CBD5E1">SLIDING</text>
    <text x="0" y="63" text-anchor="middle" font-family="sans-serif" font-size="8.5" font-weight="700" fill="#CBD5E1">WINDOWS</text>
  </g>

  <!-- Vertical Divider 1 -->
  <line x1="190" y1="472" x2="190" y2="512" stroke="#475569" stroke-width="1"/>

  <!-- 2. Doors -->
  <g transform="translate(245, 465)">
    <rect x="-20" y="0" width="40" height="42" rx="3" fill="#111827" stroke="#64748B" stroke-width="1.5"/>
    <rect x="-14" y="5" width="28" height="14" fill="#1E293B" stroke="#94A3B8" stroke-width="1"/>
    <rect x="-14" y="22" width="28" height="15" fill="#1E293B" stroke="#94A3B8" stroke-width="1"/>
    <circle cx="8" cy="22" r="1.5" fill="#F8FAFC"/>
    <text x="0" y="58" text-anchor="middle" font-family="sans-serif" font-size="8.5" font-weight="700" fill="#CBD5E1">DOORS</text>
  </g>

  <!-- Vertical Divider 2 -->
  <line x1="300" y1="472" x2="300" y2="512" stroke="#475569" stroke-width="1"/>

  <!-- 3. Partitions -->
  <g transform="translate(355, 465)">
    <rect x="-22" y="0" width="44" height="42" rx="3" fill="#111827" stroke="#64748B" stroke-width="1.5"/>
    <rect x="-16" y="5" width="10" height="32" fill="#38BDF8" opacity="0.3" stroke="#94A3B8" stroke-width="1"/>
    <rect x="-4" y="5" width="10" height="32" fill="#38BDF8" opacity="0.5" stroke="#94A3B8" stroke-width="1"/>
    <rect x="8" y="5" width="10" height="32" fill="#38BDF8" opacity="0.3" stroke="#94A3B8" stroke-width="1"/>
    <text x="0" y="58" text-anchor="middle" font-family="sans-serif" font-size="8.5" font-weight="700" fill="#CBD5E1">PARTITIONS</text>
  </g>

  <!-- Vertical Divider 3 -->
  <line x1="410" y1="472" x2="410" y2="512" stroke="#475569" stroke-width="1"/>

  <!-- 4. Toughened Glass -->
  <g transform="translate(465, 465)">
    <rect x="-20" y="0" width="40" height="42" rx="3" fill="#111827" stroke="#64748B" stroke-width="1.5"/>
    <rect x="-14" y="5" width="28" height="32" fill="url(#glassSky)" opacity="0.7" stroke="#CBD5E1" stroke-width="1"/>
    <polygon points="-12,7 8,7 -4,35 -12,35" fill="#FFFFFF" opacity="0.4"/>
    <text x="0" y="54" text-anchor="middle" font-family="sans-serif" font-size="8.5" font-weight="700" fill="#CBD5E1">TOUGHENED</text>
    <text x="0" y="63" text-anchor="middle" font-family="sans-serif" font-size="8.5" font-weight="700" fill="#CBD5E1">GLASS</text>
  </g>

  <!-- Bottom Gold Ribbon: QUALITY | TRUST | PERFECTION -->
  <g transform="translate(300, 542)">
    <text x="0" y="0" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="800" letter-spacing="3" fill="url(#goldText)">
      QUALITY  |  TRUST  |  PERFECTION
    </text>
  </g>

  <!-- 5 Gold Stars below Ribbon -->
  <g transform="translate(300, 560)" fill="url(#goldRim)">
    <!-- Star 1 -->
    <polygon points="-40,-5 -37,0 -31,1 -36,5 -34,11 -40,8 -46,11 -44,5 -49,1 -43,0" transform="scale(0.8) translate(-10, 0)"/>
    <!-- Star 2 -->
    <polygon points="-20,-5 -17,0 -11,1 -16,5 -14,11 -20,8 -26,11 -24,5 -29,1 -23,0" transform="scale(0.9) translate(-2, 0)"/>
    <!-- Star 3 (Center Largest) -->
    <polygon points="0,-7 3,0 10,1 5,6 7,13 0,9 -7,13 -5,6 -10,1 -3,0"/>
    <!-- Star 4 -->
    <polygon points="20,-5 23,0 29,1 24,5 26,11 20,8 14,11 16,5 11,1 17,0" transform="scale(0.9) translate(2, 0)"/>
    <!-- Star 5 -->
    <polygon points="40,-5 43,0 49,1 44,5 46,11 40,8 34,11 36,5 31,1 37,0" transform="scale(0.8) translate(10, 0)"/>
  </g>
</svg>`;

export const SAIRAJ_LOGO_DATA_URL = `data:image/svg+xml;utf8,${encodeURIComponent(SAIRAJ_LOGO_SVG_RAW)}`;
