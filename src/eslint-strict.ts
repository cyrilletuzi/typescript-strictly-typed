import type { JSONPath } from "jsonc-parser";
import { type Config, checkAngularEslintVersion, checkTypescriptEslintVersion, dependencyExists, findConfig, getConfig, getSource, isAngularESLint, modifyJSON, saveConfig } from "./config-utils.js";
import { enableESLintFlatStrict } from "./eslint-flat-strict.js";
import { logInfo, logWarning } from "./log-utils.js";

type ESLintErrorLevel = "error" | "warn" | "off";

interface ESLintRules {
  readonly "eqeqeq"?: ESLintErrorLevel | readonly [ESLintErrorLevel, unknown?];
  readonly "prefer-arrow-callback"?: ESLintErrorLevel | readonly [ESLintErrorLevel, unknown?];
  readonly "prefer-template"?: ESLintErrorLevel | readonly [ESLintErrorLevel, unknown?];
  readonly "@typescript-eslint/no-explicit-any"?: ESLintErrorLevel | readonly [ESLintErrorLevel, {
    readonly fixToUnknown?: boolean;
  }?];
  readonly "@typescript-eslint/explicit-function-return-type"?: ESLintErrorLevel | readonly [ESLintErrorLevel, unknown];
  readonly "@typescript-eslint/prefer-for-of"?: ESLintErrorLevel | readonly [ESLintErrorLevel, unknown?];
  readonly "@typescript-eslint/prefer-nullish-coalescing"?: ESLintErrorLevel | readonly [ESLintErrorLevel, unknown?];
  readonly "@typescript-eslint/prefer-optional-chain"?: ESLintErrorLevel | readonly [ESLintErrorLevel, unknown?];
  readonly "@typescript-eslint/use-unknown-in-catch-callback-variable"?: ESLintErrorLevel | readonly [ESLintErrorLevel, unknown?];
  readonly "@typescript-eslint/no-non-null-assertion"?: ESLintErrorLevel | readonly [ESLintErrorLevel, unknown?];
  readonly "@typescript-eslint/no-unsafe-argument"?: ESLintErrorLevel | readonly [ESLintErrorLevel, unknown?]; // in recommended-type-checked
  readonly "@typescript-eslint/no-unsafe-assignment"?: ESLintErrorLevel | readonly [ESLintErrorLevel, unknown?]; // in recommended-type-checked
  readonly "@typescript-eslint/no-unsafe-call"?: ESLintErrorLevel | readonly [ESLintErrorLevel, unknown?]; // in recommended-type-checked
  readonly "@typescript-eslint/no-unsafe-member-access"?: ESLintErrorLevel | readonly [ESLintErrorLevel, unknown?]; // in recommended-type-checked
  readonly "@typescript-eslint/no-unsafe-return"?: ESLintErrorLevel | readonly [ESLintErrorLevel, unknown?]; // in recommended-type-checked
  readonly "@typescript-eslint/no-unsafe-type-assertion"?: ESLintErrorLevel | readonly [ESLintErrorLevel, unknown?];
  readonly "@typescript-eslint/restrict-plus-operands"?: ESLintErrorLevel | readonly [ESLintErrorLevel, unknown?];
  readonly "@typescript-eslint/restrict-template-expressions"?: ESLintErrorLevel | readonly [ESLintErrorLevel, unknown?];
  readonly "@typescript-eslint/strict-boolean-expressions"?: ESLintErrorLevel | readonly [ESLintErrorLevel, unknown?];
  readonly "@typescript-eslint/strict-void-return"?: ESLintErrorLevel | readonly [ESLintErrorLevel, unknown?];
  readonly "@angular-eslint/template/no-any"?: ESLintErrorLevel | readonly [ESLintErrorLevel, unknown?];
  readonly "@angular-eslint/template/no-non-null-assertion"?: ESLintErrorLevel | readonly [ESLintErrorLevel, unknown?];
}

interface ESLintParserOptions {
  readonly project?: boolean | string | string[];
}

interface ESLint {
  readonly parserOptions?: ESLintParserOptions;
  readonly rules?: ESLintRules;
  readonly plugins?: readonly string[];
  readonly extends?: string | readonly string[];
  readonly overrides?: readonly {
    readonly files?: string | readonly string[];
    readonly parserOptions?: ESLintParserOptions;
    readonly plugins?: readonly string[];
    readonly extends?: string | readonly string[];
    readonly rules?: ESLintRules;
  }[];
}

interface PackageJSON {
  eslintConfig?: ESLint;
}


