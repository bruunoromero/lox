import { TokenType } from "../src/lexer/token";
import { Scanner } from "./../src/lexer/scanner";

describe("Scanner", () => {
  it("Should scan tokens correctly", () => {
    const scanner = new Scanner("while(x > 2) { x = x / 2; }");
    const tokens = scanner.scanTokens();

    const expected = [
      TokenType.WHILE,
      TokenType.LEFT_PAREN,
      TokenType.IDENTIFIER,
      TokenType.GREATER,
      TokenType.NUMBER,
      TokenType.RIGHT_PAREN,
      TokenType.LEFT_BRACE,
      TokenType.IDENTIFIER,
      TokenType.EQUAL,
      TokenType.IDENTIFIER,
      TokenType.SLASH,
      TokenType.NUMBER,
      TokenType.SEMICOLON,
      TokenType.RIGHT_BRACE,
      TokenType.EOF,
    ];

    expect(tokens.map(t => t.type)).toEqual(expected);
  });
});
