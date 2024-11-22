<template>
  <TransitionRoot as="template" :show="isOpen">
    <Dialog class="relative z-[2000]">
      <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-50 w-screen overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
            <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white px-6 pb-4 pt-5 text-left shadow-xl transition-all w-full max-w-3xl">
              <div class="grow">
                <DialogTitle as="h3" class="whitespace-nowrap px-3">
                  <div class="text-lg font-bold text-slate-900/30">Argon Simulation Engine</div>
                  <div class="text-4xl font-bold text-gray-900">Liquid Locking for Bitcoin</div>
                </DialogTitle>

                <div class="mt-3 text-left sm:mt-5 border-y border-gray-200 pt-4 pb-6 text-base text-gray-500 space-y-3 px-3 cursor-default">
                  <p>
                    Argon is the first crypto asset with an ability to remain stable without requiring off-chain collateral or centralized authorities. Instead, it 
                    leverages the volatility of Bitcoin to create a wall of shorts against the Argon. These shorts are created through a process of placing 
                    bitcoins into Argon Stabilization Vaults. It's called Liquid Locking, and it ensures that Argon's price cannot fall without enormous profit 
                    incentives being created for vaulted bitcoin owners on the other side of the trade.
                  </p>
                  <p>
                    This simulation engine allows you to explore these profit incentives through fifteen years of Bitcoin pricing history. It answers two 
                    fundamental questions:
                  </p>

                  <ol class="list-decimal list-inside pl-5 space-y-3">
                    <li>Why would someone place their bitcoin into Argon Stabilization Vaults?</li>
                    <li>What will happen to vaulted bitcoins if Argon's price collapses into a death spiral?</li>
                  </ol>
                  <p>
                    We recommend first-timers <a @click="startTour">Take the Tour</a>. You can also 
                    <a @click="openVideoOverlay">watch our The Loser video</a>, 
                    <a @click="openWhitepapersOverlay">read our Whitepapers</a>, explore 
                    <a @click="openFaqOverlay">Frequently Asked Questions</a>, or 
                    learn <a @click="openDetailsOfLiquidLocking">more about Liquid Locking</a>.
                  </p>

                </div>
              </div>
              <div class="flex justify-end px-3 space-x-4">
                <button ref="nextButtonRef" type="button" class="rounded-md bg-[#E6EAF3] border border-[#969AA5] px-8 py-2 mt-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-200 hover:border-slate-600 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-fuchsia-500" @click="close">Close Overlay</button>
                <button ref="nextButtonRef" type="button" class="rounded-md border px-8 py-2 mt-4 text-sm font-semibold shadow-sm text-white border-fuchsia-800 bg-fuchsia-600 hover:bg-fuchsia-500 hover:border-fuchsia-900 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-fuchsia-500" @click="startTour">
                  Take the Tour
                  <ChevronDoubleRightIcon class="w-4 h-4 inline-block relative top-[-1px]" />
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>


<script setup lang="ts">
import * as Vue from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { ChevronDoubleRightIcon } from '@heroicons/vue/24/outline'
import { useBasicStore } from '../store';
import emitter from '../emitters/basic';

const basicStore = useBasicStore();

const isOpen = Vue.ref(false);
const nextButtonRef = Vue.ref<HTMLElement | null>(null);

function close() {
  isOpen.value = false;
  basicStore.setConfig({ completedWelcome: true });
}

function startTour() {
  basicStore.setConfig({ tourStep: 1 });
  isOpen.value = false;
}

function openVideoOverlay() {
  isOpen.value = false;
  emitter.emit('openVideoOverlay');
}

function openWhitepapersOverlay() {
  isOpen.value = false;
  emitter.emit('openWhitepapersOverlay');
}

function openFaqOverlay() {
  isOpen.value = false;
  emitter.emit('openFaqOverlay');
}

function openDetailsOfLiquidLocking() {
  isOpen.value = false;
  emitter.emit('openDetailsOfLiquidLocking');
}

emitter.on('openWelcomeOverlay', () => {
  isOpen.value = true;
});

Vue.onMounted(() => {
  Vue.nextTick(() => {
    nextButtonRef.value?.focus();
  });
});
</script>

<style lang="scss" scoped>
a {
  @apply text-fuchsia-600 hover:text-fuchsia-500 underline decoration-dashed;
  cursor: pointer;
}
</style>