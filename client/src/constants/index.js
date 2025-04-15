// Константы для игры

// Время обновления автокликера (мс)
export const AUTO_CLICK_INTERVAL = 1000;

// Время проверки экспедиций (мс)
export const EXPEDITION_CHECK_INTERVAL = 10000;

// Время сохранения прогресса (мс)
export const SAVE_INTERVAL = 30000;

// Минимальное количество золота для престижа
export const PRESTIGE_GOLD_REQUIREMENT = 100000;

// CSS классы для различных уровней редкости
export const RARITY_CLASSES = {
  common: {
    text: 'text-gray-200',
    bg: 'bg-gray-600',
    border: 'border-gray-500',
  },
  uncommon: {
    text: 'text-green-300',
    bg: 'bg-green-600',
    border: 'border-green-500',
  },
  rare: {
    text: 'text-blue-300',
    bg: 'bg-blue-600',
    border: 'border-blue-500',
  },
  epic: {
    text: 'text-purple-300',
    bg: 'bg-purple-600',
    border: 'border-purple-500',
  },
  legendary: {
    text: 'text-yellow-300',
    bg: 'bg-yellow-500',
    border: 'border-yellow-400',
  },
};

// CSS классы для различных классов персонажей
export const CLASS_COLORS = {
  warrior: {
    text: 'text-class-warrior',
    bg: 'bg-class-warrior',
    border: 'border-class-warrior',
  },
  explorer: {
    text: 'text-class-explorer',
    bg: 'bg-class-explorer',
    border: 'border-class-explorer',
  },
  merchant: {
    text: 'text-class-merchant',
    bg: 'bg-class-merchant',
    border: 'border-class-merchant',
  },
  mage: {
    text: 'text-class-mage',
    bg: 'bg-class-mage',
    border: 'border-class-mage',
  },
  shaman: {
    text: 'text-class-shaman',
    bg: 'bg-class-shaman',
    border: 'border-class-shaman',
  },
};
