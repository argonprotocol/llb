<template>
  <TransitionRoot as="template" :show="isOpen">
    <Dialog class="relative z-[2000]" @close="isOpen = false">
      <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-50 w-screen overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:px-4 sm:py-10">
          <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
            <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white px-5 pb-4 pt-5 text-left shadow-xl transition-all w-full max-w-4xl">
              <div class="grow">
                <DialogTitle as="h3" class="text-xl font-semibold leading-6 text-gray-900 whitespace-nowrap px-3">Bitcoin is the Key to Argon's Stabilization</DialogTitle>

                <div class="mt-3 text-left sm:mt-5 border-y border-gray-200 py-4 text-base text-gray-500 space-y-3 px-3">
                  <p>
                    The tool you are using touches on one of the most novel aspects of Argon: it's relationship to Bitcoin. Bitcoin is the key to Argon stabilization 
                    mechanisms, and in return, Argon delivers lucrative benefits to Bitcoin holders. Bitcons are both given the right to mint Argons when market
                    demand is high, and they are given lucrative profit incentives whenever Argon's price falls below target.
                  </p>

                  <p>The key behind this entire mechanism is the following mathematical formula. It determines how many argons are required to be inserted into the
                    vault to unlock a previously locked bitcoin:
                  </p>

                  <div class="flex justify-center border-t border-b py-5">
                    <img src="../assets/unlocking-formula.png" alt="The Key Formula" class="w-[500px]" />
                  </div>

                  <p>To learn more about this mathematical formla, and for more details on Liquid Locking, please see our 2nd whitepaper, Creating a Truly Stable Asset.</p>

                  <p>This Liquid Locking model is one of two tools we've created to help us better understand Argon's mechanisms. Out other model, the Stabilization Analysis Model (SAM), shows how these vaulted bitcoins stabilize the Argon if and when the argon ever falls below its peg. Click here to open.</p>

                  <p>Argon's stabilization mechanisms are rooted in basic mathematical and economic laws, however, one of the primary assumptions behind our model cannot be answered by math. It is an emotional question. Will bitcoin holders be willing to vault their bitcoins in exchange for the benefits it provides? If the answer is overwhelmingly “Yes” then the SAM model. If it's no, then no amount of enginuity of our mechansisms will ever work.</p>
                </div>
              </div>
              <div class="flex justify-end px-3">
                <button ref="nextButtonRef" type="button" class="rounded-md bg-[#E6EAF3] border border-[#969AA5] px-8 py-2 mt-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-fuchsia-600 hover:border-fuchsia-800 hover:text-white focus:outline-none focus:ring-1 focus:ring-inset focus:ring-fuchsia-500" @click="close">Close</button>
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
import emitter from '../emitters/basic';

const isOpen = Vue.ref(false);
const nextButtonRef = Vue.ref<HTMLElement | null>(null);

function close() {
  isOpen.value = false;
}

emitter.on('openTheKeyOverlay', () => {
  isOpen.value = true;
  Vue.nextTick(() => {
    nextButtonRef.value?.focus();
  });
});
</script>
