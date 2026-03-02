import type { JSONPath } from "jsonc-parser";
import { checkDependencyVersion, type Config, dependencyExists, findConfig, getConfig, modifyJSON, saveConfig } from "./config-utils.js";
import { logInfo, logWarning } from "./log-utils.js";

type OxlintErrorLevel = "error" | "warn" | "off" | "deny" | "allow";

interface OxlintRules {
  "eqeqeq"?: OxlintErrorLevel | [OxlintErrorLevel, unknown?];
  // Missing from Oxlint for now
  // "prefer-arrow-callback"?: OxlintErrorLevel | [OxlintErrorLevel, unknown?];
  "prefer-template"?: OxlintErrorLevel | [OxlintErrorLevel, unknown?]; // v1.12
  "typescript/no-explicit-any"?: OxlintErrorLevel | [OxlintErrorLevel, {
    fixToUnknown?: boolean;
  }?];
  "typescript/explicit-function-return-type"?: OxlintErrorLevel | [OxlintErrorLevel, unknown];
  "typescript/prefer-for-of"?: OxlintErrorLevel | [OxlintErrorLevel, unknown?];
  "typescript/prefer-nullish-coalescing"?: OxlintErrorLevel | [OxlintErrorLevel, unknown?]; // v1.33
  "typescript/prefer-optional-chain"?: OxlintErrorLevel | [OxlintErrorLevel, unknown?]; // v.1.39
  "typescript/use-unknown-in-catch-callback-variable"?: OxlintErrorLevel | [OxlintErrorLevel, unknown?];
  "typescript/no-non-null-assertion"?: OxlintErrorLevel | [OxlintErrorLevel, unknown?];
  "typescript/no-unsafe-argument"?: OxlintErrorLevel | [OxlintErrorLevel, unknown?];
  "typescript/no-unsafe-assignment"?: OxlintErrorLevel | [OxlintErrorLevel, unknown?];
  "typescript/no-unsafe-call"?: OxlintErrorLevel | [OxlintErrorLevel, unknown?];
  "typescript/no-unsafe-member-access"?: OxlintErrorLevel | [OxlintErrorLevel, unknown?];
  "typescript/no-unsafe-return"?: OxlintErrorLevel | [OxlintErrorLevel, unknown?];
  "typescript/no-unsafe-type-assertion"?: OxlintErrorLevel | [OxlintErrorLevel, unknown?];
  "typescript/restrict-plus-operands"?: OxlintErrorLevel | [OxlintErrorLevel, unknown?];
  "typescript/restrict-template-expressions"?: OxlintErrorLevel | [OxlintErrorLevel, unknown?]; // enabled by default
  "typescript/strict-boolean-expressions"?: OxlintErrorLevel | [OxlintErrorLevel, unknown?];
  "typescript/strict-void-return"?: OxlintErrorLevel | [OxlintErrorLevel, unknown?]; // v.1.49
}

interface Oxlint {
  $schema?: "./node_modules/oxlint/configuration_schema.json",
  options?: {
    typeAware: boolean;
  },
  rules?: OxlintRules;
}

/**
 * Enable strict Oxlint rules
 * {@link https://oxc.rs/docs/guide/usage/linter/rules.html}
 *
 * @param cwd Working directory path
 *
 * @returns A boolean for success or failure
 */
