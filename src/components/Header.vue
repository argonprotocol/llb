<template>
  <div HeaderBar :class="[isLoaded ? 'opacity-100' : 'opacity-50 pointer-events-none']" class="HEADER COMPONENT flex flex-row pl-4 items-center">
    <div class="flex flex-row items-center w-1/3">
      <a Logo href="https://argonprotocol.org" class="block w-8 relative top-[1px]"><Logo /></a>
      <h1 class="text-2xl font-extralight relative top-[0.5px] text-left pl-[10px] py-3 whitespace-nowrap text-slate-600">
        Liquid Locking <span class="hidden xl:inline">for Bitcoin</span>
      </h1>
    </div>
    <div class="relative h-full min-w-[58%] cursor-default">
      <div v-if="isLoaded" class="absolute left-[55%] top-0 min-w-[83%] z-[1000] -translate-x-1/2 ">
        <div class="relative text-slate-500 whitespace-nowrap z-10 h-[56px] px-3 flex items-center justify-center uppercase">
          <div class="absolute -left-4 -right-4 -bottom-4 h-16 z-1" style="background: linear-gradient(to bottom, #E6EAF3 30%, rgba(248, 250, 255, 0));"></div>
          <span class="relative z-10 top-1">RESULTS FROM {{ dayjs.utc(sliderDates.left).format('MMMM D, YYYY') }} TO {{ dayjs.utc(sliderDates.right).format('MMMM D, YYYY') }}</span>
          <div class="absolute left-2 bottom-0 h-[1px] z-1 bg-slate-400/20" style="width: calc(80% - 16px)"></div>
          <div class="absolute right-2 bottom-0 h-[1px] z-1 bg-slate-400/20" style="width: calc(20% - 16px)"></div>
        </div>
        <div ref="scoreboardRef" class="flex flex-row justify-between space-x-1">
          <div class="flex flex-row justify-between relative min-w-[80%] divide-x divide-slate-600/20 py-1">
            <div class="absolute left-0 -top-12 right-0 bottom-0 -z-1 bg-[#F8FAFF] rounded border-[1px] border-slate-800/20 shadow"></div>
            <div class="flex flex-col items-center justify-center min-w-[20%] py-2 px-10" insightId="ratchets" @mouseenter="showInsight" @mouseleave="hideInsight">
              <div class="text-xl font-bold">{{ addCommas(vaultSnapshot.ratchetCount) }}</div>
              <div class="text-slate-500/70 whitespace-nowrap">Ratchet{{ vaultSnapshot.ratchetCount === 1 ? '' : 's' }}</div>
            </div>
            <div class="relative flex flex-col items-center justify-center min-w-[20%] py-2 px-10" insightId="shorts" @mouseenter="showInsight" @mouseleave="hideInsight">
              <div class="absolute left-[-1px] top-2 text-xl font-bold -translate-x-1/2 bg-[#F8FAFF] pointer-events-none">+</div>
              <div class="text-xl font-bold">{{ addCommas(vaultSnapshot.shortCount) }}</div>
              <div class="text-slate-500/70 whitespace-nowrap">Short Cover{{ vaultSnapshot.shortCount === 1 ? '' : 's' }}</div>
            </div>
            <div class="relative flex flex-col items-center justify-center min-w-[30%] py-2 px-1" insightId="cashUnlocked" @mouseenter="showInsight" @mouseleave="hideInsight">
              <div class="absolute left-[-1px] top-2 text-xl font-bold -translate-x-1/2 bg-[#F8FAFF] pointer-events-none">=</div>
              <div class="text-xl font-bold">${{ formatShorthandNumber(vaultSnapshot.totalCashUnlocked) }}</div>
              <div class="text-slate-500/70 whitespace-nowrap">Accrued Cash</div>
            </div>
            <div class="relative flex flex-col items-center justify-center min-w-[30%] py-2 px-1" insightId="vaulterReturns" align="grandparent" @mouseenter="showInsight" @mouseleave="hideInsight" @click="toggleInsightToStick">
              <div :style="{ opacity: vaulterProfitChange.isActive ? 1 : 0 }" :class="{ 'bg-green-200/50': vaulterProfitChange.change > 0, 'bg-red-200/50': vaulterProfitChange.change < 0 }" class="absolute left-1 top-0 right-1 bottom-0 -z-1 transition-opacity ease-in-out duration-1000"></div>
              <div class="absolute left-[-1px] top-2 text-xl font-bold -translate-x-1/2 bg-[#F8FAFF] pointer-events-none">=</div>
              <div :class="{ 'text-green-700': vaultSnapshot.vaulterProfit > 0, 'text-red-600': vaultSnapshot.vaulterProfit < 0 }" class="text-xl font-bold">
                {{ addCommas(formatChangePct(vaultSnapshot.vaulterProfit)) }}%
                <span class="relative h-[16px] w-[1px]">
                  <ArrowUpIcon :style="{ opacity: vaulterProfitChange.isActive && vaulterProfitChange.change > 0 ? 1 : 0 }" class="absolute top-[4.5px] left-1 w-[16px] h-[16px] transition-opacity ease-in-out duration-1000" />
                  <ArrowDownIcon :style="{ opacity: vaulterProfitChange.isActive && vaulterProfitChange.change < 0 ? 1 : 0 }" class="absolute top-[4.5px] left-1 w-[16px] h-[16px] transition-opacity ease-in-out duration-1000" />
                </span>
              </div>
              <div class="text-slate-500/70 whitespace-nowrap">Liquid Locking Return</div>
            </div>
          </div>
          <div class="flex flex-col relative min-w-[20%]">
            <div class="absolute left-0 -top-12 right-0 bottom-0 -z-1 bg-[#F8FAFF] rounded border-[1px] border-slate-800/20 shadow"></div>
            <div class="relative flex flex-col items-center justify-center py-2 my-1" insightId="hodlerReturns" align="grandparent" @mouseenter="showInsight" @mouseleave="hideInsight" @click="toggleInsightToStick">
              <div :style="{ opacity: hodlerProfitChange.isActive ? 1 : 0 }" :class="{ 'bg-green-200/50': hodlerProfitChange.change > 0, 'bg-red-200/50': hodlerProfitChange.change < 0 }" class="absolute left-1 top-0 right-1 bottom-0 -z-1 transition-opacity ease-in-out duration-1000"></div>
              <div class="absolute left-[-1px] top-3 font-bold -translate-x-1/2 bg-[#F8FAFF] border-[1px] border-slate-600/20 px-2 -py-2 rounded">vs</div>
              <div :class="{ 'text-green-700': vaultSnapshot.hodlerProfit > 0, 'text-red-600': vaultSnapshot.hodlerProfit < 0 }" class="text-xl font-bold text-center w-full">
                {{ addCommas(formatChangePct(vaultSnapshot.hodlerProfit)) }}%
                <span class="relative h-[16px] w-[1px]">
                  <ArrowUpIcon :style="{ opacity: hodlerProfitChange.isActive && hodlerProfitChange.change > 0 ? 1 : 0 }" class="absolute top-[4.5px] left-1 w-[16px] h-[16px] transition-opacity ease-in-out duration-1000" />
                  <ArrowDownIcon :style="{ opacity: hodlerProfitChange.isActive && hodlerProfitChange.change < 0 ? 1 : 0 }" class="absolute top-[4.5px] left-1 w-[16px] h-[16px] transition-opacity ease-in-out duration-1000" />
                </span>
              </div>
              <div class="text-slate-500/70 whitespace-nowrap text-center w-full">Hodling Return</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="flex flex-row w-1/3 space-x-1 items-center divide-x-1 pr-4 justify-end">      

      <div class="px-1">
        <div @click="resetConfig" class="IconWrapper" @mouseenter="showTooltip($event, 'Reset to Default')" @mouseleave="hideTooltip">
          <ResetOutlined OutlineIcon class="h-[24px]" />
          <ResetSolid SolidIcon class="h-[24px]" />
        </div>
      </div>

      <div class="px-1">
        <div @click="downloadRawData" class="IconWrapper" @mouseenter="showTooltip($event, 'Download')" @mouseleave="hideTooltip">
          <DownloadOutlined OutlineIcon class="h-[24px]" />
          <DownloadSolid SolidIcon class="h-[24px]" />
        </div>
      </div>
      
      <div class="px-1 cursor-pointer">
        <div @click="openVideoOverlay" class="IconWrapper" @mouseenter="showTooltip($event, 'Watch Video')" @mouseleave="hideTooltip">
          <PlayOutlined OutlineIcon class="w-[24px]" />
          <PlaySolid SolidIcon class="w-[24px]" />
        </div>
      </div>

      <MoreInfoMenu ref="moreInfoMenuRef" />

      <div class="px-1 cursor-pointer">
        <a class="IconWrapper"href="https://github.com/argonprotocol/llb" target="_blank" @mouseenter="showTooltip($event, 'Open Codebase')" @mouseleave="hideTooltip">
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
import emitter from '../emitters/basic';
import Download from '../lib/Download';
import * as InsightUtils from '../lib/InsightUtils';
import * as TooltipUtils from '../lib/TooltipUtils';
import ArrowUpIcon from '@/assets/arrow-up.svg';
import ArrowDownIcon from '@/assets/arrow-down.svg';
import PlayOutlined from '@/assets/play-outlined.svg';
import PlaySolid from '@/assets/play-solid.svg';
import MoreInfoMenu from './MoreInfoMenu.vue';
import ResetOutlined from '@/assets/reset-outlined.svg';
import ResetSolid from '@/assets/reset-solid.svg';
import VaultSnapshot from '../lib/VaultSnapshot';

