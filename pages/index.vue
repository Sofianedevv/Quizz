<template>
  <div :class="{
    'bg-gradient-to-br from-blue-50 to-blue-100 text-gray-800': quizStore.isDayMode, 
    'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white': !quizStore.isDayMode
  }" class="min-h-screen">
    <div class="container mx-auto px-4 py-12">
      <header class="text-center mb-12">
        <h1 class="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r mb-4"
          :class="{'from-white to-blue-100': quizStore.isDayMode, 'from-pink-500 to-purple-500': !quizStore.isDayMode}">
          Quizz Master
        </h1>
        <p :class="{'text-white': quizStore.isDayMode, 'text-gray-300': !quizStore.isDayMode}" class="text-xl">
          Testez vos connaissances !
        </p>
        
        <div class="mt-4 flex justify-center space-x-4">
          <template v-if="quizStore.currentUser">
            <span class="text-pink-400">Bonjour, {{ quizStore.currentUser.username }}</span>
            <button @click="logout" class="text-red-400 hover:text-red-600">Se déconnecter</button>
            <NuxtLink to="/leaderboard" class="text-pink-400 hover:text-pink-600">Classement</NuxtLink>
          </template>
          <template v-else>
            <NuxtLink to="/auth/login" class="text-pink-400 hover:text-pink-600">Se connecter</NuxtLink>
            <NuxtLink to="/auth/register" class="text-pink-400 hover:text-pink-600">S'inscrire</NuxtLink>
            <NuxtLink to="/leaderboard" class="text-pink-400 hover:text-pink-600">Classement</NuxtLink>
          </template>
          <ToggleModeButton />
        </div>
      </header>

      <!-- Section de recherche et filtres -->
      <div :class="{
        'bg-white/90 shadow-sm border border-blue-100 backdrop-blur-sm rounded-xl p-6 mb-10': quizStore.isDayMode, 
        'bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 mb-10': !quizStore.isDayMode
      }">
        <!-- Barre de recherche -->
        <div class="max-w-2xl mx-auto mb-6">
          <div class="relative">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Rechercher un quiz par titre, description ou contenu..." 
              :class="{
                'bg-purple-50 text-gray-800 border-purple-200 focus:ring-purple-500': quizStore.isDayMode,
                'bg-gray-700 text-white border-gray-600 focus:ring-pink-500': !quizStore.isDayMode,
                'w-full px-4 py-3 pl-10 rounded-lg focus:outline-none focus:ring-2': true
              }"
            />
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button 
              v-if="searchQuery" 
              @click="searchQuery = ''" 
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div class="flex justify-center mt-4 mb-6">
          <button 
            @click="resetQuizData" 
            :class="{
              'bg-red-500 hover:bg-red-600': quizStore.isDayMode,
              'bg-red-600 hover:bg-red-700': !quizStore.isDayMode
            }"
            class="text-white font-bold py-2 px-4 rounded-full flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Réinitialiser les données
          </button>
        </div>
        
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <!-- Filtres de catégories -->
          <div class="flex-1">
            <h3 class="text-sm font-medium mb-2" :class="{'text-gray-600': quizStore.isDayMode, 'text-gray-400': !quizStore.isDayMode}">Catégories</h3>
            <div class="flex flex-wrap gap-2">
              <button 
                @click="selectedCategoryId = null" 
                class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                :class="selectedCategoryId === null ? 
                  (quizStore.isDayMode ? 'bg-purple-600 text-white' : 'bg-pink-600 text-white') : 
                  (quizStore.isDayMode ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-gray-700 text-gray-300 hover:bg-gray-600')"
              >
                Toutes
              </button>
              <button 
                v-for="category in categories" 
                :key="category.id"
                @click="selectedCategoryId = category.id" 
                class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                :class="selectedCategoryId === category.id ? 'bg-pink-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'"
              >
                {{ category.name }}
              </button>
            </div>
          </div>
          
          <!-- Filtres de difficulté -->
          <div class="flex-1">
            <h3 class="text-sm font-medium text-gray-400 mb-2">Niveau de difficulté</h3>
            <div class="flex flex-wrap gap-2">
              <button 
                @click="selectedDifficulty = null" 
                class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                :class="selectedDifficulty === null ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'"
              >
                Tous
              </button>
              <button 
                v-for="difficulty in difficulties" 
                :key="difficulty"
                @click="selectedDifficulty = difficulty" 
                class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                :class="{
                  'bg-green-600 text-white': selectedDifficulty === difficulty && difficulty === 'Facile',
                  'bg-yellow-600 text-white': selectedDifficulty === difficulty && difficulty === 'Moyen',
                  'bg-orange-600 text-white': selectedDifficulty === difficulty && difficulty === 'Difficile',
                  'bg-red-600 text-white': selectedDifficulty === difficulty && difficulty === 'Expert',
                  'bg-gray-700 text-gray-300 hover:bg-gray-600': selectedDifficulty !== difficulty
                }"
              >
                {{ difficulty }}
              </button>
            </div>
          </div>
        </div>
        
        <!-- Résumé des filtres et bouton de réinitialisation -->
        <div class="flex justify-between items-center mt-6 pt-4 border-t border-gray-700">
          <div class="text-sm text-gray-300">
            <span v-if="hasActiveFilters">
              Filtres actifs: 
              <span v-if="selectedCategoryId" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-pink-600 text-white mr-1">
                {{ getCategoryName(selectedCategoryId) }}
              </span>
              <span v-if="selectedDifficulty" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mr-1"
                :class="{
                  'bg-green-600 text-white': selectedDifficulty === 'Facile',
                  'bg-yellow-600 text-white': selectedDifficulty === 'Moyen',
                  'bg-orange-600 text-white': selectedDifficulty === 'Difficile',
                  'bg-red-600 text-white': selectedDifficulty === 'Expert'
                }"
              >
                {{ selectedDifficulty }}
              </span>
              <span v-if="searchQuery" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-600 text-white">
                "{{ searchQuery }}"
              </span>
            </span>
            <span v-else>Aucun filtre actif</span>
          </div>
          <button 
            v-if="hasActiveFilters"
            @click="resetFilters" 
            class="text-sm text-pink-400 hover:text-pink-300 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Réinitialiser les filtres
          </button>
        </div>
      </div>

      <div v-if="quizzes.length === 0" class="text-center py-16">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
        <p class="text-lg text-gray-400">Chargement des quiz...</p>
      </div>
      
      <div v-else>
        <!-- Résultats de recherche -->
        <div class="mb-8">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-semibold text-pink-400">
              {{ filteredQuizzes.length }} quizz{{ filteredQuizzes.length !== 1 ? '' : '' }} trouvé{{ filteredQuizzes.length !== 1 ? 's' : '' }}
            </h2>
            <div class="text-sm text-gray-400">
              Trier par: 
              <select v-model="sortOption" class="bg-gray-700 text-white rounded px-2 py-1 ml-2 focus:outline-none focus:ring-1 focus:ring-pink-500">
                <option value="title">Titre</option>
                <option value="difficulty">Difficulté</option>
                <option value="questions">Nombre de questions</option>
              </select>
            </div>
          </div>
          
          <!-- Message si aucun résultat -->
          <div v-if="filteredQuizzes.length === 0" class="text-center py-16 bg-gray-800 rounded-xl" :class="{'bg-gray-100': quizStore.isDayMode, 'bg-gray-800': !quizStore.isDayMode}">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 class="text-xl font-semibold text-gray-400 mb-2">Aucun quiz ne correspond à votre recherche</h3>
            <p class="text-gray-500">Essayez de modifier vos critères de recherche ou de réinitialiser les filtres.</p>
            <button @click="resetFilters" class="mt-4 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition">
              Réinitialiser les filtres
            </button>
          </div>
          
          <!-- Grille de quiz avec pagination -->
          <div v-else>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <TransitionGroup name="quiz-card">
                <div v-for="quiz in paginatedQuizzes" :key="quiz.id">
                  <QuizCard :quiz="quiz" @start="startQuiz(quiz.id)" @ghost-mode="startGhostMode(quiz.id)" />
                </div>
              </TransitionGroup>
            </div>
            
            <!-- Pagination -->
            <div class="mt-10 flex justify-center">
              <nav class="flex items-center space-x-2">
                <button 
                  @click="currentPage = 1" 
                  :disabled="currentPage === 1"
                  class="px-3 py-1 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
                >
                  <span class="sr-only">Première page</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
                
                <button 
                  @click="prevPage" 
                  :disabled="currentPage === 1"
                  class="px-3 py-1 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
                >
                  <span class="sr-only">Page précédente</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                
                <div class="flex space-x-1">
                  <button 
                    v-for="page in displayedPageNumbers" 
                    :key="page"
                    @click="goToPage(page)"
                    class="px-3 py-1 rounded-md"
                    :class="page === currentPage ? 'bg-pink-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'"
                  >
                    {{ page }}
                  </button>
                </div>
                
                <button 
                  @click="nextPage" 
                  :disabled="currentPage === totalPages"
                  class="px-3 py-1 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="{ 'opacity-50 cursor-not-allowed': currentPage === totalPages }"
                >
                  <span class="sr-only">Page suivante</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                
                <button 
                  @click="currentPage = totalPages" 
                  :disabled="currentPage === totalPages"
                  class="px-3 py-1 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="{ 'opacity-50 cursor-not-allowed': currentPage === totalPages }"
                >
                  <span class="sr-only">Dernière page</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                    <path fill-rule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
        
        <!-- Section des quiz favoris (visible uniquement si l'utilisateur est connecté et a des favoris) -->
        <div v-if="quizStore.currentUser && favoriteQuizzes.length > 0" class="mb-12">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-semibold" 
              :class="{'text-blue-600': quizStore.isDayMode, 'text-pink-400': !quizStore.isDayMode}">
              Vos Favoris
            </h2>
            <NuxtLink to="/favorites" class="flex items-center text-sm"
              :class="{'text-blue-500 hover:text-blue-700': quizStore.isDayMode, 'text-pink-400 hover:text-pink-300': !quizStore.isDayMode}">
              Voir tous vos favoris
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </NuxtLink>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Limiter à 3 ou 6 favoris sur la page d'accueil -->
            <QuizCard 
              v-for="quiz in favoriteQuizzes.slice(0, 3)" 
              :key="quiz.id" 
              :quiz="quiz" 
              @start="startQuiz(quiz.id)" 
            />
          </div>
        </div>
        
        <!-- Ajouter un lien vers les favoris pour les utilisateurs connectés sans favoris -->
        <div v-else-if="quizStore.currentUser && favoriteQuizzes.length === 0" class="mb-12 text-center p-6 rounded-lg"
          :class="{'bg-white shadow border border-blue-100': quizStore.isDayMode, 'bg-gray-800': !quizStore.isDayMode}">
          <h3 class="text-xl font-semibold mb-2">Vous n'avez pas encore de favoris</h3>
          <p class="mb-4" :class="{'text-gray-600': quizStore.isDayMode, 'text-gray-300': !quizStore.isDayMode}">
            Ajoutez des quizz à vos favoris en cliquant sur l'étoile
          </p>
          <NuxtLink to="/favorites" class="inline-flex items-center px-4 py-2 rounded-lg"
            :class="{'bg-blue-500 hover:bg-blue-600 text-white': quizStore.isDayMode, 'bg-pink-500 hover:bg-pink-600 text-white': !quizStore.isDayMode}">
            Gérer vos favoris
          </NuxtLink>
        </div>
        
        <div class="mt-12 text-center">
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <NuxtLink to="/create-quiz" class="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-700 hover:to-purple-700 transition shadow-md flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Créer un nouveau quiz
            </NuxtLink>
            <NuxtLink to="/leaderboard" class="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition shadow-md flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Voir le classement
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
    
    <footer class="bg-gray-950 text-white py-8 mt-16">
      <div class="container mx-auto px-4 text-center">
        <p>© 2023 Quiz Master - Tous droits réservés</p>
        <div class="mt-4 flex justify-center space-x-4">
          <a href="#" class="hover:text-pink-200 transition">À propos</a>
          <a href="#" class="hover:text-pink-200 transition">Contact</a>
          <a href="#" class="hover:text-pink-200 transition">Conditions d'utilisation</a>
        </div>
      </div>
    </footer>

    <div class="fixed bottom-4 right-4">
      <button 
        @click="resetLocalStorage" 
        class="bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-700 transition-colors"
      >
        Réinitialiser les données
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuizStore } from '~/stores/quiz';
import { onMounted, computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import QuizCard from '~/components/QuizCard.vue';
import ToggleModeButton from '~/components/ToggleModeButton.vue';

const router = useRouter();
const quizStore = useQuizStore();
const quizzes = computed(() => quizStore.quizzes);
const categories = computed(() => quizStore.categories);

// État pour le filtrage et le tri
const selectedCategoryId = ref(null);
const selectedDifficulty = ref(null);
const searchQuery = ref('');
const sortOption = ref('title');

// Liste des difficultés disponibles
const difficulties = ['Facile', 'Moyen', 'Difficile', 'Expert'];

// Vérifier si des filtres sont actifs
const hasActiveFilters = computed(() => {
  return selectedCategoryId.value !== null || 
         selectedDifficulty.value !== null || 
         searchQuery.value.trim() !== '';
});

// Filtrer les quiz en fonction des critères de recherche et des filtres
const filteredQuizzes = computed(() => {
  let result = quizStore.quizzes;
  
  // Filtrer par catégorie
  if (selectedCategoryId.value !== null) {
    result = result.filter(quiz => quiz.categoryId === selectedCategoryId.value);
  }
  
  // Filtrer par difficulté
  if (selectedDifficulty.value !== null) {
    result = result.filter(quiz => quiz.difficulty === selectedDifficulty.value);
  }
  
  // Filtrer par recherche
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    result = result.filter(quiz => {
      // Rechercher dans le titre
      if (quiz.title.toLowerCase().includes(query)) return true;
      
      // Rechercher dans la description
      if (quiz.description.toLowerCase().includes(query)) return true;
      
      // Rechercher dans les questions
      return quiz.questions.some(question => 
        question.text.toLowerCase().includes(query) || 
        question.options.some(option => option.toLowerCase().includes(query))
      );
    });
  }
  
  console.log(`Filtrage: ${result.length} quiz trouvés`);
  return result;
});

