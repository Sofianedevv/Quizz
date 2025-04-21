<template>
  <div :class="{'bg-white text-black': quizStore.isDayMode, 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white': !quizStore.isDayMode}">
    <div class="container mx-auto px-4 py-12">
      <header class="text-center mb-12">
        <h1 class="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-4">Classement</h1>
        <p class="text-xl text-gray-300">Découvrez les meilleurs joueurs de Quiz Master</p>
        
        <div class="mt-6 flex justify-center">
          <NuxtLink to="/" class="flex items-center text-pink-400 hover:text-pink-300 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour à l'accueil
          </NuxtLink>
          <ToggleModeButton />
        </div>
      </header>

      <!-- Section du podium -->
      <div v-if="leaderboard.length > 0" class="bg-gray-800 rounded-xl p-6 shadow-lg mb-10">
        <h2 class="text-2xl font-semibold text-pink-400 mb-8 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          Podium des meilleurs joueurs
        </h2>
        
        <div class="flex flex-col md:flex-row justify-center items-end space-y-6 md:space-y-0 md:space-x-6 mb-10">
          <!-- 2ème place -->
          <div v-if="leaderboard.length > 1" class="order-2 md:order-1 flex flex-col items-center">
            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center mb-2">
              <span class="text-white font-bold text-xl">{{ leaderboard[1]?.username?.charAt(0) || '?' }}</span>
            </div>
            <div class="text-center">
              <div class="font-bold text-white">{{ leaderboard[1]?.username || 'Anonyme' }}</div>
              <div class="text-sm text-gray-400">{{ leaderboard[1]?.totalScore || 0 }} points</div>
            </div>
            <div class="w-24 h-24 bg-gray-700 rounded-t-lg mt-4 flex items-end justify-center">
              <div class="text-2xl font-bold text-gray-300 mb-2">2</div>
            </div>
          </div>
          
          <!-- 1ère place -->
          <div v-if="leaderboard.length > 0" class="order-1 md:order-2 flex flex-col items-center">
            <div class="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center mb-2">
              <span class="text-white font-bold text-2xl">{{ leaderboard[0]?.username?.charAt(0) || '?' }}</span>
            </div>
            <div class="text-center">
              <div class="font-bold text-white text-lg">{{ leaderboard[0]?.username || 'Anonyme' }}</div>
              <div class="text-gray-400">{{ leaderboard[0]?.totalScore || 0 }} points</div>
            </div>
            <div class="w-32 h-32 bg-gray-700 rounded-t-lg mt-4 flex items-end justify-center">
              <div class="text-3xl font-bold text-yellow-400 mb-2">1</div>
            </div>
          </div>
          
          <!-- 3ème place -->
          <div v-if="leaderboard.length > 2" class="order-3 flex flex-col items-center">
            <div class="w-14 h-14 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center mb-2">
              <span class="text-white font-bold">{{ leaderboard[2]?.username?.charAt(0) || '?' }}</span>
            </div>
            <div class="text-center">
              <div class="font-bold text-white">{{ leaderboard[2]?.username || 'Anonyme' }}</div>
              <div class="text-sm text-gray-400">{{ leaderboard[2]?.totalScore || 0 }} points</div>
            </div>
            <div class="w-20 h-16 bg-gray-700 rounded-t-lg mt-4 flex items-end justify-center">
              <div class="text-xl font-bold text-amber-600 mb-2">3</div>
            </div>
          </div>
        </div>
        
        <!-- Tableau de classement -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rang</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Joueur</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <button @click="sortOption = 'score'" class="flex items-center focus:outline-none" :class="{ 'text-pink-400': sortOption === 'score' }">
                    Score total
                    <svg v-if="sortOption === 'score'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <button @click="sortOption = 'quizzes'" class="flex items-center focus:outline-none" :class="{ 'text-pink-400': sortOption === 'quizzes' }">
                    Quiz complétés
                    <svg v-if="sortOption === 'quizzes'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <button @click="sortOption = 'average'" class="flex items-center focus:outline-none" :class="{ 'text-pink-400': sortOption === 'average' }">
                    Score moyen
                    <svg v-if="sortOption === 'average'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody class="bg-gray-800 divide-y divide-gray-700">
              <tr v-for="(player, index) in paginatedLeaderboard" :key="player.id" 
                  :class="{ 'bg-gray-700 bg-opacity-50': player.id === currentUser?.id }">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-300">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-10 w-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                      <span class="text-white font-bold">{{ player.username?.charAt(0) || '?' }}</span>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-white">{{ player.username || 'Anonyme' }}</div>
                      <div v-if="player.id === currentUser?.id" class="text-xs text-pink-400">Vous</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-white">{{ player.totalScore }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-white">{{ player.completedQuizzes }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-white">{{ player.averageScore.toFixed(1) }}</div>
                </td>
              </tr>
              <tr v-if="paginatedLeaderboard.length === 0">
                <td colspan="5" class="px-6 py-8 text-center text-gray-400">
                  Aucun joueur n'a encore complété de quiz
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex justify-center mt-6 space-x-2">
          <button 
            v-for="page in totalPages" 
            :key="page" 
            @click="changePage(page)" 
            :class="['px-4 py-2 rounded-lg', page === currentPage ? 'bg-pink-600 text-white' : 'bg-gray-700 text-gray-300']"
          >
            {{ page }}
          </button>
        </div>
      </div>
      
      <!-- Statistiques personnelles -->
      <div v-if="currentUser" class="bg-gray-800 rounded-xl p-6 shadow-lg mb-10">
        <h2 class="text-2xl font-semibold text-pink-400 mb-6 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Vos statistiques
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-gray-700 rounded-lg p-4 flex items-center">
            <div class="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <div class="text-sm text-gray-400">Score total</div>
              <div class="text-xl font-bold text-white">{{ userStats.totalScore }}</div>
            </div>
          </div>
          <div class="bg-gray-700 rounded-lg p-4 flex items-center">
            <div class="w-12 h-12 rounded-full bg-pink-600 flex items-center justify-center mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <div class="text-sm text-gray-400">Quiz complétés</div>
              <div class="text-xl font-bold text-white">{{ userStats.completedQuizzes }}</div>
            </div>
          </div>
          <div class="bg-gray-700 rounded-lg p-4 flex items-center">
            <div class="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <div class="text-sm text-gray-400">Score moyen</div>
              <div class="text-xl font-bold text-white">{{ userStats.averageScore }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Statistiques globales -->
      <div class="bg-gray-800 rounded-xl p-6 shadow-lg mb-10">
        <h2 class="text-2xl font-semibold text-pink-400 mb-6 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Statistiques globales
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-gray-700 rounded-lg p-4 flex items-center">
            <div class="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <div class="text-sm text-gray-400">Nombre de joueurs</div>
              <div class="text-xl font-bold text-white">{{ totalPlayers }}</div>
            </div>
          </div>
          <div class="bg-gray-700 rounded-lg p-4 flex items-center">
            <div class="w-12 h-12 rounded-full bg-pink-600 flex items-center justify-center mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <div class="text-sm text-gray-400">Quiz complétés</div>
              <div class="text-xl font-bold text-white">{{ totalQuizzesCompleted }}</div>
            </div>
          </div>
          <div class="bg-gray-700 rounded-lg p-4 flex items-center">
            <div class="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <div class="text-sm text-gray-400">Score moyen</div>
              <div class="text-xl font-bold text-white">{{ averageScore }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Section des badges -->
      <div class="bg-gray-800 rounded-xl p-6 shadow-lg mb-10">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-semibold text-pink-400 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Badges et récompenses
          </h2>
          <div v-if="currentUser" class="text-sm text-gray-400">
            Vous avez {{ userBadges.length }} badge{{ userBadges.length !== 1 ? 's' : '' }}
          </div>
        </div>
        
        <div v-if="currentUser" class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div v-for="badge in allBadges" :key="badge.id" 
               :class="[
                 'rounded-xl p-4 flex flex-col items-center text-center transition-all',
                 hasBadge(badge.id) ? 'bg-gradient-to-br from-gray-700 to-gray-600' : 'bg-gray-700 opacity-50'
               ]">
            <div :class="[
                   'w-16 h-16 rounded-full flex items-center justify-center mb-3',
                   hasBadge(badge.id) ? badge.color : 'bg-gray-600'
                 ]">
              <span v-html="badge.icon" :class="hasBadge(badge.id) ? 'text-white' : 'text-gray-400'"></span>
            </div>
            <h3 class="font-bold text-white mb-1">{{ badge.name }}</h3>
            <p class="text-xs text-gray-400">{{ badge.description }}</p>
            <div v-if="!hasBadge(badge.id)" class="mt-2 text-xs text-gray-500">
              {{ badge.requirement }}
            </div>
            <div v-else class="mt-2 text-xs text-green-400">
              Obtenu !
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-8 bg-gray-700 rounded-xl">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p class="text-lg font-medium text-gray-400 mb-2">Connectez-vous pour voir vos badges</p>
          <p class="text-gray-500 mb-4">Complétez des quiz pour gagner des badges et des récompenses !</p>
          <NuxtLink to="/auth/login" class="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition">
            Se connecter
          </NuxtLink>
        </div>
      </div>
      
      <!-- Quiz populaires -->
      <div class="bg-gray-800 rounded-xl p-6 shadow-lg mb-10">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-pink-400">Quiz populaires</h3>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div class="space-y-3">
          <div v-for="(quiz, index) in popularQuizzes" :key="quiz.id" class="bg-gray-700 rounded-lg p-3 flex items-center">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mr-3 flex-shrink-0">
              <span class="text-white font-bold text-sm">{{ index + 1 }}</span>
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-white font-medium truncate">{{ quiz.title }}</div>
              <div class="text-xs text-gray-400">{{ quiz.completions }} joueurs</div>
            </div>
            <NuxtLink :to="`/quiz/${quiz.id}`" class="ml-2 p-2 rounded-full hover:bg-gray-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </NuxtLink>
          </div>
          <div v-if="popularQuizzes.length === 0" class="text-center py-4 text-gray-400">
            Aucun quiz complété pour le moment
          </div>
        </div>
      </div>
      
      <!-- Boutons de test -->
      <div v-if="quizStore.currentUser" class="mt-8 flex flex-wrap justify-center gap-4">
        <button 
          @click="addTestScores" 
          class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full"
        >
          Ajouter des scores de test
        </button>
        
        <button 
          @click="resetUserScores" 
          class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full"
        >
          Réinitialiser mes scores
        </button>
        
        <button 
          @click="debugScores" 
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
        >
          Déboguer les scores
        </button>
        
        <button 
          @click="testScoreSaving" 
          class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full"
        >
          Tester la sauvegarde de score
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuizStore } from '~/stores/quiz';
import ToggleModeButton from '~/components/ToggleModeButton.vue';

