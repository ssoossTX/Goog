// Начальное состояние игрока
export const initialPlayerState = {
  // Общая информация
  username: 'Игрок',
  level: 1,
  experience: 0,
  experienceToNextLevel: 100,
  class: null,
  mergedClass: null,
  classBonus: [],

  // Ресурсы
  resources: {
    gold: 0,
    diamonds: 0,
  },

  // Характеристики кликера
  clickPower: 1,
  autoClickRate: 0,
  autoClickPower: 1,
  criticalChance: 0,
  criticalMultiplier: 2,
  goldMultiplier: 1,

  // Инвентарь
  artifacts: [],
  skins: ['standard'],
  activeSkin: 'standard',

  // Навыки
  skillPoints: 0,
  skills: {
    weapon_master: 0,
    click_speed: 0, 
    defense: 0,
    gold_rush: 0,
    critical_power: 0,
  },

  // Статистика
  stats: {
    totalClicks: 0,
    totalGoldEarned: 0,
    totalMonsters: 0,
    totalExpeditions: 0,
    timeSpent: 0,
  },

  // Прогресс
  unlockedLocations: ['forest', 'cave', 'ruins'],
  dungeonProgress: {
    trial_tower: { maxLevel: 0, completed: false },
    shadow_tower: { maxLevel: 0, completed: false },
    fire_tower: { maxLevel: 0, completed: false },
  },

  // Текущие активные экспедиции
  activeExpeditions: [],

  // Престиж
  prestigeLevel: 0,
  prestigePoints: 0,
  prestigeBonuses: {
    goldBonus: 0,
    clickPowerBonus: 0,
  },

  // Время последнего сохранения
  lastSaved: Date.now(),
};

// Классы игрока
export const classes = [
  {
    id: 'warrior',
    name: 'Воин',
    icon: 'sword',
    description: 'Специализируется на нанесении урона',
    bonuses: [
      '+30% к силе клика',
      '+20% к урону в подземельях',
      'Бонусный шанс критического урона',
    ],
    stats: {
      clickPower: 1.3,
      dungeonDamage: 1.2,
      criticalChance: 0.05,
    },
  },
  {
    id: 'explorer',
    name: 'Исследователь',
    icon: 'map-marked-alt',
    description: 'Мастер экспедиций и поиска ресурсов',
    bonuses: [
      '-25% к времени экспедиций',
      '+40% к добыче редких предметов',
      'Доступ к скрытым локациям',
    ],
    stats: {
      expeditionTime: 0.75,
      rareLoot: 1.4,
      hiddenLocations: true,
    },
  },
  {
    id: 'merchant',
    name: 'Торговец',
    icon: 'balance-scale',
    description: 'Эксперт в накоплении и экономии ресурсов',
    bonuses: [
      '-20% к ценам в магазине',
      '+30% к удаче при открытии сундуков',
      'Бонусное золото за все действия',
    ],
    stats: {
      shopDiscount: 0.2,
      chestLuck: 1.3,
      goldBonus: 1.15,
    },
  },
  {
    id: 'mage',
    name: 'Маг',
    icon: 'hat-wizard',
    description: 'Мастер магической силы и знаний',
    bonuses: [
      '+50% к эффекту автокликера',
      'Способность замедлять врагов в подземельях',
      'Бонус к опыту за все действия',
    ],
    stats: {
      autoClickPower: 1.5,
      slowEnemies: 0.25,
      expBonus: 1.2,
    },
  },
  {
    id: 'shaman',
    name: 'Шаман',
    icon: 'mortar-pestle',
    description: 'Специалист по артефактам и исцелению',
    bonuses: [
      '+40% к эффекту всех артефактов',
      'Возможность исцеления в подземельях',
      'Уникальные зелья и эликсиры',
    ],
    stats: {
      artifactBonus: 1.4,
      healingPower: 0.3,
      potionEffect: 1.5,
    },
  },
];