const basicStore = useBasicStore();
const { bitcoinCount, sliderDates, isLoaded, vaultSnapshot } = storeToRefs(basicStore);

const scoreboardRef = Vue.ref<HTMLElement | null>(null);
const moreInfoMenuRef = Vue.ref<typeof MoreInfoMenu | null>(null);

basicStore.registerPositionCheck('scoreboard', () => {
  return scoreboardRef.value?.getBoundingClientRect() || { left: 0, top: 0, right: 0, bottom: 0 } as DOMRect;
});

basicStore.registerPositionCheck('informationIcon', () => {
  const buttonElem = moreInfoMenuRef.value?.$menuButtonElem as HTMLElement;
  return buttonElem?.getBoundingClientRect() || { left: 0, top: 0, right: 0, bottom: 0 } as DOMRect;
});

function resetConfig() {
  emitter.emit('openConfirmConfigReset');
}

function openVideoOverlay(closeFn?: () => void) {
  emitter.emit('openVideoOverlay');
  closeFn?.();
}

async function downloadRawData() {
  await vaultSnapshot.value?.isLoaded;
  new Download(vaultSnapshot.value).run();
}

function showTooltip(event: MouseEvent, label: string) {
  TooltipUtils.showTooltip(event, label);
}

function hideTooltip(event: MouseEvent, forceHide = false) {
  TooltipUtils.hideTooltip();
}

