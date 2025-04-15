import { getExperienceForLevel, getUpgradePrice, classes, skills, upgrades, locations, shopItems, initialPlayerState } from '../lib/gameData';

// Получение случайного числа в диапазоне
export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Форматирование чисел (добавление разделителей)
export function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Форматирование времени
export function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// Добавление золота игроку
export function addGold(player, amount) {
  // Применяем множители золота от класса
  let goldMultiplier = player.goldMultiplier;
  
  // Если игрок торговец, добавляем бонус
  if (player.class === 'merchant') {
    goldMultiplier *= 1.15;
  }
  
  // Учитываем бонус от слияния классов, если есть
  if (player.mergedClass && player.mergedClass === 'merchant') {
    goldMultiplier *= 1.07; // Меньший бонус для второго класса
  }
  
  // Применяем бонус престижа
  goldMultiplier *= (1 + player.prestigeBonuses.goldBonus);
  
  // Рассчитываем финальную сумму
  const finalAmount = Math.floor(amount * goldMultiplier);
  
  // Обновляем статистику
  const newStats = {
    ...player.stats,
    totalGoldEarned: player.stats.totalGoldEarned + finalAmount
  };
  
  return {
    ...player,
    resources: {
      ...player.resources,
      gold: player.resources.gold + finalAmount
    },
    stats: newStats
  };
}

// Добавление опыта игроку
export function addExperience(player, amount) {
  // Применяем множители опыта
  let expMultiplier = player.experienceMultiplier || 1;
  
  // Если игрок маг, добавляем бонус
  if (player.class === 'mage') {
    expMultiplier *= 1.2;
  }
  
  // Учитываем бонус от слияния классов, если есть
  if (player.mergedClass && player.mergedClass === 'mage') {
    expMultiplier *= 1.1; // Меньший бонус для второго класса
  }
  
  // Рассчитываем финальную сумму опыта
  const finalAmount = Math.floor(amount * expMultiplier);
  let newExp = player.experience + finalAmount;
  let newLevel = player.level;
  let newSkillPoints = player.skillPoints;
  let expToNextLevel = player.experienceToNextLevel;
  
  // Проверяем, поднялся ли уровень
  while (newExp >= expToNextLevel) {
    newExp -= expToNextLevel;
    newLevel++;
    newSkillPoints += 2; // Даем 2 очка навыков за уровень
    expToNextLevel = getExperienceForLevel(newLevel);
  }
  
  return {
    ...player,
    level: newLevel,
    experience: newExp,
    experienceToNextLevel: expToNextLevel,
    skillPoints: newSkillPoints
  };
}

// Запуск экспедиции
export function startExpedition(player, locationId) {
  // Проверяем, что у игрока не больше 2-х активных экспедиций
  if (player.activeExpeditions.length >= 2) {
    return { success: false, message: 'Уже активны максимум 2 экспедиции' };
  }
  
  // Находим локацию
  const location = locations.find(loc => loc.id === locationId);
  if (!location) {
    return { success: false, message: 'Локация не найдена' };
  }
  
  // Проверяем требования по уровню
  if (player.level < location.levelRequired) {
    return { success: false, message: `Требуется уровень ${location.levelRequired}` };
  }
  
  // Рассчитываем время экспедиции с учетом бонусов
  let expeditionTime = location.expeditionTime;
  
  // Если игрок исследователь, уменьшаем время
  if (player.class === 'explorer') {
    expeditionTime *= 0.75; // -25%
  }
  
  // Учитываем бонус от слияния классов, если есть
  if (player.mergedClass && player.mergedClass === 'explorer') {
    expeditionTime *= 0.9; // -10% (меньший бонус)
  }
  
  // Учитываем бонус от артефактов или навыков
  if (player.expeditionTimeMultiplier) {
    expeditionTime *= player.expeditionTimeMultiplier;
  }
  
  // Создаем новую экспедицию
  const expedition = {
    id: Date.now(), // уникальный ID на основе времени
    locationId: location.id,
    startTime: Date.now(),
    endTime: Date.now() + expeditionTime * 1000,
    duration: expeditionTime,
    completed: false,
  };
  
  // Добавляем экспедицию
  const newActiveExpeditions = [...player.activeExpeditions, expedition];
  
  return { 
    success: true, 
    player: {
      ...player,
      activeExpeditions: newActiveExpeditions
    },
    message: `Экспедиция в ${location.name} началась!`
  };
}

