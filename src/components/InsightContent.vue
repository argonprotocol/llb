<template>
    <div class="grow cursor-default" :class="{ 'desktop-content': desktop }">
      <div class="py-3 text-left text-sm text-slate-500 font-light">
        
        <div v-if="id === 'ratchets'" class="space-y-2">
          <p>Ratcheting is the process of unlocking your bitcoin from the vault and then immediately relocking at the current market price. This reset of the Lock Price readjusts your hedge against any downward drop in Bitcoin price. The ability to continually do this as Bitcoin's price rises and falls creates a powerful profit mechanism.</p>
        </div>

        <div v-else-if="id === 'shorts'" class="space-y-2">
          <p>Vaults provide a currency arbitrage opportunity because all locked Bitcoins are naturally short the Argon. When Argon's price drops below target, vaulted bitcoins can cover their shorts and earn a profit by unlocking from the vault with below-market Argons. As part of this unlocking process, bitcoins burn a huge quantity of Argons out of circulation, thereby restoring supply and demand equilibrium and returning Argon to its target price.</p>
        </div>

        <div v-else-if="id === 'cashUnlocked'" class="space-y-2">
          <p>Every time a bitcoin is locked in a vault (or ratcheted), argons equal to the market value of the bitcoin are allowed to be minted by that bitcoin's owner and sold into the open market. This keeps the price of Argon from rising above its target value, and in doing so, it allows bitcoin holders to create cash liquidity.</p>
        </div>

        <div v-else-if="id === 'vaulterReturns'" class="space-y-2">
          <p class="pb-2">Liquid Locking provides substantially higher returns than straight up hodling because of two things: they hedge against Bitcoin's downside volatility and they provide additional profit opportunities, such as ratcheting and shorting. The following table breaks down these returns:</p>

          <table class="w-full">
            <tbody>
              <tr class="border-b border-t border-slate-400/30 h-[30px] italic hover:bg-slate-100">
                <td>Starting Value of Bitcoin{{ data.bitcoinCount === 1 ? '' : 's' }} on {{ dayjs.utc(data.startingDate).format('MMM D, YYYY') }}</td>
                <td class="text-right">${{addCommas(formatPrice(data.startingBtcValue))}}</td>
              </tr>
              <tr class="border-b-2 border-slate-400/60 h-[30px] italic hover:bg-slate-100">
                <td>Ending Value of Bitcoin{{ data.bitcoinCount === 1 ? '' : 's' }} <span v-if="data.bitcoinCount > 1">(you own {{ data.bitcoinCount }})</span> on {{ dayjs.utc(data.endingDate).format('MMM D, YYYY') }}</td>
                <td class="text-right">${{addCommas(formatPrice(data.endingBtcValue))}}</td>
              </tr>
              <tr class="border-b border-slate-400/30 h-[30px] hover:bg-slate-100">
                <td>Profits Accrued From Initial Lock</td>
                <td class="text-right">${{addCommas(formatPrice(data.profitFromInitialLock))}}</td>
              </tr>
              <tr class="border-b border-slate-400/30 h-[30px] hover:bg-slate-100">
                <td>Profits Accrued From Ratcheting</td>
                <td class="text-right">${{addCommas(formatPrice(data.profitFromRatchets))}}</td>
              </tr>
              <tr class="border-b border-slate-400/30 h-[30px] hover:bg-slate-100">
                <td>Profits Accrued From Argon Shorts</td>
                <td class="text-right">${{addCommas(formatPrice(data.profitFromShorts))}}</td>
              </tr>
              <tr class="border-b border-slate-400/30 h-[30px] hover:bg-slate-100">
                <td>Profits Accrued from Bitcoin Appreciation</td>
                <td class="text-right">${{addCommas(formatPrice(data.endingBtcValue - data.startingBtcValue))}}</td>
              </tr>
              <tr class="border-b-2 border-slate-400/60 h-[30px] hover:bg-slate-100">
                <td>Bitcoin Transaction Fees and Related Expenses</td>
                <td class="text-right">-${{ addCommas(formatPrice(data.totalExpenses)) }}</td>
              </tr>
              <tr class="border-b border-slate-400/30 h-[30px] font-bold hover:bg-slate-100">
                <td>Final Value of Your Investment (Bitcoin{{ data.bitcoinCount === 1 ? '' : 's' }} + Cash - Expenses)</td>
                <td class="text-right">${{addCommas(formatPrice(data.totalAccruedValue))}}</td>
              </tr>
              <tr class="border-b border-slate-400/30 h-[30px] font-bold hover:bg-slate-100">
                <td>Total Vaulter Profit</td>
                <td class="text-right">{{addCommas(formatPrice(data.vaulterProfit * 100))}}%</td>
              </tr>
            </tbody>
          </table>
          
          <p class="pt-2">It's important to note that this model does NOT calculate compounding returns. All profits are taken off the table as cash and are left to sit for the duration of the simulation.</p>
        </div>

        <div v-else-if="id === 'hodlerReturns'" class="space-y-2">
          <p class="pb-2">
            Hodling has been a tremendous investment strategy over the past decade, however, as with all volatile assets, there have been stretches of time where bitcoin has experienced extreme downside. 
            As such, hodling returns cannot compete with those who use Argon's Liquid Locking capabiltiies.
          </p>

          <table class="w-full">
            <tbody>
              <tr class="border-b border-t border-slate-400/30 h-[30px] italic hover:bg-slate-100">
                <td>Starting Value of Bitcoin{{ data.bitcoinCount === 1 ? '' : 's' }} on {{ dayjs.utc(data.startingDate).format('MMM D, YYYY') }}</td>
                <td class="text-right">${{addCommas(formatPrice(data.startingBtcValue))}}</td>
              </tr>
              <tr class="border-b-2 border-slate-400/60 h-[30px] italic hover:bg-slate-100">
                <td>Ending Value of Bitcoin{{ data.bitcoinCount === 1 ? '' : 's' }} <span v-if="data.bitcoinCount > 1">(you own {{ data.bitcoinCount }})</span> on {{ dayjs.utc(data.endingDate).format('MMM D, YYYY') }}</td>
                <td class="text-right">${{addCommas(formatPrice(data.endingBtcValue))}}</td>
              </tr>
              <tr class="border-b border-slate-400/30 h-[30px] hover:bg-slate-100">
                <td>Profits Accrued from Bitcoin Appreciation</td>
                <td class="text-right">${{addCommas(formatPrice(data.endingBtcValue - data.startingBtcValue))}}</td>
              </tr>
              <tr class="border-b-2 border-slate-400/60 h-[30px] hover:bg-slate-100">
                <td>Bitcoin Transaction Fees and Related Expenses</td>
                <td class="text-right">-${{ addCommas(formatPrice(data.hodlerExpenses)) }}</td>
              </tr>
              <tr class="border-b border-slate-400/30 h-[30px] font-bold hover:bg-slate-100">
                <td>Final Value of Your Investment (Bitcoin{{ data.bitcoinCount === 1 ? '' : 's' }} + Cash - Expenses)</td>
                <td class="text-right">${{addCommas(formatPrice(data.totalHodlerValue))}}</td>
              </tr>
              <tr class="border-b border-slate-400/30 h-[30px] font-bold hover:bg-slate-100">
                <td>Total Hodler Profit</td>
                <td class="text-right">{{addCommas(formatPrice(data.hodlerProfit * 100))}}%</td>
              </tr>
            </tbody>
          </table>

        </div>

        <div v-else-if="id === 'download'">
          <p>Download Dataset</p>
        </div>

        <div v-else-if="id === 'playVideo'">
          <p>Open Video</p>
        </div>

        <div v-else-if="id === 'information'">
          <p>More Info</p>
        </div>

        <div v-else-if="id === 'github'">
          <p>Code Repository</p>
        </div>

        <div v-else-if="id === 'addPriceDrop'" class="space-y-2">
          <p>Force Argon into a price drop to see how vaulted bitcoins perform in an Argon down market.</p>
        </div>
      </div>
    </div>            
</template>
<script setup lang="ts">
import dayjs from 'dayjs';
import { addCommas, formatPrice } from '../lib/BasicUtils';
defineProps<{ id: string; data: Record<string, any>; desktop?: boolean }>();
</script>
<style scoped>
table { table-layout: fixed; overflow-wrap: anywhere; }
td { padding: .35rem; vertical-align: top; }
td:last-child { width: 36%; }
.desktop-content table { table-layout: auto; overflow-wrap: normal; }
.desktop-content td { padding: 0; vertical-align: middle; }
.desktop-content td:last-child { width: auto; }
</style>
