/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  plugins: ["prettier-plugin-tailwindcss"],

  tailwindFunctions: ["clsx", "cn", "cva"],
};

export default config;
