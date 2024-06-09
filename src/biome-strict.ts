import { checkDependencyVersion, findConfig, getConfig, modifyJSON, saveConfig } from "./config-utils.js";
import { logInfo, logWarning } from "./log-utils.js";

// Missing rules from ESlint (last check: v1.8.0)
// interface ESLintRules {
//   "@typescript-eslint/explicit-function-return-type"?: ESLintErrorLevel | [ESLintErrorLevel, unknown];
//   "@typescript-eslint/prefer-nullish-coalescing"?: ESLintErrorLevel | [ESLintErrorLevel, unknown?];
//   "@typescript-eslint/use-unknown-in-catch-callback-variable"?: ESLintErrorLevel | [ESLintErrorLevel, unknown?];
//   "@typescript-eslint/restrict-plus-operands"?: ESLintErrorLevel | [ESLintErrorLevel, unknown?];
//   "@typescript-eslint/restrict-template-expressions"?: ESLintErrorLevel | [ESLintErrorLevel, unknown?];
//   "@typescript-eslint/strict-boolean-expressions"?: ESLintErrorLevel | [ESLintErrorLevel, unknown?];
// }

type BiomeErrorLevel = "error" | "warn" | "off";

interface BiomeGroupRules {
  noDoubleEquals?: BiomeErrorLevel;
  noExplicitAny?: BiomeErrorLevel;
  noImplicitAnyLet?: BiomeErrorLevel;
  noNonNullAssertion?: BiomeErrorLevel;
  useArrowFunction?: BiomeErrorLevel;
  useForOf?: BiomeErrorLevel;
  useOptionalChain?: BiomeErrorLevel;
  useTemplate?: BiomeErrorLevel;
}

interface BiomeRules {
  complexity?: Pick<BiomeGroupRules, "useArrowFunction" | "useOptionalChain">;
  style?: Pick<BiomeGroupRules, "noNonNullAssertion" | "useForOf" | "useTemplate">;
  suspicious?: Pick<BiomeGroupRules, "noDoubleEquals" | "noExplicitAny" | "noImplicitAnyLet">;
}

interface Biome {
  extends?: string[];
  linter?: {
    rules?: BiomeRules & {
      recommended?: boolean;
    };
  };
}

interface BiomeRuleInfo {
  group: keyof BiomeRules;
  version: string;
  recommended?: true;
}

const rulesInfo: Record<keyof BiomeGroupRules, BiomeRuleInfo> = {
  noDoubleEquals: {
    group: "suspicious",
    version: "1.0.0",
    recommended: true,
  },
  noExplicitAny: {
    group: "suspicious",
    version: "1.0.0",
    recommended: true,
  },
  noImplicitAnyLet: {
    group: "suspicious",
    version: "1.4.0",
    recommended: true,
  },
  noNonNullAssertion: {
    group: "style",
    version: "1.0.0",
    recommended: true,
  },
  useArrowFunction: {
    group: "complexity",
    version: "1.0.0",
    recommended: true,
  },
  useForOf: {
    group: "style",
    version: "1.5.0",
  },
  useOptionalChain: {
    group: "complexity",
    version: "1.0.0",
    recommended: true,
  },
  useTemplate: {
    group: "style",
    version: "1.0.0",
    recommended: true,
  },
};

const biomePackageName = "@biomejs/biome";

/**
 * Enable Biome rules
 * {@link https://biomejs.dev/linter/rules/}
 *
 * @param cwd Working directory path
 *
 * @returns A boolean for success or failure
 */
export async function enableBiomeStrict(cwd: string): Promise<boolean> {

  const possibleConfigFiles = ["biome.jsonc", "biome.json"];

  const file = findConfig(cwd, possibleConfigFiles);
  if (file === null) {
    logInfo(`Can't find a Biome config file. Skipping this configuration.`);
    return false;
  }

  const config = await getConfig<Biome>(cwd, file);

  if (!config) {
    return false;
  }

  for (const [ruleName, ruleInfo] of Object.entries(rulesInfo)) {

    if (checkDependencyVersion(cwd, biomePackageName, `>=${ruleInfo.version}`)) {

      /* Add the rule if:
       * - it is not part of the recommended preset
       * - or the recommended preset is not enabled in user config
       * - or the user config extends another one */
      if (ruleInfo.recommended !== true
        || config.json.linter?.rules?.recommended !== true
        || config.json.extends !== undefined) {
        config.raw = modifyJSON(config.raw, ["linter", "rules", ruleInfo.group, ruleName], "error");
      }

    } else {
      logWarning(`Biome "${ruleName}" rule was not added because it requires "${biomePackageName}" version >=${ruleInfo.version}.`);
    }

  }

  return saveConfig(cwd, file, config);

}
