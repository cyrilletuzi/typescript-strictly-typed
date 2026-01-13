import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { IndentationText, type ObjectLiteralElementLike, type ObjectLiteralExpression, Project, QuoteKind, ScriptTarget, StructureKind, SyntaxKind } from "ts-morph";
import { checkDependencyVersion, dependencyExists, findConfig, getSource, isAngularESLint } from "./config-utils.js";
import { logWarning } from "./log-utils.js";

function getEslintRules(cwd: string): Record<string, string> {
  return {
    "eqeqeq": `"error"`,
    "prefer-arrow-callback": `"error"`,
    "prefer-template": `"error"`,
    "@typescript-eslint/explicit-function-return-type": `"error"`,
    "@typescript-eslint/no-explicit-any": `"error"`,
    "@typescript-eslint/no-non-null-assertion": `"error"`,
    "@typescript-eslint/no-unsafe-argument": `"error"`,
    "@typescript-eslint/no-unsafe-assignment": `"error"`,
    "@typescript-eslint/no-unsafe-call": `"error"`,
    "@typescript-eslint/no-unsafe-member-access": `"error"`,
    "@typescript-eslint/no-unsafe-return": `"error"`,
    ...(checkDependencyVersion(cwd, "typescript-eslint", ">=8.15.0") || checkDependencyVersion(cwd, "@typescript-eslint/eslint-plugin", ">=8.15.0") ? { "@typescript-eslint/no-unsafe-type-assertion": `"error"` } : {}),
    "@typescript-eslint/prefer-for-of": `"error"`,
    "@typescript-eslint/prefer-nullish-coalescing": `"error"`,
    "@typescript-eslint/prefer-optional-chain": `"error"`,
    "@typescript-eslint/restrict-plus-operands": `["error", {
    allowAny: false,
    allowBoolean: false,
    allowNullish: false,
    allowNumberAndString: false,
    allowRegExp: false,
  }]`,
    "@typescript-eslint/restrict-template-expressions": `"error"`,
    "@typescript-eslint/strict-boolean-expressions": `["error", {
    allowNumber: false,
    allowString: false,
  }]`,
     ...(checkDependencyVersion(cwd, "typescript-eslint", ">=8.53.0") || checkDependencyVersion(cwd, "@typescript-eslint/eslint-plugin", ">=8.53.0") ? { "@typescript-eslint/strict-void-return": `"error"` } : {}),
    "@typescript-eslint/use-unknown-in-catch-callback-variable": `"error"`,
  };
}

