<template>
  <div :class="{
    'animated-gradient text-gray-800': quizStore.isDayMode, 
    'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white': !quizStore.isDayMode
  }" class="min-h-screen">
    <ToggleModeButton />
    <div class="container mx-auto px-4 py-6">
      <header class="flex justify-between items-center mb-8">
        <NuxtLink to="/" class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r" 
          :class="{'from-pink-500 to-blue-500': quizStore.isDayMode, 'from-pink-500 to-purple-500': !quizStore.isDayMode}">
          Quiz Master
        </NuxtLink>
        <div class="flex items-center space-x-4">
          <NuxtLink v-if="quizStore.currentUser" to="/favorites" 
            :class="{'text-pink-600 hover:text-pink-800 font-medium': quizStore.isDayMode, 'text-pink-400 hover:text-pink-300': !quizStore.isDayMode}">
            Favoris
          </NuxtLink>
          <NuxtLink v-if="quizStore.currentUser" to="/leaderboard" 
            :class="{'text-blue-600 hover:text-blue-800 font-medium': quizStore.isDayMode, 'text-pink-400 hover:text-pink-300': !quizStore.isDayMode}">
            Classement
          </NuxtLink>
          <NuxtLink v-if="!quizStore.currentUser" to="/auth/login" 
            :class="{'text-green-600 hover:text-green-800 font-medium': quizStore.isDayMode, 'text-pink-400 hover:text-pink-300': !quizStore.isDayMode}">
            Connexion
          </NuxtLink>
          <NuxtLink v-if="!quizStore.currentUser" to="/auth/register" 
            :class="{'text-yellow-600 hover:text-yellow-800 font-medium': quizStore.isDayMode, 'text-pink-400 hover:text-pink-300': !quizStore.isDayMode}">
            Inscription
          </NuxtLink>
        </div>
      </header>
      
      <slot />
    </div>
  </div>
</template>

<script setup>
import { useQuizStore } from '~/stores/quiz';
import ToggleModeButton from '~/components/ToggleModeButton.vue';

const quizStore = useQuizStore();
</script>

<style>
@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.animated-gradient {
  background: linear-gradient(-45deg, #fcd5ce, #b8e0f6, #c1f8cf, #ffffff, #fef3c7);
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;
}
</style> 