function addTSConfig(
  cwd: string,
  // oxlint-disable-next-line typescript/prefer-readonly-parameter-types -- Mutability wanted here
  config: Config<ESLint>,
  path: Readonly<JSONPath>,
  rules?: ESLint["rules"],
): void {

  config.raw = modifyJSON(config.raw, [...path, "rules", "eqeqeq"], "error");

  config.raw = modifyJSON(config.raw, [...path, "rules", "prefer-arrow-callback"], "error");

  config.raw = modifyJSON(config.raw, [...path, "rules", "prefer-template"], "error");

  config.raw = modifyJSON(config.raw, [...path, "rules", "@typescript-eslint/explicit-function-return-type"], "error");

  if (Array.isArray(rules?.["@typescript-eslint/no-explicit-any"])) {

    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Type is lost by Array.isArray()
    const ruleValue = rules["@typescript-eslint/no-explicit-any"] as readonly [ESLintErrorLevel, {
      readonly fixToUnknown?: boolean;
    }?];

    config.raw = modifyJSON(config.raw, [...path, "rules", "@typescript-eslint/no-explicit-any", 0], ["error", (ruleValue[1]?.fixToUnknown === undefined ? {} : { fixToUnknown: ruleValue[1].fixToUnknown })]);

  } else {
    config.raw = modifyJSON(config.raw, [...path, "rules", "@typescript-eslint/no-explicit-any"], "error");
  }

  config.raw = modifyJSON(config.raw, [...path, "rules", "@typescript-eslint/no-non-null-assertion"], "error");

  config.raw = modifyJSON(config.raw, [...path, "rules", "@typescript-eslint/no-unsafe-argument"], "error");
  config.raw = modifyJSON(config.raw, [...path, "rules", "@typescript-eslint/no-unsafe-assignment"], "error");
  config.raw = modifyJSON(config.raw, [...path, "rules", "@typescript-eslint/no-unsafe-call"], "error");
  config.raw = modifyJSON(config.raw, [...path, "rules", "@typescript-eslint/no-unsafe-member-access"], "error");
  config.raw = modifyJSON(config.raw, [...path, "rules", "@typescript-eslint/no-unsafe-return"], "error");

  if (checkTypescriptEslintVersion(cwd, ">=8.15.0")) {
    config.raw = modifyJSON(config.raw, [...path, "rules", "@typescript-eslint/no-unsafe-type-assertion"], "error");
  }

  config.raw = modifyJSON(config.raw, [...path, "rules", "@typescript-eslint/prefer-for-of"], "error");

  config.raw = modifyJSON(config.raw, [...path, "rules", "@typescript-eslint/prefer-nullish-coalescing"], "error");

  config.raw = modifyJSON(config.raw, [...path, "rules", "@typescript-eslint/prefer-optional-chain"], "error");

  config.raw = modifyJSON(config.raw, [...path, "rules", "@typescript-eslint/restrict-plus-operands"], ["error", {
    allowAny: false,
    allowBoolean: false,
    allowNullish: false,
    allowNumberAndString: false,
    allowRegExp: false,
  }]);

  config.raw = modifyJSON(config.raw, [...path, "rules", "@typescript-eslint/restrict-template-expressions"], "error");

  config.raw = modifyJSON(config.raw, [...path, "rules", "@typescript-eslint/strict-boolean-expressions"], ["error", {
    allowNumber: false,
    allowString: false
  }]);

  if (checkTypescriptEslintVersion(cwd, ">=8.53.0")) {
    config.raw = modifyJSON(config.raw, [...path, "rules", "@typescript-eslint/strict-void-return"], "error");
  }

  config.raw = modifyJSON(config.raw, [...path, "rules", "@typescript-eslint/use-unknown-in-catch-callback-variable"], "error");

}

function addAngularHTMLConfig(
  cwd: string,
  // oxlint-disable-next-line typescript/prefer-readonly-parameter-types -- Mutability wanted here
  config: Config<ESLint>,
  path: Readonly<JSONPath>,
): void {

  config.raw = modifyJSON(config.raw, [...path, "rules", "@angular-eslint/template/no-any"], "error");

  if (checkAngularEslintVersion(cwd, ">=21.3.0")) {
    config.raw = modifyJSON(config.raw, [...path, "rules", "@angular-eslint/template/no-non-null-assertion"], "error");
  }

}

function normalizeConfigToArray(config?: string | readonly string[]): string[] {

  if (Array.isArray(config)) {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Type lost by Array.isArray()
    return config as string[];
  }

  return typeof config === "string" ? [config] : [];

}

/**
 * Enable strict ESLint rules
 * {@link https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin}
 *
 * @param cwd Working directory path
 *
 * @returns A boolean for success or failure
 */
