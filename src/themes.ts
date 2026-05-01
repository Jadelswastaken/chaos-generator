export type Theme = {
  name: string;
  colors: string[];
};

export const themes: Theme[] = [
  {
    name: "iridescent",
    colors: [
      "#c48dfc", // heliotrope
      "#ea8afd", // heliotrope light
      "#b5f7e5", // ice-cold
      "#9eb5f9", // jordy-blue
      "#dee9f1", // catskill-white
      "#978efd", // melrose
      "#e4a5ef", // perfume
      "#9ddded", // blizzard-blue
      "#e2caf1", // french-lilac
    ],
  },
  {
    name: "demeter",
    colors: [
      "#073763", // deep blue
      "#fff2cc", // cream
      "#44c117", // green
      "#ea9999", // salmon
      "#8b541a", // brown
    ],
  },
  {
    name: "jade",
    colors: [
      "#00a86b", // jade
      "#0d7a52", // deep jade
      "#5fd1a3", // mint
      "#b8ecd5", // pale jade
      "#f5fbf8", // jade white
      "#1a3a2e", // forest
    ],
  },
];

export const themeByName = (name: string): Theme =>
  themes.find((t) => t.name === name) ?? themes[0];