const quizStore = useQuizStore();

// Pagination
const currentPage = ref(1);
const itemsPerPage = 10;

// Tri
const sortOption = ref('score'); // 'score', 'quizzes', 'average'

// Utilisateur actuel
const currentUser = computed(() => quizStore.currentUser);

// Classement
const leaderboard = computed(() => {
  // Calculer le classement à partir des scores des utilisateurs
  const board = quizStore.users
    .filter(user => user && user.username) // Filtrer les utilisateurs non définis ou sans nom d'utilisateur
    .map(user => {
      const totalScore = user.scores ? user.scores.reduce((sum, score) => sum + score.score, 0) : 0;
      const completedQuizzes = user.scores ? user.scores.length : 0;
      
      return {
        id: user.id,
        username: user.username || 'Anonyme', // Utiliser 'Anonyme' si le nom d'utilisateur est vide
        totalScore,
        completedQuizzes,
        averageScore: completedQuizzes > 0 ? totalScore / completedQuizzes : 0
      };
    });
  
  // Trier selon l'option sélectionnée
  if (sortOption.value === 'score') {
    return board.sort((a, b) => b.totalScore - a.totalScore);
  } else if (sortOption.value === 'quizzes') {
    return board.sort((a, b) => b.completedQuizzes - a.completedQuizzes);
  } else if (sortOption.value === 'average') {
    return board.sort((a, b) => b.averageScore - a.averageScore);
  }
  
  return board;
});

