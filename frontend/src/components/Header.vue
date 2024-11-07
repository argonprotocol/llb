<template>
  <div HeaderBar class="HEADER COMPONENT flex flex-row pl-4 items-center">
    <div class="flex flex-row items-center w-1/3">
      <a :disabled="selectedPanel==='runner'" Logo href="https://argonprotocol.org" class="block w-8 relative top-[1px]"><Logo /></a>
      <h1 :disabled="selectedPanel==='runner'" class="text-2xl font-extralight relative top-[0.5px] text-left pl-[10px] py-3 whitespace-nowrap text-slate-600">Liquid Locking Model</h1>
    </div>
    <div class="relative h-full w-1/3">
      <div class="absolute left-1/2 top-0 w-10/12 bg-[#F8FAFF] rounded -translate-x-1/2 border-[1px] border-slate-800/20 shadow z-[1000]">
        <div class="text-slate-500 whitespace-nowrap h-[56px] border-b mx-3 flex items-center justify-center">
          {{ dayjs(sliderDates.left).format('MMM D, YYYY') }} to {{ dayjs(sliderDates.right).format('MMM D, YYYY') }}
        </div>
        <div class="flex flex-row justify-between px-5">
          <div class="flex flex-col items-center w-1/2 py-3">
            <div :class="{ 'text-green-700': traderReturns.hodler > 0, 'text-red-600': traderReturns.hodler < 0 }" class="text-xl font-bold">{{ formatChangePct(traderReturns.hodler) }}%</div>
            <div class="text-slate-500/70 whitespace-nowrap">Hodler Return</div>
          </div>
          <div class="flex flex-col items-center w-1/2 py-3">
            <div :class="{ 'text-green-700': traderReturns.vaulter > 0, 'text-red-600': traderReturns.vaulter < 0 }" class="text-xl font-bold">{{ addCommas(formatChangePct(traderReturns.vaulter)) }}%</div>
            <div class="text-slate-500/70 whitespace-nowrap">Vaulter Return</div>
          </div>
          <!-- <div class="flex flex-col items-center w-1/3 py-3">
            <div :class="{ 'text-green-700': traderReturns.vaulter > 0, 'text-red-600': improvement < 0 }" class="text-xl font-bold">{{ addCommas(formatChangePct(improvement)) }}%</div>
            <div class="text-slate-500/70 whitespace-nowrap">Improvement</div>
          </div> -->
        </div>
      </div>
    </div>
    <div class="flex flex-row w-1/3 space-x-1 items-center divide-x-2 pr-4 justify-end">      
      <div class="px-1">
        <div class="IconWrapper" :disabled="selectedPanel !== 'base'">
          <DownloadOutlined OutlineIcon class="h-[22px]" />
          <DownloadSolid SolidIcon class="h-[22px]" />
        </div>
      </div>
      <Popover class="px-1 cursor-pointer relative">
        <PopoverButton as="div" class="IconWrapper" id="header-settings-icon">
          <div IconWrapper :disabled="selectedPanel==='runner'">
            <SettingsOutlined OutlineIcon class="h-[24px]" @click="" />
            <SettingsSolid SolidIcon class="h-[24px]" />
          </div>
        </PopoverButton>

        <transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0 translate-y-1" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition ease-in duration-150" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 translate-y-1">
          <PopoverPanel v-slot="{ close }" class="absolute -right-9 z-[1000] mt-3 flex w-screen max-w-min px-4">
            <div class="absolute -top-3 right-7 transform -translate-x-1/2">
              <svg width="24" height="12" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0L24 12H0L12 0Z" fill="white"/>
              </svg>
            </div>
            <div class="w-40 shrink rounded bg-white p-1 pb-1 text-sm font-light leading-6 text-gray-900 shadow-lg ring-1 ring-gray-900/5 text-right whitespace-nowrap">
              <a @click="resetToDefault" class="block pt-2 pb-1 px-3 hover:text-fuchsia-600 hover:bg-[#FAF4FC]">Reset to Default</a>
              <a @click="resetToDefault" class="block pb-2 pt-1 px-3 hover:text-fuchsia-600 hover:bg-[#FAF4FC]">Reset Everything</a>
              <a @click="editConfiguration(close)" class="block py-2 px-3 hover:text-fuchsia-600 border-t border-gray-200 hover:bg-[#FAF4FC]">Edit Configuration</a>
            </div>
          </PopoverPanel>
        </transition>
      </Popover>
      <div class="px-1 cursor-pointer">
        <a class="IconWrapper" :disabled="selectedPanel==='runner'">
          <LightBulbOutlined OutlineIcon class="w-[28px] mt-[-2px] opacity-60" @click="" />
          <LightBulbSolid SolidIcon class="w-[28px] mt-[-2px]" />
        </a>
      </div>
      <div class="px-1 cursor-pointer">
        <a class="IconWrapper" :disabled="selectedPanel==='runner'" href="https://github.com/argonprotocol/stabilization-analysis-model" target="_blank">
          <GithubOutlined OutlineIcon class="h-[24px]" @click="" />
          <GithubSolid SolidIcon class="h-[24px]" />
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as Vue from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';
import DownloadOutlined from '@/assets/download-outlined.svg';
import DownloadSolid from '@/assets/download-solid.svg';
import SettingsOutlined from '@/assets/settings-outlined.svg';
import SettingsSolid from '@/assets/settings-solid.svg';
import GithubOutlined from '@/assets/github-outlined.svg';
import GithubSolid from '@/assets/github-solid.svg';
import Logo from '@/assets/logo.svg';
import { useBasicStore } from '@/stores/basic';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue';
import { formatChangePct, addCommas } from '@/lib/BasicUtils';
import LightBulbOutlined from '@/assets/lightbulb-outlined.svg';
import LightBulbSolid from '@/assets/lightbulb-solid.svg';

const basicStore = useBasicStore();
const { selectedPanel, sliderDates, traderReturns } = storeToRefs(basicStore);
const router = useRouter();

const improvement = Vue.computed(() => {
  return (traderReturns.value.vaulter - traderReturns.value.hodler) / Math.abs(traderReturns.value.hodler);
});

function resetToDefault() {
  basicStore.resetToDefault();
  window.location.reload();
}

function editConfiguration(close: () => void) {
  router.push('/edit');
  close();
}
</script>

<style lang="scss">
  .HEADER.COMPONENT {
    [disabled='true'] {
      opacity: 0.2;
      pointer-events: none;
    }

    &[HeaderBar] {
      border-bottom: 1px solid #b9bcc4;
      box-shadow: 0 1px 0 0 white;
    }

    [Logo] svg path {
      fill: #73179E !important;
    }
    svg[SolidIcon] path {
      fill: #73179E !important;
    }

    .IconWrapper {
      @apply cursor-pointer;
      [SolidIcon] {
        display: none;
      }
      &:hover {
        [OutlineIcon] {
          display: none;
        }
        [SolidIcon] {
          display: block;
        }
      }
    }
  }
</style>

