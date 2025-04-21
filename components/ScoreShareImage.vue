<template>
  <div ref="shareImageContainer" class="share-image-container p-8 rounded-xl"
    :class="{'bg-white text-gray-800': isDayMode, 'bg-gray-800 text-white': !isDayMode}">
    <div class="text-center mb-6">
      <h2 class="text-2xl font-bold mb-2">{{ quizTitle }}</h2>
      
      <!-- Changeons la façon dont le score est affiché -->
      <div class="score-display text-5xl font-bold mb-2">
        <span :style="{color: isDayMode ? '#3B82F6' : '#EC4899'}">{{ score }}</span>
        <span> / </span>
        <span>{{ totalQuestions }}</span>
      </div>
      
      <p class="text-lg" :class="{'text-gray-600': isDayMode, 'text-gray-300': !isDayMode}">
        {{ scorePercentage >= 80 ? 'Excellent travail !' : scorePercentage >= 60 ? 'Bon travail !' : 'Continuez à vous entraîner !' }}
      </p>
    </div>
    
    <div class="flex justify-between items-center">
      <div class="text-sm" :class="{'text-gray-500': isDayMode, 'text-gray-400': !isDayMode}">
        {{ new Date().toLocaleDateString() }}
      </div>
      <div class="text-sm font-medium">Quiz Master</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import html2canvas from 'html2canvas';

const props = defineProps({
  quizTitle: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  isDayMode: {
    type: Boolean,
    default: false
  }
});

// Ajouter des logs pour vérifier les valeurs des props
console.log("Props reçues par ScoreShareImage:", {
  quizTitle: props.quizTitle,
  score: props.score,
  totalQuestions: props.totalQuestions,
  isDayMode: props.isDayMode
});

const emit = defineEmits(['image-generated']);
const shareImageContainer = ref(null);
const scorePercentage = computed(() => (props.score / props.totalQuestions) * 100);

// Régénérer l'image quand les props changent
watch(() => [props.score, props.totalQuestions, props.quizTitle, props.isDayMode], () => {
  console.log("Props modifiées, régénération de l'image");
  console.log("Nouvelles valeurs:", {
    quizTitle: props.quizTitle,
    score: props.score,
    totalQuestions: props.totalQuestions,
    isDayMode: props.isDayMode
  });
  
  // Attendre que le DOM soit mis à jour
  setTimeout(() => {
    generateImage();
  }, 100);
}, { deep: true });

// Générer l'image à partir du contenu du div
async function generateImage() {
  console.log("Début de la génération de l'image");
  console.log("Valeurs actuelles:", {
    quizTitle: props.quizTitle,
    score: props.score,
    totalQuestions: props.totalQuestions,
    scorePercentage: scorePercentage.value
  });
  
  // Vérifier que le score est un nombre valide
  if (typeof props.score !== 'number' || isNaN(props.score)) {
    console.error("Score invalide:", props.score);
    return null;
  }
  
  if (!shareImageContainer.value) {
    console.error("Conteneur d'image non disponible");
    return null;
  }
  
  // Forcer la mise à jour du DOM avec les valeurs actuelles
  shareImageContainer.value.querySelector('.score-display').innerHTML = 
    `<span style="color: ${props.isDayMode ? '#3B82F6' : '#EC4899'}">${props.score}</span> / <span>${props.totalQuestions}</span>`;
  
  try {
    // Forcer une mise à jour du DOM avant de générer l'image
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // S'assurer que le conteneur est visible pendant la génération
    const originalDisplay = shareImageContainer.value.style.display;
    shareImageContainer.value.style.display = 'block';
    shareImageContainer.value.style.position = 'fixed';
    shareImageContainer.value.style.left = '-9999px';
    shareImageContainer.value.style.top = '0';
    
    console.log("Configuration de html2canvas");
    const canvas = await html2canvas(shareImageContainer.value, {
      backgroundColor: props.isDayMode ? '#ffffff' : '#1f2937',
      scale: 2, // Meilleure qualité
      logging: true, // Activer les logs pour le débogage
      useCORS: true, // Permettre le chargement d'images cross-origin
      allowTaint: true, // Permettre le rendu d'images potentiellement non sécurisées
      onclone: (clonedDoc) => {
        // Vérifier les valeurs dans le clone du DOM
        const clonedContainer = clonedDoc.querySelector('.share-image-container');
        console.log("Contenu cloné:", clonedContainer ? clonedContainer.innerHTML : "Non trouvé");
      }
    });
    
    console.log("Canvas généré, conversion en image");
    const imageData = canvas.toDataURL('image/png');
    
    // Restaurer l'affichage original
    shareImageContainer.value.style.display = originalDisplay;
    shareImageContainer.value.style.position = '';
    shareImageContainer.value.style.left = '';
    shareImageContainer.value.style.top = '';
    
    console.log("Image générée avec succès");
    emit('image-generated', imageData);
    return imageData;
  } catch (error) {
    console.error('Erreur lors de la génération de l\'image:', error);
    return null;
  }
}

onMounted(() => {
  // Générer l'image après le montage du composant
  console.log("Composant monté, génération de l'image");
  setTimeout(() => {
    generateImage();
  }, 500); // Attendre un peu que le composant soit complètement rendu
});

// Exposer la méthode pour permettre de régénérer l'image
defineExpose({ generateImage });
</script>

<style scoped>
.share-image-container {
  width: 600px;
  max-width: 100%;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}
</style> 