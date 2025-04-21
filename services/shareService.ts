// Service pour gérer les partages sur les réseaux sociaux

// Générer un texte de partage
export function generateShareText(quizTitle: string, score: number, totalQuestions: number): string {
  const percentage = (score / totalQuestions) * 100;
  
  let emoji = '🎯';
  let message = 'Continuez à vous entraîner!';
  
  if (percentage >= 90) {
    emoji = '🏆';
    message = 'Excellent travail!';
  } else if (percentage >= 70) {
    emoji = '🌟';
    message = 'Très bon travail!';
  } else if (percentage >= 50) {
    emoji = '👍';
    message = 'Bon travail!';
  }
  
  return `${emoji} J'ai obtenu ${score}/${totalQuestions} (${Math.round(percentage)}%) au quiz "${quizTitle}" sur Quiz Master! ${message}`;
}

// Générer une URL de partage pour Twitter
export function getTwitterShareUrl(text: string, url: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
}

// Générer une URL de partage pour Facebook
export function getFacebookShareUrl(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

// Générer une URL de partage pour WhatsApp
export function getWhatsAppShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

// Copier du texte dans le presse-papiers
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Erreur lors de la copie dans le presse-papiers:', error);
    return false;
  }
} 