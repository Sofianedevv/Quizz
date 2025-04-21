<template>
  <div :class="{
    'bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 text-gray-800': quizStore.isDayMode, 
    'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white': !quizStore.isDayMode
  }" class="min-h-screen">
    <div class="container mx-auto px-4 py-12">
      <header class="text-center mb-12 relative">
        <!-- Bouton de retour à la page d'accueil -->
        <NuxtLink to="/" class="absolute left-0 top-1/2 transform -translate-y-1/2 flex items-center"
          :class="{'text-blue-600 hover:text-blue-800': quizStore.isDayMode, 'text-pink-400 hover:text-pink-300': !quizStore.isDayMode}">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour
        </NuxtLink>
        
        <h1 class="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r mb-4"
          :class="{'from-blue-500 to-indigo-600': quizStore.isDayMode, 'from-pink-500 to-purple-500': !quizStore.isDayMode}">
          Mes Favoris
        </h1>
        <p :class="{'text-gray-600': quizStore.isDayMode, 'text-gray-300': !quizStore.isDayMode}" class="text-xl">
          Retrouvez tous vos quizz préférés
        </p>
      </header>

      <!-- Contenu principal -->
      <div v-if="!quizStore.currentUser" class="text-center py-16">
        <h2 class="text-2xl font-semibold mb-4">Vous devez être connecté pour voir vos favoris</h2>
        <NuxtLink to="/auth/login" class="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition">
          Se connecter
        </NuxtLink>
      </div>
      
      <div v-else-if="favoriteQuizzes.length === 0" class="text-center py-16">
        <h2 class="text-2xl font-semibold mb-4">Vous n'avez pas encore de favoris</h2>
        <p class="mb-6">Explorez nos quizz et ajoutez-les à vos favoris en cliquant sur l'étoile</p>
        <NuxtLink to="/" class="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition">
          Explorer les quizz
        </NuxtLink>
      </div>
      
      <div v-else>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuizCard 
            v-for="quiz in favoriteQuizzes" 
            :key="quiz.id" 
            :quiz="quiz" 
            @start="startQuiz(quiz.id)" 
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useQuizStore } from '~/stores/quiz';
import { useRouter } from 'vue-router';
import QuizCard from '~/components/QuizCard.vue';

const quizStore = useQuizStore();
const router = useRouter();
const favoriteQuizzes = computed(() => quizStore.getFavoriteQuizzes);

function startQuiz(quizId) {
  quizStore.startQuiz(quizId);
  router.push(`/quiz/${quizId}`);
}
</script> 