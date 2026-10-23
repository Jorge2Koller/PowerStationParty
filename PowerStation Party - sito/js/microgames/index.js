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
import { GuidaScene } from './GuidaScene.js';
import { PiovraScene } from './PiovraScene.js';
import { ScapoliScene } from './ScapoliScene.js';
import { RetromarciaScene } from './RetromarciaScene.js';
import { BeerpongScene } from './BeerpongScene.js';
import { XfactorScene } from './XfactorScene.js';
import { PizzaScene } from './PizzaScene.js';
import { BallataScene } from './BallataScene.js';
import { ProverbiScene } from './ProverbiScene.js';
import { ScontrinoScene } from './ScontrinoScene.js';
import { BarattiScene } from './BarattiScene.js';

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
  guida: GuidaScene,
  piovra: PiovraScene,
  scapoli: ScapoliScene,
  retromarcia: RetromarciaScene,
  beerpong: BeerpongScene,
  xfactor: XfactorScene,
  pizza: PizzaScene,
  ballata: BallataScene,
  proverbi: ProverbiScene,
  scontrino: ScontrinoScene,
  baratti: BarattiScene,
};
