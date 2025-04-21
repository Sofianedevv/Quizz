<template>
  <div class="max-w-md mx-auto">
    <div :class="[quizStore.isDayMode ? 'bg-white' : 'bg-gray-800', 'rounded-xl shadow-lg p-8']">
      <h2 class="text-2xl font-bold mb-6 text-center" :class="{'text-gray-800': quizStore.isDayMode, 'text-white': !quizStore.isDayMode}">
        Connexion
      </h2>
      
      <div v-if="errorMessage" class="mb-6 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-300 text-sm">
        {{ errorMessage }}
      </div>
      
      <form @submit.prevent="login" class="space-y-6">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-400 mb-2">Nom d'utilisateur</label>
          <input 
            type="text" 
            id="username" 
            v-model="username" 
            class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            required
          />
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium text-gray-400 mb-2">Mot de passe</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            required
          />
        </div>
        
        <div>
          <button 
            type="submit" 
            class="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity"
            :disabled="isLoading"
          >
            <span v-if="isLoading">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connexion en cours...
            </span>
            <span v-else>Se connecter</span>
          </button>
        </div>
      </form>
      
      <div class="mt-6 text-center">
        <p class="text-gray-400">
          Pas encore de compte ? 
          <NuxtLink to="/auth/register" class="text-pink-500 hover:text-pink-400">
            Créer un compte
          </NuxtLink>
        </p>
      </div>
      
      <div class="mt-8 text-center">
        <NuxtLink to="/" class="text-gray-400 hover:text-white flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour à l'accueil
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuizStore } from '~/stores/quiz';
import { useRouter } from 'vue-router';

const quizStore = useQuizStore();
const router = useRouter();

const username = ref('');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

async function login() {
  if (!username.value || !password.value) {
    errorMessage.value = 'Veuillez remplir tous les champs';
    return;
  }
  
  isLoading.value = true;
  errorMessage.value = '';
  
  try {
    const success = quizStore.login(username.value, password.value);
    
    if (success) {
      // Redirection vers la page d'accueil après connexion réussie
      router.push('/');
    } else {
      errorMessage.value = 'Nom d\'utilisateur ou mot de passe incorrect';
    }
  } catch (error) {
    console.error('Erreur de connexion:', error);
    errorMessage.value = 'Une erreur est survenue lors de la connexion';
  } finally {
    isLoading.value = false;
  }
}
</script> 