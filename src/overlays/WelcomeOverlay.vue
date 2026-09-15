<template>
  <TransitionRoot as="template" :show="isOpen">
    <Dialog class="legacy-dialog WelcomeOverlay Component relative z-[2000]" @close="close">
      <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-50 w-screen overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
            <DialogPanel data-dialog-panel class="relative transform overflow-hidden rounded-lg bg-white px-6 pb-4 pt-5 my-10 text-left shadow-xl transition-all w-full max-w-3xl">
              <div class="grow">
                <DialogTitle as="h3" class="whitespace-nowrap px-3">
                  <div class="text-lg font-bold text-slate-900/30">Argon Simulation Engine</div>
                  <div class="text-4xl font-bold text-gray-900">Liquid Locking for Bitcoin</div>
                </DialogTitle>

                <div class="mt-3 text-left sm:mt-5 border-y border-gray-200 pt-4 pb-6 text-base text-gray-500 space-y-3 px-3 cursor-default">
                  <p>
                    Argon is the first crypto asset with an ability to remain stable without requiring off-chain collateral or centralized authorities. It does this by
                    leveraging the volatility of Bitcoin to create a wall of shorts against the Argon. These shorts are created through a process of placing 
                    bitcoins into Argon Stabilization Vaults. It's called Liquid Locking, and it ensures that Argon's price cannot fall without enormous profit 
                    incentives being created for vaulted bitcoin owners on the other side of the trade.
                  </p>
                  <p>
                    This simulation engine allows you to explore these profit incentives through fifteen years of Bitcoin pricing history. It answers two 
                    fundamental questions:
                  </p>

                  <ol class="list-decimal list-inside pl-5 pb-2 space-y-3">
                    <li>Why would someone place their bitcoin into Argon Stabilization Vaults?</li>
                    <li>What will happen to vaulted bitcoins if Argon's price collapses into a death spiral?</li>
                  </ol>

                  <div v-if="showVideo" class="grow relative">
                    <div class="LoadingPulse absolute inset-0 flex items-center justify-center text-slate-500/60 text-3xl uppercase">Loading Video...</div>
                    <wistia-player media-id="1k1jdinjxd"></wistia-player>
                  </div>

                  <button type="button" v-else VideoLink @click="expandVideo" class="!mt-5 !mb-6 block w-full border border-dashed border-gray-400 rounded-md py-4 text-center group cursor-pointer">
                    <div class="text-lg text-fuchsia-600 group-hover:text-fuchsia-500 cursor-pointer pl-1 font-bold">
                      <PlayOutlined OutlineIcon class="w-6 h-6 inline-block relative top-[-1px]" />
                      <PlaySolid SolidIcon class="w-6 h-6 inline-block relative top-[-1px]" />
                      <span class="inline-block underline decoration-dashed decoration-fuchsia-300/50 underline-offset-[6px] ml-2">Watch <em class="italic">The Intro Video</em></span>
                    </div>
                    <p class="text-sm text-gray-500 mx-20 mt-2 group-hover:text-fuchsia-900/60">
                      A short video from our founder on how Liquid Locking works and why<br /> 
                      the returns are so much stronger than hodling.
                    </p>
                  </button>

                  <p class="welcome-links">
                    <span v-if="desktop">
                      We recommend first-timers <button type="button" class="text-fuchsia-700 underline" @click="startTour">Take the Tour</button>.
                      You can also
                    </span>
                    <span v-else>You can </span>
                    <button type="button" class="text-fuchsia-700 underline" @click="openWhitepapersOverlay">read our Whitepapers</button>, explore
                    <button type="button" class="text-fuchsia-700 underline" @click="openFaqOverlay">Frequently Asked Questions</button>, or
                    <button type="button" class="text-fuchsia-700 underline" @click="openDetailsOfLiquidLocking">learn more about Liquid Locking</button>.
                  </p>

                </div>
              </div>
              <div class="flex flex-row-reverse justify-start px-3">
                <button Main type="button" class="rounded-md border px-8 py-2 mt-4 ml-4 text-sm font-semibold text-white border-fuchsia-800 bg-fuchsia-600 hover:bg-fuchsia-500 hover:border-fuchsia-900 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-fuchsia-500" @click="desktop ? startTour() : close()">
                  {{ desktop ? 'Take the Tour' : 'Explore the simulator' }}
                  <ChevronDoubleRightIcon v-if="desktop" class="w-4 h-4 inline-block relative top-[-1px]" />
                </button>
                <button v-if="desktop" ref="nextButtonRef" type="button" class="rounded-md bg-[#E6EAF3] border border-[#969AA5] px-8 py-2 mt-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-200 hover:border-slate-600 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-fuchsia-500" @click="close">
                  Skip Tour and Explore
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
import PlayOutlined from '../assets/play-outlined.svg';
import PlaySolid from '../assets/play-solid.svg';
import { useBasicStore } from '../store';
import emitter from '../emitters/basic';
import { useEvent } from '../lib/EventUtils';
import { useDesktopLayout } from '../lib/ResponsiveLayout';

const basicStore = useBasicStore();
const desktop = useDesktopLayout();

const isOpen = Vue.ref(false);
const showVideo = Vue.ref(false);

const nextButtonRef = Vue.ref<HTMLElement | null>(null);

function close() {
  isOpen.value = false;
  basicStore.setConfig({ completedWelcome: true });
}

function startTour() {
  basicStore.setConfig({ tourStep: 1 });
  isOpen.value = false;
}

function expandVideo() {
  showVideo.value = true;
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

useEvent('openWelcomeOverlay', () => {
  isOpen.value = true;
});

Vue.onMounted(() => {
  Vue.nextTick(() => {
    nextButtonRef.value?.focus();
  });
});
</script>

<style lang="scss">
.WelcomeOverlay.Component {
  .welcome-links button {
    min-height: 0;
    padding: 0;
    line-height: inherit;
  }

  a {
    @apply text-fuchsia-600 hover:text-fuchsia-500 underline decoration-dashed;
    cursor: pointer;
  }

  ol {
    list-style-type: none; /* Remove default list style */
    counter-reset: list-counter; /* Initialize counter */
  }

  ol > li {
    counter-increment: list-counter; /* Increment the counter */
    position: relative; /* For absolute positioning of number */
    padding-left: 1.2rem; /* Add space for the custom number */
  }

  ol > li::before {
    content: counter(list-counter) ")"; /* Add custom number with closing parenthesis */
    position: absolute; /* Position number absolutely */
    left: 0; /* Align to the left */
  }

  button[Main] {
    box-shadow: inset 1px 1px 1px 0 rgb(255 255 255 / 0.8);
  }

  [VideoLink] {
    position: relative;

    [SolidIcon] {
      display: none;
    }
    [OutlineIcon] {
      display: inline-block;
    }
    &:hover {
      &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgb(192 38 211 / 0.05);
      }
      [SolidIcon] {
        display: inline-block;
      }
      [OutlineIcon] {
        display: none;
      }
      svg path {
        fill: rgb(192 38 211 / 0.8) !important;
      }
    }
    svg path {
      fill: rgb(192 38 211) !important;
    }
  }
}
</style>
