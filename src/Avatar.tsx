import { forwardRef } from "react";
import type { AvatarSpec } from "./avatarGen";

type Props = {
  spec: AvatarSpec;
  size?: number;
};

const VB = 400;
const BADGE_R = VB * 0.22;

export const Avatar = forwardRef<SVGSVGElement, Props>(({ spec, size = 320 }, ref) => {
  const { grid, chars, image, badge, textColor, badgeColor } = spec;
  const gridSize = grid.length || 4;
  const cell = VB / gridSize;
  const hasImage = !!image;
  const hasChars = !hasImage && chars.length > 0;
  const imgSize = BADGE_R * 2;
  const imgHref = image ? `${import.meta.env.BASE_URL}${image}` : "";

  return (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox={`0 0 ${VB} ${VB}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`avatar ${image ?? chars}`}
    >
      <defs>
        <clipPath id="centerClip">
          <circle cx={VB / 2} cy={VB / 2} r={BADGE_R} />
        </clipPath>
      </defs>

      {grid.map((row, r) =>
        row.map((color, c) => (
          <rect
            key={`${r}-${c}`}
            x={c * cell}
            y={r * cell}
            width={cell}
            height={cell}
            fill={color}
          />
        )),
      )}

      {(hasImage || hasChars) && badge && (
        <circle cx={VB / 2} cy={VB / 2} r={BADGE_R} fill={badgeColor} />
      )}

      {hasImage && (
        <image
          href={imgHref}
          x={VB / 2 - BADGE_R}
          y={VB / 2 - BADGE_R}
          width={imgSize}
          height={imgSize}
          preserveAspectRatio="xMidYMid meet"
          clipPath={badge ? "url(#centerClip)" : undefined}
        />
      )}

      {hasChars && (
        <text
          x={VB / 2}
          y={VB / 2}
          fontFamily='"Chaotic Sans", ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
          fontSize={VB * 0.22}
          fontWeight={700}
          fill={badge ? textColor : badgeColor}
          stroke={badge ? undefined : textColor}
          strokeWidth={badge ? undefined : 4}
          paintOrder={badge ? undefined : "stroke"}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {chars.toUpperCase()}
        </text>
      )}
    </svg>
  );
});

Avatar.displayName = "Avatar";