export async function enableESLintStrict(cwd: string): Promise<boolean> {

  if (enableESLintFlatStrict(cwd)) {
    return true;
  }

  const possibleConfigFiles = ["eslint.config.js", "eslint.config.mjs", ".eslintrc.js", ".eslintrc.cjs", ".eslintrc.yaml", ".eslintrc.yml", ".eslintrc.json", "package.json"];
  const tsFilesConfig = "*.ts";
  const htmlFilesConfig = "*.html";

  let config: Config<ESLint> | null | undefined;
  let packageJSONConfig: Config<PackageJSON> | null = null;

  const file = findConfig(cwd, possibleConfigFiles);
  if (file === null) {
    logInfo(`Can't find an ESLint config file. Skipping this configuration.`);
    return false;
  }

  if (file === "eslint.config.js" || file === "eslint.config.mjs") {
    config = {
      source: getSource(cwd, file),
      raw: JSON.stringify({ rules: {} }),
      json: { rules: {} },
    };
  } else if (file === "package.json") {
    packageJSONConfig = await getConfig<PackageJSON>(cwd, file);
    if (!packageJSONConfig?.json.eslintConfig) {
      return false;
    }
    config = {
      raw: JSON.stringify(packageJSONConfig.json.eslintConfig),
      json: packageJSONConfig.json.eslintConfig,
    };
  } else {
    config = await getConfig<ESLint>(cwd, file);
  }

  if (!config) {
    return false;
  }

  let tsConfigAdded = false;

  /* If there is an override, rules must be set inside it, or they won't be checked */
  for (const [index, override] of Object.entries(config.json.overrides ?? [])) {

    const indexNumber = Number.parseInt(index, 10);

    const files = normalizeConfigToArray(override.files);

    if (files.some((fileItem) => fileItem.includes(tsFilesConfig))) {

      if (config.json.overrides?.[indexNumber]?.parserOptions?.project === undefined) {
        config.raw = modifyJSON(config.raw, ["overrides", indexNumber, "parserOptions", "project"], true);
      }

      addTSConfig(cwd, config, ["overrides", indexNumber], config.json.overrides?.[indexNumber]?.rules);

      tsConfigAdded = true;

    }

    if (isAngularESLint(cwd) && files.some((fileItem) => fileItem.includes(htmlFilesConfig))) {

      addAngularHTMLConfig(cwd, config, ["overrides", indexNumber]);

    }

  }

  /* Add rules at root level */
  if (!tsConfigAdded) {

    if (config.json.parserOptions?.project === undefined) {
      config.raw = modifyJSON(config.raw, ["parserOptions", "project"], true);
    }

    addTSConfig(cwd, config, [], config.json.rules);
  }

  if (!dependencyExists(cwd, "@typescript-eslint/eslint-plugin") && !dependencyExists(cwd, "typescript-eslint")) {
    logWarning(`'@typescript-eslint/eslint-plugin' or 'typescript-eslint' dependency must be installed, otherwise rules will not be checked.`);
  }

  if (packageJSONConfig) {
    config.raw = modifyJSON(packageJSONConfig.raw, ["eslintConfig"], config.json);
    return saveConfig(cwd, file, packageJSONConfig);
  }

  if (file === "eslint.config.js" || file === "eslint.config.mjs") {
    logWarning(`The project is using the new ${file} format, and it cannot be overwrited directly, as it could mess up with advanced configuration. So the new strict configuration was saved in eslint.config.json. eslint.config.json is not recognized by ESLint, it is needed to manually copy the options from eslint.config.json to ${file}. Once done, eslint.config.json can be deleted.`);
    return saveConfig(cwd, "eslint.config.json", config);
  }

  if (file === ".eslintrc.js") {
    logWarning("The project is using the advanced .eslintrc.js format, and it cannot be overwrited directly, as it could mess up with advanced configuration. So the new strict configuration was saved in .eslintrc.json. As .eslintrc.js has precedence over .eslintrc.json, it is needed to manually copy the options from .eslintrc.json to .eslintrc.js. Once done, .eslintrc.json can be deleted.");
    return saveConfig(cwd, ".eslintrc.json", config);
  }

  if (file === ".eslintrc.cjs") {
    logWarning("The project is using the advanced .eslintrc.cjs format, and it cannot be overwrited directly, as it could mess up with advanced configuration. So the new strict configuration was saved in .eslintrc.json. As .eslintrc.cjs has precedence over .eslintrc.json, it is needed to manually copy the options from .eslintrc.json to .eslintrc.cjs. Once done, .eslintrc.json can be deleted.");
    return saveConfig(cwd, ".eslintrc.json", config);
  }

  return saveConfig(cwd, file, config);

}
