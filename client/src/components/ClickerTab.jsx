import { useEffect, useState, useRef } from 'react';
import { useGame } from '../contexts/GameContext';
import { handleClick, purchaseUpgrade, activatePrestige, processAutoClick, formatNumber, calculatePrestigeProgress } from '../utils/gameUtils';
import { getUpgradePrice } from '../lib/gameData';
import { AUTO_CLICK_INTERVAL, PRESTIGE_GOLD_REQUIREMENT } from '../constants';
import targetImage from '../assets/images/target.svg';

export default function ClickerTab() {
  const { player, setPlayer } = useGame();
  const [clickEffect, setClickEffect] = useState({ show: false, amount: 0, isCritical: false, position: { x: 0, y: 0 } });
  const clickAreaRef = useRef(null);
  const autoClickIntervalRef = useRef(null);
  
  // Запуск авто-кликера
  useEffect(() => {
    if (player && player.autoClickRate > 0) {
      // Останавливаем предыдущий интервал
      if (autoClickIntervalRef.current) {
        clearInterval(autoClickIntervalRef.current);
      }
      
      // Запускаем новый интервал
      autoClickIntervalRef.current = setInterval(() => {
        setPlayer(prevPlayer => processAutoClick(prevPlayer));
      }, AUTO_CLICK_INTERVAL);
    }
    
    // Очистка при размонтировании
    return () => {
      if (autoClickIntervalRef.current) {
        clearInterval(autoClickIntervalRef.current);
      }
    };
  }, [player?.autoClickRate, setPlayer]);

  // Обработчик клика по области клика
  const onClickArea = (e) => {
    if (!player) return;
    
    const clickResult = handleClick(player);
    if (clickResult.success) {
      setPlayer(clickResult.player);
      
      // Показываем анимацию эффекта клика
      const rect = clickAreaRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setClickEffect({
        show: true,
        amount: clickResult.clickResult.amount,
        isCritical: clickResult.clickResult.isCritical,
        position: { x, y }
      });
      
      // Скрываем эффект через 500мс
      setTimeout(() => {
        setClickEffect(prev => ({ ...prev, show: false }));
      }, 500);
    }
  };
  
  // Обработчик покупки улучшения
  const handlePurchaseUpgrade = (upgradeId) => {
    if (!player) return;
    
    const result = purchaseUpgrade(player, upgradeId);
    if (result.success) {
      setPlayer(result.player);
      alert(result.message);
    } else {
      alert(result.message);
    }
  };
  
  // Обработчик активации престижа
  const handleActivatePrestige = () => {
    if (!player) return;
    
    const result = activatePrestige(player);
    if (result.success) {
      setPlayer(result.player);
      alert(result.message);
    } else {
      alert(result.message);
    }
  };
  
  // Если игрок не инициализирован
  if (!player) {
    return <div className="text-center">Загрузка...</div>;
  }
  
  // Функция для расчета цен улучшений
  const getUpgradeLevelAndPrice = (upgradeId) => {
    const level = player[`${upgradeId}_level`] || 0;
    const upgradeData = upgrades.find(u => u.id === upgradeId);
    const price = getUpgradePrice(upgradeData, level);
    
    // Применяем скидку, если класс торговец
    let finalPrice = price;
    if (player.class === 'merchant') {
      finalPrice = Math.floor(finalPrice * 0.8); // -20%
    } else if (player.mergedClass === 'merchant') {
      finalPrice = Math.floor(finalPrice * 0.9); // -10%
    }
    
    return { level, price: finalPrice };
  };
  
  // Данные по улучшениям
  const upgrades = [
    {
      id: 'click_power',
      name: 'Улучшение клика',
      description: '+1 к силе клика',
      icon: 'hand-pointer',
      iconColor: 'yellow-400',
      basePrice: 10,
      priceMultiplier: 1.15,
    },
    {
      id: 'auto_clicker',
      name: 'Автокликер',
      description: '+0.5 кликов в секунду',
      icon: 'robot',
      iconColor: 'blue-400',
      basePrice: 100,
      priceMultiplier: 1.35,
    },
    {
      id: 'auto_clicker_power',
      name: 'Усиление автокликера',
      description: '+20% к силе автокликера',
      icon: 'bolt',
      iconColor: 'purple-400',
      basePrice: 300,
      priceMultiplier: 1.5,
    },
    {
      id: 'gold_multiplier',
      name: 'Множитель золота',
      description: '+25% к получаемому золоту',
      icon: 'coins',
      iconColor: 'yellow-400',
      basePrice: 500,
      priceMultiplier: 1.75,
    },
    {
      id: 'critical_chance',
      name: 'Шанс крит. клика',
      description: '+5% шанс критического клика (×3)',
      icon: 'bullseye',
      iconColor: 'red-400',
      basePrice: 1000,
      priceMultiplier: 2,
      levelRequired: 20,
    },
  ];
  
  // Расчет прогресса престижа
  const prestigeProgress = calculatePrestigeProgress(player);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Область клика и информация */}
      <div className="lg:col-span-2 bg-[#4C566A] rounded-lg p-6 shadow-lg">
        <div className="text-center mb-6">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <i className="fas fa-hammer text-[#D69E2E] mr-2"></i>
              <span className="text-sm">Сила клика:</span>
            </div>
            <span className="font-semibold">{formatNumber(Math.floor(player.clickPower))}</span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <i className="fas fa-bolt text-yellow-400 mr-2"></i>
              <span className="text-sm">Авто-клики в сек:</span>
            </div>
            <span className="font-semibold">{player.autoClickRate.toFixed(1)}</span>
          </div>
          <div className="p-2 bg-gray-700 rounded-lg text-xs mb-4">
            <span className="text-yellow-300">Бонус класса:</span> 
            <span className="text-gray-300">{player.classBonus[0]}</span>
          </div>
        </div>
        
        <div 
          ref={clickAreaRef}
          className="click-area flex flex-col items-center justify-center mb-6 cursor-pointer"
          onClick={onClickArea}
        >
          <div className="relative w-48 h-48 mb-2 bg-[#2D3748] rounded-full flex items-center justify-center shadow-lg">
            <img src={targetImage} alt="Кликер" className="w-full h-full object-contain" />
            {clickEffect.show && (
              <div 
                style={{
                  position: 'absolute',
                  top: clickEffect.position.y,
                  left: clickEffect.position.x,
                  transform: 'translate(-50%, -50%)',
                  opacity: 1,
                  animation: 'moveUp 0.5s ease-out forwards',
                }}
                className={`pointer-events-none ${clickEffect.isCritical ? 'text-red-500 font-bold text-2xl' : 'text-yellow-400 font-bold text-xl'}`}
              >
                +{clickEffect.amount}
              </div>
            )}
          </div>
          <div className="text-center">
            <div className="mb-2 font-['Press_Start_2P,_cursive'] text-[#D69E2E] text-xl">
              <span>{formatNumber(player.resources.gold)}</span>
              <i className="fas fa-coins ml-2"></i>
            </div>
            <div className="text-sm text-gray-400">Нажмите, чтобы добывать золото</div>
          </div>
        </div>
        
        {/* Система престижа */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-center font-['Press_Start_2P,_cursive'] text-[#D69E2E] mb-2">Система Престижа</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">Прогресс до следующего престижа:</span>
            <span className="text-[#D69E2E] font-semibold">{prestigeProgress.toFixed(0)}%</span>
          </div>
          <div className="progress-bar mb-4">
            <div className="progress-fill bg-[#D69E2E]" style={{ width: `${prestigeProgress}%` }}></div>
          </div>
          <div className="text-sm mb-4">
            Текущие бонусы престижа: 
            <span className="text-green-400">
              {player.prestigeLevel > 0 
                ? ` +${Math.round(player.prestigeBonuses.goldBonus * 100)}% к золоту, +${Math.round(player.prestigeBonuses.clickPowerBonus * 100)}% к силе клика` 
                : ' Нет активных бонусов'}
            </span>
          </div>
          <button 
            className={`w-full py-2 px-4 ${player.resources.gold >= PRESTIGE_GOLD_REQUIREMENT ? 'bg-[#6B46C1] hover:bg-purple-700' : 'bg-gray-600 cursor-not-allowed'} text-white rounded transition`}
            onClick={handleActivatePrestige}
            disabled={player.resources.gold < PRESTIGE_GOLD_REQUIREMENT}
          >
            Престиж (Требуется {formatNumber(PRESTIGE_GOLD_REQUIREMENT)} золота)
          </button>
        </div>
      </div>
      
      {/* Улучшения */}
      <div className="bg-[#4C566A] rounded-lg p-6 shadow-lg">
        <h3 className="font-['Press_Start_2P,_cursive'] text-[#D69E2E] text-xl mb-4 text-center">Улучшения</h3>
        
        {upgrades.map(upgrade => {
          const { level, price } = getUpgradeLevelAndPrice(upgrade.id);
          const isLocked = upgrade.levelRequired && player.level < upgrade.levelRequired;
          const canAfford = player.resources.gold >= price;
          
          return (
            <div 
              key={upgrade.id}
              className={`mb-4 bg-gray-800 rounded-lg p-3 ${isLocked ? 'opacity-50 cursor-not-allowed' : (canAfford ? 'hover:bg-gray-700 cursor-pointer' : 'cursor-not-allowed')} transition border border-gray-700`}
              onClick={() => !isLocked && canAfford && handlePurchaseUpgrade(upgrade.id)}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <div className="mr-3 w-10 h-10 bg-[#2D3748] rounded-full flex items-center justify-center">
                    <i className={`fas fa-${upgrade.icon} text-${upgrade.iconColor}`}></i>
                  </div>
                  <div>
                    <h4 className="font-semibold">{upgrade.name}</h4>
                    <p className="text-xs text-gray-400">
                      {isLocked 
                        ? `Требуется уровень ${upgrade.levelRequired}` 
                        : `Уровень: ${level}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-yellow-400">
                    <span>{formatNumber(price)}</span>
                    <i className="fas fa-coins ml-1"></i>
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-300">{upgrade.description}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
