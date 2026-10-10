// Registro dei microgiochi: id (lo stesso usato in config.js) -> scena.
// Per aggiungerne uno nuovo basta importarlo e metterlo qui.
import { SpinaScene } from './SpinaScene.js';
import { ReGrorioScene } from './ReGrorioScene.js';
import { BarbaScene } from './BarbaScene.js';
import { PaninoScene } from './PaninoScene.js';
import { ManiScene } from './ManiScene.js';
import { SegoScene } from './SegoScene.js';
import { RondaScene } from './RondaScene.js';
import { BlackjackScene } from './BlackjackScene.js';
import { PalleggiScene } from './PalleggiScene.js';
import { PassaseoScene } from './PassaseoScene.js';
import { BotaScene } from './BotaScene.js';

export const MICROGIOCHI = {
  spina: SpinaScene,
  regrorio: ReGrorioScene,
  barba: BarbaScene,
  panino: PaninoScene,
  mani: ManiScene,
  sego: SegoScene,
  ronda: RondaScene,
  blackjack: BlackjackScene,
  palleggi: PalleggiScene,
  passaseo: PassaseoScene,
  bota: BotaScene,
};