// Завершение экспедиции
export function completeExpedition(player, expeditionId) {
  // Находим экспедицию
  const expeditionIndex = player.activeExpeditions.findIndex(exp => exp.id === expeditionId);
  if (expeditionIndex === -1) {
    return { success: false, message: 'Экспедиция не найдена' };
  }
  
  const expedition = player.activeExpeditions[expeditionIndex];
  const location = locations.find(loc => loc.id === expedition.locationId);
  
  if (!location) {
    return { success: false, message: 'Локация не найдена' };
  }
  
  // Проверяем, завершилась ли экспедиция по времени
  if (Date.now() < expedition.endTime && !expedition.completed) {
    return { 
      success: false, 
      message: 'Экспедиция еще не завершена',
      timeLeft: formatTime((expedition.endTime - Date.now()) / 1000)
    };
  }
  
  // Рассчитываем награды
  const goldReward = getRandomInt(location.rewards.gold.min, location.rewards.gold.max);
  const diamondsReward = getRandomInt(location.rewards.diamonds.min, location.rewards.diamonds.max);
  const expReward = getRandomInt(location.rewards.exp.min, location.rewards.exp.max);
  
  // Проверяем шанс на предмет
  let itemFound = null;
  let itemChance = location.rewards.itemChance;
  
  // Если игрок исследователь, увеличиваем шанс
  if (player.class === 'explorer') {
    itemChance *= 1.4; // +40%
  }
  
  // Учитываем бонус от слияния классов, если есть
  if (player.mergedClass && player.mergedClass === 'explorer') {
    itemChance *= 1.2; // +20% (меньший бонус)
  }
  
  // Проверяем, выпал ли предмет
  if (Math.random() < itemChance) {
    // В реальной игре здесь будет выбор случайного предмета
    itemFound = { type: 'artifact', id: 'amulet' };
  }
  
  // Удаляем экспедицию из активных
  const newActiveExpeditions = [...player.activeExpeditions];
  newActiveExpeditions.splice(expeditionIndex, 1);
  
  // Обновляем статистику
  const newStats = {
    ...player.stats,
    totalExpeditions: player.stats.totalExpeditions + 1
  };
  
  // Добавляем награды
  let updatedPlayer = {
    ...player,
    activeExpeditions: newActiveExpeditions,
    resources: {
      ...player.resources,
      gold: player.resources.gold + goldReward,
      diamonds: player.resources.diamonds + diamondsReward
    },
    stats: newStats
  };
  
  // Добавляем опыт
  updatedPlayer = addExperience(updatedPlayer, expReward);
  
  // Добавляем предмет, если нашли
  if (itemFound && itemFound.type === 'artifact') {
    // Проверяем, есть ли уже такой артефакт
    if (!updatedPlayer.artifacts.includes(itemFound.id)) {
      updatedPlayer = {
        ...updatedPlayer,
        artifacts: [...updatedPlayer.artifacts, itemFound.id]
      };
    }
  }
  
  return { 
    success: true, 
    player: updatedPlayer,
    rewards: { gold: goldReward, diamonds: diamondsReward, exp: expReward, item: itemFound },
    message: `Экспедиция завершена! Получено: ${goldReward} золота, ${diamondsReward} алмазов, ${expReward} опыта${itemFound ? ', и предмет!' : '!'}`
  };
}

