import Vault from '../lib/Vault';
import VaultSnapshot from '../lib/VaultSnapshot';
import BitcoinPrices from '../lib/BitcoinPrices';
import BitcoinFees from '../lib/BitcoinFees';

const bitcoinPrices = new BitcoinPrices();
const bitcoinFees = new BitcoinFees();

self.addEventListener('message', (event) => {
  const { startingDate, endingDate, ratchetPct, shorts, bitcoinCount } = event.data;
  const vault = new Vault(startingDate, endingDate, ratchetPct, shorts, bitcoinPrices, bitcoinFees, bitcoinCount);
  const snapshot = new VaultSnapshot();
  snapshot.update(vault);
  self.postMessage(snapshot);
});
