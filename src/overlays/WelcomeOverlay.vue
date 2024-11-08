<template>
  <TransitionRoot as="template" :show="open">
    <Dialog class="relative z-[2000]">
      <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-50 w-screen overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
            <DialogPanel class="absolute top-[32.5%] transform flex flex-col overflow-scroll rounded-lg bg-white px-5 pb-4 pt-5 text-left shadow-xl transition-all w-full max-w-2xl">
              <div class="grow">
                <DialogTitle as="h3" class="text-xl font-semibold leading-6 text-gray-900 whitespace-nowrap px-3">Welcome to Argon's Liquid Locking for Bitcoin</DialogTitle>

                <div class="mt-3 text-left sm:mt-5 border-y border-gray-200 py-4 text-sm text-gray-500 space-y-3 px-3">
                  <p>
                    This tool makes it easy to test one of Argon's most fundamental mechanisms: Liquid Locking. Liquid Locking is the process of 
                    locking your Bitcoin into an Argon Vault, and in the process of doing so, it hedges your Bitcoin against any loss in value. In return, your
                    Bitcoins are used as a stablization mechanism for the Argon currency 
                    (<a href="https://sam.argonprotocol.org" target="_blank" class="text-blue-600 underline">explore our Stabilization Analysis Model</a>).
                  </p>

                  <p>
                    Liquid Locking is similar in concept to Liquid Staking used by Ethereum and other PoS blockchains, at least from a yield perspective. The main difference
                    is how each is applied. Liquid Staking is used to secure mining positions, Liquid Locking is for currency stabilization.
                  </p>

                  <p>Use this tool to explore how vaulting your Bitcoin compares with hodling. Select any timeframe over the last fifteen years to see how your returns would have looked based on actual data from that time period.</p>

                </div>
              </div>
              <div class="flex justify-end px-3">
                <button ref="nextButtonRef" type="button" class="rounded-md bg-[#E6EAF3] border border-[#969AA5] px-8 py-2 mt-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-fuchsia-600 hover:border-fuchsia-800 hover:text-white focus:outline-none focus:ring-1 focus:ring-inset focus:ring-fuchsia-500" @click="nextStep">Let's Go</button>
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

const open = Vue.ref(true);
const nextButtonRef = Vue.ref<HTMLElement | null>(null);

function nextStep() {
  open.value = false;
}

Vue.onMounted(() => {
  Vue.nextTick(() => {
    nextButtonRef.value?.focus();
  });
});
</script>
