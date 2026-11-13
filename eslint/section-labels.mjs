// Lint rule that keeps components in the section order from CLAUDE.md ("Component structure")

// constants - the section labels, in the required order
const ORDER = [
  "imports",
  "types",
  "constants",
  "helper functions",
  "global states",
  "states",
  "refs",
  "custom hooks",
  "handlers",
  "effects",
  "return",
];
const LONGEST_FIRST = [...ORDER].sort((a, b) => b.length - a.length);
const FUNCTION_TYPES = new Set([
  "ArrowFunctionExpression",
  "FunctionExpression",
]);

// helper functions
function labelOf(comment) {
  if (comment.type !== "Line") return null;
  const text = comment.value.trim();
  return (
    LONGEST_FIRST.find(
      (label) => text === label || text.startsWith(`${label} `),
    ) ?? null
  );
}

function isPascalCase(name) {
  return typeof name === "string" && /^[A-Z]/.test(name);
}

// Name of the function being called, including React.useState-style calls
function calleeName(call) {
  if (call.callee.type === "Identifier") return call.callee.name;
  if (
    call.callee.type === "MemberExpression" &&
    call.callee.property.type === "Identifier"
  ) {
    return call.callee.property.name;
  }
  return null;
}

function calledName(node) {
  const call = node?.type === "AwaitExpression" ? node.argument : node;
  return call?.type === "CallExpression" ? calleeName(call) : null;
}

// Finds the component function inside wrappers like memo(...) or withSomething(...)
function unwrapComponent(node) {
  if (FUNCTION_TYPES.has(node?.type)) return node;
  if (node?.type !== "CallExpression") return null;
  for (const argument of node.arguments) {
    const found = unwrapComponent(argument);
    if (found) return found;
  }
  return null;
}

function isClassComponent(node) {
  const parent = node.superClass;
  const name =
    parent?.type === "Identifier"
      ? parent.name
      : parent?.type === "MemberExpression"
        ? parent.property.name
        : null;
  return name === "Component" || name === "PureComponent";
}

function hookSection(name) {
  if (!name || !/^use[A-Z]/.test(name)) return null;
  if (name === "useState" || name === "useReducer") return "states";
  if (name === "useRef") return "refs";
  if (["useEffect", "useLayoutEffect", "useInsertionEffect"].includes(name))
    return "effects";
  if (name === "useCallback") return "handlers";
  if (name === "useMemo") return null;
  if (/Store$/.test(name)) return "global states";
  return "custom hooks";
}

// Which section a statement directly inside a component belongs to (null = no label needed)
function componentSection(statement) {
  if (statement.type === "ReturnStatement") return "return";
  if (statement.type === "FunctionDeclaration") return "handlers";
  if (statement.type === "ExpressionStatement")
    return hookSection(calledName(statement.expression));
  if (
    statement.type === "VariableDeclaration" &&
    statement.declarations.length === 1
  ) {
    const init = statement.declarations[0].init;
    if (FUNCTION_TYPES.has(init?.type)) return "handlers";
    return hookSection(calledName(init));
  }
  return null;
}

// Returns the component function if this top-level declaration defines one (isDefault = export default)
function componentOf(declaration, isDefault = false) {
  if (!declaration) return null;
  if (declaration.type === "FunctionDeclaration") {
    return isPascalCase(declaration.id?.name) || !declaration.id
      ? declaration
      : null;
  }
  if (
    declaration.type === "VariableDeclaration" &&
    declaration.declarations.length === 1
  ) {
    const { id, init } = declaration.declarations[0];
    return isPascalCase(id.name) ? unwrapComponent(init) : null;
  }
  return isDefault ? unwrapComponent(declaration) : null;
}