// Pagination du classement
const paginatedLeaderboard = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return leaderboard.value.slice(start, end);
});

// Nombre total de pages
const totalPages = computed(() => Math.ceil(leaderboard.value.length / itemsPerPage));

// Changer de page
function changePage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
}

// Statistiques de l'utilisateur actuel
const userStats = computed(() => {
  if (!currentUser.value) return null;
  
  const userScores = currentUser.value.scores || [];
  const totalScore = userScores.reduce((sum, score) => sum + score.score, 0);
  const completedQuizzes = userScores.length;
  
  return {
    totalScore,
    completedQuizzes,
    averageScore: completedQuizzes > 0 ? (totalScore / completedQuizzes).toFixed(1) : '0.0'
  };
});

// Rang de l'utilisateur actuel
const userRank = computed(() => {
  if (!currentUser.value) return '-';
  
  const index = leaderboard.value.findIndex(player => player.id === currentUser.value.id);
  return index !== -1 ? index + 1 : '-';
});

// Nombre de quiz complétés par l'utilisateur
const userQuizzes = computed(() => {
  if (!currentUser.value || !currentUser.value.scores) return 0;
  return currentUser.value.scores.length;
});

// Score moyen de l'utilisateur
const userAverageScore = computed(() => {
  if (!currentUser.value || !currentUser.value.scores || currentUser.value.scores.length === 0) return '0.0';
  
  const totalScore = currentUser.value.scores.reduce((sum, score) => sum + score.score, 0);
  return (totalScore / currentUser.value.scores.length).toFixed(1);
});

