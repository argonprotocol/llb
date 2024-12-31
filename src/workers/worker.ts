import Vault from '../lib/Vault';
import VaultSnapshot from '../lib/VaultSnapshot';
import BtcPrices from '../lib/BtcPrices';
import BtcFees from '../lib/BtcFees';

const btcPrices = new BtcPrices();
const btcFees = new BtcFees();

self.addEventListener('message', (event) => {
  const { startingDate, endingDate, ratchetPct, shorts, bitcoinCount } = event.data;
  const vault = new Vault(startingDate, endingDate, ratchetPct, shorts, btcPrices, btcFees, bitcoinCount);
  const snapshot = new VaultSnapshot();
  snapshot.update(vault);
  self.postMessage(snapshot);
});