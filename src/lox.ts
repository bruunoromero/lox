import { Token, TokenType } from "./lexer/token";
import { Scanner } from "./lexer/scanner";
export class Lox {
  static hadError = false;

  static error(line: number, message: string) {
    this.report(line, "", message);
  }

  static errorFrom(token: Token, message: string) {
    if (token.type === TokenType.EOF) {
      this.report(token.line, " at end", message);
    } else {
      this.report(token.line, " at '" + token.lexeme + "'", message);
    }
  }

  static report(line: number, where: string, message: string) {
    console.error(`[line ${line}] Error ${where}: ${message}`);
    this.hadError = true;
  }

  static main() {
    const args = process.argv.slice(2);

    if (args.length > 1) {
      console.log("Usage: lox [script]");
      process.exit(64);
    } else if (args.length === 1) {
      this.runFile(args[0]);
    } else {
      this.runPrompt();
    }
  }

  static run(source: string) {
    const scanner = new Scanner(source);
    const tokens = scanner.scanTokens();

    tokens.forEach(t => console.log(t));
  }

  private static runFile(file: string) {}

  private static runPrompt() {
    process.stdin.on("data", data => {
      console.log("> ");
      this.run(data.toString("utf8"));
    });
  }
}
