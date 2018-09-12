import { Expr, Literal, Grouping, Unary, Binary } from "./ast";
import { Token, TokenType } from "./../lexer/token";
import { Lox } from "../lox";

export class Parser {
  current: number;

  constructor(public readonly tokens: Token[]) {
    this.current = 0;
  }

  parser(): Expr | null {
    try {
      return this.expression();
    } catch (error) {
      return null;
    }
  }

  private expression(): Expr {
    return this.equality();
  }

  private equality(): Expr {
    let expr = this.comparasion();

    while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
      const operator = this.previous;
      const right = this.comparasion();

      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private comparasion(): Expr {
    let expr = this.addition();

    while (
      this.match(
        TokenType.LESS,
        TokenType.GREATER,
        TokenType.LESS_EQUAL,
        TokenType.GREATER_EQUAL,
      )
    ) {
      const operator = this.previous;
      const right = this.addition();

      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private addition(): Expr {
    let expr = this.multiplication();

    while (this.match(TokenType.PLUS, TokenType.MINUS)) {
      const operator = this.previous;
      const right = this.multiplication();

      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private multiplication(): Expr {
    let expr = this.unary();

    while (this.match(TokenType.STAR, TokenType.SLASH)) {
      const operator = this.previous;
      const right = this.unary();

      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private unary(): Expr {
    if (this.match(TokenType.MINUS, TokenType.BANG)) {
      const operator = this.previous;
      const expr = this.primary();

      return new Unary(operator, expr);
    }

    return this.primary();
  }

  private primary(): Expr {
    if (this.match(TokenType.NIL)) return new Literal(null);
    if (this.match(TokenType.TRUE)) return new Literal(true);
    if (this.match(TokenType.FALSE)) return new Literal(false);

    if (this.match(TokenType.STRING, TokenType.NUMBER)) {
      return new Literal(this.previous.literal);
    }

    if (this.match(TokenType.LEFT_PAREN)) {
      const expr = this.expression();
      this.consume(TokenType.RIGHT_PAREN, "Expected ')' after expression.");
      return new Grouping(expr);
    }

    throw this.error(this.peek, "Expect expression.");
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }

    return false;
  }

  private advance() {
    if (!this.isEnd) this.current++;
    return this.previous;
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();

    throw this.error(this.peek, message);
  }

  private check(type: TokenType): boolean {
    if (this.isEnd) return false;
    return this.peek.type === type;
  }

  private get peek(): Token {
    return this.tokens[this.current];
  }

  private get previous(): Token {
    return this.tokens[this.current - 1];
  }

  private get isEnd(): boolean {
    return this.peek.type === TokenType.EOF;
  }

  private error(token: Token, message: string) {
    Lox.errorFrom(token, message);
    return new Error();
  }
}
