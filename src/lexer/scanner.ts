import { Map } from "immutable";
import { Token, TokenType } from "./token";

export class Scanner {
  private line: number;
  private start: number;
  private current: number;
  private tokens: Token[];
  private typeMap: Map<string, () => void>;

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
      " ": this.noop,
      "\r": this.noop,
      "\t": this.noop,
      '"': this.string,
      "\n": this.newLine,
      "/": this.surmiseSlash,
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
    // TODO: Check if c is a digit and parse a number if so.
    const tokenize = this.typeMap.get(c);

    if (tokenize) {
      tokenize();
    }
  }

  private newLine() {
    this.line++;
  }

  private string() {
    while (this.peek() !== '"' && !this.isEnd) {
      if (this.peek() === "\n") this.newLine();
      this.advance();
    }

    // Unterminated string.
    if (this.isEnd) {
      // Lox.error(line, "Unterminated string.");
    }

    // The closing ".
    this.advance();

    // Trim the surrounding quotes.
    const value = this.source.substring(this.start + 1, this.current - 1);
    this.addToken(TokenType.STRING, value);
  }

  private surmiseSlash() {
    if (this.match("/")) {
      while (this.peek() !== "\n" && !this.isEnd) this.advance();
    } else {
      this.addToken(TokenType.SLASH);
    }
  }

  private addToken(type: TokenType, literal: any = null) {
    if (type !== TokenType.SKIP) {
      const text = this.source.substring(this.start, this.current);
      this.tokens.push(new Token(type, text, literal, this.line));
    }
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

  private peek(): string {
    if (this.isEnd) return "\0";
    return this.source[this.current];
  }

  private get isEnd(): boolean {
    return this.current >= this.source.length;
  }
}
