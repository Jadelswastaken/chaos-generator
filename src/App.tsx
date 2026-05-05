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
import GlassSelect from "./components/GlassSelect";

type SymMode = Symmetry | "random";

function ColorSelect({
  value,
  onChange,
  palette,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
  palette: string[];
}) {
  const seen = new Set<string>();
  const colors = [...palette, "#ffffff", "#000000"].filter((c) => {
    const k = c.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  return (
    <GlassSelect
      value={value ?? ""}
      onChange={(v) => onChange(v === "" ? null : v)}
      options={[
        { label: "auto", value: "" },
        ...colors.map((c) => ({
          label: c.toLowerCase() === "#ffffff" ? "white" : c.toLowerCase() === "#000000" ? "black" : c,
          value: c,
        })),
      ]}
    />
  );
}

const resolveSymmetry = (mode: SymMode): Symmetry =>
  mode === "random" ? (Math.random() < 0.9 ? "radial" : "mirror") : mode;

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
  const [badgeColor, setBadgeColor] = useState<string | null>(null);
  const [textColor, setTextColor] = useState<string | null>(null);
  const [imageColor, setImageColor] = useState<string | null>(null);
  const [badgeShape, setBadgeShape] = useState<"circle" | "square">("circle");

  const theme = useMemo(() => themeByName(themeName), [themeName]);

  const activeChars = centerMode === "chars" ? chars : "";
  const activeImage = centerMode === "image" ? image || null : null;

  // Grid + auto colours only re-roll on theme / symmetry / grid size / explicit reroll.
  const baseSpec = useMemo(
    () => generate(theme, "", resolveSymmetry(symMode), null, true, gridSize),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme, symMode, gridSize, seed],
  );

  const spec = useMemo(
    () => ({
      ...baseSpec,
      chars: activeChars,
      image: activeImage,
      badge,
      badgeShape,
      badgeColor: badgeColor ?? baseSpec.badgeColor,
      textColor: textColor ?? baseSpec.textColor,
      imageColor: imageColor,
    }),
    [baseSpec, activeChars, activeImage, badge, badgeShape, badgeColor, textColor, imageColor],
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
      <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mx-4">
        {/* column 1 */}
        <div className="flex flex-col gap-4">
          <label className="gap-2 flex flex-row items-center">
            <div className="font-chaotic w-24">theme</div>
            <GlassSelect
              value={themeName}
              onChange={(v) => setThemeName(v)}
              options={themes.map((t) => ({ label: t.name, value: t.name }))}
            />
          </label>

          <label className="gap-2 flex flex-row items-center">
            <div className="font-chaotic w-24">symmetry</div>
            <GlassSelect
              value={symMode}
              onChange={(v) => setSymMode(v as SymMode)}
              placeholder="Select an option"
              options={(["radial", "mirror", "none"] as SymMode[]).map((s) => ({
                label: s,
                value: s,
              }))}
            />
          </label>

          <label className="gap-2 flex flex-row items-center">
            <div className="font-chaotic w-24">grid</div>
            <GlassSelect
              value={String(gridSize)}
              onChange={(v) => setGridSize(Number(v))}
              options={GRID_SIZES.map((n) => ({
                label: `${n}×${n}`,
                value: String(n),
              }))}
            />
          </label>
        </div>

        {/* column 2 */}
        <div className="flex flex-col gap-4">
          <label className="gap-2 flex flex-row items-center">
            <div className="font-chaotic w-28">badge</div>
            <GlassSelect
              value={centerMode}
              onChange={(v) => setCenterMode(v as typeof centerMode)}
              options={[
                { label: "characters", value: "chars" },
                { label: "image", value: "image" },
                { label: "none", value: "none" },
              ]}
            />
          </label>

          {centerMode === "chars" && (
            <label className="gap-2 flex flex-row items-center">
              <div className="font-chaotic w-28">characters (0–3)</div>
              <input
                value={chars}
                className="border-1 border-random p-2 rounded-md flex-grow"
                onChange={(e) => setChars(e.target.value.slice(0, 3))}
                maxLength={3}
                placeholder="meh"
              />
            </label>
          )}

          {centerMode === "image" && (
            <label className="gap-2 flex flex-row items-center">
              <div className="font-chaotic w-28">centerpiece</div>
              <GlassSelect
                value={image}
                onChange={(v) => setImage(v)}
                options={CENTERPIECES.filter((c) => c.value).map((c) => ({
                  label: c.label,
                  value: c.value,
                }))}
              />
            </label>
          )}

          {centerMode === "chars" && (
            <label className="gap-2 flex flex-row items-center">
              <div className="font-chaotic w-28">text colour</div>
              <ColorSelect
                value={textColor}
                onChange={setTextColor}
                palette={theme.colors}
              />
            </label>
          )}

          {centerMode === "image" && (
            <label className="gap-2 flex flex-row items-center">
              <div className="font-chaotic w-28">image tint</div>
              <ColorSelect
                value={imageColor}
                onChange={setImageColor}
                palette={theme.colors}
              />
            </label>
          )}
        </div>

        {/* column 3 */}
        <div className="flex flex-col gap-4">
          {centerMode !== "none" && (
            <>
              <label className="flex flex-row items-center gap-2">
                <input
                  type="checkbox"
                  checked={badge}
                  onChange={(e) => setBadge(e.target.checked)}
                />
                <div className="font-chaotic">badge backdrop</div>
              </label>

              {badge && (
                <label className="gap-2 flex flex-row items-center">
                  <div className="font-chaotic w-24">shape</div>
                  <GlassSelect
                    value={badgeShape}
                    onChange={(v) => setBadgeShape(v as "circle" | "square")}
                    options={[
                      { label: "circle", value: "circle" },
                      { label: "square", value: "square" },
                    ]}
                  />
                </label>
              )}

              {badge && (
                <label className="gap-2 flex flex-row items-center">
                  <div className="font-chaotic w-24">badge colour</div>
                  <ColorSelect
                    value={badgeColor}
                    onChange={setBadgeColor}
                    palette={theme.colors}
                  />
                </label>
              )}
            </>
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
