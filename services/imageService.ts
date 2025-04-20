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
    case 1: return fallbackImages.culture;
    case 2: return fallbackImages.science;
    case 3: return fallbackImages.sport;
    case 4: return fallbackImages.musique;
    default: return fallbackImages.default;
  }
}

// Fonction pour obtenir une image en fonction du titre du quiz
export function getImageForQuizTitle(title: string): string {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('culture')) return fallbackImages.culture;
  if (lowerTitle.includes('science')) return fallbackImages.science;
  if (lowerTitle.includes('histoire')) return fallbackImages.histoire;
  if (lowerTitle.includes('astronomie')) return fallbackImages.astronomie;
  if (lowerTitle.includes('sport')) return fallbackImages.sport;
  if (lowerTitle.includes('musique')) return fallbackImages.musique;
  if (lowerTitle.includes('cinéma') || lowerTitle.includes('cinema')) return fallbackImages.cinema;
  if (lowerTitle.includes('géographie') || lowerTitle.includes('geographie')) return fallbackImages.geographie;
  if (lowerTitle.includes('programmation')) return fallbackImages.programmation;
  if (lowerTitle.includes('gastronomie')) return fallbackImages.gastronomie;
  
  return fallbackImages.default;
}

// Fonction pour obtenir l'image de secours
export function getFallbackImage(): string {
  return fallbackImages.default;
} 