import {WorkerValue} from './worker-value';

export class LocalStats {
  miner_hash_rates: WorkerValue[];
  miner_last_difficulties: WorkerValue[];
  attempts_to_block: number;
  block_value: number;
  shares: Shares;
  efficiency: number;
  fee: number;
  donation_proportion: number;
}

export class Shares {
  total: number;
  orphan: number;
  dead: number;
}
