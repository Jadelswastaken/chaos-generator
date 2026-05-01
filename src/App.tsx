import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { themes, themeByName } from "./themes";
import { generate, CENTERPIECES, GRID_SIZES, type Symmetry } from "./avatarGen";
import { Avatar } from "./Avatar";
import { downloadAvatarPng } from "./download";
import { Repeat2, Download } from "lucide-react";

type SymMode = Symmetry | "random";

export default function App() {
  const [themeName, setThemeName] = useState(themes[0].name);
  const [chars, setChars] = useState("");
  const [symMode, setSymMode] = useState<SymMode>("random");
  const [image, setImage] = useState<string>(
    CENTERPIECES.find((c) => c.value)?.value ?? "",
  );
  const [badge, setBadge] = useState(true);
  const [centerMode, setCenterMode] = useState<"chars" | "image" | "none">(
    "chars",
  );
  const [gridSize, setGridSize] = useState<number>(6);
  const [seed, setSeed] = useState(0);

  const theme = useMemo(() => themeByName(themeName), [themeName]);

  const activeChars = centerMode === "chars" ? chars : "";
  const activeImage = centerMode === "image" ? image || null : null;

  const spec = useMemo(
    () => generate(theme, activeChars, symMode, activeImage, badge, gridSize),

    [theme, activeChars, symMode, activeImage, badge, gridSize, seed],
  );

  useEffect(() => {
    document.title = "Chaos Avatar Generator";
  }, []);

  const _reroll = () => setSeed((s) => s + 1);
  void _reroll;

  const svgRef = useRef<SVGSVGElement>(null);
  const handleDownload = async () => {
    if (!svgRef.current) return;
    const name = spec.image
      ? `chaos-${spec.image.replace(/\.[^.]+$/, "")}.png`
      : spec.chars
        ? `chaos-${spec.chars.toLowerCase()}.png`
        : "chaos-avatar.png";
    try {
      await downloadAvatarPng(svgRef.current, name);
    } catch (err) {
      console.error("download failed", err);
    }
  };

  const iconColor = useMemo(() => {
    const palette = spec.theme.colors;
    return palette[Math.floor(Math.random() * palette.length)];
  }, [spec]);

  const base = import.meta.env.BASE_URL;
  const maskStyle = (file: string) =>
    ({
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
    <div className=" backdrop-blur-lg bg-black/20 min-h-screen min-w-2xl flex flex-col justify-center gap-8 p-4">
      {/* title */}
      <div className="flex flex-col items-center ml-4 gap-2">
        <div className="flex flex-row gap-4">
          <div
            role="img"
            aria-label="Chaos logo"
            style={{
              ["--color-random" as string]: iconColor,
              ...maskStyle("chaos-icon.svg"),
            }}
            className="w-20 h-20 bg-random"
          />
          <div
            role="img"
            aria-label="Chaos"
            style={{
              ["--color-random" as string]: iconColor,
              ...maskStyle("chaos.svg"),
            }}
            className="w-20 h-20 bg-random"
          />
        </div>
        <h1 className="font-chaotic text-3xl tracking-wide">
          c h a o s . a v a t a r . g e n e r a t o r
        </h1>
      </div>
      {/* avatar */}
      <div className="flex justify-center gap-6">
        <Avatar ref={svgRef} spec={spec} size={320} />
      </div>
      {/* controls */}
      <div className="gap-6 grid grid-cols-2">
        {/* theme and stuff */}
        <div className="flex flex-col gap-4 ml-4">
          <label className="gap-2 flex flex-row items-center">
            <div className="font-chaotic">theme</div>
            <select
              className="border-1 border-random p-2 rounded-md flex-grow"
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

          <label className="gap-2 flex flex-row items-center">
            <div className="font-chaotic">symmetry</div>
            <select
              className="border-1 border-random p-2 rounded-md flex-grow"
              value={symMode}
              onChange={(e) => setSymMode(e.target.value as SymMode)}
            >
              <option value="random">random</option>
              <option value="radial">radial</option>
              <option value="mirror">mirror</option>
            </select>
          </label>

          <label className="gap-2 flex flex-row items-center">
            <div className="font-chaotic">grid</div>
            <select
              className="border-1 border-random p-2 rounded-md flex-grow"
              value={gridSize}
              onChange={(e) => setGridSize(Number(e.target.value))}
            >
              {GRID_SIZES.map((n) => (
                <option key={n} value={n}>
                  {n}×{n}
                </option>
              ))}
            </select>
          </label>
        </div>
        {/* badge */}
        <div className="flex flex-col gap-4 mr-4">
          <label className="gap-2 flex flex-row items-center">
            <div className="font-chaotic">badge</div>
            <select
              className="border-1 border-random p-2 rounded-md flex-grow"
              value={centerMode}
              onChange={(e) =>
                setCenterMode(e.target.value as typeof centerMode)
              }
            >
              <option value="chars">characters</option>
              <option value="image">image</option>
              <option value="none">none</option>
            </select>
          </label>

          {centerMode === "chars" && (
            <label className="gap-2 flex flex-row items-center">
              <div className="font-chaotic">characters (0–3)</div>
              <input
                value={chars}
                className="border-1 border-random p-2 rounded-md"
                onChange={(e) => setChars(e.target.value.slice(0, 3))}
                maxLength={3}
                placeholder="meh"
              />
            </label>
          )}

          {centerMode === "image" && (
            <label className="gap-2 flex flex-row items-center">
              <div className="font-chaotic">centerpiece</div>
              <select
                className="border-1 border-random p-2 rounded-md"
                value={image}
                onChange={(e) => setImage(e.target.value)}
              >
                {CENTERPIECES.filter((c) => c.value).map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
          )}

          {centerMode !== "none" && (
            <label className="flex flex-row items-center gap-2">
              <input
                type="checkbox"
                checked={badge}
                onChange={(e) => setBadge(e.target.checked)}
              />
              <div className="font-chaotic">badge circle</div>
            </label>
          )}
        </div>
      </div>
      {/* buttons */}
      <div className="flex flex-row gap-2 justify-center">
        <button className="bg-random rounded-md" onClick={_reroll}>
          <Repeat2 />
        </button>
        <button
          className="bg-random rounded-md flex flex-row gap-3"
          onClick={handleDownload}
        >
          Download Avatar
          <Download />
        </button>
      </div>
    </div>
  );
}
