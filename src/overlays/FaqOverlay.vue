<template>
  <TransitionRoot as="template" :show="isOpen">
    <Dialog class="relative z-[2000]" @close="closeOverlay()">
      <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
        <div @click="close" class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      </TransitionChild>

      <div @click="close" class="fixed inset-0 z-50 w-screen overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
            
            <DialogPanel class="relative transform rounded-lg bg-white px-5 pb-3 pt-3 text-left shadow-xl transition-all w-full max-w-5xl min-h-[50rem]">
              
              <div v-if="completedWelcome" @click="closeOverlay()" CloseIcon class="absolute -top-2 -right-2 cursor-pointer flex flex-row items-center space-x-1 border border-slate-400/70 rounded-full p-2 bg-white hover:bg-slate-300 z-1">
                <XMarkIcon class="inline-block w-4 h-4" />
              </div>
              <div v-if="!completedWelcome" class="pb-3 border-b border-slate-300">
                <div @click="closeOverlay()" class="inline-block cursor-pointer text-gray-400 hover:text-fuchsia-600">
                  <ArrowLeftIcon class="inline-block w-4 h-4 relative top-[-1.5px]" /> Back to Welcome
                </div>
              </div>

              <DialogTitle class="text-3xl font-bold text-center py-3 border-b border-slate-300">Frequently Asked Questions</DialogTitle>

              <div class="flex flex-col divide-y px-6 pt-6 py-4 space-y-4 overflow-y-scroll overflow-x-auto max-h-[72vh]">

                <section class="space-y-3">
                  <h3>What is the purpose of this tool?</h3>
                  <p>This tool is designed to help you understand the impact of liquid locking on a single bitcoin. </p>
                </section>

                <section class="space-y-3 pt-4">
                  <h3>How do I test Argon outside of this simulation engine?</h3>
                  <p>You can use our testnet. It's been live since September 2024. <a href="https://docs.argon.org/getting-started/testnet" target="_blank">Click here</a> for our getting started documentation.</p>
                  <p>Argon is launching live on the mainnet in a few weeks (January of 2025).</p>
                  <p>However, the real answer is that no testnet or mainnet will allow you to test Argon over a multi-year timespan without waiting multiple years. A robust simulation engine like this one is required to test real-world realities. For example, if you want to test what happens if Bitcoin plunges 50% in less than a month, drag the sliders to encompass January 4, 2019 to February 1, 2019. If you want to test what happens if Argon plunges by 99.9%, insert a price drop in your configuration properites.</p>
                </section>

                <section class="space-y-3 pt-4">
                  <h3>How does Argon's Liquid Locking compare to Babylon's Liquid Staking?</h3>
                  <p>They are very different mechanisms. Here are the two key differences:</p>
                  <p>
                    Babylon is your typical liquid staking in that you have the ability to earn yield from loaning your asset to miners while also sharing in the loss 
                    that can come from slashing. Babylon has no hedging protection for your bitcoin. Argon's novel mechanism creates a complete hedge against any 
                    downward Bitcoin price movement while also providing opportunities to generate yield on your asset. In addition, Argon has no slashing risk.
                  </p>
                  <p>Babylon's liquid staking protocol uses a complicated series of locking/slashing algorithms to ensure self-custodianship within the limitations of Bitcoin Script. Although brilliant in their design, Babylon creates a broad surface area for possible exploits. Argon, on the other hand, uses a much simpler mechanism called Dual-Signature Time Lock (DSTL). It's basically a multisig, which has been proven secure over many years and across many trillions of dollars in transactions.</p>
                </section>

                <section class="space-y-3 pt-4">
                  <h3>These results seem too good to be true; who is the loser?</h3>
                  <p>Great question. The loser is whoever sells their Argon below market price. </p>
                </section>

                <section class="space-y-3 pt-4">
                  <h3>How long must I leave my bitcoins locked in the vault?</h3>
                  <p>There is no minimum lock time. You can unlock your bitcoins at any time. Just reinsert the required amount of argons into the vault to unlock your bitcoins.</p>
                </section>

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

emitter.on('openFaqOverlay', () => {
  isOpen.value = true;
});
</script>

<style lang="scss" scoped>
section h3 {
  @apply text-lg font-semibold;
}

a {
  @apply text-slate-600 hover:text-fuchsia-500;
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