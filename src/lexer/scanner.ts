import { Map } from "immutable";

import { Lox } from "../lox";
import { Token, TokenType } from "./token";

const KEYWORDS = Map({
  and: TokenType.AND,
  class: TokenType.CLASS,
  else: TokenType.ELSE,
  false: TokenType.FALSE,
  for: TokenType.FOR,
  fun: TokenType.FUN,
  if: TokenType.IF,
  nil: TokenType.NIL,
  or: TokenType.OR,
  print: TokenType.PRINT,
  return: TokenType.RETURN,
  super: TokenType.SUPER,
  this: TokenType.THIS,
  true: TokenType.TRUE,
  var: TokenType.VAR,
  while: TokenType.WHILE,
});

export class Scanner {
  private line: number;
  private start: number;
  private current: number;
  private tokens: Token[];
  private readonly typeMap: Map<string, () => void>;

  constructor(private readonly source: string) {
    this.line = 1;
    this.start = 0;
    this.tokens = [];
    this.current = 0;

    this.typeMap = Map({
      "(": () => this.addToken(TokenType.LEFT_PAREN),
      ")": () => this.addToken(TokenType.RIGHT_PAREN),
      "{": () => this.addToken(TokenType.LEFT_BRACE),
      "}": () => this.addToken(TokenType.RIGHT_BRACE),
      ",": () => this.addToken(TokenType.COMMA),
      ".": () => this.addToken(TokenType.DOT),
      "-": () => this.addToken(TokenType.MINUS),
      "+": () => this.addToken(TokenType.PLUS),
      ";": () => this.addToken(TokenType.SEMICOLON),
      "*": () => this.addToken(TokenType.STAR),
      "!": () =>
        this.addToken(this.match("=") ? TokenType.BANG_EQUAL : TokenType.EQUAL),
      "=": () =>
        this.addToken(
          this.match("=") ? TokenType.EQUAL_EQUAL : TokenType.EQUAL,
        ),
      "<": () =>
        this.addToken(this.match("=") ? TokenType.LESS_EQUAL : TokenType.LESS),
      ">": () =>
        this.addToken(
          this.match("=") ? TokenType.GREATER_EQUAL : TokenType.GREATER,
        ),
      '"': () => this.string(),
      "\n": () => this.newLine(),
      "/": () => this.surmiseSlash(),
    });
  }

  static fromFile(): Scanner {
    return new Scanner("");
  }

  private noop() {}

  public scanTokens(): Token[] {
    while (!this.isEnd) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push(new Token(TokenType.EOF, "", null, this.line));
    return this.tokens;
  }

  private scanToken() {
    const c = this.advance();

    if (this.isDigit(c)) {
      this.number();
    } else if (this.isAlpha(c)) {
      this.identifier();
    } else if (!/\r|\t/.test(c)) {
      const tokenize = this.typeMap.get(c);

      if (tokenize) {
        tokenize();
      }
    }
  }

  private newLine() {
    this.line++;
  }

  private identifier() {
    while (this.isAlphaNumeric(this.peek)) this.advance();

    const text = this.source.slice(this.start, this.current);
    const type = KEYWORDS.get(text) || TokenType.IDENTIFIER;

    this.addToken(type);
  }

  private string() {
    while (this.peek !== '"' && !this.isEnd) {
      if (this.peek === "\n") this.newLine();
      this.advance();
    }

    // Unterminated string.
    if (this.isEnd) {
      Lox.error(this.line, "Unterminated string.");
    }

    this.advance();

    const value = this.source.slice(this.start + 1, this.current - 1);
    this.addToken(TokenType.STRING, value);
  }

  private number() {
    while (this.isDigit(this.peek)) this.advance();

    if (this.peek === "." && this.isDigit(this.peekNext)) {
      this.advance();
      while (this.isDigit(this.peek)) this.advance();
    }

    this.addToken(
      TokenType.NUMBER,
      Number(this.source.slice(this.start, this.current)),
    );
  }

  private surmiseSlash() {
    if (this.match("/")) {
      while (this.peek !== "\n" && !this.isEnd) this.advance();
    } else {
      this.addToken(TokenType.SLASH);
    }
  }

  private isAlpha(c: string): boolean {
    return /[a-zA-Z_]/.test(c);
  }

  private isDigit(c: string): boolean {
    return !/\s/.test(c) && !isNaN(Number(c));
  }

  private isAlphaNumeric(c: string): boolean {
    return this.isDigit(c) || this.isAlpha(c);
  }

  private addToken(type: TokenType, literal: any = null) {
    const text = this.source.slice(this.start, this.current);
    this.tokens.push(new Token(type, text, literal, this.line));
  }

  private match(expected: string): boolean {
    if (this.isEnd) return false;
    if (this.source[this.current] !== expected) return false;

    this.advance();
    return true;
  }

  private advance() {
    this.current++;
    return this.source[this.current - 1];
  }

  private get peek(): string {
    if (this.isEnd) return "\0";
    return this.source[this.current];
  }

  private get peekNext(): string {
    if (this.current + 1 >= this.source.length) return "\0";
    return this.source[this.current + 1];
  }

  private get isEnd(): boolean {
    return this.current >= this.source.length;
  }
}