// Улучшения для покупки
export const upgrades = [
  {
    id: 'click_power',
    name: 'Улучшение клика',
    description: '+1 к силе клика',
    icon: 'hand-pointer',
    basePrice: 10,
    priceMultiplier: 1.15,
    effect: (player) => ({ ...player, clickPower: player.clickPower + 1 }),
  },
  {
    id: 'auto_clicker',
    name: 'Автокликер',
    description: '+0.5 кликов в секунду',
    icon: 'robot',
    basePrice: 100,
    priceMultiplier: 1.35,
    effect: (player) => ({ ...player, autoClickRate: player.autoClickRate + 0.5 }),
  },
  {
    id: 'auto_clicker_power',
    name: 'Усиление автокликера',
    description: '+20% к силе автокликера',
    icon: 'bolt',
    basePrice: 300,
    priceMultiplier: 1.5,
    effect: (player) => ({ ...player, autoClickPower: player.autoClickPower * 1.2 }),
  },
  {
    id: 'gold_multiplier',
    name: 'Множитель золота',
    description: '+25% к получаемому золоту',
    icon: 'coins',
    basePrice: 500,
    priceMultiplier: 1.75,
    effect: (player) => ({ ...player, goldMultiplier: player.goldMultiplier * 1.25 }),
  },
  {
    id: 'critical_chance',
    name: 'Шанс крит. клика',
    description: '+5% шанс критического клика (×3)',
    icon: 'bullseye',
    basePrice: 1000,
    priceMultiplier: 2,
    levelRequired: 20,
    effect: (player) => ({ ...player, criticalChance: player.criticalChance + 0.05 }),
  },
];

// Локации для экспедиций
export const locations = [
  {
    id: 'forest',
    name: 'Лес',
    icon: 'tree',
    color: 'green-800',
    difficulty: 'Легкая',
    expeditionTime: 5 * 60, // 5 минут в секундах
    rewards: {
      gold: { min: 20, max: 50 },
      diamonds: { min: 1, max: 2 },
      exp: { min: 10, max: 20 },
      itemChance: 0.05,
    },
    levelRequired: 1,
  },
  {
    id: 'cave',
    name: 'Пещера',
    icon: 'mountain',
    color: 'gray-700',
    difficulty: 'Средняя',
    expeditionTime: 10 * 60, // 10 минут
    rewards: {
      gold: { min: 50, max: 120 },
      diamonds: { min: 2, max: 4 },
      exp: { min: 25, max: 40 },
      itemChance: 0.15,
    },
    levelRequired: 3,
  },
  {
    id: 'ruins',
    name: 'Руины',
    icon: 'archway',
    color: 'yellow-800',
    difficulty: 'Средняя',
    expeditionTime: 15 * 60, // 15 минут
    rewards: {
      gold: { min: 80, max: 180 },
      diamonds: { min: 3, max: 6 },
      exp: { min: 35, max: 60 },
      itemChance: 0.25,
    },
    levelRequired: 5,
  },
  {
    id: 'swamp',
    name: 'Болото',
    icon: 'water',
    color: 'blue-700',
    difficulty: 'Сложная',
    expeditionTime: 30 * 60, // 30 минут
    rewards: {
      gold: { min: 150, max: 300 },
      diamonds: { min: 5, max: 10 },
      exp: { min: 70, max: 100 },
      itemChance: 0.4,
    },
    levelRequired: 15,
  },
  {
    id: 'volcano',
    name: 'Вулкан',
    icon: 'fire',
    color: 'red-500',
    difficulty: 'Очень сложная',
    expeditionTime: 60 * 60, // 60 минут
    rewards: {
      gold: { min: 300, max: 600 },
      diamonds: { min: 10, max: 20 },
      exp: { min: 150, max: 250 },
      itemChance: 0.6,
    },
    levelRequired: 25,
  },
];

// Подземелья
export const dungeons = [
  {
    id: 'trial_tower',
    name: 'Башня испытаний',
    icon: 'tower',
    difficulty: 'Легко',
    levels: 15,
    rewards: {
      gold: { base: 50, level: 10 },
      diamonds: { base: 2, level: 1 },
      exp: { base: 20, level: 5 },
      relicChance: 0.01,
    },
    levelRequired: 1,
  },
  {
    id: 'shadow_tower',
    name: 'Башня теней',
    icon: 'tower-shadow',
    difficulty: 'Средне',
    levels: 25,
    rewards: {
      gold: { base: 100, level: 20 },
      diamonds: { base: 4, level: 2 },
      exp: { base: 40, level: 10 },
      relicChance: 0.05,
    },
    levelRequired: 10,
  },
  {
    id: 'fire_tower',
    name: 'Башня огня',
    icon: 'tower-fire',
    difficulty: 'Сложно',
    levels: 40,
    rewards: {
      gold: { base: 200, level: 40 },
      diamonds: { base: 8, level: 4 },
      exp: { base: 80, level: 20 },
      relicChance: 0.1,
    },
    levelRequired: 25,
  },
];

