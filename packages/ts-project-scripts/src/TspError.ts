export class TspError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TspError";
  }
}
