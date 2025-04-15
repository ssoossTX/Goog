import { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { dungeons } from '../lib/gameData';
import { formatNumber } from '../utils/gameUtils';
import trialTowerIcon from '../assets/icons/dungeons/trial-tower.svg';
import shadowTowerIcon from '../assets/icons/dungeons/shadow-tower.svg';
import fireTowerIcon from '../assets/icons/dungeons/fire-tower.svg';

export default function DungeonTab() {
  const { player, setPlayer } = useGame();
  const [selectedDungeon, setSelectedDungeon] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [dungeonsState, setDungeonsState] = useState({});
  const [battleResult, setBattleResult] = useState(null);
  
  // Если игрок не инициализирован
  if (!player) {
    return <div className="text-center">Загрузка...</div>;
  }
  
  // Обработчик выбора подземелья
  const handleSelectDungeon = (dungeonId) => {
    const dungeon = dungeons.find(d => d.id === dungeonId);
    if (!dungeon) return;
    
    // Проверяем, доступно ли подземелье по уровню
    if (player.level < dungeon.levelRequired) {
      alert(`Требуется уровень ${dungeon.levelRequired} для входа в ${dungeon.name}`);
      return;
    }
    
    // Устанавливаем выбранное подземелье и начинаем с 1 уровня
    setSelectedDungeon(dungeon);
    
    // Получаем текущий максимальный уровень, если он есть
    const maxLevel = player.dungeonProgress[dungeonId]?.maxLevel || 0;
    setCurrentLevel(1);
    
    // Инициализируем состояние подземелья
    setDungeonsState({
      playerHealth: 100,
      enemyHealth: calculateEnemyHealth(dungeon, 1),
      enemyName: getEnemyName(1),
      isBoss: false, // 1 уровень не может быть боссом
      isMini: false, // 1 уровень не может быть мини-боссом
      rewards: calculateRewards(dungeon, 1, false, false)
    });
    
    setBattleResult(null);
  };
  
  // Функция для расчета здоровья врага
  const calculateEnemyHealth = (dungeon, level) => {
    // Базовое здоровье
    let health = 20 + level * 10;
    
    // Увеличение для боссов и мини-боссов
    if (level % 10 === 0) { // Босс
      health *= 3;
    } else if (level % 5 === 0) { // Мини-босс
      health *= 1.5;
    }
    
    // Увеличение в зависимости от сложности подземелья
    switch (dungeon.difficulty) {
      case 'Легко':
        health *= 1;
        break;
      case 'Средне':
        health *= 1.5;
        break;
      case 'Сложно':
        health *= 2;
        break;
      default:
        break;
    }
    
    return Math.floor(health);
  };
  
  // Функция для расчета наград
  const calculateRewards = (dungeon, level, isBoss, isMini) => {
    // Базовые награды
    let gold = dungeon.rewards.gold.base + dungeon.rewards.gold.level * level;
    let diamonds = dungeon.rewards.diamonds.base + dungeon.rewards.diamonds.level * Math.floor(level / 5);
    let exp = dungeon.rewards.exp.base + dungeon.rewards.exp.level * level;
    
    // Увеличение для боссов и мини-боссов
    if (isBoss) {
      gold *= 3;
      diamonds *= 2;
      exp *= 3;
    } else if (isMini) {
      gold *= 1.5;
      diamonds *= 1.5;
      exp *= 1.5;
    }
    
    // Шанс на реликвию
    let relicChance = dungeon.rewards.relicChance;
    if (isBoss) {
      relicChance *= 5;
    } else if (isMini) {
      relicChance *= 2;
    }
    
    // Бонусы класса
    if (player.class === 'warrior') {
      gold *= 1.1; // +10% к золоту для воина
    }
    
    if (player.class === 'mage') {
      exp *= 1.2; // +20% к опыту для мага
    }
    
    // Округляем до целых чисел
    return {
      gold: Math.floor(gold),
      diamonds: Math.floor(diamonds),
      exp: Math.floor(exp),
      relicChance: Math.min(1, relicChance) // Макс. шанс 100%
    };
  };
  
  // Функция для получения имени врага в зависимости от уровня
  const getEnemyName = (level) => {
    const normalEnemies = ['Гоблин', 'Скелет', 'Зомби', 'Слизень', 'Летучая мышь', 'Паук'];
    const miniBosses = ['Огр', 'Тролль', 'Минотавр', 'Химера', 'Грифон'];
    const bosses = ['Древний дракон', 'Лич-король', 'Демон бездны', 'Гидра', 'Бехолдер', 'Кракен'];
    
    if (level % 10 === 0) { // Босс
      return bosses[Math.floor(level / 10 - 1) % bosses.length];
    }
    
    if (level % 5 === 0) { // Мини-босс
      return miniBosses[Math.floor(level / 5 - 1) % miniBosses.length];
    }
    
    // Обычный враг
    return normalEnemies[level % normalEnemies.length];
  };
  
  // Обработчик атаки врага
  const handleAttack = () => {
    if (!selectedDungeon || !dungeonsState) return;
    
    // Расчет урона игрока
    let playerDamage = player.clickPower;
    
    // Бонус воина
    if (player.class === 'warrior') {
      playerDamage *= 1.2; // +20% к урону для воина
    }
    
    // Шанс критического удара
    let isCritical = Math.random() < player.criticalChance;
    if (isCritical) {
      playerDamage *= player.criticalMultiplier;
    }
    
    // Округляем до целого
    playerDamage = Math.floor(playerDamage);
    
    // Наносим урон врагу
    let newEnemyHealth = Math.max(0, dungeonsState.enemyHealth - playerDamage);
    
    // Расчет урона от врага
    let enemyDamage = calculateEnemyDamage(selectedDungeon, currentLevel, dungeonsState.isBoss, dungeonsState.isMini);
    
    // Уменьшение урона для мага (способность замедления)
    if (player.class === 'mage') {
      enemyDamage *= 0.75; // -25% урона для мага
    }
    
    // Возможность исцеления для шамана
    let healing = 0;
    if (player.class === 'shaman' && Math.random() < 0.3) { // 30% шанс исцеления
      healing = Math.floor(player.level * 0.5);
    }
    
    // Применяем урон и исцеление
    let newPlayerHealth = Math.min(100, Math.max(0, dungeonsState.playerHealth - enemyDamage + healing));
    
    // Обновляем состояние
    setDungeonsState({
      ...dungeonsState,
      playerHealth: newPlayerHealth,
      enemyHealth: newEnemyHealth,
      lastDamage: {
        player: playerDamage,
        enemy: enemyDamage,
        healing: healing,
        isCritical: isCritical
      }
    });
    
    // Проверяем победу или поражение
    if (newEnemyHealth <= 0) {
      // Победа!
      handleVictory();
    } else if (newPlayerHealth <= 0) {
      // Поражение
      handleDefeat();
    }
  };
  
  // Расчет урона от врага
  const calculateEnemyDamage = (dungeon, level, isBoss, isMini) => {
    // Базовый урон
    let damage = 5 + Math.floor(level * 0.5);
    
    // Увеличение для боссов и мини-боссов
    if (isBoss) {
      damage *= 2;
    } else if (isMini) {
      damage *= 1.5;
    }
    
    // Увеличение в зависимости от сложности подземелья
    switch (dungeon.difficulty) {
      case 'Легко':
        damage *= 1;
        break;
      case 'Средне':
        damage *= 1.3;
        break;
      case 'Сложно':
        damage *= 1.6;
        break;
      default:
        break;
    }
    
    // Уменьшение урона за счет защиты
    if (player.dungeonDamageReduction) {
      damage *= (1 - player.dungeonDamageReduction);
    }
    
    return Math.floor(damage);
  };
  
  // Обработчик победы над врагом
  const handleVictory = () => {
    // Расчет наград
    const rewards = calculateRewards(
      selectedDungeon, 
      currentLevel, 
      currentLevel % 10 === 0, 
      currentLevel % 5 === 0
    );
    
    // Проверяем шанс на реликвию
    let foundRelic = null;
    if (Math.random() < rewards.relicChance) {
      // В реальной игре здесь будет логика выбора случайной реликвии
      foundRelic = "amulet"; // Для примера используем фиксированную реликвию
    }
    
    // Обновляем игрока с наградами
    const updatedPlayer = {
      ...player,
      resources: {
        ...player.resources,
        gold: player.resources.gold + rewards.gold,
        diamonds: player.resources.diamonds + rewards.diamonds
      },
      experience: player.experience + rewards.exp,
      // Обновляем максимальный уровень прохождения
      dungeonProgress: {
        ...player.dungeonProgress,
        [selectedDungeon.id]: {
          ...player.dungeonProgress[selectedDungeon.id],
          maxLevel: Math.max(
            (player.dungeonProgress[selectedDungeon.id]?.maxLevel || 0),
            currentLevel
          )
        }
      },
      // Если нашли реликвию, добавляем в инвентарь
      artifacts: foundRelic 
        ? (player.artifacts.includes(foundRelic) 
            ? player.artifacts 
            : [...player.artifacts, foundRelic])
        : player.artifacts,
      // Увеличиваем счетчик монстров
      stats: {
        ...player.stats,
        totalMonsters: player.stats.totalMonsters + 1
      }
    };
    
    setPlayer(updatedPlayer);
    
    // Устанавливаем результат битвы
    setBattleResult({
      success: true,
      message: 'Победа!',
      rewards: {
        gold: rewards.gold,
        diamonds: rewards.diamonds,
        exp: rewards.exp,
        relic: foundRelic
      }
    });
    
    // Переходим на следующий уровень или завершаем подземелье
    if (currentLevel < selectedDungeon.levels) {
      const nextLevel = currentLevel + 1;
      const isNextBoss = nextLevel % 10 === 0;
      const isNextMini = nextLevel % 5 === 0;
      
      setCurrentLevel(nextLevel);
      setDungeonsState({
        playerHealth: 100, // Восстанавливаем здоровье
        enemyHealth: calculateEnemyHealth(selectedDungeon, nextLevel),
        enemyName: getEnemyName(nextLevel),
        isBoss: isNextBoss,
        isMini: isNextMini,
        rewards: calculateRewards(selectedDungeon, nextLevel, isNextBoss, isNextMini)
      });
    } else {
      // Завершение всего подземелья
      setTimeout(() => {
        alert(`Поздравляем! Вы прошли ${selectedDungeon.name}!`);
        setSelectedDungeon(null);
      }, 2000);
    }
  };
  
  // Обработчик поражения
  const handleDefeat = () => {
    // Устанавливаем результат битвы
    setBattleResult({
      success: false,
      message: 'Поражение!',
      rewards: null
    });
    
    // Через 2 секунды возвращаемся к выбору подземелий
    setTimeout(() => {
      setSelectedDungeon(null);
    }, 2000);
  };
  
  // Функция получения иконки подземелья
  const getDungeonIcon = (dungeonId) => {
    switch (dungeonId) {
      case 'trial_tower':
        return trialTowerIcon;
      case 'shadow_tower':
        return shadowTowerIcon;
      case 'fire_tower':
        return fireTowerIcon;
      default:
        return '';
    }
  };
  
  // Расчет прогресса подземелья
  const calculateDungeonProgress = (dungeonId) => {
    const maxLevel = player.dungeonProgress[dungeonId]?.maxLevel || 0;
    const totalLevels = dungeons.find(d => d.id === dungeonId)?.levels || 1;
    return Math.floor((maxLevel / totalLevels) * 100);
  };
  
  // Если выбрано подземелье, показываем интерфейс боя
  if (selectedDungeon && dungeonsState) {
    return (
      <div className="bg-[#4C566A] rounded-lg p-6 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-['Press_Start_2P,_cursive'] text-[#D69E2E] text-xl">
            {selectedDungeon.name} - Уровень {currentLevel}
          </h3>
          <button 
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            onClick={() => setSelectedDungeon(null)}
          >
            Выйти
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Игрок */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <div className="mr-3 w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-white text-xl"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-lg">{player.username}</h4>
                  <p className="text-sm text-gray-400">Уровень: {player.level}</p>
                </div>
              </div>
              <div className="text-xl font-bold text-white">
                {dungeonsState.lastDamage?.player && (
                  <div className={`${dungeonsState.lastDamage.isCritical ? 'text-red-500' : 'text-green-500'}`}>
                    {dungeonsState.lastDamage.isCritical ? '!' : ''}{dungeonsState.lastDamage.player}
                  </div>
                )}
              </div>
            </div>
            
            <div className="mb-2 text-sm">
              Здоровье: {dungeonsState.playerHealth}/100
            </div>
            <div className="progress-bar mb-4">
              <div 
                className="progress-fill bg-green-500" 
                style={{ width: `${dungeonsState.playerHealth}%` }}
              ></div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-gray-700 p-2 rounded-lg">
                <span className="text-gray-400">Сила атаки:</span> {Math.floor(player.clickPower)}
              </div>
              <div className="bg-gray-700 p-2 rounded-lg">
                <span className="text-gray-400">Крит. шанс:</span> {Math.floor(player.criticalChance * 100)}%
              </div>
              {dungeonsState.lastDamage?.healing > 0 && (
                <div className="col-span-2 bg-green-900 p-2 rounded-lg text-center">
                  Исцеление: +{dungeonsState.lastDamage.healing}
                </div>
              )}
            </div>
          </div>
          
          {/* Враг */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <div className={`mr-3 w-12 h-12 ${dungeonsState.isBoss ? 'bg-red-700' : (dungeonsState.isMini ? 'bg-yellow-700' : 'bg-gray-700')} rounded-full flex items-center justify-center`}>
                  <i className={`fas fa-${dungeonsState.isBoss ? 'dragon' : (dungeonsState.isMini ? 'skull' : 'ghost')} text-white text-xl`}></i>
                </div>
                <div>
                  <h4 className="font-semibold text-lg">{dungeonsState.enemyName}</h4>
                  <p className="text-sm text-gray-400">
                    {dungeonsState.isBoss ? 'БОСС' : (dungeonsState.isMini ? 'Мини-босс' : 'Враг')}
                  </p>
                </div>
              </div>
              <div className="text-xl font-bold text-white">
                {dungeonsState.lastDamage?.enemy && (
                  <div className="text-red-500">
                    {dungeonsState.lastDamage.enemy}
                  </div>
                )}
              </div>
            </div>
            
            <div className="mb-2 text-sm">
              Здоровье: {dungeonsState.enemyHealth}/{calculateEnemyHealth(selectedDungeon, currentLevel)}
            </div>
            <div className="progress-bar mb-4">
              <div 
                className={`progress-fill ${dungeonsState.isBoss ? 'bg-red-600' : (dungeonsState.isMini ? 'bg-yellow-600' : 'bg-blue-600')}`}
                style={{ width: `${(dungeonsState.enemyHealth / calculateEnemyHealth(selectedDungeon, currentLevel)) * 100}%` }}
              ></div>
            </div>
            
            <div className="bg-gray-700 p-2 rounded-lg text-sm mb-2">
              <span className="text-gray-400">Урон:</span> {calculateEnemyDamage(selectedDungeon, currentLevel, dungeonsState.isBoss, dungeonsState.isMini)}
            </div>
            
            <div className="bg-gray-700 p-2 rounded-lg text-sm">
              <span className="text-gray-400">Награды:</span> {formatNumber(dungeonsState.rewards.gold)} золота, 
              {dungeonsState.rewards.diamonds} алмазов, 
              {formatNumber(dungeonsState.rewards.exp)} опыта
            </div>
          </div>
        </div>
        
        <div className="flex justify-center mb-6">
          <button 
            className="px-6 py-3 bg-[#6B46C1] text-white rounded-lg hover:bg-purple-700 transition text-lg"
            onClick={handleAttack}
            disabled={!!battleResult}
          >
            Атаковать!
          </button>
        </div>
        
        {/* Прогресс подземелья */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <span>Прогресс башни:</span>
            <span>{currentLevel} / {selectedDungeon.levels}</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill bg-blue-600" 
              style={{ width: `${(currentLevel / selectedDungeon.levels) * 100}%` }}
            ></div>
          </div>
        </div>
        
        {/* Результат битвы */}
        {battleResult && (
          <div className={`fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70`}>
            <div className={`bg-gray-800 p-6 rounded-lg border-4 ${battleResult.success ? 'border-green-600' : 'border-red-600'} max-w-md w-full mx-4`}>
              <h3 className="text-2xl font-bold text-center mb-4">
                {battleResult.success ? 'Победа!' : 'Поражение!'}
              </h3>
              
              {battleResult.success && battleResult.rewards && (
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span>Золото:</span>
                    <span className="text-yellow-400">{formatNumber(battleResult.rewards.gold)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Алмазы:</span>
                    <span className="text-blue-400">{battleResult.rewards.diamonds}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Опыт:</span>
                    <span className="text-green-400">{formatNumber(battleResult.rewards.exp)}</span>
                  </div>
                  {battleResult.rewards.relic && (
                    <div className="flex justify-between items-center">
                      <span>Реликвия:</span>
                      <span className="text-purple-400">Древний амулет</span>
                    </div>
                  )}
                </div>
              )}
              
              {battleResult.success ? (
                <div className="text-center">
                  <p>Подготовка к следующему бою...</p>
                </div>
              ) : (
                <div className="text-center">
                  <p>Возвращение в лобби...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Список доступных подземелий
  return (
    <div className="bg-[#4C566A] rounded-lg shadow-lg p-6">
      <h3 className="font-['Press_Start_2P,_cursive'] text-[#D69E2E] text-xl mb-4 text-center">Башни подземелий</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dungeons.map(dungeon => {
          const isLocked = player.level < dungeon.levelRequired;
          const progress = calculateDungeonProgress(dungeon.id);
          
          return (
            <div 
              key={dungeon.id}
              className={`bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700 ${isLocked ? 'opacity-60 cursor-not-allowed' : 'hover:border-[#6B46C1] transition cursor-pointer'}`}
              onClick={() => !isLocked && handleSelectDungeon(dungeon.id)}
            >
              <div className="relative">
                <div className="w-full h-40 flex items-center justify-center bg-gray-900">
                  <img 
                    src={getDungeonIcon(dungeon.id)} 
                    alt={dungeon.name} 
                    className={`w-24 h-24 object-contain ${isLocked ? 'filter grayscale' : ''}`} 
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">{dungeon.name}</h4>
                    <div className="flex items-center">
                      {Array.from({ length: dungeon.difficulty === 'Легко' ? 1 : (dungeon.difficulty === 'Средне' ? 2 : 3) }).map((_, i) => (
                        <i key={i} className="fas fa-star text-yellow-400 mr-1"></i>
                      ))}
                      <span className="text-sm">{dungeon.difficulty}</span>
                    </div>
                  </div>
                </div>
                {isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-red-900 rounded-full p-3">
                      <i className="fas fa-lock text-2xl text-white"></i>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-3">
                {isLocked ? (
                  <div className="mb-2 text-sm text-gray-300">
                    Требуется уровень: <span className="text-red-400">{dungeon.levelRequired}</span>
                  </div>
                ) : (
                  <div className="mb-2 text-sm text-gray-300">
                    Этажей: <span className="text-white">{dungeon.levels}</span> | 
                    Пройдено: <span className="text-green-400">{player.dungeonProgress[dungeon.id]?.maxLevel || 0}</span>
                  </div>
                )}
                <div className="progress-bar mb-3">
                  <div 
                    className="progress-fill bg-green-500" 
                    style={{ width: `${isLocked ? 0 : progress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-400">
                  <div className="mb-1">Награды:</div>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-gray-700 px-2 py-1 rounded-full flex items-center">
                      <i className="fas fa-coins text-yellow-400 mr-1"></i> Золото
                    </span>
                    <span className="bg-gray-700 px-2 py-1 rounded-full flex items-center">
                      <i className="fas fa-gem text-blue-400 mr-1"></i> Алмазы
                    </span>
                    {dungeon.rewards.relicChance > 0.01 && (
                      <span className="bg-gray-700 px-2 py-1 rounded-full flex items-center">
                        <i className="fas fa-scroll text-purple-400 mr-1"></i> Реликвия
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