// Покупка улучшения
export function purchaseUpgrade(player, upgradeId) {
  // Находим улучшение
  const upgrade = upgrades.find(u => u.id === upgradeId);
  if (!upgrade) {
    return { success: false, message: 'Улучшение не найдено' };
  }
  
  // Определяем текущий уровень улучшения (по умолчанию 0)
  const currentLevel = player[`${upgradeId}_level`] || 0;
  
  // Проверяем требования к уровню
  if (upgrade.levelRequired && player.level < upgrade.levelRequired) {
    return { success: false, message: `Требуется уровень ${upgrade.levelRequired}` };
  }
  
  // Рассчитываем стоимость с учетом бонусов
  let price = getUpgradePrice(upgrade, currentLevel);
  
  // Если игрок торговец, уменьшаем цену
  if (player.class === 'merchant') {
    price = Math.floor(price * 0.8); // -20%
  }
  
  // Учитываем бонус от слияния классов, если есть
  if (player.mergedClass && player.mergedClass === 'merchant') {
    price = Math.floor(price * 0.9); // -10% (меньший бонус)
  }
  
  // Проверяем, хватает ли золота
  if (player.resources.gold < price) {
    return { success: false, message: 'Недостаточно золота' };
  }
  
  // Применяем эффект улучшения
  let updatedPlayer = upgrade.effect(player);
  
  // Увеличиваем уровень улучшения
  updatedPlayer = {
    ...updatedPlayer,
    [`${upgradeId}_level`]: currentLevel + 1,
    resources: {
      ...updatedPlayer.resources,
      gold: updatedPlayer.resources.gold - price
    }
  };
  
  return { 
    success: true, 
    player: updatedPlayer,
    message: `${upgrade.name} улучшено до уровня ${currentLevel + 1}!`
  };
}

// Покупка предмета в магазине
export function purchaseShopItem(player, itemId) {
  // Находим предмет
  const item = shopItems.find(i => i.id === itemId);
  if (!item) {
    return { success: false, message: 'Предмет не найден' };
  }
  
  // Рассчитываем стоимость с учетом бонусов
  let price = item.price;
  
  // Если игрок торговец, уменьшаем цену
  if (player.class === 'merchant') {
    price = Math.floor(price * 0.8); // -20%
  }
  
  // Учитываем бонус от слияния классов, если есть
  if (player.mergedClass && player.mergedClass === 'merchant') {
    price = Math.floor(price * 0.9); // -10% (меньший бонус)
  }
  
  // Проверяем, хватает ли алмазов
  if (player.resources.diamonds < price) {
    return { success: false, message: 'Недостаточно алмазов' };
  }
  
  // Рассчитываем награды из сундука
  const rewards = {
    gold: getRandomInt(item.rewards.gold.min, item.rewards.gold.max),
    artifacts: []
  };
  
  // Проверяем шанс на артефакт
  let artifactChance = item.rewards.artifacts.chance;
  
  // Если игрок торговец, увеличиваем шанс
  if (player.class === 'merchant') {
    artifactChance *= 1.3; // +30%
  }
  
  // Учитываем бонус от слияния классов, если есть
  if (player.mergedClass && player.mergedClass === 'merchant') {
    artifactChance *= 1.15; // +15% (меньший бонус)
  }
  
  // Проверяем, выпал ли артефакт
  if (Math.random() < artifactChance) {
    // Выбираем случайный артефакт из доступных для этого сундука
    // В реальной игре здесь будет более сложная логика выбора
    const artifactCandidate = 'amulet'; // здесь должен быть случайный выбор
    
    // Проверяем, есть ли уже такой артефакт
    if (!player.artifacts.includes(artifactCandidate)) {
      rewards.artifacts.push(artifactCandidate);
    }
  }
  
  // Обновляем игрока
  let updatedPlayer = {
    ...player,
    resources: {
      ...player.resources,
      diamonds: player.resources.diamonds - price,
      gold: player.resources.gold + rewards.gold
    }
  };
  
  // Добавляем артефакты, если они есть
  if (rewards.artifacts.length > 0) {
    updatedPlayer = {
      ...updatedPlayer,
      artifacts: [...updatedPlayer.artifacts, ...rewards.artifacts]
    };
  }
  
  return { 
    success: true, 
    player: updatedPlayer,
    rewards: rewards,
    message: `Сундук открыт! Получено: ${rewards.gold} золота${rewards.artifacts.length > 0 ? ' и артефакт!' : '!'}`
  };
}

