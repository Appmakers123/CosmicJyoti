/**
 * Generate Tarot Card Reading
 */
export async function generateTarot(question, spread = 'three-card', language = 'en') {
  try {
    const cards = drawCards(spread);
    const reading = interpretCards(cards, question, spread, language);
    
    return {
      question: question,
      spread: spread,
      cards: cards,
      reading: reading,
      language: language
    };
  } catch (error) {
    console.error('Tarot generation error:', error);
    throw new Error(`Failed to generate Tarot reading: ${error.message}`);
  }
}

/**
 * Draw Tarot cards
 */
function drawCards(spread) {
  const majorArcana = [
    'The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor',
    'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit',
    'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death', 'Temperance',
    'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun',
    'Judgement', 'The World'
  ];
  
  const minorArcana = [
    'Ace of Wands', 'Two of Wands', 'Three of Wands', 'Four of Wands', 'Five of Wands',
    'Six of Wands', 'Seven of Wands', 'Eight of Wands', 'Nine of Wands', 'Ten of Wands',
    'Ace of Cups', 'Two of Cups', 'Three of Cups', 'Four of Cups', 'Five of Cups',
    'Six of Cups', 'Seven of Cups', 'Eight of Cups', 'Nine of Cups', 'Ten of Cups',
    'Ace of Swords', 'Two of Swords', 'Three of Swords', 'Four of Swords', 'Five of Swords',
    'Six of Swords', 'Seven of Swords', 'Eight of Swords', 'Nine of Swords', 'Ten of Swords',
    'Ace of Pentacles', 'Two of Pentacles', 'Three of Pentacles', 'Four of Pentacles', 'Five of Pentacles',
    'Six of Pentacles', 'Seven of Pentacles', 'Eight of Pentacles', 'Nine of Pentacles', 'Ten of Pentacles'
  ];
  
  const allCards = [...majorArcana, ...minorArcana];
  const numCards = spread === 'three-card' ? 3 : spread === 'celtic-cross' ? 10 : 1;
  
  const drawnCards = [];
  const usedIndices = new Set();
  
  for (let i = 0; i < numCards; i++) {
    let index;
    do {
      index = Math.floor(Math.random() * allCards.length);
    } while (usedIndices.has(index));
    
    usedIndices.add(index);
    const isReversed = Math.random() > 0.5;
    
    drawnCards.push({
      name: allCards[index],
      position: spread === 'three-card' ? ['Past', 'Present', 'Future'][i] : `Position ${i + 1}`,
      reversed: isReversed,
      meaning: getCardMeaning(allCards[index], isReversed)
    });
  }
  
  return drawnCards;
}

/**
 * Get card meaning
 */
function getCardMeaning(cardName, reversed) {
  const meanings = {
    'The Fool': reversed ? 'Recklessness, poor judgement' : 'New beginnings, innocence',
    'The Magician': reversed ? 'Manipulation, poor planning' : 'Manifestation, resourcefulness',
    'The High Priestess': reversed ? 'Secrets, disconnected from intuition' : 'Intuition, sacred knowledge',
    'The Empress': reversed ? 'Dependence, smothering' : 'Fertility, nurturing',
    'The Emperor': reversed ? 'Domination, rigidity' : 'Authority, structure'
  };
  
  return meanings[cardName] || (reversed ? 'Challenges, obstacles' : 'Positive energy, growth');
}

/**
 * Interpret cards
 */
function interpretCards(cards, question, spread, language) {
  if (language === 'hi') {
    return {
      summary: `${cards.length} कार्ड निकाले गए हैं। यह रीडिंग आपके प्रश्न के बारे में जानकारी प्रदान करती है।`,
      detailed: cards.map(card => 
        `${card.position}: ${card.name} ${card.reversed ? '(उल्टा)' : ''} - ${card.meaning}`
      ).join('\n')
    };
  }
  
  return {
    summary: `${cards.length} cards drawn. This reading provides insight into your question.`,
    detailed: cards.map(card => 
      `${card.position}: ${card.name} ${card.reversed ? '(Reversed)' : ''} - ${card.meaning}`
    ).join('\n')
  };
}

