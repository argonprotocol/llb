<template>
  <div HeaderBar :class="[isLoaded ? 'opacity-100' : 'opacity-50 pointer-events-none']" class="HEADER COMPONENT flex flex-row pl-4 items-center">
    <div class="flex flex-row items-center w-1/3">
      <a Logo href="https://argonprotocol.org" class="block w-8 relative top-[1px]"><Logo /></a>
      <h1 class="text-2xl font-extralight relative top-[0.5px] text-left pl-[10px] py-3 whitespace-nowrap text-slate-600">Bitcoin Vaulting Model</h1>
    </div>
    <div class="relative h-full w-7/12">
      <div v-if="isLoaded" class="absolute left-1/2 top-0 w-10/12 z-[1000] -translate-x-1/2 ">
        <div class="text-slate-500 whitespace-nowrap h-[56px] border-b mx-3 flex items-center justify-center uppercase">
          Result of Bitcoin Vaulting Between {{ dayjs(sliderDates.left).format('MMM D, YYYY') }} and {{ dayjs(sliderDates.right).format('MMM D, YYYY') }}
        </div>
        <div class="flex flex-row justify-between">
          <div class="flex flex-row justify-between bg-[#F8FAFF] rounded border-[1px] border-slate-800/20 shadow w-[80%]">
            <div class="flex flex-col items-center w-1/4 py-3">
            <div class="text-xl font-bold">{{ formatChangePct(traderReturns.hodler) }}</div>
              <div class="text-slate-500/70 whitespace-nowrap">Ratchets</div>
            </div>
            <div class="flex flex-col items-center w-1/4 py-3">
              <div class="text-xl font-bold">{{ addCommas(formatChangePct(traderReturns.vaulter)) }}</div>
              <div class="text-slate-500/70 whitespace-nowrap">Shorts</div>
            </div>
            <div class="flex flex-col items-center w-1/4 py-3">
              <div class="text-xl font-bold">${{ addCommas(formatChangePct(traderReturns.vaulter)) }}</div>
              <div class="text-slate-500/70 whitespace-nowrap">Liquid Cash</div>
            </div>
            <div class="flex flex-col items-center w-1/4 py-3">
              <div :class="{ 'text-green-700': traderReturns.vaulter > 0, 'text-red-600': traderReturns.vaulter < 0 }" class="text-xl font-bold">{{ addCommas(formatChangePct(traderReturns.vaulter)) }}%</div>
              <div class="text-slate-500/70 whitespace-nowrap">Vaulter Return</div>
            </div>
          </div>
          <div class="flex flex-col bg-[#F8FAFF] rounded border-[1px] border-slate-800/20 shadow w-[20%]">
            <div class="flex flex-col items-center py-3">
              <div :class="{ 'text-green-700': traderReturns.vaulter > 0, 'text-red-600': traderReturns.vaulter < 0 }" class="text-xl font-bold">{{ addCommas(formatChangePct(traderReturns.vaulter)) }}%</div>
              <div class="text-slate-500/70 whitespace-nowrap">Hodler Return</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="flex flex-row w-1/3 space-x-1 items-center divide-x-2 pr-4 justify-end">      
      <div class="px-1">
        <div class="IconWrapper">
          <DownloadOutlined OutlineIcon class="h-[24px]" />
          <DownloadSolid SolidIcon class="h-[24px]" />
        </div>
      </div>
      <div class="px-1 cursor-pointer">
        <a class="IconWrapper">
          <InformationOutlined OutlineIcon class="w-[24px]" @click="" />
          <InformationSolid SolidIcon class="w-[24px]" />
        </a>
      </div>
      <div class="px-1 cursor-pointer">
        <a class="IconWrapper"href="https://github.com/argonprotocol/bvm" target="_blank">
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
import dayjs from 'dayjs';
import DownloadOutlined from '@/assets/download-outlined.svg';
import DownloadSolid from '@/assets/download-solid.svg';
import GithubOutlined from '@/assets/github-outlined.svg';
import GithubSolid from '@/assets/github-solid.svg';
import Logo from '@/assets/logo.svg';
import { useBasicStore } from '@/store';
import { formatChangePct, addCommas } from '@/lib/BasicUtils';
import InformationOutlined from '@/assets/information-outlined.svg';
import InformationSolid from '@/assets/information-solid.svg';

const basicStore = useBasicStore();
const { sliderDates, traderReturns, isLoaded } = storeToRefs(basicStore);

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