// Statistiques globales
const totalPlayers = computed(() => quizStore.users.length);

const totalQuizzesCompleted = computed(() => {
  return quizStore.users.reduce((sum, user) => {
    return sum + (user.scores ? user.scores.length : 0);
  }, 0);
});

const averageScore = computed(() => {
  const allScores = quizStore.users.flatMap(user => user.scores || []);
  if (allScores.length === 0) return '0.0';
  
  const totalScore = allScores.reduce((sum, score) => sum + score.score, 0);
  return (totalScore / allScores.length).toFixed(1);
});

// Quiz populaires
const popularQuizzes = computed(() => {
  const quizCompletions = {};
  
  quizStore.users.forEach(user => {
    user.scores.forEach(score => {
      if (!quizCompletions[score.quizId]) {
        quizCompletions[score.quizId] = 0;
      }
      quizCompletions[score.quizId]++;
    });
  });
  
  const sortedQuizzes = Object.keys(quizCompletions).map(quizId => {
    const quiz = quizStore.quizzes.find(q => q.id === parseInt(quizId));
    return {
      id: parseInt(quizId),
      title: quiz ? quiz.title : `Quiz #${quizId}`,
      completions: quizCompletions[quizId]
    };
  });
  
  return sortedQuizzes.sort((a, b) => b.completions - a.completions).slice(0, 5);
});

// Badges
const allBadges = [
  { id: 'first_quiz', name: 'Premier Quiz', description: 'Complétez votre premier quiz', icon: '🏅', color: 'bg-yellow-500', requirement: 'Complétez un quiz' },
  { id: 'ten_quizzes', name: 'Dix Quiz', description: 'Complétez dix quiz', icon: '🥇', color: 'bg-red-500', requirement: 'Complétez 10 quiz' },
  { id: 'high_score', name: 'Score Élevé', description: 'Obtenez un score de 100', icon: '🏆', color: 'bg-green-500', requirement: 'Obtenez un score de 100' },
  { id: 'all_categories', name: 'Maître des Catégories', description: 'Complétez un quiz dans chaque catégorie', icon: '🌟', color: 'bg-blue-500', requirement: 'Complétez un quiz dans chaque catégorie' }
];

