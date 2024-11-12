<template>
  <TransitionRoot as="template" :show="isOpen">
    <Dialog>
      <TransitionChild as="template" enter="ease-out duration-150" enter-from="opacity-0 -translate-y-10" enter-to="opacity-100 translate-y-0" leave="ease-in duration-100" leave-from="opacity-100 translate-y-0" leave-to="opacity-0 -translate-y-10">
        <DialogPanel ref="dialogRef" :style="{ left: `${left}px`, top: `${top}px` }" class="absolute z-[2000] transform rounded-md bg-white px-5 pb-4 pt-5 text-left shadow transition-all w-full max-w-80">
          <div :style="{ left: `${arrowLeft}px` }" class="absolute top-0 -translate-x-1/2 -translate-y-full">
            <svg class="relative z-10" width="12" height="6" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0L24 12H0L12 0Z" fill="white"/>
            </svg>
            <svg class="absolute z-0 -top-0.5 left-[-0.5px] opacity-[0.05]" width="13" height="7" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0L24 12H0L12 0Z" fill="black"/>
            </svg>
          </div>
          
          <div class="grow">
            
            <div v-if="id === 'bitcoinCount'">
              <label for="bitcoinCount" class="block text-sm/6 font-medium text-gray-900">Bitcoin Quantity</label>
              <div class="mt-2">
                <input type="text" @keydown="handleKeyPress" v-model="value" name="bitcoinCount" id="bitcoinCount" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6" />
              </div>
            </div>

            <div v-else-if="id === 'ratchetPct'">
              <label for="email" class="block text-sm/6 font-medium text-gray-900">Ratchet Only If Bitcoin Price Changes By</label>
              <div class="mt-2">
                <input type="text" @keydown="handleKeyPress" v-model="value" name="ratchetPct" id="ratchetPct" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6" />
              </div>
            </div>
            
          </div>
          <div class="mt-7 flex flex-row">
            <button type="button" class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto" @click="cancel" ref="cancelButtonRef">Cancel</button>
            <button type="button" class="inline-flex w-full justify-center rounded-md bg-fuchsia-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-fuchsia-500 sm:ml-3 sm:w-auto" @click="save">Save</button>
          </div>

        </DialogPanel>
      </TransitionChild>
    </Dialog>
  </TransitionRoot>
</template>


<script setup lang="ts">
import * as Vue from 'vue'
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'
import emitter from '../emitters/basic';

const isOpen = Vue.ref(false);
const nextButtonRef = Vue.ref<HTMLElement | null>(null);
const dialogRef = Vue.ref<{ $el: HTMLElement } | null>(null);

const id = Vue.ref('');
const left = Vue.ref(0);
const top = Vue.ref(0);
const arrowLeft = Vue.ref(0);
const value = Vue.ref('');
const type = Vue.ref('');

emitter.on('showEditorOverlay', (data: any) => {
  id.value = data.id;
  type.value = data.type;
  left.value = data.left;
  top.value = data.top + 11;
  arrowLeft.value = data.arrowLeft;
  value.value = data.value;
  showOverlay();
});

function showOverlay() {
  console.log('showOverlay');
  isOpen.value = true;
  setTimeout(() => {
    window.addEventListener('click', onClickOutside);
  }, 100);
}

function hideOverlay(data: any = {}) {
  isOpen.value = false;
  data.type = type.value;
  data.id = id.value;
  emitter.emit('hideEditorOverlay', data);
  window.removeEventListener('click', onClickOutside);
}

function onClickOutside(event: MouseEvent) {
  if (!isOpen.value) return;
  const dialogElem = dialogRef.value?.$el;
  if (dialogElem?.contains(event.target as Node)) return;
  hideOverlay();
}

function onResize() {
  if (!isOpen.value) return;
  hideOverlay();
}


function cancel() {
  hideOverlay();
}

function save() {
  hideOverlay({ isSaving: true, value: value.value });
}

function handleKeyPress(event: KeyboardEvent) {
  if (event.key === 'ArrowUp') {
    value.value = Math.max(0, Number(value.value) + 1).toString();
  } else if (event.key === 'ArrowDown') {
    value.value = Math.max(0, Number(value.value) - 1).toString();
  } else if (event.key === 'Enter') {
    save();
  } else if (event.key === 'Escape') {
    hideOverlay();
  }
}

Vue.watch(value, (val) => {
  if (['number', 'dollar', 'percent'].includes(type.value)) {
    if (typeof value.value === 'number') return;
    value.value = val.replace(/[^0-9.]/g, '');
  }
});

Vue.onMounted(() => {
  Vue.nextTick(() => {
    nextButtonRef.value?.focus();
  });
  window.addEventListener('resize', onResize);
});

Vue.onUnmounted(() => {
  window.removeEventListener('click', onClickOutside);
  window.removeEventListener('resize', onResize);
});

</script>