export function enableESLintFlatStrict(cwd: string): boolean {

  const fileName = findConfig(cwd, ["eslint.config.mjs", "eslint.config.js"]);

  if (fileName === null) {
    return false;
  }

  const fallbackErrorMessage = `Could not handle ${fileName}, falling back to JSON solution.`;

  try {

    const filePath = join(cwd, fileName);
    const fileContent = getSource(cwd, fileName);

    const quoteMatch = /import .* from (['"])/.exec(fileContent);
    const quote = quoteMatch?.[1] ?? `"`;

    const spacesMatch = /tseslint\.config\(\n(\s)+/.exec(fileContent);
    const spaces = spacesMatch?.[1]?.length ?? 2;

    const project = new Project({
      manipulationSettings: {
        quoteKind: quote === "'" ? QuoteKind.Single : QuoteKind.Double,
        indentationText: spaces === 4 ? IndentationText.FourSpaces : IndentationText.TwoSpaces,
      },
      compilerOptions: {
        target: ScriptTarget.Latest,
      },
      useInMemoryFileSystem: true,
    });

    const source = project.createSourceFile(filePath, fileContent);

    const isCommonJS: boolean = (fileContent.includes("require(") || /require ?['"]/.exec(fileContent) !== null);

    const exportExpression = isCommonJS ?
      /* CommonJS */
      source
        .getChildAtIndexIfKind(0, SyntaxKind.SyntaxList)
        ?.getFirstChildByKind(SyntaxKind.ExpressionStatement)
        ?.getFirstChildByKind(SyntaxKind.BinaryExpression) :
      /* ESM */
      source
        .getChildAtIndexIfKind(0, SyntaxKind.SyntaxList)
        ?.getFirstChildByKind(SyntaxKind.ExportAssignment);

    const configList = exportExpression
      ?.getFirstChildByKind(SyntaxKind.CallExpression)
      ?.getFirstChildByKind(SyntaxKind.SyntaxList);

    const configObjectsCheck = configList
      ?.getChildrenOfKind(SyntaxKind.ObjectLiteralExpression)
      ?? [];

    if (configObjectsCheck.length === 0) {
      configList?.addChildText((writer) => {
        writer.conditionalWrite(configList.getChildAtIndexIfKind(configList.getChildren().length - 1, SyntaxKind.CommaToken) === undefined, ",").newLine().write("{}");
      });
    }

    const configObjects = configList
      ?.getChildrenOfKind(SyntaxKind.ObjectLiteralExpression)
      ?? [];

    const configObject = configObjects.find((config) => getProperty(config, "files")?.getLastChildByKind(SyntaxKind.ArrayLiteralExpression)?.getFullText().includes(".ts") ?? false)
      ?? configObjects.find((config) => getProperty(config, "files") === undefined)
      ?? configObjects[0];

    if (!configObject) {
      logWarning(fallbackErrorMessage);
      return false;
    }

    const rulesProperty = getProperty(configObject, "rules") ?? configObject.addProperty({
      kind: StructureKind.PropertyAssignment,
      name: "rules",
      initializer: "{}",
    });

    const rulesObject = rulesProperty.getFirstChildByKind(SyntaxKind.ObjectLiteralExpression);

    if (!rulesObject) {
      logWarning(fallbackErrorMessage);
      return false;
    }

    const languageOptionsProperty = getProperty(configObject, "languageOptions") ?? configObject.addProperty({
      kind: StructureKind.PropertyAssignment,
      name: "languageOptions",
      initializer: "{}",
    });

    const languageOptionsObject = languageOptionsProperty.getFirstChildByKind(SyntaxKind.ObjectLiteralExpression);

    if (languageOptionsObject) {

      const parserOptionsProperty = getProperty(languageOptionsObject, "parserOptions") ?? languageOptionsObject.addProperty({
        kind: StructureKind.PropertyAssignment,
        name: "parserOptions",
        initializer: "{}",
      });

      const parserOptionsObject = parserOptionsProperty.getFirstChildByKind(SyntaxKind.ObjectLiteralExpression);

      if (parserOptionsObject) {

        const projectProperty = getProperty(parserOptionsObject, "projectService")
          ?? getProperty(parserOptionsObject, "project")
          ?? getProperty(parserOptionsObject, "EXPERIMENTAL_useProjectService");

        if (projectProperty === undefined) {

          const name = checkDependencyVersion(cwd, "typescript-eslint", ">=8.0.0") ?
            "projectService" : "project";

          parserOptionsObject.addProperty({
            kind: StructureKind.PropertyAssignment,
            name,
            initializer: "true",
          });

          const tsconfigProperty = getProperty(languageOptionsObject, "tsconfigRootDir");

          if (tsconfigProperty === undefined) {

            const initializer = isCommonJS ? "__dirname" : "import.meta.dirname";

            parserOptionsObject.addProperty({
              kind: StructureKind.PropertyAssignment,
              name: "tsconfigRootDir",
              initializer,
            });

          }

        }

      }

    }

    for (const [ruleName, ruleErrorConfig] of Object.entries(getEslintRules(cwd))) {

      const ruleProperty = getProperty(rulesObject, ruleName);

      if (ruleProperty) {
        ruleProperty.getLastChild()?.replaceWithText(ruleErrorConfig);
      } else {

        const name = `${quote}${ruleName}${quote}`;
        const spacesReplaceValue = "".padStart(spaces);
        const initializer = ruleErrorConfig
          .replaceAll('"', quote)
          .replaceAll(/\s{2}/g, spacesReplaceValue);

        rulesObject.addProperty({
          kind: StructureKind.PropertyAssignment,
          name,
          initializer,
        });

      }

    }

    if (isAngularESLint(cwd)) {

      const angularConfigObject = configObjects.find((config) => getProperty(config, "files")?.getLastChildByKind(SyntaxKind.ArrayLiteralExpression)?.getFullText().includes(".html") ?? false);

      if (angularConfigObject) {

        const angularRulesProperty = getProperty(angularConfigObject, "rules") ?? angularConfigObject.addProperty({
          kind: StructureKind.PropertyAssignment,
          name: "rules",
          initializer: "{}",
        });

        const angularRulesObject = angularRulesProperty.getFirstChildByKind(SyntaxKind.ObjectLiteralExpression);

        if (angularRulesObject) {

          const ruleName = "@angular-eslint/template/no-any";
          const ruleErrorConfig = `"error"`;
          const ruleProperty = getProperty(angularRulesObject, ruleName);

          if (ruleProperty) {
            ruleProperty.getLastChild()?.replaceWithText(ruleErrorConfig);
          } else {

            const name = `${quote}${ruleName}${quote}`;
            const spacesReplaceValue = "".padStart(spaces);
            const initializer = ruleErrorConfig
              .replaceAll('"', quote)
              .replaceAll(/\s{2}/g, spacesReplaceValue);

            angularRulesObject.addProperty({
              kind: StructureKind.PropertyAssignment,
              name,
              initializer,
            });

          }

        }

      }

    }

    writeFileSync(filePath, source.getFullText());

    if (!dependencyExists(cwd, "typescript-eslint") && !dependencyExists(cwd, "@typescript-eslint/eslint-plugin")) {
      logWarning(`'@typescript-eslint/eslint-plugin' or 'typescript-eslint' dependency must be installed, otherwise rules will not be checked.`);
    }

    return true;

  } catch {
    logWarning(fallbackErrorMessage);
    return false;
  }

}

function getProperty(objectLiteralExpression: ObjectLiteralExpression, propertyName: string): ObjectLiteralElementLike | undefined {
  return objectLiteralExpression.getProperty(propertyName) ??
    objectLiteralExpression.getProperty(`"${propertyName}"`) ??
    objectLiteralExpression.getProperty(`'${propertyName}'`);
}
