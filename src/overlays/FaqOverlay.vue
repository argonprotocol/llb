<template>
  <TransitionRoot as="template" :show="isOpen">
    <Dialog class="relative z-[2000]" @close="closeOverlay()">
      <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-50 w-screen overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
            
            <DialogPanel class="relative transform rounded-lg bg-white px-5 pb-3 pt-3 text-left shadow-xl transition-all w-full max-w-3xl my-6">
              
              <button v-if="completedWelcome" type="button" aria-label="Close FAQ" @click="closeOverlay()" CloseIcon class="absolute -top-2 -right-2 cursor-pointer flex flex-row items-center space-x-1 border border-slate-400/70 rounded-full p-2 bg-white hover:bg-slate-300 z-1">
                <XMarkIcon class="inline-block w-4 h-4" />
              </button>
              <div v-if="!completedWelcome" class="pb-3 border-b border-slate-300">
                <button type="button" @click="closeOverlay()" class="inline-block cursor-pointer text-gray-400 hover:text-fuchsia-600">
                  <ArrowLeftIcon class="inline-block w-4 h-4 relative top-[-1.5px]" /> Back to Welcome
                </button>
              </div>

              <DialogTitle class="text-3xl font-bold text-center py-3 border-b border-slate-300">Frequently Asked Questions</DialogTitle>

              <div class="divide-y px-1 sm:px-4 overflow-y-auto max-h-[65vh]">
                <details class="py-4" open>
                  <summary class="cursor-pointer text-lg font-semibold hover:text-fuchsia-600">What Does This Simulator Show?</summary>
                  <div class="space-y-3 pt-3 text-base text-gray-500 cursor-default">
                    <p>It compares Liquid Locking with simply holding bitcoin, using historical Bitcoin prices and the scenarios you choose. You can explore how changes in Bitcoin and Argon prices affect the results.</p>
                    <p>The simulator uses a snapshot of Argon’s mainnet target price, currently ${{ basicStore.usdTargetForArgon.toFixed(2) }} per ARGN. That target stays fixed throughout your selected Bitcoin history; it does not recreate historical Argon targets or track the live market price. The snapshot is refreshed when the simulator’s data is updated and published.</p>
                    <p>Minted and burned amounts are measured in ARGN. Bitcoin values, cash, fees, and price-drop inputs are in US dollars. The model converts between them using the target price.</p>
                  </div>
                </details>

                <details class="py-4">
                  <summary class="cursor-pointer text-lg font-semibold hover:text-fuchsia-600">How Do I Get Started?</summary>
                  <div class="space-y-3 pt-3 text-base text-gray-500 cursor-default">
                    <p>Choose when to lock and unlock your bitcoin, then compare the results. Add an Argon price drop to explore what happens if Argon falls below its target price, or choose <strong>Take Our Guided Tour</strong> from the More Info menu for a walkthrough.</p>
                  </div>
                </details>

                <details class="py-4">
                  <summary class="cursor-pointer text-lg font-semibold hover:text-fuchsia-600">Where Do the Returns Come From?</summary>
                  <div class="space-y-3 pt-3 text-base text-gray-500 cursor-default">
                    <p>The model combines Bitcoin price changes with Liquid Locking’s hedging mechanism and opportunities to buy back Argon below its target price. Results depend on your selected dates and settings; they are simulated outcomes, not promised returns.</p>
                  </div>
                </details>

                <details class="py-4">
                  <summary class="cursor-pointer text-lg font-semibold hover:text-fuchsia-600">Who Is the Loser?</summary>
                  <div class="space-y-3 pt-3 text-base text-gray-500 cursor-default">
                    <p>For gains from an Argon price drop, the other side of the trade is whoever sells Argon below its target price. Buying it back at that lower price reduces the cost of unlocking your bitcoin.</p>
                  </div>
                </details>

                <details class="py-4">
                  <summary class="cursor-pointer text-lg font-semibold hover:text-fuchsia-600">How Does Liquid Locking Compare With Babylon?</summary>
                  <div class="space-y-3 pt-3 text-base text-gray-500 cursor-default">
                    <p>Babylon lets you lock bitcoin to help secure proof-of-stake networks and earn rewards. Your bitcoin remains exposed to Bitcoin price declines, and security violations can trigger slashing—a loss of staked bitcoin. Argon’s Liquid Locking is designed to hedge Bitcoin price declines and create opportunities to profit when Argon falls below its target price, without staking-related slashing.</p>
                    <p>The locking mechanisms also differ: Babylon combines timelocks and slashing conditions in Bitcoin scripts, while Argon uses a Dual-Signature Time Lock (DSTL), a multisignature locking mechanism. Babylon’s additional complexity can create more potential paths for exploits; a simpler design can be easier to review, but simplicity alone does not establish security.</p>
                  </div>
                </details>

                <details class="py-4">
                  <summary class="cursor-pointer text-lg font-semibold hover:text-fuchsia-600">How Do I Unlock My Bitcoin?</summary>
                  <div class="space-y-3 pt-3 text-base text-gray-500 cursor-default">
                    <p>There is no minimum lock time. You can unlock your bitcoin at any time by returning the amount of Argon required by the vault’s unlocking formula. Open <button type="button" class="text-fuchsia-600 hover:text-fuchsia-500 underline decoration-dashed" @click="openDetailsOfLiquidLocking">The Details of Liquid Locking</button> to see the formula and learn more.</p>
                  </div>
                </details>

                <details class="py-4">
                  <summary class="cursor-pointer text-lg font-semibold hover:text-fuchsia-600">Is Liquid Locking In Production?</summary>
                  <div class="space-y-3 pt-3 text-base text-gray-500 cursor-default">
                    <p>Yes. Liquid Locking is live on Argon’s mainnet. Download the <a href="https://argon.network/" target="_blank" rel="noopener noreferrer">Argon Desktop App</a> to get started.</p>
                  </div>
                </details>

                <details class="py-4">
                  <summary class="cursor-pointer text-lg font-semibold hover:text-fuchsia-600">Why a Simulator If Production Is Running?</summary>
                  <div class="space-y-3 pt-3 text-base text-gray-500 cursor-default">
                    <p>A live network cannot show you years of outcomes without years of waiting; this simulator lets you explore long-term scenarios and sudden market drops immediately.</p>
                    <p>For example, you can drag the date sliders to include February 14–March 13, 2020, when Bitcoin fell roughly 53% in under a month. This allows you to explore
                    how Liquid Locking compares with hodling in a bear market.</p>
                    <p>Similarly, you can explore what would happen if Argon's stablecoin plunged into a Terra-like death spiral. Simply add a Price Drop of ${{ Number((basicStore.usdTargetForArgon * 0.001).toFixed(3)) }}, which is 0.1% of Argon's target price of ${{ Number((basicStore.usdTargetForArgon).toPrecision(3)) }}.</p>
                  </div>
                </details>
              </div>

              
            </DialogPanel>

          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>


