import dayjs, { type Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import IRules from "../interfaces/IRules";
import BtcPrices from "../lib/BtcPrices";
import Vault from '../lib/Vault';

dayjs.extend(utc);
dayjs.extend(isSameOrBefore);

export default class StartController {  

  public async fetchBitcoinPrices() {    
    return BtcPrices.all;
  }

  public async fetchVaultingRatchets(rules: IRules) {
    return new Vault(rules).ratchets;
  }
}
