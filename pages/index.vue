<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
    <div class="container mx-auto px-4 py-12">
      <header class="text-center mb-12">
        <h1 class="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-4">Quiz Master</h1>
        <p class="text-xl text-gray-300">Testez vos connaissances avec nos quiz interactifs</p>
        
        <div class="mt-4 flex justify-center space-x-4">
          <template v-if="currentUser">
            <span class="text-pink-400">Bonjour, {{ currentUser.username }}</span>
            <button @click="logout" class="text-red-400 hover:text-red-600">Se déconnecter</button>
          </template>
          <template v-else>
            <NuxtLink to="/auth/login" class="text-pink-400 hover:text-pink-600">Se connecter</NuxtLink>
            <NuxtLink to="/auth/register" class="text-pink-400 hover:text-pink-600">S'inscrire</NuxtLink>
          </template>
        </div>
      </header>

      <!-- Section de recherche et filtres -->
      <div class="bg-gray-800 rounded-xl p-6 mb-10 shadow-lg">
        <!-- Barre de recherche -->
        <div class="max-w-2xl mx-auto mb-6">
          <div class="relative">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Rechercher un quiz par titre, description ou contenu..." 
              class="w-full bg-gray-700 text-white rounded-lg px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-pink-500"
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
            class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full flex items-center"
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
            <h3 class="text-sm font-medium text-gray-400 mb-2">Catégories</h3>
            <div class="flex flex-wrap gap-2">
              <button 
                @click="selectedCategoryId = null" 
                class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                :class="selectedCategoryId === null ? 'bg-pink-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'"
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
              {{ filteredQuizzes.length }} quiz{{ filteredQuizzes.length !== 1 ? 's' : '' }} trouvé{{ filteredQuizzes.length !== 1 ? 's' : '' }}
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
          <div v-if="filteredQuizzes.length === 0" class="text-center py-16 bg-gray-800 rounded-xl">
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
                  <QuizCard :quiz="quiz" @start="startQuiz(quiz.id)" />
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
  </div>
</template>

<script setup lang="ts">
import { useQuizStore } from '~/stores/quiz';
import { onMounted, computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import QuizCard from '~/components/QuizCard.vue';

const router = useRouter();
const quizStore = useQuizStore();
const quizzes = computed(() => quizStore.quizzes);
const categories = computed(() => quizStore.categories);
const currentUser = computed(() => quizStore.currentUser);

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

// Filtrer les quiz en fonction des critères
const filteredQuizzes = computed(() => {
  let result = quizzes.value;
  
  if (selectedCategoryId.value) {
    result = result.filter(quiz => quiz.categoryId === selectedCategoryId.value);
  }
  
  if (selectedDifficulty.value) {
    result = result.filter(quiz => quiz.difficulty === selectedDifficulty.value);
  }
  
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    result = result.filter(quiz => 
      quiz.title.toLowerCase().includes(query) || 
      quiz.description.toLowerCase().includes(query) ||
      quiz.questions.some(q => 
        q.text.toLowerCase().includes(query) ||
        q.options.some(opt => opt.toLowerCase().includes(query))
      )
    );
  }
  
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

onMounted(() => {
  quizStore.loadFromLocalStorage();
});

function startQuiz(quizId: number) {
  quizStore.startQuiz(quizId);
  router.push(`/quiz/${quizId}`);
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