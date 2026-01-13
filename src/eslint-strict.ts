import type { JSONPath } from "jsonc-parser";
import { type Config, checkDependencyVersion, dependencyExists, findConfig, getConfig, getSource, isAngularESLint, modifyJSON, saveConfig } from "./config-utils.js";
import { enableESLintFlatStrict } from "./eslint-flat-strict.js";
import { logInfo, logWarning } from "./log-utils.js";

type ESLintErrorLevel = "error" | "warn" | "off";

interface ESLintRules {
  "eqeqeq"?: ESLintErrorLevel | [ESLintErrorLevel, unknown?];
  "prefer-arrow-callback"?: ESLintErrorLevel | [ESLintErrorLevel, unknown?];
  "prefer-template"?: ESLintErrorLevel | [ESLintErrorLevel, unknown?];
  "@typescript-eslint/no-explicit-any"?: ESLintErrorLevel | [ESLintErrorLevel, {
    fixToUnknown?: boolean;
  }?];
  "@typescript-eslint/explicit-function-return-type"?: ESLintErrorLevel | [ESLintErrorLevel, unknown];
  "@typescript-eslint/prefer-for-of"?: ESLintErrorLevel | [ESLintErrorLevel, unknown?];
  "@typescript-eslint/prefer-nullish-coalescing"?: ESLintErrorLevel | [ESLintErrorLevel, unknown?];
  "@typescript-eslint/prefer-optional-chain"?: ESLintErrorLevel | [ESLintErrorLevel, unknown?];
  "@typescript-eslint/use-unknown-in-catch-callback-variable"?: ESLintErrorLevel | [ESLintErrorLevel, unknown?];
  "@typescript-eslint/no-non-null-assertion"?: ESLintErrorLevel | [ESLintErrorLevel, unknown?];
  "@typescript-eslint/no-unsafe-argument"?: ESLintErrorLevel | [ESLintErrorLevel, unknown?]; // in recommended-type-checked
  "@typescript-eslint/no-unsafe-assignment"?: ESLintErrorLevel | [ESLintErrorLevel, unknown?]; // in recommended-type-checked
  "@typescript-eslint/no-unsafe-call"?: ESLintErrorLevel | [ESLintErrorLevel, unknown?]; // in recommended-type-checked
  "@typescript-eslint/no-unsafe-member-access"?: ESLintErrorLevel | [ESLintErrorLevel, unknown?]; // in recommended-type-checked
  "@typescript-eslint/no-unsafe-return"?: ESLintErrorLevel | [ESLintErrorLevel, unknown?]; // in recommended-type-checked
  "@typescript-eslint/no-unsafe-type-assertion"?: ESLintErrorLevel | [ESLintErrorLevel, unknown?];
  "@typescript-eslint/restrict-plus-operands"?: ESLintErrorLevel | [ESLintErrorLevel, unknown?];
  "@typescript-eslint/restrict-template-expressions"?: ESLintErrorLevel | [ESLintErrorLevel, unknown?];
  "@typescript-eslint/strict-boolean-expressions"?: ESLintErrorLevel | [ESLintErrorLevel, unknown?];
  "@typescript-eslint/strict-void-return"?: ESLintErrorLevel | [ESLintErrorLevel, unknown?];
  "@angular-eslint/template/no-any"?: ESLintErrorLevel | [ESLintErrorLevel, unknown?];
}

interface ESLintParserOptions {
  project?: boolean | string | string[];
}

interface ESLint {
  parserOptions?: ESLintParserOptions;
  rules?: ESLintRules;
  plugins?: string[];
  extends?: string | string[];
  overrides?: {
    files?: string | string[];
    parserOptions?: ESLintParserOptions;
    plugins?: string[];
    extends?: string | string[];
    rules?: ESLintRules;
  }[];
}

interface PackageJSON {
  eslintConfig?: ESLint;
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

  let config: Config<ESLint> | null = null;
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

