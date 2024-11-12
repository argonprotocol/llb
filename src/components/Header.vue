<template>
  <div HeaderBar :class="[isLoaded ? 'opacity-100' : 'opacity-50 pointer-events-none']" class="HEADER COMPONENT flex flex-row pl-4 items-center">
    <div class="flex flex-row items-center w-1/3">
      <a Logo href="https://argonprotocol.org" class="block w-8 relative top-[1px]"><Logo /></a>
      <h1 class="text-2xl font-extralight relative top-[0.5px] text-left pl-[10px] py-3 whitespace-nowrap text-slate-600">
        Liquid Locking <span class="hidden xl:inline">for Bitcoin</span>
      </h1>
    </div>
    <div class="relative h-full min-w-[58%]">
      <div v-if="isLoaded" class="absolute left-[55%] top-0 min-w-[83%] z-[1000] -translate-x-1/2 ">
        <div class="relative text-slate-500 whitespace-nowrap z-10 h-[56px] px-3 flex items-center justify-center uppercase">
          <div class="absolute -left-4 -right-4 -bottom-4 h-16 z-1" style="background: linear-gradient(to bottom, #E6EAF3 30%, rgba(248, 250, 255, 0));"></div>
          <span class="relative z-10 top-1">VAULTING RESULTS FROM {{ dayjs.utc(sliderDates.left).format('MMMM D, YYYY') }} TO {{ dayjs.utc(sliderDates.right).format('MMMM D, YYYY') }}</span>
          <div class="absolute left-2 bottom-0 h-[1px] z-1 bg-slate-400/20" style="width: calc(80% - 16px)"></div>
          <div class="absolute right-2 bottom-0 h-[1px] z-1 bg-slate-400/20" style="width: calc(20% - 16px)"></div>
        </div>
        <div ref="scoreboardRef" class="flex flex-row justify-between space-x-1">
          <div class="flex flex-row justify-between relative min-w-[80%] divide-x divide-slate-600/20 py-1">
            <div class="absolute left-0 -top-12 right-0 bottom-0 -z-1 bg-[#F8FAFF] rounded border-[1px] border-slate-800/20 shadow"></div>
            <div class="flex flex-col items-center justify-center min-w-[20%] py-2 px-10" insightId="ratchets" @mouseenter="showInsight" @mouseleave="hideInsight">
              <div class="text-xl font-bold">{{ addCommas(vaultStats.ratchetCount) }}</div>
              <div class="text-slate-500/70 whitespace-nowrap">Ratchet{{ vaultStats.ratchetCount === 1 ? '' : 's' }}</div>
            </div>
            <div class="relative flex flex-col items-center justify-center min-w-[20%] py-2 px-10" insightId="shorts" @mouseenter="showInsight" @mouseleave="hideInsight">
              <div class="absolute left-[-1px] top-2 text-xl font-bold -translate-x-1/2 bg-[#F8FAFF] pointer-events-none">+</div>
              <div class="text-xl font-bold">{{ addCommas(vaultStats.shortCount) }}</div>
              <div class="text-slate-500/70 whitespace-nowrap">Short Cover{{ vaultStats.shortCount === 1 ? '' : 's' }}</div>
            </div>
            <div class="relative flex flex-col items-center justify-center min-w-[30%] py-2 px-1" insightId="cashUnlocked" @mouseenter="showInsight" @mouseleave="hideInsight">
              <div class="absolute left-[-1px] top-2 text-xl font-bold -translate-x-1/2 bg-[#F8FAFF] pointer-events-none">=</div>
              <div class="text-xl font-bold">${{ formatShorthandNumber(vaultStats.cashUnlocked) }}</div>
              <div class="text-slate-500/70 whitespace-nowrap">Accrued Cash</div>
            </div>
            <div class="relative flex flex-col items-center justify-center min-w-[30%] py-2 px-1" insightId="vaulterReturns" align="grandparent" @mouseenter="showInsight" @mouseleave="hideInsight">
              <div class="absolute left-[-1px] top-2 text-xl font-bold -translate-x-1/2 bg-[#F8FAFF] pointer-events-none">=</div>
              <div :class="{ 'text-green-700': vaultStats.vaulterProfit > 0, 'text-red-600': vaultStats.vaulterProfit < 0 }" class="text-xl font-bold">{{ addCommas(formatChangePct(vaultStats.vaulterProfit)) }}%</div>
              <div class="text-slate-500/70 whitespace-nowrap">Vaulter Return</div>
            </div>
          </div>
          <div class="flex flex-col relative min-w-[20%]">
            <div class="absolute left-0 -top-12 right-0 bottom-0 -z-1 bg-[#F8FAFF] rounded border-[1px] border-slate-800/20 shadow"></div>
            <div class="relative flex flex-col items-center justify-center py-2 my-1" insightId="hodlerReturns" align="grandparent" @mouseenter="showInsight" @mouseleave="hideInsight">
              <div class="absolute left-[-1px] top-3 font-bold -translate-x-1/2 bg-[#F8FAFF] border-[1px] border-slate-600/20 px-2 -py-2 rounded">vs</div>
              <div :class="{ 'text-green-700': vaultStats.hodlerProfit > 0, 'text-red-600': vaultStats.hodlerProfit < 0 }" class="text-xl font-bold text-center w-full">{{ addCommas(formatChangePct(vaultStats.hodlerProfit)) }}%</div>
              <div class="text-slate-500/70 whitespace-nowrap text-center w-full">Hodler Return</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="flex flex-row w-1/3 space-x-1 items-center divide-x-2 pr-4 justify-end">      
      <div class="px-1">
        <div @click="downloadRawData" class="IconWrapper" insightId="download" align="right" @mouseenter="showInsight" @mouseleave="hideInsight">
          <DownloadOutlined OutlineIcon class="h-[24px]" />
          <DownloadSolid SolidIcon class="h-[24px]" />
        </div>
      </div>
      <div class="px-1 cursor-pointer">
        <a @click="openTheKeyOverlay" class="IconWrapper" insightId="information" align="right" @mouseenter="showInsight" @mouseleave="hideInsight">
          <InformationOutlined OutlineIcon class="w-[24px]" />
          <InformationSolid SolidIcon class="w-[24px]" />
        </a>
      </div>
      <div class="px-1 cursor-pointer">
        <a class="IconWrapper"href="https://github.com/argonprotocol/bvm" target="_blank" insightId="github" align="right" @mouseenter="showInsight" @mouseleave="hideInsight">
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
import { useBasicStore } from '../store';
import { formatChangePct, addCommas, formatShorthandNumber } from '../lib/BasicUtils';
import InformationOutlined from '@/assets/information-outlined.svg';
import InformationSolid from '@/assets/information-solid.svg';
import emitter from '../emitters/basic';
import Download from '../lib/Download';
import * as InsightOverlay from '../lib/InsightUtils';
import Vault from '../lib/Vault';

