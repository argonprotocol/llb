<template>
  <div v-if="isOpen" :style="{ top: top, left: left, width: width, transform: `translate(${translateX}, ${translateY})` }" class="absolute z-[1200] border border-slate-500/30 flex flex-col rounded bg-white px-6 py-2 text-left shadow-xl transition-all pointer-events-none">
    
    <div :style="{ left: arrowLeft, top: arrowTop, bottom: arrowBottom, right: arrowRight, rotate: arrowRotate, transform: `translate(${arrowTranslateX}, ${arrowTranslateY})` }" class="absolute">
      <svg class="relative z-10" width="24" height="12" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0L24 12H0L12 0Z" fill="white"/>
      </svg>
      <svg class="absolute z-0 -top-0.5 left-[-0.5px] opacity-20" width="26" height="14" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0L24 12H0L12 0Z" fill="black"/>
      </svg>
    </div>
    
    <div class="grow">
      <div class="py-3 text-left text-sm text-slate-500 font-light">
        
        <div v-if="id === 'ratchets'" class="space-y-2">
          <p>Ratcheting is the process of unlocking your bitcoin from the vault and then immediately relocking at the current market price. This reset of the Lock Price readjusts your hedge against any downward drop in Bitcoin price. The ability to continually do this as Bitcoin's price rises and falls creates a powerful profit mechanism.</p>
        </div>

        <div v-else-if="id === 'shorts'" class="space-y-2">
          <p>Vaults provide a currency arbitrage opportunity because all locked Bitcoins are naturally short the Argon. When Argon's price drops below target, vaulted bitcoins can cover their shorts and earn a profit by unlocking from the vault with below-market Argons. As part of this unlocking process, bitcoins burn a huge quantity of Argons out of circulation, thereby restoring supply and demand equilibrium and returning Argon to its target price.</p>
        </div>

        <div v-else-if="id === 'cashUnlocked'" class="space-y-2">
          <p>Every time a bitcoin is locked into the vault (or ratcheted), argons equal to the value of the bitcoin is allowed to be minted and sold into the market. This keeps the price of Argon from rising above its target value, and in doing so, it allows bitcoin holders to create cash liquidity.</p>
        </div>

        <div v-else-if="id === 'vaulterReturns'" class="space-y-2">
          <p class="pb-2">Vaulting provides substantially higher returns than straight up hodling because of two things: they hedge against Bitcoin's downside volatility and they provide additional profit opportunities, such as ratcheting and shorting. The following table breaks down these returns:</p>

          <table class="w-full">
            <tr class="border-b border-t border-slate-400/30 h-[30px] italic">
              <td>Starting Value of Bitcoin{{ data.bitcoinCount === 1 ? '' : 's' }} on {{ dayjs.utc(data.startingDate).format('MMM D, YYYY') }}</td>
              <td class="text-right">${{addCommas(formatPrice(data.startingBtcValue))}}</td>
            </tr>
            <tr class="border-b-2 border-slate-400/60 h-[30px] italic">
              <td>Ending Value of Bitcoin{{ data.bitcoinCount === 1 ? '' : 's' }} <span v-if="data.bitcoinCount > 1">(you own {{ data.bitcoinCount }})</span> on {{ dayjs.utc(data.endingDate).format('MMM D, YYYY') }}</td>
              <td class="text-right">${{addCommas(formatPrice(data.endingBtcValue))}}</td>
            </tr>
            <tr class="border-b border-slate-400/30 h-[30px]">
              <td>Profits Accrued From Initial Lock</td>
              <td class="text-right">${{addCommas(formatPrice(data.profitFromInitialLock))}}</td>
            </tr>
            <tr class="border-b border-slate-400/30 h-[30px]">
              <td>Profits Accrued From Ratcheting</td>
              <td class="text-right">${{addCommas(formatPrice(data.profitFromRatchets))}}</td>
            </tr>
            <tr class="border-b border-slate-400/30 h-[30px]">
              <td>Profits Accrued From Short Covers</td>
              <td class="text-right">${{addCommas(formatPrice(data.profitFromShorts))}}</td>
            </tr>
            <tr class="border-b border-slate-400/30 h-[30px]">
              <td>Profits Accrued from Bitcoin Appreciation</td>
              <td class="text-right">${{addCommas(formatPrice(data.endingBtcValue - data.startingBtcValue))}}</td>
            </tr>
            <tr class="border-b-2 border-slate-400/60 h-[30px]">
              <td>Bitcoin Transaction Fees and Related Expenses</td>
              <td class="text-right">-${{ addCommas(formatPrice(data.totalExpenses)) }}</td>
            </tr>
            <tr class="border-b border-slate-400/30 h-[30px] font-bold">
              <td>Final Value of Your Investment (Bitcoin{{ data.bitcoinCount === 1 ? '' : 's' }} + Cash - Expenses)</td>
              <td class="text-right">${{addCommas(formatPrice(data.totalAccruedValue))}}</td>
            </tr>
            <tr class="border-b border-slate-400/30 h-[30px] font-bold">
              <td>Total Vaulter Profit</td>
              <td class="text-right">{{addCommas(formatPrice(data.vaulterProfit * 100))}}%</td>
            </tr>
          </table>
          
          <p class="pt-2">It's important to note that this model does NOT use compounding returns. All profits are taken off the table as cash and are left to sit for the duration of the simulation.</p>
        </div>

        <div v-else-if="id === 'hodlerReturns'" class="space-y-2">
          <p class="pb-2">
            Hodling has been a tremendous investment strategy over the past decade, however, as with all volatile assets, there have been stretches of time where bitcoin has experienced extreme downside. 
            As such, hodling returns cannot compete with those who use Argon's Liquid Locking capabiltiies.
          </p>

          <table class="w-full">
            <tr class="border-b border-t border-slate-400/30 h-[30px] italic">
              <td>Starting Value of Bitcoin{{ data.bitcoinCount === 1 ? '' : 's' }} on {{ dayjs.utc(data.startingDate).format('MMM D, YYYY') }}</td>
              <td class="text-right">${{addCommas(formatPrice(data.startingBtcValue))}}</td>
            </tr>
            <tr class="border-b-2 border-slate-400/60 h-[30px] italic">
              <td>Ending Value of Bitcoin{{ data.bitcoinCount === 1 ? '' : 's' }} <span v-if="data.bitcoinCount > 1">(you own {{ data.bitcoinCount }})</span> on {{ dayjs.utc(data.endingDate).format('MMM D, YYYY') }}</td>
              <td class="text-right">${{addCommas(formatPrice(data.endingBtcValue))}}</td>
            </tr>
            <tr class="border-b border-slate-400/30 h-[30px]">
              <td>Profits Accrued from Bitcoin Appreciation</td>
              <td class="text-right">${{addCommas(formatPrice(data.endingBtcValue - data.startingBtcValue))}}</td>
            </tr>
            <tr class="border-b-2 border-slate-400/60 h-[30px]">
              <td>Bitcoin Transaction Fees and Related Expenses</td>
              <td class="text-right">-${{ addCommas(formatPrice(data.hodlerExpenses)) }}</td>
            </tr>
            <tr class="border-b border-slate-400/30 h-[30px] font-bold">
              <td>Final Value of Your Investment (Bitcoin{{ data.bitcoinCount === 1 ? '' : 's' }} + Cash - Expenses)</td>
              <td class="text-right">${{addCommas(formatPrice(data.totalHodlerValue))}}</td>
            </tr>
            <tr class="border-b border-slate-400/30 h-[30px] font-bold">
              <td>Total Hodler Profit</td>
              <td class="text-right">{{addCommas(formatPrice(data.hodlerProfit * 100))}}%</td>
            </tr>
          </table>

        </div>

        <div v-else-if="id === 'download'" class="space-y-2">
          <p>Download the full dataset of these returns.</p>
        </div>

        <div v-else-if="id === 'information'" class="space-y-2">
          <p>Understand the pivotal role Liquid Locking can play in stabilizing a currency.</p>
        </div>

        <div v-else-if="id === 'github'" class="space-y-2">
          <p>View the code behind this tool.</p>
        </div>

        <div v-else-if="id === 'addPriceDrop'" class="space-y-2">
          <p>Force Argon into a price drop to see how vaulted bitcoins perform in an Argon down market.</p>
        </div>
      </div>
    </div>            
  </div>
