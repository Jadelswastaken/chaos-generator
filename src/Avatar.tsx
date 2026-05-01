import type { AvatarSpec } from "./avatarGen";

type Props = {
  spec: AvatarSpec;
  size?: number;
};

const VB = 400;
const CELL = VB / 4;

export const Avatar = ({ spec, size = 320 }: Props) => {
  const { grid, chars, textColor, badgeColor } = spec;
  const hasChars = chars.length > 0;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${VB} ${VB}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`avatar ${chars}`}
    >
      {grid.map((row, r) =>
        row.map((color, c) => (
          <rect
            key={`${r}-${c}`}
            x={c * CELL}
            y={r * CELL}
            width={CELL}
            height={CELL}
            fill={color}
          />
        )),
      )}
      {hasChars && (
        <>
          <circle cx={VB / 2} cy={VB / 2} r={VB * 0.22} fill={badgeColor} />
          <text
            x={VB / 2}
            y={VB / 2}
            fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
            fontSize={VB * 0.22}
            fontWeight={700}
            fill={textColor}
            textAnchor="middle"
            dominantBaseline="central"
          >
            {chars.toUpperCase()}
          </text>
        </>
      )}
    </svg>
  );
};