// Which section a top-level statement belongs to (null = no label needed)
function topLevelSection(statement) {
  if (statement.type === "ImportDeclaration") return "imports";
  if (
    statement.type === "TSTypeAliasDeclaration" ||
    statement.type === "TSInterfaceDeclaration"
  ) {
    return "types";
  }
  if (statement.type === "ExportNamedDeclaration") {
    const type = statement.declaration?.type;
    return type === "TSTypeAliasDeclaration" ||
      type === "TSInterfaceDeclaration"
      ? "types"
      : null;
  }
  if (statement.type === "FunctionDeclaration")
    return componentOf(statement) ? null : "helper functions";
  if (
    statement.type === "VariableDeclaration" &&
    statement.declarations.length === 1
  ) {
    if (componentOf(statement)) return null;
    if (FUNCTION_TYPES.has(statement.declarations[0].init?.type))
      return "helper functions";
    return statement.kind === "const" ? "constants" : null;
  }
  return null;
}

const sectionLabels = {
  rules: {
    "require-section-labels": {
      meta: {
        type: "suggestion",
        schema: [],
        messages: {
          missing:
            'Add a "// {{section}}" label above this code (see "Component structure" in CLAUDE.md).',
          wrong:
            'This is {{section}} code, but it sits under "// {{label}}"; move it or add a "// {{section}}" label (see CLAUDE.md).',
          order:
            '"// {{label}}" must come before "// {{previous}}" (section order in CLAUDE.md).',
          classComponent:
            "Use a function component instead of a class (React recommends functions; Next.js error.tsx handles error boundaries).",
          forwardRef:
            "forwardRef is not needed in React 19: accept ref as a normal prop instead.",
        },
      },
      create(context) {
        const functionBodies = [];

        // Finds the function body a comment sits in (null = top level of the file)
        function ownerOf(comment) {
          let owner = null;
          for (const body of functionBodies) {
            const inside =
              body.range[0] < comment.range[0] &&
              comment.range[1] < body.range[1];
            if (inside && (!owner || body.range[0] > owner.range[0]))
              owner = body;
          }
          return owner;
        }

        function checkScope(scopeBody, statements, sectionOf, labels) {
          const reported = new Set();
          let previous = null;
          for (const { comment, label } of labels) {
            if (previous && ORDER.indexOf(label) < ORDER.indexOf(previous)) {
              context.report({
                loc: comment.loc,
                messageId: "order",
                data: { label, previous },
              });
            } else {
              previous = label;
            }
          }
          for (const statement of statements) {
            const section = sectionOf(statement);
            if (!section || reported.has(section)) continue;
            const above = labels
              .filter(({ comment }) => comment.range[1] <= statement.range[0])
              .at(-1);
            if (above?.label === section) continue;
            reported.add(section);
            context.report({
              node: statement,
              messageId: above ? "wrong" : "missing",
              data: { section, label: above?.label },
            });
          }
        }

        return {
          ":function"(node) {
            if (node.body?.type === "BlockStatement")
              functionBodies.push(node.body);
          },
          "ClassDeclaration, ClassExpression"(node) {
            if (isClassComponent(node)) {
              context.report({ node, messageId: "classComponent" });
            }
          },
          CallExpression(node) {
            if (calleeName(node) === "forwardRef") {
              context.report({ node, messageId: "forwardRef" });
            }
          },
          "Program:exit"(program) {
            const labels = context.sourceCode
              .getAllComments()
              .map((comment) => ({
                comment,
                label: labelOf(comment),
                owner: ownerOf(comment),
              }))
              .filter(({ label }) => label);

            checkScope(
              null,
              program.body,
              topLevelSection,
              labels.filter(({ owner }) => owner === null),
            );

            for (const statement of program.body) {
              const declaration =
                statement.type === "ExportNamedDeclaration" ||
                statement.type === "ExportDefaultDeclaration"
                  ? statement.declaration
                  : statement;
              const component = componentOf(
                declaration,
                statement.type === "ExportDefaultDeclaration",
              );
              if (component?.body?.type !== "BlockStatement") continue;
              checkScope(
                component.body,
                component.body.body,
                componentSection,
                labels.filter(({ owner }) => owner === component.body),
              );
            }
          },
        };
      },
    },
  },
};

export default sectionLabels;