</template>

<script setup lang="ts">
import * as Vue from 'vue';
import dayjs from 'dayjs';
import dayjsUtc from 'dayjs/plugin/utc';
import emitter from '../emitters/basic';
import { addCommas, formatPrice } from '../lib/BasicUtils';

dayjs.extend(dayjsUtc);

const isOpen = Vue.ref(false);

const id = Vue.ref('');
const data = Vue.ref({} as any);

const positionAt = Vue.ref('');
const alignTo = Vue.ref('');

const left = Vue.ref('auto');
const top = Vue.ref('auto');
const translateY = Vue.ref('0');
const translateX = Vue.ref('0');

const width = Vue.ref('auto');

const arrowLeft = Vue.ref('auto');
const arrowRight = Vue.ref('auto');
const arrowTop = Vue.ref('auto');
const arrowBottom = Vue.ref('auto');
const arrowRotate = Vue.ref('0deg');
const arrowTranslateY = Vue.ref('0');
const arrowTranslateX = Vue.ref('0');

emitter.on('showInsight', (incoming: any) => {
  isOpen.value = true;
  id.value = incoming.id;
  positionAt.value = incoming.positionAt;
  alignTo.value = incoming.alignTo;
  width.value = incoming.width ? `${incoming.width}px` : '24rem';
  data.value = incoming.data;
  
  if (positionAt.value === 'top') {
    top.value = `${incoming.y - 5}px`;
    arrowTop.value = 'auto';
    arrowBottom.value = '0px';
    translateY.value = '-100%';
    arrowRotate.value = '180deg';
    arrowTranslateX.value = '-50%';
    arrowTranslateY.value = '0%'
  } else if (positionAt.value === 'bottom') {
    top.value = `${incoming.y + 7}px`;
    arrowTop.value = '0px';
    arrowBottom.value = 'auto';
    translateY.value = '0';
    arrowRotate.value = '0deg';
    arrowTranslateY.value = '-100%';
  } else if (positionAt.value === 'right') {
    top.value = `${incoming.y}px`;
    left.value = `${incoming.x}px`;
    
    arrowTop.value = '50%';
    arrowBottom.value = 'auto';
    arrowLeft.value = `${incoming.arrowX}px`;
    arrowRight.value = 'auto';

    translateY.value = '-50%';
    translateX.value = '10px';
    arrowRotate.value = '-90deg';
    arrowTranslateY.value = '-150%';
    arrowTranslateX.value = '20%';
  }

  if (['top', 'bottom'].includes(positionAt.value)) {
    if (alignTo.value === 'left') {
      left.value = `${incoming.x}px`;
      arrowLeft.value = `${incoming.arrowX}px`;
      arrowRight.value = 'auto';
      translateX.value = '0';
      arrowTranslateX.value = '-50%';
    } else if (alignTo.value === 'right') {
      left.value = `${incoming.x}px`;
      arrowLeft.value = 'auto';
      arrowRight.value = `${incoming.arrowX}px`;
      translateX.value = '-100%';
      arrowTranslateX.value = '50%';
    }  
  }
});

emitter.on('hideInsight', () => {
  isOpen.value = false;
});
</script>