// Улучшение навыка
export function upgradeSkill(player, skillId) {
  // Находим навык
  const skill = skills.find(s => s.id === skillId);
  if (!skill) {
    return { success: false, message: 'Навык не найден' };
  }
  
  // Получаем текущий уровень навыка
  const currentLevel = player.skills[skillId] || 0;
  
  // Проверяем, не достигнут ли максимальный уровень
  if (currentLevel >= skill.maxLevel) {
    return { success: false, message: 'Достигнут максимальный уровень навыка' };
  }
  
  // Проверяем требования к уровню игрока
  if (skill.levelRequired && player.level < skill.levelRequired) {
    return { success: false, message: `Требуется уровень ${skill.levelRequired}` };
  }
  
  // Проверяем, хватает ли очков навыков
  if (player.skillPoints < 1) {
    return { success: false, message: 'Недостаточно очков навыков' };
  }
  
  // Применяем эффект навыка
  let updatedPlayer = skill.effect(player, currentLevel + 1);
  
  // Увеличиваем уровень навыка и уменьшаем количество очков
  updatedPlayer = {
    ...updatedPlayer,
    skills: {
      ...updatedPlayer.skills,
      [skillId]: currentLevel + 1
    },
    skillPoints: updatedPlayer.skillPoints - 1
  };
  
  return { 
    success: true, 
    player: updatedPlayer,
    message: `${skill.name} улучшен до уровня ${currentLevel + 1}!`
  };
}

// Активация системы престижа
export function activatePrestige(player) {
  // Проверяем минимальное количество золота для престижа
  const PRESTIGE_GOLD_REQUIREMENT = 100000;
  
  if (player.resources.gold < PRESTIGE_GOLD_REQUIREMENT) {
    return { success: false, message: `Требуется ${PRESTIGE_GOLD_REQUIREMENT} золота для престижа` };
  }
  
  // Рассчитываем бонусы на основе текущего прогресса
  const goldBonusIncrease = 0.05; // +5% к золоту за каждый престиж
  const clickPowerBonusIncrease = 0.04; // +4% к силе клика за каждый престиж
  
  // Создаем нового игрока с сохранением некоторых характеристик
  const newPlayer = {
    ...initialPlayerState,
    class: player.class,
    mergedClass: player.mergedClass,
    classBonus: player.classBonus,
    skills: initialPlayerState.skills, // Сбрасываем навыки
    skins: player.skins, // Сохраняем разблокированные скины
    activeSkin: player.activeSkin,
    artifacts: player.artifacts, // Сохраняем артефакты
    stats: {
      ...player.stats,
      timeSpent: player.stats.timeSpent // Сохраняем статистику времени
    },
    unlockedLocations: player.unlockedLocations, // Сохраняем открытые локации
    dungeonProgress: player.dungeonProgress, // Сохраняем прогресс в подземельях
    
    // Увеличиваем уровень престижа и бонусы
    prestigeLevel: player.prestigeLevel + 1,
    prestigePoints: player.prestigePoints + 1,
    prestigeBonuses: {
      goldBonus: (player.prestigeBonuses.goldBonus || 0) + goldBonusIncrease,
      clickPowerBonus: (player.prestigeBonuses.clickPowerBonus || 0) + clickPowerBonusIncrease,
    },
    
    // Добавляем ресурсы в зависимости от престижа
    resources: {
      ...initialPlayerState.resources,
      diamonds: player.resources.diamonds + 10 * (player.prestigeLevel + 1), // Бонусные алмазы
    },
    
    lastSaved: Date.now()
  };
  
  return { 
    success: true, 
    player: newPlayer,
    message: `Престиж активирован! Уровень престижа: ${newPlayer.prestigeLevel}, бонусы: +${Math.round(newPlayer.prestigeBonuses.goldBonus * 100)}% к золоту, +${Math.round(newPlayer.prestigeBonuses.clickPowerBonus * 100)}% к силе клика`
  };
}

// Выбор скина
export function selectSkin(player, skinId) {
  // Проверяем, есть ли скин у игрока
  if (!player.skins.includes(skinId)) {
    return { success: false, message: 'Этот скин не разблокирован' };
  }
  
  // Применяем скин
  const updatedPlayer = {
    ...player,
    activeSkin: skinId
  };
  
  return { 
    success: true, 
    player: updatedPlayer,
    message: `Скин ${skinId} активирован!`
  };
}