// Trier les quiz filtrés
const sortedQuizzes = computed(() => {
  const quizzesToSort = [...filteredQuizzes.value];
  
  switch (sortOption.value) {
    case 'title':
      return quizzesToSort.sort((a, b) => a.title.localeCompare(b.title));
    case 'difficulty':
      const difficultyOrder = { 'Facile': 1, 'Moyen': 2, 'Difficile': 3, 'Expert': 4 };
      return quizzesToSort.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
    case 'questions':
      return quizzesToSort.sort((a, b) => b.questions.length - a.questions.length);
    default:
      return quizzesToSort;
  }
});

// Pagination
const itemsPerPage = 15; // Nombre de quiz par page
const currentPage = ref(1);

// Calculer le nombre total de pages
const totalPages = computed(() => {
  return Math.ceil(sortedQuizzes.value.length / itemsPerPage);
});

// Obtenir les quiz pour la page actuelle
const paginatedQuizzes = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return sortedQuizzes.value.slice(startIndex, endIndex);
});

// Calculer les numéros de page à afficher (max 5 pages visibles)
const displayedPageNumbers = computed(() => {
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage.value - Math.floor(maxVisiblePages / 2));
  let endPage = startPage + maxVisiblePages - 1;
  
  if (endPage > totalPages.value) {
    endPage = totalPages.value;
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  
  return pages;
});