// Предметы магазина
export const shopItems = [
  {
    id: 'common_chest',
    name: 'Обычный сундук',
    icon: 'chest',
    rarity: 'Обычный',
    rarityColor: 'gray-600',
    price: 10,
    description: 'Содержит случайные предметы и ресурсы.',
    rareLoot: { chance: 0.05, description: 'Шанс редкого предмета: 5%' },
    rewards: {
      gold: { min: 10, max: 50 },
      artifacts: { chance: 0.01, rarity: ['common'] },
    },
  },
  {
    id: 'rare_chest',
    name: 'Редкий сундук',
    icon: 'chest',
    rarity: 'Редкий',
    rarityColor: 'blue-600',
    price: 30,
    description: 'Содержит редкие предметы и ресурсы.',
    rareLoot: { chance: 0.15, description: 'Шанс эпического предмета: 15%' },
    rewards: {
      gold: { min: 50, max: 150 },
      artifacts: { chance: 0.05, rarity: ['common', 'rare'] },
    },
  },
  {
    id: 'epic_chest',
    name: 'Эпический сундук',
    icon: 'chest',
    rarity: 'Эпический',
    rarityColor: 'purple-600',
    price: 75,
    description: 'Содержит эпические предметы и ресурсы.',
    rareLoot: { chance: 0.07, description: 'Шанс легендарного предмета: 7%' },
    rewards: {
      gold: { min: 100, max: 300 },
      artifacts: { chance: 0.15, rarity: ['rare', 'epic'] },
    },
  },
  {
    id: 'legendary_chest',
    name: 'Легендарный сундук',
    icon: 'chest',
    rarity: 'Легендарный',
    rarityColor: 'yellow-500',
    price: 150,
    description: 'Содержит легендарные предметы и ресурсы.',
    rareLoot: { chance: 1, description: 'Гарантированный редкий артефакт!' },
    rewards: {
      gold: { min: 200, max: 500 },
      artifacts: { chance: 1, rarity: ['epic', 'legendary'] },
    },
  },
];

// Артефакты
export const artifacts = [
  {
    id: 'amulet',
    name: 'Древний амулет',
    icon: 'gem',
    rarity: 'Редкий',
    description: 'Увеличивает силу клика на 15%',
    effect: (player) => ({ ...player, clickPower: player.clickPower * 1.15 }),
  },
  {
    id: 'ring',
    name: 'Кольцо силы',
    icon: 'ring',
    rarity: 'Необычный',
    description: 'Увеличивает получаемый опыт на 10%',
    effect: (player) => ({ ...player, experienceMultiplier: (player.experienceMultiplier || 1) * 1.1 }),
  },
  {
    id: 'crown',
    name: 'Корона величия',
    icon: 'crown',
    rarity: 'Эпический',
    description: 'Увеличивает все получаемые ресурсы на 20%',
    effect: (player) => ({ 
      ...player, 
      goldMultiplier: player.goldMultiplier * 1.2,
      experienceMultiplier: (player.experienceMultiplier || 1) * 1.2,
    }),
  },
  {
    id: 'shard',
    name: 'Осколок времени',
    icon: 'hourglass',
    rarity: 'Легендарный',
    description: 'Ускоряет все процессы на 15%',
    effect: (player) => ({ 
      ...player, 
      timeMultiplier: (player.timeMultiplier || 1) * 0.85, 
    }),
  },
  {
    id: 'pendant',
    name: 'Подвеска удачи',
    icon: 'clover',
    rarity: 'Редкий',
    description: 'Увеличивает шанс критического удара на 7%',
    effect: (player) => ({ ...player, criticalChance: player.criticalChance + 0.07 }),
  },
  {
    id: 'gauntlet',
    name: 'Рукавица мощи',
    icon: 'fist',
    rarity: 'Эпический',
    description: 'Критический урон увеличен на 50%',
    effect: (player) => ({ ...player, criticalMultiplier: player.criticalMultiplier + 0.5 }),
  },
  {
    id: 'boots',
    name: 'Сапоги странника',
    icon: 'boot',
    rarity: 'Необычный',
    description: 'Уменьшает время экспедиций на 12%',
    effect: (player) => ({ ...player, expeditionTimeMultiplier: (player.expeditionTimeMultiplier || 1) * 0.88 }),
  },
  {
    id: 'scroll',
    name: 'Древний свиток',
    icon: 'scroll',
    rarity: 'Редкий',
    description: 'Увеличивает эффект автокликера на 25%',
    effect: (player) => ({ ...player, autoClickPower: player.autoClickPower * 1.25 }),
  },
  {
    id: 'talisman',
    name: 'Талисман защиты',
    icon: 'shield',
    rarity: 'Эпический',
    description: 'Уменьшает урон в подземельях на 15%',
    effect: (player) => ({ ...player, dungeonDamageReduction: (player.dungeonDamageReduction || 0) + 0.15 }),
  },
  {
    id: 'crystal',
    name: 'Кристалл познания',
    icon: 'gem',
    rarity: 'Легендарный',
    description: 'Даёт двойной опыт за все действия',
    effect: (player) => ({ ...player, experienceMultiplier: (player.experienceMultiplier || 1) * 2 }),
  },
];