// Получение бонусов класса
export function getClassBonuses(classId) {
  const classData = classes.find(c => c.id === classId);
  return classData ? classData.bonuses : [];
}

// Расчет возможных слияний классов
export function getMergedClassBonuses(class1, class2) {
  // Здесь будет логика для расчета уникальных бонусов от слияния
  // Для примера используем простую комбинацию
  return {
    name: `${getClassName(class1)}-${getClassName(class2)}`,
    bonuses: [
      `Уникальная способность: Слияние ${getClassName(class1)} и ${getClassName(class2)}`,
      `Половина бонусов от ${getClassName(class2)}`,
    ]
  };
}

// Получение имени класса
export function getClassName(classId) {
  const classData = classes.find(c => c.id === classId);
  return classData ? classData.name : classId;
}

// Обработка клика
export function handleClick(player) {
  // Рассчитываем силу клика с учетом бонусов
  let clickPower = player.clickPower;
  
  // Учитываем бонус престижа
  clickPower *= (1 + player.prestigeBonuses.clickPowerBonus);
  
  // Проверяем критический удар
  let isCritical = false;
  if (Math.random() < player.criticalChance) {
    clickPower *= player.criticalMultiplier;
    isCritical = true;
  }
  
  // Округляем до целого
  clickPower = Math.floor(clickPower);
  
  // Прибавляем золото
  let updatedPlayer = addGold(player, clickPower);
  
  // Обновляем статистику
  updatedPlayer = {
    ...updatedPlayer,
    stats: {
      ...updatedPlayer.stats,
      totalClicks: updatedPlayer.stats.totalClicks + 1
    }
  };
  
  return { 
    success: true, 
    player: updatedPlayer,
    clickResult: {
      amount: clickPower,
      isCritical
    }
  };
}

// Обработка автоклика (вызывается периодически)
export function processAutoClick(player) {
  // Если скорость автоклика равна 0, пропускаем
  if (player.autoClickRate <= 0) {
    return player;
  }
  
  // Рассчитываем силу автоклика
  let clickPower = player.clickPower * player.autoClickPower;
  
  // Учитываем бонус мага
  if (player.class === 'mage') {
    clickPower *= 1.5; // +50%
  }
  
  // Учитываем бонус от слияния классов, если есть
  if (player.mergedClass && player.mergedClass === 'mage') {
    clickPower *= 1.25; // +25% (меньший бонус)
  }
  
  // Учитываем бонус престижа
  clickPower *= (1 + player.prestigeBonuses.clickPowerBonus);
  
  // Округляем до целого
  clickPower = Math.floor(clickPower);
  
  // Прибавляем золото (умножаем на скорость автоклика)
  // Примечание: в реальной игре это будет работать с учетом времени
  const goldGain = Math.floor(clickPower * player.autoClickRate);
  let updatedPlayer = addGold(player, goldGain);
  
  return updatedPlayer;
}

// Проверка и завершение экспедиций
export function checkExpeditions(player) {
  let updatedPlayer = { ...player };
  let completedExpeditions = [];
  
  // Проверяем каждую экспедицию
  for (const expedition of player.activeExpeditions) {
    if (Date.now() >= expedition.endTime && !expedition.completed) {
      // Завершаем экспедицию
      const result = completeExpedition(updatedPlayer, expedition.id);
      if (result.success) {
        updatedPlayer = result.player;
        completedExpeditions.push({
          locationId: expedition.locationId,
          rewards: result.rewards
        });
      }
    }
  }
  
  return { 
    player: updatedPlayer,
    completedExpeditions
  };
}

// Расчет прогресса до следующего престижа
export function calculatePrestigeProgress(player) {
  const PRESTIGE_GOLD_REQUIREMENT = 100000;
  const progress = (player.resources.gold / PRESTIGE_GOLD_REQUIREMENT) * 100;
  return Math.min(100, progress);
}
