import * as Vue from 'vue';
import VaultSnapshot from './VaultSnapshot';
import VaultWorker from '../workers/worker.ts?worker';
import { IShort, IClonableShort } from './Vault';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);


type VaultQueuePayload = {
  startingDate: string;
  endingDate: string;
  ratchetPct: number;
  shorts: IClonableShort[];
  bitcoinCount: number;
};

export default class VaultQueue {
  private vaultSnapshot: Vue.Ref<VaultSnapshot>;
  private worker = new VaultWorker();
  private pending: VaultQueuePayload[] = [];
  private isProcessing = false;

  constructor(vaultSnapshot: Vue.Ref<VaultSnapshot>) {
    this.vaultSnapshot = vaultSnapshot;

    this.worker.onmessage = (event) => {
      this.vaultSnapshot.value = event.data;
      this.isProcessing = false;
      this.processNext();
    };
  }

  public add(startingDate: string, endingDate: string, ratchetPct: number, shorts: IShort[], bitcoinCount: number) {
    const clonableShorts = shorts.map(this.cloneShort);
    this.pending.push({ startingDate, endingDate, ratchetPct, shorts: clonableShorts, bitcoinCount });
    this.processNext();
  }

  private processNext() {
    if (this.pending.length === 0) return;
    if (this.isProcessing) return;

    this.isProcessing = true;
    this.vaultSnapshot.value.isLoaded = false;
    const lastPayload = this.pending.pop()!;
    this.pending = [];

    this.worker.postMessage(lastPayload);
  }

  private cloneShort(short: IShort): IClonableShort {
    return { ...short, date: short.date === 'EXIT' ? 'EXIT' : dayjs.utc(short.date).format('YYYY-MM-DD') };
  }
}
