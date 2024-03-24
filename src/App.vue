<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { ref } from 'vue'

import { Input as VarInput } from '@varlet/ui'
import '@varlet/ui/es/input/style/index'
import { Button as VarButton } from '@varlet/ui'
import '@varlet/ui/es/button/style/index'

const tickOffset = ref(0)
const subtitleBottomMargin = ref('3.8%')

onBeforeMount(async () => {
  tickOffset.value = (await chrome.storage.local.get('tickOffset'))['tickOffset'] ?? 0
  subtitleBottomMargin.value = (await chrome.storage.local.get('subtitleBottomMargin'))['subtitleBottomMargin'] ?? '3.8%'
})

function handleSettingUpdate() {
  chrome.storage.local.set({
    tickOffset: tickOffset.value,
    subtitleBottomMargin: subtitleBottomMargin.value,
  })

  chrome.tabs.query({ currentWindow: true, active: true }).then((tabs) => {
    chrome.tabs.sendMessage(tabs[0].id!, 'update')
  })
}
</script>

<template>
  <div class="flex w-52 flex-col p-6 text-start shadow-md">
    <div class="text-base font-bold">Netflix Dual Subtitle Kitty</div>
    <div class="text-sm">by. 柒夜雨猫</div>

    <div class="mt-3">
      <div class="text-lg font-bold">Guide:</div>
      <div class="text-base">
        The first selected or already selected subtitle once page entered will be loaded as secondary subtitle. Then select another subtile
        to set it as primary subtitle (If you want to change secondary subtitle, just select it and refresh the page then select the primary
        subtitle)
      </div>
    </div>

    <div class="mt-3 flex flex-col">
      <!-- @vue-ignore -->
      <var-input v-model="tickOffset" type="number" placeholder="Tick Offset" />
      <var-input v-model="subtitleBottomMargin" placeholder="Bottom Margin" />
      <var-button type="primary" @click="handleSettingUpdate" class="mt-3">Save Settings</var-button>
    </div>
  </div>
</template>
