const fileToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

const inlineImages = async (svg: SVGSVGElement) => {
  const images = svg.querySelectorAll("image");
  await Promise.all(
    Array.from(images).map(async (img) => {
      const href =
        img.getAttribute("href") || img.getAttribute("xlink:href");
      if (!href || href.startsWith("data:")) return;
      const res = await fetch(href);
      const blob = await res.blob();
      const dataUrl = await fileToDataUrl(blob);
      img.setAttribute("href", dataUrl);
      img.removeAttribute("xlink:href");
    }),
  );
};

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("svg image failed to load"));
    img.src = src;
  });

const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export const downloadAvatarPng = async (
  svgEl: SVGSVGElement,
  filename = "chaos-avatar.png",
  scale = 2,
) => {
  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  await inlineImages(clone);

  const xml = new XMLSerializer().serializeToString(clone);
  const svgBlob = new Blob([xml], {
    type: "image/svg+xml;charset=utf-8",
  });
  const svgUrl = URL.createObjectURL(svgBlob);

  try {
    const img = await loadImage(svgUrl);
    const vb = svgEl.viewBox.baseVal;
    const w = (vb.width || svgEl.clientWidth) * scale;
    const h = (vb.height || svgEl.clientHeight) * scale;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no 2d context");
    ctx.drawImage(img, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    if (!blob) throw new Error("toBlob returned null");
    triggerDownload(blob, filename);
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
};
