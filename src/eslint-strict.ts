import { type JSONPath } from "jsonc-parser";
import { dependencyExists, findConfig, getConfig, modifyJSON, saveConfig, type Config } from "./config-utils.js";
import { logWarning } from "./log-utils.js";

type ESLintErrorLevel = "error" | "warn" | "off";

interface ESLintRules {
  "eqeqeq"?: ESLintErrorLevel | [ESLintErrorLevel, unknown?];
  "prefer-arrow-callback"?: ESLintErrorLevel | [ESLintErrorLevel, unknown?];
  "prefer-for-of"?: ESLintErrorLevel | [ESLintErrorLevel, unknown?];
  "prefer-template"?: ESLintErrorLevel | [ESLintErrorLevel, unknown?];
  "@typescript-eslint/no-explicit-any"?: ESLintErrorLevel | [ESLintErrorLevel, {
    fixToUnknown?: boolean;
  }?];
  "@typescript-eslint/explicit-function-return-type"?: ESLintErrorLevel | [ESLintErrorLevel, {
    allowExpressions?: boolean;
  }?];
  "@typescript-eslint/prefer-nullish-coalescing"?: ESLintErrorLevel | [ESLintErrorLevel, unknown?];
  "@typescript-eslint/use-unknown-in-catch-callback-variable"?: ESLintErrorLevel | [ESLintErrorLevel, unknown?];
  "@typescript-eslint/no-non-null-assertion"?: ESLintErrorLevel | [ESLintErrorLevel, unknown?];
  "@typescript-eslint/restrict-plus-operands"?: ESLintErrorLevel | [ESLintErrorLevel, unknown?];
  "@typescript-eslint/restrict-template-expressions"?: ESLintErrorLevel | [ESLintErrorLevel, unknown?];
  "@typescript-eslint/strict-boolean-expressions"?: ESLintErrorLevel | [ESLintErrorLevel, unknown?];
  "@angular-eslint/template/no-any"?: ESLintErrorLevel | [ESLintErrorLevel, unknown?];
}

interface ESLint {
  rules?: ESLintRules;
  plugins?: string[];
  extends?: string | string[];
  overrides?: {
    files?: string | string[];
    plugins?: string[];
    extends?: string | string[];
    rules?: ESLintRules;
  }[];
}

interface PackageJSON {
  eslintConfig?: ESLint;
}

/**
 * Enable the following ESLint rules:
 * - `eqeqeq`
 * - `prefer-arrow-callback`
 * - `prefer-for-of`
 * - `prefer-template`
 * - `@typescript-eslint/no-explicit-any`
 * - `@typescript-eslint/explicit-function-return-type`
 * - `@typescript-eslint/prefer-nullish-coalescing`
 * - `@typescript-eslint/use-unknown-in-catch-callback-variable`
 * - `@typescript-eslint/no-non-null-assertion`
 * - `@typescript-eslint/restrict-plus-operands`
 * - `@typescript-eslint/strict-boolean-expressions`
 * - `@typescript-eslint/restrict-template-expressions`
 * {@link https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin}
 *
 * @param cwd Working directory path
 *
 * @returns A boolean for success or failure
 */
