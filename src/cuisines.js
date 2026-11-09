// The kinds of food of a place. The text of each is the catalog key `cuisine.<id>`.
export const CUISINES = [
  { id: 'spanish', emoji: '🥘' },
  { id: 'tapas', emoji: '🍤' },
  { id: 'mexican', emoji: '🌮' },
  { id: 'japanese', emoji: '🍣' },
  { id: 'italian', emoji: '🍝' },
  { id: 'pizza', emoji: '🍕' },
  { id: 'burger', emoji: '🍔' },
  { id: 'asian', emoji: '🥢' },
  { id: 'indian', emoji: '🍛' },
  { id: 'peruvian', emoji: '🐟' },
  { id: 'mediterranean', emoji: '🫒' },
  { id: 'vegetarian', emoji: '🥗' },
  { id: 'cafe', emoji: '☕' },
  { id: 'dessert', emoji: '🍰' },
  { id: 'other', emoji: '🍽️' },
];

const OTHER = CUISINES.at(-1);

// The entry of an id; an unknown id is `other`.
export const cuisineOf = (id) => CUISINES.find((cuisine) => cuisine.id === id) ?? OTHER;
