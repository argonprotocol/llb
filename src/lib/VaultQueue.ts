import type VaultSnapshot from './VaultSnapshot';
import type { IClonableShort } from './Vault';

export type CalculationState = 'idle' | 'pending' | 'ready' | 'error';
export type VaultInputs = {
  startingDate: string; endingDate: string; ratchetPct: number;
  shorts: IClonableShort[]; bitcoinCount: number;
  usdTargetForArgon: number; argonTargetUpdatedAt: string;
};
export type VaultRequest = VaultInputs & { requestId: number };
export type VaultReply = { requestId: number; snapshot?: VaultSnapshot; error?: string };
export interface VaultWorkerPort {
  onmessage: ((event: MessageEvent<VaultReply>) => void) | null;
  onerror: ((event: ErrorEvent) => void) | null;
  postMessage(message: VaultRequest): void;
  terminate(): void;
}
type Scheduler = { schedule: (callback: () => void) => number; cancel: (id: number) => void };

export default class VaultQueue {
  private worker: VaultWorkerPort | null = null;
  private pending: VaultRequest | null = null;
  private inFlight: VaultRequest | null = null;
  private frame: number | null = null;
  private latestId = 0;
  private disposed = false;

  constructor(
    private createWorker: () => VaultWorkerPort,
    private complete: (snapshot: VaultSnapshot) => void,
    private stateChanged: (state: CalculationState, error?: string) => void,
    private scheduler: Scheduler = { schedule: callback => requestAnimationFrame(callback), cancel: id => cancelAnimationFrame(id) },
  ) {}
  public add(inputs: VaultInputs) {
    const request: VaultRequest = { ...inputs, shorts: inputs.shorts.map(short => ({ ...short })), requestId: ++this.latestId };
    this.pending = request;
    this.stateChanged('pending');
    this.scheduleNext();
    return request.requestId;
  }
  private scheduleNext() {
    if (this.disposed || this.inFlight || this.frame !== null || !this.pending) return;
    this.frame = this.scheduler.schedule(() => {
      this.frame = null;
      const request = this.pending;
      if (!request || this.disposed) return;
      this.pending = null;
      this.inFlight = request;
      try {
        if (!this.worker) {
          this.worker = this.createWorker();
          this.worker.onmessage = event => this.receive(event.data);
          this.worker.onerror = () => this.failed('The calculation could not finish. Please retry.');
        }
        this.worker.postMessage(request);
      } catch { this.failed('The calculation could not start. Please retry.'); }
    });
  }
  private receive(reply: VaultReply) {
    if (this.disposed || reply.requestId !== this.inFlight?.requestId) return;
    const request = this.inFlight;
    this.inFlight = null;
    if (reply.requestId === this.latestId) {
      if (reply.error || !reply.snapshot) this.stateChanged('error', reply.error || 'The calculation returned no result.');
      else {
        this.complete(Object.assign(reply.snapshot, { isLoaded: true, requestId: request.requestId, inputs: request }));
        this.stateChanged('ready');
      }
    }
    this.scheduleNext();
  }
  private failed(message: string) {
    this.worker?.terminate();
    this.worker = null;
    const failedId = this.inFlight?.requestId;
    this.inFlight = null;
    if (failedId === this.latestId) this.stateChanged('error', message);
    this.scheduleNext();
  }
  public dispose() {
    this.disposed = true;
    if (this.frame !== null) this.scheduler.cancel(this.frame);
    this.worker?.terminate();
    this.pending = null;
    this.inFlight = null;
  }
}
