import { Howl } from "howler";
import { AWP_VOLUME, QUACK_VOLUME } from "utils";
import { AWP_URL, QUACK_URL } from "../store/SocketStore/SoundService.constants";

let quackSound: Howl | null = null;
let awpSound: Howl | null = null;

const getQuack = (): Howl => {
  if (!quackSound) {
    quackSound = new Howl({
      src: [QUACK_URL],
      volume: QUACK_VOLUME,
      loop: true,
    });
  }
  return quackSound;
};

const getAwp = (): Howl => {
  if (!awpSound) {
    awpSound = new Howl({
      src: [AWP_URL],
      volume: AWP_VOLUME,
      loop: false,
    });
  }
  return awpSound;
};

export const SoundService = {
  preload(): void {
    getQuack().load();
    getAwp().load();
  },

  playQuackLoop(): void {
    SoundService.stopQuack();
    getQuack().play();
  },

  stopQuack(): void {
    if (quackSound) {
      quackSound.stop();
    }
  },

  playAwp(): void {
    getAwp().play();
  },
};
