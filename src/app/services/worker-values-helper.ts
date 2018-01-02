import {WorkerValue} from '../model/worker-value';

export class WorkerValuesHelper {
  public static ExtractWorkerValues(values: any): WorkerValue[] {
    const miner_hash_rates = new Array<WorkerValue>();
    for (const propertyName of Object.getOwnPropertyNames(values)) {
      const workerValue = new WorkerValue();
      workerValue.Address = propertyName;
      workerValue.Value = values[propertyName];
      miner_hash_rates.push(workerValue);
    }
    return miner_hash_rates;
  }
}
