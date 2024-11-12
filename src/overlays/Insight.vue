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
          <p>Ratchets are a combination-action whereby the bitcoin is unlocked from the vault and then immediately relocked at the new market price. This reset of the Lock Price creates a continually readjusting hedge against any downward drop in Bitcoin price.</p>
        </div>

        <div v-else-if="id === 'shorts'" class="space-y-2">
          <p>Wherever the price of Argon drops below its target price, vaulted bitcoins are given an exclusive right to cover the short. This burns excess argons from circulation and helps to drive Argon's price back up to target. And of course, the bitcoins profit.</p>
        </div>

        <div v-else-if="id === 'cashUnlocked'" class="space-y-2">
          <p>Every time a bitcoin is locked into the vault (or ratcheted), argons equal to the value of the bitcoin is allowed to be minted and sold into the market. This keeps the price of Argon from rising above its target value, and in doing so, it allows bitcoin holders to create cash liquidity.</p>
        </div>

        <div v-else-if="id === 'vaulterReturns'" class="space-y-2">
          <p>As you'll discover from trying various combinations, the yeild from vaulting is substantially higher than straight up hodling. This is due to the novel way Argon's vaulting mechanisms hedge against the volatility of Bitcoin while still allowing for full upside.</p>
        </div>

        <div v-else-if="id === 'hodlerReturns'" class="space-y-2">
          <p>
            Hodling has been a tremendous investment strategy over the past decade, and it will likely continue for many years to come.
            <template v-if="data.hodlerProfit < 0">However, as with all volatile assets, there have been stretches of time where bitcoin has experienced extreme downside.</template>
          </p>
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

        <div v-else-if="id === 'enterVaultAt'" class="space-y-2">
          <p>This determines when your bitcoin goes in the Argon vaults, and therefore, determines when the downside risk of your bitcoin is hedged. The quantity or dollar amount of bitcoin does not change your percentage returns.</p>
        </div>

        <div v-else-if="id === 'exitVaultAt'" class="space-y-2">
          <p>This is the date when you pull your bitcoin out of the Argon vaults, and therfore the final date when all the profit calculations are determined.</p>
        </div>

        <div v-else-if="id === 'ratchetPct'" class="space-y-2">
          <p>The lower your ratchet percentage, the tighter the hedge on your downside risk, and therefore, the stronger your upside potential.</p>
        </div>

        <div v-else-if="id === 'addPriceDrop'" class="space-y-2">
          <p>Force Argon into a price drop to see how vaulted bitcoins performs in an Argon down market.</p>
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
import { currency, formatPrice, formatShorthandNumber } from '../lib/BasicUtils';

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