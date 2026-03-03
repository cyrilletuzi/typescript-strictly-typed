import type { JSONPath } from "jsonc-parser";
import { checkDependencyVersion, type Config, dependencyExists, findConfig, getConfig, modifyJSON, saveConfig } from "./config-utils.js";
import { logInfo, logWarning } from "./log-utils.js";

type OxlintErrorLevel = "error" | "warn" | "off" | "deny" | "allow";

interface OxlintRules {
  readonly "eqeqeq"?: OxlintErrorLevel | readonly [OxlintErrorLevel, unknown?];
  // Missing from Oxlint for now
  // readonly "prefer-arrow-callback"?: OxlintErrorLevel | readonly [OxlintErrorLevel, unknown?];
  readonly "prefer-template"?: OxlintErrorLevel | readonly [OxlintErrorLevel, unknown?]; // v1.12
  readonly "typescript/no-explicit-any"?: OxlintErrorLevel | readonly [OxlintErrorLevel, {
    readonly fixToUnknown?: boolean;
  }?];
  readonly "typescript/explicit-function-return-type"?: OxlintErrorLevel | readonly [OxlintErrorLevel, unknown];
  readonly "typescript/prefer-for-of"?: OxlintErrorLevel | readonly [OxlintErrorLevel, unknown?];
  readonly "typescript/prefer-nullish-coalescing"?: OxlintErrorLevel | readonly [OxlintErrorLevel, unknown?]; // v1.33
  readonly "typescript/prefer-optional-chain"?: OxlintErrorLevel | readonly [OxlintErrorLevel, unknown?]; // v.1.39
  readonly "typescript/use-unknown-in-catch-callback-variable"?: OxlintErrorLevel | readonly [OxlintErrorLevel, unknown?];
  readonly "typescript/no-non-null-assertion"?: OxlintErrorLevel | readonly [OxlintErrorLevel, unknown?];
  readonly "typescript/no-unsafe-argument"?: OxlintErrorLevel | readonly [OxlintErrorLevel, unknown?];
  readonly "typescript/no-unsafe-assignment"?: OxlintErrorLevel | readonly [OxlintErrorLevel, unknown?];
  readonly "typescript/no-unsafe-call"?: OxlintErrorLevel | readonly [OxlintErrorLevel, unknown?];
  readonly "typescript/no-unsafe-member-access"?: OxlintErrorLevel | readonly [OxlintErrorLevel, unknown?];
  readonly "typescript/no-unsafe-return"?: OxlintErrorLevel | readonly [OxlintErrorLevel, unknown?];
  readonly "typescript/no-unsafe-type-assertion"?: OxlintErrorLevel | readonly [OxlintErrorLevel, unknown?];
  readonly "typescript/restrict-plus-operands"?: OxlintErrorLevel | readonly [OxlintErrorLevel, unknown?];
  readonly "typescript/restrict-template-expressions"?: OxlintErrorLevel | readonly [OxlintErrorLevel, unknown?]; // enabled by default
  readonly "typescript/strict-boolean-expressions"?: OxlintErrorLevel | readonly [OxlintErrorLevel, unknown?];
  readonly "typescript/strict-void-return"?: OxlintErrorLevel | readonly [OxlintErrorLevel, unknown?]; // v.1.49
}

interface Oxlint {
  readonly $schema?: "./node_modules/oxlint/configuration_schema.json",
  readonly options?: {
    readonly typeAware: boolean;
  },
  readonly rules?: OxlintRules;
}

function addRulesConfig(
  // oxlint-disable-next-line typescript/prefer-readonly-parameter-types -- Mutability wanted here
  config: Config<Oxlint>,
  path: Readonly<JSONPath>,
  rules?: Oxlint["rules"],
): void {

  config.raw = modifyJSON(config.raw, [...path, "rules", "eqeqeq"], "deny");

  // Missing for now
  // config.raw = modifyJSON(config.raw, [...path, "rules", "prefer-arrow-callback"], "deny");

  config.raw = modifyJSON(config.raw, [...path, "rules", "prefer-template"], "deny");

  config.raw = modifyJSON(config.raw, [...path, "rules", "typescript/explicit-function-return-type"], "deny");

  if (Array.isArray(rules?.["typescript/no-explicit-any"])) {

    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Array.isArray() loses the type
    const ruleValue = rules["typescript/no-explicit-any"] as readonly [OxlintErrorLevel, {
      readonly fixToUnknown?: boolean;
    }?];

    config.raw = modifyJSON(config.raw, [...path, "rules", "typescript/no-explicit-any", 0], ["deny", (ruleValue[1]?.fixToUnknown === undefined ? {} : { fixToUnknown: ruleValue[1].fixToUnknown })]);

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
