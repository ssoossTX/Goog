import { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { formatNumber } from '../utils/gameUtils';
import { skills as skillsData, artifacts, skins, initialPlayerState } from '../lib/gameData';
import standardSkin from '../assets/images/skins/standard.svg';
import knightSkin from '../assets/images/skins/knight.svg';
import lockedSkin from '../assets/images/skins/locked.svg';
import amuletIcon from '../assets/icons/artifacts/amulet.svg';
import ringIcon from '../assets/icons/artifacts/ring.svg';

export default function ProfileTab() {
  const { player, setPlayer } = useGame();
  const [selectedTab, setSelectedTab] = useState('skills'); // 'skills' или 'artifacts'
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  // Если игрок не инициализирован
  if (!player) {
    return <div className="text-center">Загрузка...</div>;
  }
  
  // Функция сброса игры
  const handleResetGame = () => {
    if (confirm('Вы действительно хотите сбросить игру? Весь прогресс будет потерян!')) {
      // Полностью сбрасываем игрока, что вызовет показ экрана выбора класса
      setPlayer(null);
      alert('Игра сброшена! Выберите новый класс, чтобы начать игру заново.');
    }
  };
  
  // Обработчик улучшения навыка
  const handleUpgradeSkill = (skillId) => {
    const skillData = skillsData.find(s => s.id === skillId);
    if (!skillData) return;
    
    // Проверяем текущий уровень навыка
    const currentLevel = player.skills[skillId] || 0;
    
    // Проверяем, не превышен ли максимальный уровень
    if (currentLevel >= skillData.maxLevel) {
      alert(`Достигнут максимальный уровень навыка ${skillData.name}`);
      return;
    }
    
    // Проверяем требования к уровню персонажа
    if (skillData.levelRequired && player.level < skillData.levelRequired) {
      alert(`Для этого навыка требуется уровень персонажа ${skillData.levelRequired}`);
      return;
    }
    
    // Проверяем наличие очков навыков
    if (player.skillPoints <= 0) {
      alert('Недостаточно очков навыков');
      return;
    }
    
    // Применяем навык
    const updatedPlayer = {
      ...player,
      skills: {
        ...player.skills,
        [skillId]: currentLevel + 1
      },
      skillPoints: player.skillPoints - 1
    };
    
    // Применяем эффект навыка
    // В реальной игре здесь будет более детальная логика применения эффектов
    switch (skillId) {
      case 'weapon_master':
        updatedPlayer.clickPower = player.clickPower * 1.05;
        break;
      case 'click_speed':
        updatedPlayer.autoClickRate = player.autoClickRate * 1.1;
        break;
      case 'defense':
        updatedPlayer.dungeonDamageReduction = (player.dungeonDamageReduction || 0) + 0.05;
        break;
      case 'gold_rush':
        updatedPlayer.goldMultiplier = player.goldMultiplier * 1.15;
        break;
      case 'critical_power':
        updatedPlayer.criticalMultiplier = player.criticalMultiplier + 0.25;
        break;
      default:
        break;
    }
    
    // Сохраняем обновленного игрока
    setPlayer(updatedPlayer);
    alert(`Навык ${skillData.name} улучшен до уровня ${currentLevel + 1}!`);
  };
  
  // Обработчик выбора скина
  const handleSelectSkin = (skinId) => {
    // Проверяем, разблокирован ли скин
    if (!player.skins.includes(skinId)) {
      const skinData = skins.find(s => s.id === skinId);
      if (skinData) {
        alert(`Требуется уровень ${skinData.levelRequired} для разблокировки`);
      }
      return;
    }
    
    // Устанавливаем выбранный скин
    setPlayer({
      ...player,
      activeSkin: skinId
    });
  };
  
  // Получение иконки артефакта
  const getArtifactIcon = (artifactId) => {
    switch (artifactId) {
      case 'amulet':
        return amuletIcon;
      case 'ring':
        return ringIcon;
      default:
        return '';
    }
  };
  
  // Получение иконки скина
  const getSkinImage = (skinId) => {
    switch (skinId) {
      case 'standard':
        return standardSkin;
      case 'knight':
        return knightSkin;
      default:
        return lockedSkin;
    }
  };
  
  // Расчет опыта до следующего уровня
  const calculateExpProgress = () => {
    return (player.experience / player.experienceToNextLevel) * 100;
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Информация о персонаже */}
      <div className="bg-[#4C566A] rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-[#D69E2E] overflow-hidden bg-gray-700">
              <img 
                src={getSkinImage(player.activeSkin)} 
                alt="Аватар персонажа" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-[#6B46C1] text-white text-xs rounded-full w-8 h-8 flex items-center justify-center border-2 border-gray-800">
              {player.level}
            </div>
          </div>
        </div>
        
        <div className="text-center mb-4">
          <h3 className="font-['Press_Start_2P,_cursive'] text-[#D69E2E] mb-1 text-xl">{player.username}</h3>
          <div className="flex items-center justify-center text-sm">
            <i className={`fas fa-${player.class === 'warrior' ? 'user-shield' : player.class === 'explorer' ? 'map-marked-alt' : player.class === 'merchant' ? 'balance-scale' : player.class === 'mage' ? 'hat-wizard' : 'mortar-pestle'} text-class-${player.class} mr-1`}></i>
            <span>{player.class === 'warrior' ? 'Воин' : player.class === 'explorer' ? 'Исследователь' : player.class === 'merchant' ? 'Торговец' : player.class === 'mage' ? 'Маг' : 'Шаман'}</span>
            {player.mergedClass && (
              <span className="ml-2">+ {player.mergedClass === 'warrior' ? 'Воин' : player.mergedClass === 'explorer' ? 'Исследователь' : player.mergedClass === 'merchant' ? 'Торговец' : player.mergedClass === 'mage' ? 'Маг' : 'Шаман'}</span>
            )}
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between mb-1 text-sm">
            <span>Опыт:</span>
            <span>{formatNumber(player.experience)} / {formatNumber(player.experienceToNextLevel)}</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill bg-[#6B46C1]" 
              style={{ width: `${calculateExpProgress()}%` }}
            ></div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="text-center text-sm text-gray-400 mb-1">Общий урон</div>
            <div className="text-center font-semibold">{formatNumber(Math.floor(player.clickPower * player.stats.totalClicks))}</div>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="text-center text-sm text-gray-400 mb-1">Кликов</div>
            <div className="text-center font-semibold">{formatNumber(player.stats.totalClicks)}</div>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="text-center text-sm text-gray-400 mb-1">Монстров</div>
            <div className="text-center font-semibold">{formatNumber(player.stats.totalMonsters)}</div>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="text-center text-sm text-gray-400 mb-1">Экспедиций</div>
            <div className="text-center font-semibold">{formatNumber(player.stats.totalExpeditions)}</div>
          </div>
        </div>
        
        <div className="bg-gray-800 p-3 rounded-lg">
          <h4 className="text-sm font-semibold mb-2">Бонусы класса:</h4>
          <ul className="text-sm space-y-1">
            {player.classBonus.map((bonus, index) => (
              <li key={index} className="flex items-start">
                <i className="fas fa-check text-green-400 mt-1 mr-2"></i>
                <span>{bonus}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Навыки и Артефакты Табы */}
      <div className="lg:col-span-2">
        {/* Табы */}
        <div className="bg-[#4C566A] rounded-lg shadow-lg p-6">
          <div className="flex border-b border-gray-700 mb-4">
            <button 
              className={`px-4 py-2 ${selectedTab === 'skills' ? 'border-b-2 border-[#6B46C1] text-white' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setSelectedTab('skills')}
            >
              Навыки
            </button>
            <button 
              className={`px-4 py-2 ${selectedTab === 'artifacts' ? 'border-b-2 border-[#6B46C1] text-white' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setSelectedTab('artifacts')}
            >
              Артефакты и Скины
            </button>
          </div>
          
          {/* Содержимое таба "Навыки" */}
          {selectedTab === 'skills' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-['Press_Start_2P,_cursive'] text-[#D69E2E]">Дерево навыков</h3>
                <div className="text-sm bg-[#6B46C1] px-3 py-1 rounded-full text-white">
                  <i className="fas fa-brain mr-1"></i> {player.skillPoints} очков
                </div>
              </div>
              
              <div className="mb-4 text-sm text-gray-300">
                Распределите очки навыков, чтобы усилить своего персонажа. Вы получаете 2 очка за каждый новый уровень.
              </div>
              
              {skillsData.map(skill => {
                const currentLevel = player.skills[skill.id] || 0;
                const isLocked = skill.levelRequired && player.level < skill.levelRequired;
                
                return (
                  <div key={skill.id} className="bg-gray-800 rounded-lg p-3 mb-3 border border-gray-700">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-start">
                        <div className={`mr-3 w-10 h-10 bg-[#2D3748] rounded-full flex items-center justify-center`}>
                          <i className={`fas fa-${skill.icon} text-${skill.iconColor}`}></i>
                        </div>
                        <div>
                          <h4 className="font-semibold">{skill.name}</h4>
                          <p className="text-xs text-gray-400">
                            {isLocked 
                              ? `Требуется уровень ${skill.levelRequired}` 
                              : `Уровень: ${currentLevel}/${skill.maxLevel}`}
                          </p>
                        </div>
                      </div>
                      <button 
                        className={`px-2 py-1 ${isLocked || currentLevel >= skill.maxLevel || player.skillPoints <= 0 ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#6B46C1] hover:bg-purple-700'} text-white rounded transition text-sm`}
                        onClick={() => !isLocked && currentLevel < skill.maxLevel && player.skillPoints > 0 && handleUpgradeSkill(skill.id)}
                        disabled={isLocked || currentLevel >= skill.maxLevel || player.skillPoints <= 0}
                      >
                        {isLocked ? 'Заблокировано' : (currentLevel >= skill.maxLevel ? 'Максимум' : 'Улучшить')}
                      </button>
                    </div>
                    <div className="text-sm text-gray-300">{skill.description}</div>
                    
                    {/* Полоска прогресса навыка */}
                    {!isLocked && skill.maxLevel > 0 && (
                      <div className="mt-2 progress-bar">
                        <div 
                          className="progress-fill bg-blue-600" 
                          style={{ width: `${(currentLevel / skill.maxLevel) * 100}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Содержимое таба "Артефакты и Скины" */}
          {selectedTab === 'artifacts' && (
            <div>
              <div className="mb-6">
                <h3 className="font-['Press_Start_2P,_cursive'] text-[#D69E2E] mb-4">Артефакты</h3>
                <div className="grid grid-cols-5 gap-2">
                  {/* Артефакты игрока */}
                  {player.artifacts.map(artifactId => {
                    const artifactData = artifacts.find(a => a.id === artifactId);
                    if (!artifactData) return null;
                    
                    return (
                      <div key={artifactId} className="relative group">
                        <div className="w-full aspect-square bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-center cursor-pointer">
                          <img 
                            src={getArtifactIcon(artifactId)}
                            alt={artifactData.name}
                            className="w-6 h-6"
                          />
                        </div>
                        <div className="absolute inset-0 bg-gray-900 bg-opacity-90 rounded-lg opacity-0 group-hover:opacity-100 transition flex items-center justify-center pointer-events-none">
                          <div className="text-xs text-white text-center p-1">{artifactData.name}</div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Пустые слоты */}
                  {Array.from({ length: 10 - player.artifacts.length }).map((_, i) => (
                    <div key={`empty-${i}`} className="w-full aspect-square bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-center opacity-50">
                      <i className="fas fa-question text-gray-600"></i>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-['Press_Start_2P,_cursive'] text-[#D69E2E] mb-4">Доступные скины</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {/* Первые 3 скина */}
                  {skins.slice(0, 3).map(skin => {
                    const isUnlocked = player.skins.includes(skin.id);
                    const isActive = player.activeSkin === skin.id;
                    
                    return (
                      <div 
                        key={skin.id}
                        className={`bg-gray-800 rounded-lg overflow-hidden ${isUnlocked ? (isActive ? 'border-2 border-[#D69E2E]' : 'border border-gray-700 hover:border-gray-500') : 'border border-gray-700 opacity-60'} ${isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                        onClick={() => isUnlocked && handleSelectSkin(skin.id)}
                      >
                        <div className="relative">
                          <div className="w-full h-24 flex items-center justify-center">
                            <img 
                              src={getSkinImage(skin.id)} 
                              alt={skin.name} 
                              className="h-20 object-contain" 
                            />
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-1 bg-black bg-opacity-70 text-center text-xs">
                            {skin.name}
                          </div>
                          
                          {!isUnlocked && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                              <i className="fas fa-lock text-lg text-white"></i>
                            </div>
                          )}
                        </div>
                        
                        {!isUnlocked && (
                          <div className="px-2 py-1 text-center text-xs">
                            Разблокируется на уровне {skin.levelRequired}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Кнопка сброса игры */}
      <div className="mt-6 lg:col-span-3">
        <div className="bg-[#4C566A] rounded-lg shadow-lg p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-700 pt-4">
            <div className="text-sm text-gray-300 mb-3 sm:mb-0">
              <i className="fas fa-exclamation-triangle text-red-400 mr-2"></i>
              Опасная зона: Сброс игры удалит весь ваш прогресс, включая все предметы, навыки и достижения.
            </div>
            <button 
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition text-sm"
              onClick={handleResetGame}
            >
              <i className="fas fa-trash mr-2"></i>
              Сбросить игру
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
