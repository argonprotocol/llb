import Vault from '../lib/Vault';
import VaultSnapshot from '../lib/VaultSnapshot';
import API from '../lib/API';
import BtcPrices from '../lib/BtcPrices';
import BtcFees from '../lib/BtcFees';

const btcPrices = new BtcPrices();
const btcFees = new BtcFees(btcPrices);
const loadPromise = loadData();

async function loadData() {
  const [a, b] = await Promise.all([
    API.fetchSimulationData('bitcoinPrices'),
    API.fetchSimulationData('bitcoinFeesPerTransaction')
  ]);
  btcPrices.load(a);
  btcFees.load(b);
}

self.addEventListener('message', async (event) => {
  await loadPromise;
  const { startingDate, endingDate, ratchetPct, shorts, bitcoinCount } = event.data;
  const vault = new Vault(startingDate, endingDate, ratchetPct, shorts, btcPrices, btcFees, bitcoinCount);
  const snapshot = new VaultSnapshot();
  snapshot.update(vault);
  self.postMessage(snapshot);
});