// Fonctions de navigation
function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
    scrollToTop();
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    scrollToTop();
  }
}

function goToPage(page: number) {
  currentPage.value = page;
  scrollToTop();
}

// Remonter en haut de la liste des quiz lors du changement de page
function scrollToTop() {
  window.scrollTo({
    top: document.querySelector('.grid')?.offsetTop - 100 || 0,
    behavior: 'smooth'
  });
}

// Réinitialiser la page courante lorsque les filtres changent
watch([selectedCategoryId, selectedDifficulty, searchQuery, sortOption], () => {
  currentPage.value = 1;
});

// Réinitialiser tous les filtres
function resetFilters() {
  selectedCategoryId.value = null;
  selectedDifficulty.value = null;
  searchQuery.value = '';
  sortOption.value = 'title';
}

// Obtenir le nom d'une catégorie à partir de son ID
function getCategoryName(categoryId) {
  const category = categories.value.find(cat => cat.id === categoryId);
  return category ? category.name : 'Catégorie inconnue';
}

// Ajouter cette fonction pour déboguer
function debugQuizzes() {
  console.log('Nombre de quiz disponibles:', quizStore.quizzes.length);
  console.log('Quiz disponibles:', quizStore.quizzes.map(q => ({ id: q.id, title: q.title })));
  console.log('Filtres actuels:', {
    catégorie: selectedCategoryId.value,
    difficulté: selectedDifficulty.value,
    recherche: searchQuery.value
  });
  console.log('Quiz filtrés:', filteredQuizzes.value.length);
}