const insightIdToStick = Vue.ref<string | null>(null);

function toggleInsightToStick(event: MouseEvent) {
  if (insightIdToStick.value) {
    insightIdToStick.value = null;
    emitter.emit('unstickInsight');
    return;
  } 

  const targetElem = event.currentTarget as HTMLElement;
  if (!targetElem) return;

  const id = targetElem.getAttribute('insightId') || '';
  insightIdToStick.value = id;

  emitter.emit('stickInsight');
}

function showInsight(event: MouseEvent) {
  hideInsight(event, true);

  if (moreInfoMenuRef.value?.$menuElem) {
    moreInfoMenuRef.value.$menuButtonElem.click();
  }

  const targetElem = event.currentTarget as HTMLElement;
  if (!targetElem) return;

  const id = targetElem.getAttribute('insightId') || '';
  const data: any = {};

  if (['vaulterReturns', 'hodlerReturns'].includes(id)) {
    const snapshot = vaultSnapshot.value as VaultSnapshot;
    data.bitcoinCount = bitcoinCount.value;
    data.startingDate = sliderDates.value.left;
    data.endingDate = sliderDates.value.right;
    data.startingBtcValue = snapshot.startingPrice * bitcoinCount.value;
    data.endingBtcValue = snapshot.endingPrice * bitcoinCount.value;
    data.totalExpenses = snapshot.totalExpenses || 0;
    data.totalAccruedValue = snapshot.totalAccruedValue || 0;
    data.vaulterProfit = snapshot.vaulterProfit || 0;
    data.hodlerExpenses = snapshot.hodlerExpenses || 0;
    data.hodlerProfit = snapshot.hodlerProfit || 0;
    data.totalHodlerValue = snapshot.totalHodlerValue || 0;
    data.profitFromShorts = snapshot.profitFromShorts || 0;
    data.profitFromInitialLock = snapshot.profitFromInitialLock || 0;

    data.profitFromRatchets = snapshot.totalAccruedValue - (
      snapshot.profitFromInitialLock +
      snapshot.profitFromShorts + 
      (snapshot.endingPrice * bitcoinCount.value)
    );
  }

  InsightUtils.showInsight(event, data, insightIdToStick.value === id);
}

function hideInsight(event: MouseEvent, forceHide = false) {
  const targetElem = event.currentTarget as HTMLElement;
  if (!targetElem) return;

  const id = targetElem.getAttribute('insightId') || '';
  if (!forceHide && id === insightIdToStick.value) return;
  if (forceHide) insightIdToStick.value = null;

  InsightUtils.hideInsight();
}

function displayChange(newValue: number | undefined, oldValue: number | undefined) {
  const changeObj: any = this;

  if (changeObj.value.isActive) {
    clearTimeout(changeObj.value.isActive);
    changeObj.value.isActive = false;
  }
  changeObj.value = {
    change: (newValue || 0) - (oldValue || 0),
    isActive: setTimeout(() => {
      changeObj.value.isActive = false;
    }, 1000),
  }
}

const vaulterProfitChange = Vue.ref<any>({});
const hodlerProfitChange = Vue.ref<any>({});

Vue.watch(() => vaultSnapshot.value?.vaulterProfit, displayChange.bind(vaulterProfitChange));
Vue.watch(() => vaultSnapshot.value.hodlerProfit, displayChange.bind(hodlerProfitChange));
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