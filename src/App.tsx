import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { themes, themeByName } from "./themes";
import { generate, type Symmetry } from "./avatarGen";
import { Avatar } from "./Avatar";

type SymMode = Symmetry | "random";

export default function App() {
  const [themeName, setThemeName] = useState(themes[0].name);
  const [chars, setChars] = useState("");
  const [symMode, setSymMode] = useState<SymMode>("random");
  const [seed, setSeed] = useState(0);

  const theme = useMemo(() => themeByName(themeName), [themeName]);

  const spec = useMemo(
    () => generate(theme, chars, symMode),

    [theme, chars, symMode, seed],
  );

  useEffect(() => {
    document.title = "Chaos Avatar Generator";
  }, []);

  const _reroll = () => setSeed((s) => s + 1);
  void _reroll;

  const iconColor = useMemo(() => {
    const palette = spec.theme.colors;
    return palette[Math.floor(Math.random() * palette.length)];
  }, [spec]);

  const base = import.meta.env.BASE_URL;
  const maskStyle = (file: string) => ({
    maskImage: `url(${base}${file})`,
    WebkitMaskImage: `url(${base}${file})`,
    maskSize: "contain",
    WebkitMaskSize: "contain",
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    maskPosition: "center",
    WebkitMaskPosition: "center",
  }) as CSSProperties;

  return (
    <div className=" backdrop-blur-lg min-h-screen min-w-2xl flex flex-col justify-center gap-8 p-4">
      <div className="flex flex-row items-center ml-4 gap-4">
        <div
          role="img"
          aria-label="Chaos logo"
          style={{ ["--color-random" as string]: iconColor, ...maskStyle("chaos-icon.svg") }}
          className="w-20 h-20 bg-random"
        />
        <div
          role="img"
          aria-label="Chaos"
          style={{ ["--color-random" as string]: iconColor, ...maskStyle("chaos.svg") }}
          className="w-20 h-20 bg-random"
        />
      </div>
      <div className="stage">
        <Avatar spec={spec} size={320} />
        <div className="meta">
          <span>theme: {spec.theme.name}</span>
          <span>symmetry: {spec.symmetry}</span>
        </div>
      </div>

      <div className="controls">
        <label>
          theme
          <select
            value={themeName}
            onChange={(e) => setThemeName(e.target.value)}
          >
            {themes.map((t) => (
              <option key={t.name} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          characters (0–3)
          <input
            value={chars}
            onChange={(e) => setChars(e.target.value.slice(0, 2))}
            maxLength={3}
            placeholder="JD"
          />
        </label>

        <label>
          symmetry
          <select
            value={symMode}
            onChange={(e) => setSymMode(e.target.value as SymMode)}
          >
            <option value="random">random</option>
            <option value="radial">radial</option>
            <option value="mirror">mirror</option>
          </select>
        </label>
        <button>Download</button>
      </div>
    </div>
  );
}
