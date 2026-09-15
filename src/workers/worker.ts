import Vault from '../lib/Vault';
import VaultSnapshot from '../lib/VaultSnapshot';
import BitcoinPrices from '../lib/BitcoinPrices';
import BitcoinFees from '../lib/BitcoinFees';
import type { VaultRequest, VaultReply } from '../lib/VaultQueue';

const bitcoinPrices = new BitcoinPrices();
const bitcoinFees = new BitcoinFees();

self.addEventListener('message', (event: MessageEvent<VaultRequest>) => {
  const { requestId, startingDate, endingDate, ratchetPct, shorts, bitcoinCount, usdTargetForArgon, argonTargetUpdatedAt } = event.data;
  let reply: VaultReply;
  try {
    const vault = new Vault(startingDate, endingDate, ratchetPct, shorts, bitcoinPrices, bitcoinFees, bitcoinCount, usdTargetForArgon, argonTargetUpdatedAt);
    const snapshot = new VaultSnapshot();
    snapshot.update(vault);
    reply = { requestId, snapshot };
  } catch {
    reply = { requestId, error: 'The calculation could not finish. Please retry.' };
  }
  self.postMessage(reply);
});