// Appeler cette fonction au chargement de la page
onMounted(() => {
  quizStore.loadFromLocalStorage();
  debugQuizzes();
});

function startQuiz(quizId: number) {
  quizStore.startQuiz(quizId);
  router.push(`/quiz/${quizId}`);
}

function startGhostMode(quizId: number) {
  const success = quizStore.activateGhostMode(quizId);
  if (success) {
    quizStore.startQuiz(quizId);
    router.push(`/quiz/${quizId}`);
  } else {
    alert("Impossible d'activer le mode compétition. Vous devez d'abord terminer ce quiz au moins une fois.");
  }
}

function logout() {
  quizStore.logout();
}

function resetQuizData() {
  if (confirm('Cette action va réinitialiser tous les quiz et charger les nouveaux quiz. Continuer?')) {
    localStorage.removeItem('quizzes');
    quizStore.initializeQuizzes();
    window.location.reload();
  }
}

// Récupérer les quiz favoris
const favoriteQuizzes = computed(() => quizStore.getFavoriteQuizzes);

function resetLocalStorage() {
  if (confirm('Attention: Cette action va réinitialiser toutes les données de l\'application. Continuer?')) {
    localStorage.clear();
    quizStore.initializeQuizzes();
    quizStore.initializeUsers();
    quizStore.isDayMode = false;
    quizStore.favorites = [];
    quizStore.currentUser = null;
    quizStore.saveToLocalStorage();
    window.location.reload();
  }
}
</script>

<style scoped>
/* Animation pour les cartes de quiz */
.quiz-card-enter-active,
.quiz-card-leave-active {
  transition: all 0.3s ease;
}

.quiz-card-enter-from,
.quiz-card-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* Animation pour la barre de recherche */
input:focus {
  box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.3);
}

/* Transition pour les boutons */
button {
  transition: all 0.2s ease;
}

button:hover {
  transform: translateY(-1px);
}

button:active {
  transform: translateY(0);
}
</style>