      addAngularHTMLConfig(config, ["overrides", indexNumber]);

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
    logWarning(`Your project is using the new ${file} format, and it cannot be overwrited directly, as it could mess up with advanced configuration. So the new strict configuration was saved in eslint.config.json. eslint.config.json is not recognized by ESLint, you need to manually copy the options from eslint.config.json to ${file}. Once done, you can delete eslint.config.json.`);
    return saveConfig(cwd, "eslint.config.json", config);
  }
  
  if (file === ".eslintrc.js") {
    logWarning("Your project is using the advanced .eslintrc.js format, and it cannot be overwrited directly, as it could mess up with advanced configuration. So the new strict configuration was saved in .eslintrc.json. As .eslintrc.js has precedence over .eslintrc.json, you need to manually copy the options from .eslintrc.json to .eslintrc.js. Once done, you can delete .eslintrc.json.");
    return saveConfig(cwd, ".eslintrc.json", config);
  }
  
  if (file === ".eslintrc.cjs") {
    logWarning("Your project is using the advanced .eslintrc.cjs format, and it cannot be overwrited directly, as it could mess up with advanced configuration. So the new strict configuration was saved in .eslintrc.json. As .eslintrc.cjs has precedence over .eslintrc.json, you need to manually copy the options from .eslintrc.json to .eslintrc.cjs. Once done, you can delete .eslintrc.json.");
    return saveConfig(cwd, ".eslintrc.json", config);
  }
  
  return saveConfig(cwd, file, config);

}

function addTSConfig(cwd: string, config: Config<ESLint>, path: JSONPath, rules?: ESLint["rules"]): void {

  config.raw = modifyJSON(config.raw, [...path, "rules", "eqeqeq"], "error");

  config.raw = modifyJSON(config.raw, [...path, "rules", "prefer-arrow-callback"], "error");

  config.raw = modifyJSON(config.raw, [...path, "rules", "prefer-template"], "error");

  config.raw = modifyJSON(config.raw, [...path, "rules", "@typescript-eslint/explicit-function-return-type"], "error");

  if (Array.isArray(rules?.["@typescript-eslint/no-explicit-any"])) {

    const ruleValue = rules["@typescript-eslint/no-explicit-any"];

    config.raw = modifyJSON(config.raw, [...path, "rules", "@typescript-eslint/no-explicit-any", 0], ["error", {
      ...(ruleValue[1]?.fixToUnknown !== undefined ? { fixToUnknown: ruleValue[1].fixToUnknown } : {}),
    }]);

  } else {
    config.raw = modifyJSON(config.raw, [...path, "rules", "@typescript-eslint/no-explicit-any"], "error");
  }

  config.raw = modifyJSON(config.raw, [...path, "rules", "@typescript-eslint/no-non-null-assertion"], "error");

  config.raw = modifyJSON(config.raw, [...path, "rules", "@typescript-eslint/no-unsafe-argument"], "error");
  config.raw = modifyJSON(config.raw, [...path, "rules", "@typescript-eslint/no-unsafe-assignment"], "error");
  config.raw = modifyJSON(config.raw, [...path, "rules", "@typescript-eslint/no-unsafe-call"], "error");
  config.raw = modifyJSON(config.raw, [...path, "rules", "@typescript-eslint/no-unsafe-member-access"], "error");
  config.raw = modifyJSON(config.raw, [...path, "rules", "@typescript-eslint/no-unsafe-return"], "error");

  if (checkDependencyVersion(cwd, "@typescript-eslint/eslint-plugin", ">=8.15.0") || checkDependencyVersion(cwd, "typescript-eslint", ">=8.15.0")) {
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

  if (checkDependencyVersion(cwd, "@typescript-eslint/eslint-plugin", ">=8.53.0") || checkDependencyVersion(cwd, "typescript-eslint", ">=8.53.0")) {
    config.raw = modifyJSON(config.raw, [...path, "rules", "@typescript-eslint/strict-void-return"], "error");
  }

  config.raw = modifyJSON(config.raw, [...path, "rules", "@typescript-eslint/use-unknown-in-catch-callback-variable"], "error");

}

function addAngularHTMLConfig(config: Config<ESLint>, path: JSONPath): void {

  config.raw = modifyJSON(config.raw, [...path, "rules", "@angular-eslint/template/no-any"], "error");

}

function normalizeConfigToArray(config?: string | string[]): string[] {

  return Array.isArray(config) ? config : (config !== undefined ? [config] : []);

}
