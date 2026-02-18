declare module "howler" {
  export class Howl {
    constructor(options: {
      src: string | string[];
      volume?: number;
      loop?: boolean;
    });
    play(): number;
    stop(): void;
    load(): void;
  }
}