const basicStore = useBasicStore();
const { vaultStats, bitcoinCount, sliderDates, isLoaded, vault } = storeToRefs(basicStore);

const scoreboardRef = Vue.ref<HTMLElement | null>(null);

function downloadRawData() {
  new Download(vault.value).run();
}

function openTheKeyOverlay() {
  emitter.emit('openTheKeyOverlay');
}

function showInsight(event: MouseEvent) {
  const targetElem = event.currentTarget as HTMLElement;
  if (!targetElem) return;

  const id = targetElem.getAttribute('insightId') || '';
  const data: any = {};

  if (['vaulterReturns', 'hodlerReturns'].includes(id)) {
    const activeVault = vault.value as Vault;
    data.bitcoinCount = bitcoinCount.value;
    data.startingDate = sliderDates.value.left;
    data.endingDate = sliderDates.value.right;
    data.startingBtcValue = activeVault.startingPrice * bitcoinCount.value;
    data.endingBtcValue = activeVault.endingPrice * bitcoinCount.value;
    data.totalExpenses = activeVault.totalExpenses || 0;
    data.totalAccruedValue = activeVault.totalAccruedValue || 0;
    data.vaulterProfit = activeVault.vaulterProfit || 0;
    data.hodlerExpenses = activeVault.hodlerExpenses || 0;
    data.hodlerProfit = activeVault.hodlerProfit || 0;
    data.totalHodlerValue = activeVault.totalHodlerValue || 0;
    data.profitFromShorts = activeVault.profitFromShorts || 0;
    data.profitFromInitialLock = activeVault.profitFromInitialLock || 0;

    data.profitFromRatchets = activeVault.totalAccruedValue - (
      activeVault.profitFromInitialLock +
      activeVault.profitFromShorts + 
      (activeVault.endingPrice * bitcoinCount.value)
    );
  }

  InsightOverlay.showInsight(event, data);
}

function hideInsight(event: MouseEvent) {
  InsightOverlay.hideInsight();
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