export async function enableOxlintStrict(cwd: string): Promise<boolean> {

  const possibleConfigFiles = [".oxlintrc.json", "oxlint.config.ts"];

  let config: Config<Oxlint> | null | undefined;

  const file = findConfig(cwd, possibleConfigFiles);
  if (file === null && !dependencyExists(cwd, "oxlint")) {
    logInfo(`Can't find an Oxlint config file or dependency. Skipping this configuration.`);
    return false;
  }

  if (file === null || file === "oxlint.config.ts") {
    const json: Oxlint = {
      $schema: "./node_modules/oxlint/configuration_schema.json",
      rules: {},
    };
    config = {
      raw: JSON.stringify(json),
      json,
    };
  } else {
    config = await getConfig<Oxlint>(cwd, file);
  }

  if (!config) {
    return false;
  }

  config.raw = modifyJSON(config.raw, ["options", "typeAware"], true);

  if (!checkDependencyVersion(cwd, "oxlint", ">=1.51")) {
    logWarning(`Some Oxlint lint rules require the "typeAware" option, which requires "oxlint" version >= 1.51. The detected version appears to be lower, "oxlint" should be updated.`);
  }

  addRulesConfig(config, [], config.json.rules);

  if (!dependencyExists(cwd, "oxlint-tsgolint")) {
    logWarning(`Some Oxlint lint rules require type-aware linting, and the "oxlint-tsgolint" dependency required for it seems to be missing. See https://oxc.rs/docs/guide/usage/linter/type-aware.html`);
  }

  if (file === "oxlint.config.ts") {
    logWarning(`The project is using the Oxlint "oxlint.config.ts" configuration format, which is too complicated to be manipulated directly. So the new strict configuration will be saved in ".oxlintrc.json"; then it is needed to manually copy the rules from ".oxlintrc.json" to "oxlint.config.ts". Once done, the ".oxlintrc.json" file must be deleted.`);
  }

  return saveConfig(cwd, ".oxlintrc.json", config);

}

function addRulesConfig(config: Config<Oxlint>, path: JSONPath, rules?: Oxlint["rules"]): void {

  config.raw = modifyJSON(config.raw, [...path, "rules", "eqeqeq"], "deny");

  // Missing for now
  // config.raw = modifyJSON(config.raw, [...path, "rules", "prefer-arrow-callback"], "deny");

  config.raw = modifyJSON(config.raw, [...path, "rules", "prefer-template"], "deny");

  config.raw = modifyJSON(config.raw, [...path, "rules", "typescript/explicit-function-return-type"], "deny");

  if (Array.isArray(rules?.["typescript/no-explicit-any"])) {

    const ruleValue = rules["typescript/no-explicit-any"];

    config.raw = modifyJSON(config.raw, [...path, "rules", "typescript/no-explicit-any", 0], ["deny", (ruleValue[1]?.fixToUnknown !== undefined ? { fixToUnknown: ruleValue[1].fixToUnknown } : {})]);

  } else {
    config.raw = modifyJSON(config.raw, [...path, "rules", "typescript/no-explicit-any"], "deny");
  }

  config.raw = modifyJSON(config.raw, [...path, "rules", "typescript/no-non-null-assertion"], "deny");

  config.raw = modifyJSON(config.raw, [...path, "rules", "typescript/no-unsafe-argument"], "deny");
  config.raw = modifyJSON(config.raw, [...path, "rules", "typescript/no-unsafe-assignment"], "deny");
  config.raw = modifyJSON(config.raw, [...path, "rules", "typescript/no-unsafe-call"], "deny");
  config.raw = modifyJSON(config.raw, [...path, "rules", "typescript/no-unsafe-member-access"], "deny");
  config.raw = modifyJSON(config.raw, [...path, "rules", "typescript/no-unsafe-return"], "deny");

  config.raw = modifyJSON(config.raw, [...path, "rules", "typescript/no-unsafe-type-assertion"], "deny");

  config.raw = modifyJSON(config.raw, [...path, "rules", "typescript/prefer-for-of"], "deny");

  config.raw = modifyJSON(config.raw, [...path, "rules", "typescript/prefer-nullish-coalescing"], "deny");

  config.raw = modifyJSON(config.raw, [...path, "rules", "typescript/prefer-optional-chain"], "deny");

  config.raw = modifyJSON(config.raw, [...path, "rules", "typescript/restrict-plus-operands"], ["deny", {
    allowAny: false,
    allowBoolean: false,
    allowNullish: false,
    allowNumberAndString: false,
    allowRegExp: false,
  }]);

  config.raw = modifyJSON(config.raw, [...path, "rules", "typescript/restrict-template-expressions"], "deny");

  config.raw = modifyJSON(config.raw, [...path, "rules", "typescript/strict-boolean-expressions"], ["deny", {
    allowNumber: false,
    allowString: false
  }]);

  config.raw = modifyJSON(config.raw, [...path, "rules", "typescript/strict-void-return"], "deny");

  config.raw = modifyJSON(config.raw, [...path, "rules", "typescript/use-unknown-in-catch-callback-variable"], "deny");

}
