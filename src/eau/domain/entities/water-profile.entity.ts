import { WaterConformity } from '../enums/water-conformity.enum';
import { WaterProviderKey } from '../enums/water-provider-key.enum';

export interface WaterMineralsMgL {
  readonly ca: number | null;
  readonly mg: number | null;
  readonly cl: number | null;
  readonly so4: number | null;
  readonly hco3: number | null;
}

export interface WaterProfileEntityProps {
  readonly provider: WaterProviderKey;
  readonly codeInsee: string;
  readonly annee: number;
  readonly nomReseau: string | null;
  readonly nbPrelevements: number;
  readonly conformite: WaterConformity;
  readonly minerauxMgL: WaterMineralsMgL;
  readonly dureteFrancais: number | null;
}

export class WaterProfileEntity {
  readonly provider: WaterProviderKey;
  readonly codeInsee: string;
  readonly annee: number;
  readonly nomReseau: string | null;
  readonly nbPrelevements: number;
  readonly conformite: WaterConformity;
  readonly minerauxMgL: WaterMineralsMgL;
  readonly dureteFrancais: number | null;

  constructor(props: WaterProfileEntityProps) {
    this.provider = props.provider;
    this.codeInsee = props.codeInsee;
    this.annee = props.annee;
    this.nomReseau = props.nomReseau;
    this.nbPrelevements = props.nbPrelevements;
    this.conformite = props.conformite;
    this.minerauxMgL = props.minerauxMgL;
    this.dureteFrancais = props.dureteFrancais;
  }
}
