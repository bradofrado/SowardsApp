/* eslint-disable import/no-default-export -- allow default*/
import type { HexColor } from "model/src/core/colors";
import type { ForceValueType } from "model/src/core/utils";
import baseConfig from "tailwind-config/tailwind.config";
import type { Config } from "tailwindcss";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindColors from "tailwindcss/colors";
import type { DefaultColors } from "tailwindcss/types/generated/colors";

export default baseConfig satisfies Config;

const fullConfig = resolveConfig(baseConfig);
export const colors = {
  ...tailwindColors,
  ...baseConfig.theme.extend.colors,
} as unknown as ForceValueType<
  typeof fullConfig.theme.colors & Omit<DefaultColors, "gray">,
  string,
  HexColor
>;