export async function enableESLintStrict(cwd: string): Promise<boolean> {

  const possibleConfigFiles = ["eslint.config.js", ".eslintrc.js", ".eslintrc.cjs", ".eslintrc.yaml", ".eslintrc.yml", ".eslintrc.json", "package.json"];
  const tsFilesConfig = "*.ts";
  const htmlFilesConfig = "*.html";
  const eslintAngularTemplatePlugin = "@angular-eslint/template";

  let config: Config<ESLint> | null = null;
  let packageJSONConfig: Config<PackageJSON> | null = null;

  const file = findConfig(cwd, possibleConfigFiles);
  if (file === null) {
    return false;
  }

  if (file === "eslint.config.js") {
    config = {
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

  if (!dependencyExists(cwd, "@typescript-eslint/eslint-plugin") && !dependencyExists(cwd, "typescript-eslint")) {
    logWarning(`'@typescript-eslint/eslint-plugin' or 'typescript-eslint' dependency must be installed, otherwise rules will not be checked.`);
  }

  let tsConfigAdded = false;

  /* If there is an override, rules must be set inside it, or they won't be checked */
  for (const [index, override] of Object.entries(config.json.overrides ?? [])) {

    const indexNumber = Number.parseInt(index, 10);

    const files = normalizeConfigToArray(override.files);

    if (files.some((file) => file.includes(tsFilesConfig))) {

      addTSConfig(config, ["overrides", indexNumber], config.json.overrides?.[indexNumber]?.rules);

      tsConfigAdded = true;

    }

    if (files.some((file) => file.includes(htmlFilesConfig))) {

      const extendsConfig = normalizeConfigToArray(override.extends);

      if ((override.plugins ?? []).includes(eslintAngularTemplatePlugin)
        || extendsConfig.some((extendConfig) => extendConfig.includes(eslintAngularTemplatePlugin)))

        addAngularHTMLConfig(config, ["overrides", indexNumber]);

    }

  }

  /* Add rules at root level */
  if (!tsConfigAdded) {
    addTSConfig(config, [], config.json.rules);
  }

  if (packageJSONConfig) {
    config.raw = modifyJSON(packageJSONConfig.raw, ["eslintConfig"], config.json);
    return saveConfig(cwd, file, packageJSONConfig);
  } else if (file === "eslint.config.js") {
    logWarning(`Your project is using the new eslint.config.js format, and it cannot be overwrited directly, as it could mess up with advanced configuration. So the new strict configuration was saved in eslint.config.json. eslint.config.json is not recognized by ESLint, you need to manually copy the options from eslint.config.json to eslint.config.js. Once done, you can delete eslint.config.json.`);
    return saveConfig(cwd, "eslint.config.json", config);
  } else if (file === ".eslintrc.js") {
    logWarning(`Your project is using the advanced .eslintrc.js format, and it cannot be overwrited directly, as it could mess up with advanced configuration. So the new strict configuration was saved in .eslintrc.json. As .eslintrc.js has precedence over .eslintrc.json, you need to manually copy the options from .eslintrc.json to .eslintrc.js. Once done, you can delete .eslintrc.json.`);
    return saveConfig(cwd, ".eslintrc.json", config);
  } else if (file === ".eslintrc.cjs") {
    logWarning(`Your project is using the advanced .eslintrc.cjs format, and it cannot be overwrited directly, as it could mess up with advanced configuration. So the new strict configuration was saved in .eslintrc.json. As .eslintrc.cjs has precedence over .eslintrc.json, you need to manually copy the options from .eslintrc.json to .eslintrc.cjs. Once done, you can delete .eslintrc.json.`);
    return saveConfig(cwd, ".eslintrc.json", config);
  } else {
    return saveConfig(cwd, file, config);
  }

}

function addTSConfig(config: Config<ESLint>, path: JSONPath, rules?: ESLint["rules"]): void {

  config.raw = modifyJSON(config.raw, [...path, "rules", "eqeqeq"], "error");

  config.raw = modifyJSON(config.raw, [...path, "rules", "prefer-arrow-callback"], "error");

  config.raw = modifyJSON(config.raw, [...path, "rules", "prefer-for-of"], "error");

  config.raw = modifyJSON(config.raw, [...path, "rules", "prefer-template"], "error");

  config.raw = modifyJSON(config.raw, [...path, "rules", "@typescript-eslint/explicit-function-return-type"], ["error", {
    allowExpressions: true
  }]);

  if (Array.isArray(rules?.["@typescript-eslint/no-explicit-any"])) {

    const ruleValue = rules["@typescript-eslint/no-explicit-any"];

    config.raw = modifyJSON(config.raw, [...path, "rules", "@typescript-eslint/no-explicit-any", 0], ["error", {
      ...(ruleValue[1]?.fixToUnknown !== undefined ? { fixToUnknown: ruleValue[1].fixToUnknown } : {}),
    }]);

  } else {
    config.raw = modifyJSON(config.raw, [...path, "rules", "@typescript-eslint/no-explicit-any"], "error");
  }

  config.raw = modifyJSON(config.raw, [...path, "rules", "@typescript-eslint/no-non-null-assertion"], "error");

  config.raw = modifyJSON(config.raw, [...path, "rules", "@typescript-eslint/prefer-nullish-coalescing"], "error");

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

  config.raw = modifyJSON(config.raw, [...path, "rules", "@typescript-eslint/use-unknown-in-catch-callback-variable"], "error");

}

function addAngularHTMLConfig(config: Config<ESLint>, path: JSONPath): void {

  config.raw = modifyJSON(config.raw, [...path, "rules", "@angular-eslint/template/no-any"], "error");

}

function normalizeConfigToArray(config?: string | string[]): string[] {

  return Array.isArray(config) ? config : (config !== undefined ? [config] : []);

}