// Скины персонажей
export const skins = [
  {
    id: 'standard',
    name: 'Стандартный',
    description: 'Базовый внешний вид персонажа',
    levelRequired: 1,
  },
  {
    id: 'knight',
    name: 'Рыцарь',
    description: 'Внешний вид бесстрашного рыцаря',
    levelRequired: 5,
  },
  {
    id: 'ninja',
    name: 'Ниндзя',
    description: 'Тёмный и скрытный образ ниндзя',
    levelRequired: 10,
  },
  {
    id: 'mage_lord',
    name: 'Архимаг',
    description: 'Величественный повелитель магии',
    levelRequired: 15,
  },
  {
    id: 'explorer_king',
    name: 'Король исследователей',
    description: 'Легендарный первооткрыватель',
    levelRequired: 20,
  },
  {
    id: 'merchant_prince',
    name: 'Принц торговцев',
    description: 'Богатейший торговец королевства',
    levelRequired: 25,
  },
  {
    id: 'shaman_elder',
    name: 'Старейшина шаманов',
    description: 'Мудрейший из шаманов',
    levelRequired: 30,
  },
  {
    id: 'warrior_king',
    name: 'Король воинов',
    description: 'Верховный правитель всех воинов',
    levelRequired: 35,
  },
  {
    id: 'dimensional',
    name: 'Повелитель измерений',
    description: 'Мистический странник между мирами',
    levelRequired: 40,
  },
  {
    id: 'ascended',
    name: 'Вознесённый',
    description: 'Персонаж, превзошедший обычное существование',
    levelRequired: 50,
  },
];

// Навыки
export const skills = [
  {
    id: 'weapon_master',
    name: 'Мастер оружия',
    description: '+5% к урону от всех источников за уровень',
    icon: 'fist-raised',
    iconColor: 'red-400',
    maxLevel: 5,
    effect: (player, level) => ({ 
      ...player, 
      clickPower: player.clickPower * (1 + 0.05 * level),
      autoClickPower: player.autoClickPower * (1 + 0.05 * level),
    }),
  },
  {
    id: 'click_speed',
    name: 'Скорость клика',
    description: '+10% к скорости автокликера за уровень',
    icon: 'tachometer-alt',
    iconColor: 'green-400',
    maxLevel: 5,
    effect: (player, level) => ({ 
      ...player, 
      autoClickRate: player.autoClickRate * (1 + 0.1 * level),
    }),
  },
  {
    id: 'defense',
    name: 'Защита',
    description: '-5% к получаемому урону в подземельях за уровень',
    icon: 'shield-alt',
    iconColor: 'blue-400',
    maxLevel: 5,
    effect: (player, level) => ({ 
      ...player, 
      dungeonDamageReduction: (player.dungeonDamageReduction || 0) + 0.05 * level,
    }),
  },
  {
    id: 'gold_rush',
    name: 'Золотая жила',
    description: '+15% к получаемому золоту за уровень',
    icon: 'coins',
    iconColor: 'yellow-400',
    maxLevel: 5,
    effect: (player, level) => ({ 
      ...player, 
      goldMultiplier: player.goldMultiplier * (1 + 0.15 * level),
    }),
  },
  {
    id: 'critical_power',
    name: 'Критическая мощь',
    description: '+25% к урону критических ударов за уровень',
    icon: 'skull',
    iconColor: 'red-400',
    maxLevel: 5,
    levelRequired: 20,
    effect: (player, level) => ({ 
      ...player, 
      criticalMultiplier: player.criticalMultiplier + 0.25 * level,
    }),
  },
];

// Расчет опыта для следующего уровня
export function getExperienceForLevel(level) {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

// Расчет стоимости апгрейда
export function getUpgradePrice(upgrade, level) {
  return Math.floor(upgrade.basePrice * Math.pow(upgrade.priceMultiplier, level));
}
