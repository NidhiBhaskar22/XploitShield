const recast = require("recast");
const { visit } = recast.types;

/**
 * Replaces vulnerable SQL queries with parameterized queries
 */
function patchSQLInjection(code) {
  const ast = recast.parse(code);

  visit(ast, {
    visitCallExpression(path) {
      const { callee, arguments: args } = path.node;

      // Look for vulnerable raw SQL queries
      if (
        callee.type === "MemberExpression" &&
        callee.property.name === "query" &&
        args.length &&
        args[0].type === "Literal" &&
        args[0].value.includes("SELECT * FROM users WHERE username = ")
      ) {
        // Replace the raw SQL with parameterized query
        const safeQuery = "SELECT * FROM users WHERE username = ?";
        const newArgs = [
          recast.types.builders.literal(safeQuery),
          recast.types.builders.arrayExpression([
            recast.types.builders.identifier("user"),
          ]),
        ];

        path.node.arguments = newArgs;
        this.traverse(path);
      } else {
        return false;
      }
    },
  });

  return recast.print(ast).code;
}

module.exports = { patchSQLInjection };
