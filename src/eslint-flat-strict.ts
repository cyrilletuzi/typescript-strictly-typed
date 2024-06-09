import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { ObjectLiteralExpression, Project, ScriptTarget, StructureKind, SyntaxKind, type ObjectLiteralElementLike } from "ts-morph";
import { findConfig, getSource } from "./config-utils.js";

const eslintRules: Record<string, string> = {
  "eqeqeq": `"error"`,
  "prefer-arrow-callback": `"error"`,
  "prefer-template": `"error"`,
  "@typescript-eslint/no-explicit-any": `"error"`,
  "@typescript-eslint/no-non-null-assertion": `"error"`,
  "@typescript-eslint/no-unsafe-argument": `"error"`,
  "@typescript-eslint/no-unsafe-assignment": `"error"`,
  "@typescript-eslint/no-unsafe-call": `"error"`,
  "@typescript-eslint/no-unsafe-member-access": `"error"`,
  "@typescript-eslint/no-unsafe-return": `"error"`,
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
    allowString: false
  }]`,
  "@typescript-eslint/use-unknown-in-catch-callback-variable": `"error"`,
};

export function enableESLintFlatStrict(cwd: string): boolean {

  const fileName = findConfig(cwd, ["eslint.config.mjs", "eslint.config.js"]);

  if (fileName === null) {
    return false;
  }

  const filePath = join(cwd, fileName);

  const fileContent = getSource(cwd, fileName);

  const project = new Project({
    manipulationSettings: {
      // quoteKind: this.quote === "'" ? QuoteKind.Single : QuoteKind.Double,

    },
    compilerOptions: {
      target: ScriptTarget.Latest,
    },
    useInMemoryFileSystem: true,
    // skipLoadingLibFiles: true,
  });

  const source = project.createSourceFile(filePath, fileContent);

  const sourceRootNode = source.getChildAtIndexIfKind(0, SyntaxKind.SyntaxList);

  if (!sourceRootNode) {
    return false;
  }

  const sourceExport = sourceRootNode.getFirstChildByKind(SyntaxKind.ExportAssignment);

  if (!sourceExport) {
    return false;
  }

  const exportExpression = sourceExport.getFirstChildByKind(SyntaxKind.CallExpression);

  if (!exportExpression) {
    return false;
  }

  const exportExpressionList = exportExpression.getFirstChildByKind(SyntaxKind.SyntaxList);

  if (!exportExpressionList) {
    return false;
  }

  const configObjects = exportExpressionList.getChildrenOfKind(SyntaxKind.ObjectLiteralExpression);

  const configObject = configObjects.find((config) => getProperty(config, "files")?.getLastChildByKind(SyntaxKind.ArrayLiteralExpression)?.getFullText().includes(".ts") ?? false)
    ?? configObjects.find((config) => getProperty(config, "files") === undefined)
    ?? configObjects[0];

  if (!configObject) {
    return false;
  }

  const rulesProperty = getProperty(configObject, "rules") ?? configObject.addProperty({
    kind: StructureKind.PropertyAssignment,
    name: "rules",
    initializer: "{}",
  }) as ObjectLiteralElementLike;

  const rulesObject = rulesProperty.getFirstChildByKind(SyntaxKind.ObjectLiteralExpression);

  if (!rulesObject) {
    return false;
  }

  for (const [ruleName, ruleErrorConfig] of Object.entries(eslintRules)) {

    const ruleProperty = getProperty(rulesObject, ruleName);

    try {

      if (ruleProperty) {
        ruleProperty.getLastChild()?.replaceWithText(ruleErrorConfig);
      } else {
        rulesObject.addProperty({
          kind: StructureKind.PropertyAssignment,
          name: `"${ruleName}"`,
          initializer: ruleErrorConfig,
        });
      }

    } catch (error) {
      console.log(error);
    }

  }

  writeFileSync(filePath, source.getFullText());

  return true;

}

function getProperty(objectLiteralExpression: ObjectLiteralExpression, propertyName: string): ObjectLiteralElementLike | undefined {
  return objectLiteralExpression.getProperty(propertyName) ??
    objectLiteralExpression.getProperty(`"${propertyName}"`) ??
    objectLiteralExpression.getProperty(`"${propertyName}"`);
}