<template>
  <Transition name="fade">
    <div class="welcome" v-if="visible">
      <div class="greeting">Добро пожаловать</div>
      <div class="name">{{ playerName }}</div>
      <div class="stats">
        <div class="stat">
          <span class="dot red"></span>
          <div class="bar"><div class="fill red" :style="{ width: health + '%' }"></div></div>
          <span>{{ health }}</span>
        </div>
        <div class="stat">
          <span class="dot green"></span>
          <span class="green">${{ money }}</span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const visible = ref(false)
const playerName = ref('E')
const health = ref(100)
const money = ref(0)

onMounted(() => {
  if (window.cef) {
    window.cef.on('onPlayerData', (name: string, m: number, hp: number) => {
        playerName.value = name
        money.value = m
        health.value = hp
        visible.value = true
        setTimeout(() => visible.value = false, 5000)
    })
  } else {
    playerName.value = 'Easy_Code'
    money.value = 5000
    health.value = 85
    visible.value = true
  }
})
</script>

<style scoped>
* { margin: 0; padding: 0; box-sizing: border-box; }

body { background: transparent; }

.welcome {
  position: fixed;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 32px 40px;
  text-align: center;
  color: white;
  min-width: 260px;
}
.greeting {
  font-size: 10px;
  color: rgba(255,255,255,0.4);
  text-transform: uppercase;
  letter-spacing: 3px;
  margin-bottom: 4px;
}

.name {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 20px;
}

.stats {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: rgba(255,255,255,0.7);
}

.dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot.red   { background: #e74c3c; }
.dot.green { background: #2ecc71; }

.bar {
  flex: 1; height: 4px;
  background: rgba(255,255,255,0.1);
  border-radius: 2px;
  overflow: hidden;
}

.fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.5s ease;
}
.fill.red { background: #e74c3c; }

.green { color: #2ecc71; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.4s, transform 0.4s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translate(-50%, -46%); }
.fade-enter-to, .fade-leave-from { opacity: 1; transform: translate(-50%, -50%); }
</style>
