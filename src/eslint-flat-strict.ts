import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { IndentationText, ObjectLiteralExpression, Project, QuoteKind, ScriptTarget, StructureKind, SyntaxKind, type ObjectLiteralElementLike } from "ts-morph";
import { findConfig, getSource } from "./config-utils.js";
import { logWarning } from "./log-utils.js";

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
  allowString: false,
}]`,
  "@typescript-eslint/use-unknown-in-catch-callback-variable": `"error"`,
};

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

    const exportExpression = (fileContent.includes(`require(`) || /require ?['"]/.exec(fileContent)) ?
      /* CommonJS */
      source
        .getChildAtIndexIfKind(0, SyntaxKind.SyntaxList)
        ?.getFirstChildByKind(SyntaxKind.ExpressionStatement)
        ?.getFirstChildByKind(SyntaxKind.BinaryExpression) :
      /* ESM */
      source
        .getChildAtIndexIfKind(0, SyntaxKind.SyntaxList)
        ?.getFirstChildByKind(SyntaxKind.ExportAssignment);

    const configObjects = exportExpression
      ?.getFirstChildByKind(SyntaxKind.CallExpression)
      ?.getFirstChildByKind(SyntaxKind.SyntaxList)
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
    }) as ObjectLiteralElementLike;

    const rulesObject = rulesProperty.getFirstChildByKind(SyntaxKind.ObjectLiteralExpression);

    if (!rulesObject) {
      logWarning(fallbackErrorMessage);
      return false;
    }

    for (const [ruleName, ruleErrorConfig] of Object.entries(eslintRules)) {

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

    writeFileSync(filePath, source.getFullText());

    return true;

  } catch (error) {
    console.log(error);
    logWarning(fallbackErrorMessage);
    return false;
  }

}

function getProperty(objectLiteralExpression: ObjectLiteralExpression, propertyName: string): ObjectLiteralElementLike | undefined {
  return objectLiteralExpression.getProperty(propertyName) ??
    objectLiteralExpression.getProperty(`"${propertyName}"`) ??
    objectLiteralExpression.getProperty(`'${propertyName}'`);
}