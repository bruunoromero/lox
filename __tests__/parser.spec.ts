import { Scanner } from "../src/lexer/scanner";
import { Parser } from "./../src/parser/parser";
import { TokenType } from "./../src/lexer/token";

describe("Parser", () => {
  it("Should parser correctly", () => {
    const scanner = new Scanner("1 + 2 * 3 + (1 / 2)");
    const tokens = scanner.scanTokens();
    const parser = new Parser(tokens);
    const expr: any = parser.parser();

    expect(expr.left.left.value).toBe(1);
    expect(expr.left.operator.type).toBe(TokenType.PLUS);
    expect(expr.left.right.left.value).toBe(2);
    expect(expr.left.right.operator.type).toBe(TokenType.STAR);
    expect(expr.left.right.right.value).toBe(3);
    expect(expr.right.expression.left.value).toBe(1);
    expect(expr.right.expression.operator.type).toBe(TokenType.SLASH);
    expect(expr.right.expression.right.value).toBe(2);
  });
});