<script setup lang="ts">
import * as Vue from 'vue';
import { storeToRefs } from 'pinia';
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue';
import { XMarkIcon } from '@heroicons/vue/24/outline';
import emitter from '../emitters/basic';
import { ArrowLeftIcon } from '@heroicons/vue/24/outline';
import { useBasicStore } from '../store';

const basicStore = useBasicStore();
const { completedWelcome } = storeToRefs(basicStore);

const isOpen = Vue.ref(false);

function closeOverlay() {
  isOpen.value = false;
  if (!completedWelcome.value) {
    emitter.emit('openWelcomeOverlay');
  }
}

function openDetailsOfLiquidLocking() {
  isOpen.value = false;
  emitter.emit('openDetailsOfLiquidLocking', 'faq');
}

emitter.on('openFaqOverlay', () => {
  isOpen.value = true;
});
</script>

<style lang="scss" scoped>
a {
  @apply text-fuchsia-600 hover:text-fuchsia-500 underline decoration-dashed;
  cursor: pointer;
  &[disabled] {
    @apply pointer-events-none;
    div {
      @apply opacity-30;  
    }
  }
}

[CloseIcon]:hover {
    opacity: 1;
    svg path {
      opacity: 1;
      fill: white;
      stroke: white;
    }
  }
</style>