const userBadges = computed(() => {
  if (!currentUser.value) return [];
  
  const badges = [];
  
  if (userQuizzes.value >= 1) badges.push('first_quiz');
  if (userQuizzes.value >= 10) badges.push('ten_quizzes');
  if (currentUser.value.scores.some(score => score.score >= 100)) badges.push('high_score');
  
  const categories = new Set(quizStore.categories.map(cat => cat.id));
  const completedCategories = new Set();
  
  currentUser.value.scores.forEach(score => {
    const quiz = quizStore.quizzes.find(q => q.id === score.quizId);
    if (quiz) {
      completedCategories.add(quiz.categoryId);
    }
  });
  
  if (completedCategories.size === categories.size) badges.push('all_categories');
  
  return badges;
});

// Vérifier si l'utilisateur a un badge spécifique
function hasBadge(badgeId: string): boolean {
  return userBadges.value.includes(badgeId);
}

function addTestScores() {
  if (!quizStore.currentUser) return;
  
  // Ajouter quelques scores de test pour l'utilisateur actuel
  const quizIds = [1, 2, 3, 4, 5];
  
  quizIds.forEach(quizId => {
    const score = Math.floor(Math.random() * 5) + 1; // Score entre 1 et 5
    quizStore.saveScore({
      quizId,
      score,
      date: new Date().toISOString()
    });
  });
  
  // Recharger la page pour voir les changements
  window.location.reload();
}

function resetUserScores() {
  if (!quizStore.currentUser) return;
  
  if (confirm('Êtes-vous sûr de vouloir réinitialiser tous vos scores?')) {
    // Trouver l'utilisateur dans le tableau des utilisateurs
    const userIndex = quizStore.users.findIndex(u => u.id === quizStore.currentUser!.id);
    
    if (userIndex !== -1) {
      // Réinitialiser les scores
      quizStore.users[userIndex].scores = [];
      
      // Mettre à jour l'utilisateur courant
      quizStore.currentUser = quizStore.users[userIndex];
      
      // Sauvegarder dans le localStorage
      quizStore.saveToLocalStorage();
      
      // Recharger la page
      window.location.reload();
    }
  }
}

function debugScores() {
  quizStore.debugScores();
  alert('Vérifiez la console pour les informations de débogage');
}

// Ajouter cette fonction pour tester directement la sauvegarde des scores
function testScoreSaving() {
  if (!quizStore.currentUser) {
    alert("Vous devez être connecté pour tester la sauvegarde des scores");
    return;
  }
  
  // Créer un score de test
  const testScore = {
    quizId: 1, // ID du premier quiz
    score: 5,  // Score de 5 points
    date: new Date().toISOString()
  };
  
  // Sauvegarder le score
  const success = quizStore.saveScore(testScore);
  
  if (success) {
    alert("Score de test sauvegardé avec succès! Vérifiez la console pour les détails.");
  } else {
    alert("Échec de la sauvegarde du score de test. Vérifiez la console pour les erreurs.");
  }
  
  // Afficher les informations de débogage
  quizStore.debugScores();
  
  // Recharger la page pour voir les changements
  window.location.reload();
}

onMounted(() => {
  quizStore.loadFromLocalStorage();
});
</script>

<style scoped>
/* Animation pour les badges */
[class*="badge-"] {
  transition: all 0.3s ease;
}

/* Animation pour le tableau */
tbody tr {
  transition: all 0.2s ease;
}

tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

/* Animation pour le podium */
@keyframes podiumPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.order-first {
  animation: podiumPulse 2s infinite;
}
</style> 