// Liste d'images de secours en ligne
const fallbackImages = {
  culture: 'https://cdn.pixabay.com/photo/2016/01/19/01/42/library-1147815_1280.jpg',
  science: 'https://cdn.pixabay.com/photo/2018/07/15/10/44/dna-3539309_1280.jpg',
  histoire: 'https://cdn.pixabay.com/photo/2020/04/11/08/26/colosseum-5029013_1280.jpg',
  astronomie: 'https://cdn.pixabay.com/photo/2011/12/14/12/21/orion-nebula-11107_1280.jpg',
  sport: 'https://cdn.pixabay.com/photo/2016/11/29/03/53/athletes-1867185_1280.jpg',
  musique: 'https://cdn.pixabay.com/photo/2015/05/07/11/02/guitar-756326_1280.jpg',
  cinema: 'https://cdn.pixabay.com/photo/2016/11/15/07/09/photo-manipulation-1825450_1280.jpg',
  geographie: 'https://cdn.pixabay.com/photo/2016/01/19/15/48/luggage-1149289_1280.jpg',
  programmation: 'https://cdn.pixabay.com/photo/2016/11/19/14/00/code-1839406_1280.jpg',
  gastronomie: 'https://cdn.pixabay.com/photo/2017/06/01/18/46/cook-2364221_1280.jpg',
  default: 'https://cdn.pixabay.com/photo/2016/11/18/14/05/brick-wall-1834784_1280.jpg'
};

// Fonction pour obtenir une image en fonction de la catégorie
export function getImageForCategory(categoryId: number): string {
  switch (categoryId) {
    case 1: return 'https://cdn.pixabay.com/photo/2016/01/19/01/42/library-1147815_1280.jpg'; // Culture Générale
    case 2: return 'https://cdn.pixabay.com/photo/2018/07/15/10/44/dna-3539309_1280.jpg'; // Sciences
    case 3: return 'https://cdn.pixabay.com/photo/2016/11/29/03/53/athletes-1867185_1280.jpg'; // Sport
    case 4: return 'https://cdn.pixabay.com/photo/2015/05/07/11/02/guitar-756326_1280.jpg'; // Musique
    case 5: return 'https://cdn.pixabay.com/photo/2016/11/15/07/09/photo-manipulation-1825450_1280.jpg'; // Cinéma
    case 6: return 'https://cdn.pixabay.com/photo/2017/12/12/12/44/bitcoin-3014614_1280.jpg'; // Technologie
    case 7: return 'https://cdn.pixabay.com/photo/2016/10/20/18/35/earth-1756274_1280.jpg'; // Géographie
    case 8: return 'https://cdn.pixabay.com/photo/2018/04/25/09/26/erechtheion-3349072_1280.jpg'; // Histoire
    case 9: return 'https://cdn.pixabay.com/photo/2017/08/30/12/45/girl-2696947_1280.jpg'; // Art
    case 10: return 'https://cdn.pixabay.com/photo/2016/03/26/22/21/books-1281581_1280.jpg'; // Littérature
    default: return 'https://cdn.pixabay.com/photo/2016/11/18/14/05/brick-wall-1834784_1280.jpg';
  }
}

// Fonction pour obtenir une image en fonction du titre du quiz
export function getImageForQuizTitle(title: string): string {
  const titleLower = title.toLowerCase();
  
  // Images pour les nouveaux quiz
  if (titleLower.includes('littérature')) return 'https://cdn.pixabay.com/photo/2016/03/26/22/21/books-1281581_1280.jpg';
  if (titleLower.includes('art')) return 'https://cdn.pixabay.com/photo/2017/08/30/12/45/girl-2696947_1280.jpg';
  if (titleLower.includes('géographie')) return 'https://cdn.pixabay.com/photo/2016/10/20/18/35/earth-1756274_1280.jpg';
  if (titleLower.includes('technologie')) return 'https://cdn.pixabay.com/photo/2017/12/12/12/44/bitcoin-3014614_1280.jpg';
  if (titleLower.includes('cinéma')) return 'https://cdn.pixabay.com/photo/2016/11/15/07/09/photo-manipulation-1825450_1280.jpg';
  if (titleLower.includes('histoire antique')) return 'https://cdn.pixabay.com/photo/2018/04/25/09/26/erechtheion-3349072_1280.jpg';
  if (titleLower.includes('jeux vidéo')) return 'https://cdn.pixabay.com/photo/2021/09/07/07/11/game-console-6603120_1280.jpg';
  if (titleLower.includes('cuisine')) return 'https://cdn.pixabay.com/photo/2017/06/01/18/46/cook-2364221_1280.jpg';
  if (titleLower.includes('animaux')) return 'https://cdn.pixabay.com/photo/2014/10/23/18/56/tiger-500118_1280.jpg';
  if (titleLower.includes('mythologie')) return 'https://cdn.pixabay.com/photo/2017/08/01/08/29/people-2563491_1280.jpg';
  
  // Images existantes
  if (titleLower.includes('culture')) return 'https://cdn.pixabay.com/photo/2016/01/19/01/42/library-1147815_1280.jpg';
  if (titleLower.includes('science')) return 'https://cdn.pixabay.com/photo/2018/07/15/10/44/dna-3539309_1280.jpg';
  if (titleLower.includes('histoire')) return 'https://cdn.pixabay.com/photo/2020/04/11/08/26/colosseum-5029013_1280.jpg';
  if (titleLower.includes('astronomie')) return 'https://cdn.pixabay.com/photo/2011/12/14/12/21/orion-nebula-11107_1280.jpg';
  if (titleLower.includes('sport')) return 'https://cdn.pixabay.com/photo/2016/11/29/03/53/athletes-1867185_1280.jpg';
  if (titleLower.includes('musique')) return 'https://cdn.pixabay.com/photo/2015/05/07/11/02/guitar-756326_1280.jpg';
  if (titleLower.includes('programmation')) return 'https://cdn.pixabay.com/photo/2016/11/19/14/00/code-1839406_1280.jpg';
  
  // Image par défaut
  return 'https://cdn.pixabay.com/photo/2016/11/18/14/05/brick-wall-1834784_1280.jpg';
}

// Fonction pour obtenir l'image de secours
export function getFallbackImage(): string {
  return fallbackImages.default;
} 