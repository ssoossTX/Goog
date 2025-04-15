import { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { shopItems } from '../lib/gameData';
import { purchaseShopItem, formatNumber } from '../utils/gameUtils';
import commonChestIcon from '../assets/icons/treasures/common-chest.svg';
import rareChestIcon from '../assets/icons/treasures/rare-chest.svg';
import epicChestIcon from '../assets/icons/treasures/epic-chest.svg';
import legendaryChestIcon from '../assets/icons/treasures/legendary-chest.svg';

export default function ShopTab() {
  const { player, setPlayer } = useGame();
  const [purchaseResult, setPurchaseResult] = useState(null);
  
  // Если игрок не инициализирован
  if (!player) {
    return <div className="text-center">Загрузка...</div>;
  }
  
  // Обработчик покупки предмета
  const handlePurchaseItem = (itemId) => {
    const result = purchaseShopItem(player, itemId);
    
    if (result.success) {
      setPlayer(result.player);
      setPurchaseResult({
        success: true,
        message: result.message,
        rewards: result.rewards
      });
      
      // Скрываем результат через 3 секунды
      setTimeout(() => {
        setPurchaseResult(null);
      }, 3000);
    } else {
      setPurchaseResult({
        success: false,
        message: result.message
      });
      
      // Скрываем сообщение об ошибке через 3 секунды
      setTimeout(() => {
        setPurchaseResult(null);
      }, 3000);
    }
  };
  
  // Получение цены с учётом скидки торговца
  const getDiscountedPrice = (originalPrice) => {
    // Если игрок торговец, применяем скидку 20%
    if (player.class === 'merchant') {
      return Math.floor(originalPrice * 0.8);
    }
    
    // Если у игрока есть слияние с торговцем, применяем скидку 10%
    if (player.mergedClass === 'merchant') {
      return Math.floor(originalPrice * 0.9);
    }
    
    return originalPrice;
  };
  
  // Получение иконки сундука
  const getChestIcon = (itemId) => {
    switch (itemId) {
      case 'common_chest':
        return commonChestIcon;
      case 'rare_chest':
        return rareChestIcon;
      case 'epic_chest':
        return epicChestIcon;
      case 'legendary_chest':
        return legendaryChestIcon;
      default:
        return '';
    }
  };
  
  return (
    <div className="bg-[#4C566A] rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-['Press_Start_2P,_cursive'] text-[#D69E2E] text-xl">Магазин сокровищ</h3>
        {player.class === 'merchant' && (
          <div className="text-sm text-blue-300">
            <i className="fas fa-percentage mr-1"></i>
            Бонус торговца: <span>-20% к ценам</span>
          </div>
        )}
        {player.mergedClass === 'merchant' && (
          <div className="text-sm text-blue-300">
            <i className="fas fa-percentage mr-1"></i>
            Бонус торговца: <span>-10% к ценам</span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shopItems.map(item => {
          const discountedPrice = getDiscountedPrice(item.price);
          const canAfford = player.resources.diamonds >= discountedPrice;
          
          return (
            <div 
              key={item.id}
              className={`bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700 ${canAfford ? 'hover:border-[#6B46C1] transition cursor-pointer' : 'opacity-70 cursor-not-allowed'}`}
              onClick={() => canAfford && handlePurchaseItem(item.id)}
            >
              <div className="relative">
                <div className="w-full h-40 flex items-center justify-center bg-gray-900">
                  <img 
                    src={getChestIcon(item.id)} 
                    alt={item.name} 
                    className="w-24 h-24 object-contain" 
                  />
                </div>
                <div className={`px-2 py-1 bg-${item.rarityColor} text-xs absolute top-2 right-2 rounded`}>
                  {item.rarity}
                </div>
              </div>
              <div className="p-3">
                <h4 className="font-semibold mb-2">{item.name}</h4>
                <div className="text-xs text-gray-300 mb-3">
                  <p>{item.description}</p>
                  <p className="mt-1">{item.rareLoot.description}</p>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <div className="flex items-center text-blue-400">
                      <i className="fas fa-gem mr-1"></i>
                      <span>{discountedPrice}</span>
                      {player.class === 'merchant' && (
                        <span className="ml-1 text-xs line-through text-gray-500">{item.price}</span>
                      )}
                      {player.mergedClass === 'merchant' && (
                        <span className="ml-1 text-xs line-through text-gray-500">{item.price}</span>
                      )}
                    </div>
                  </div>
                  <button 
                    className={`px-3 py-1 ${canAfford ? 'bg-[#6B46C1] hover:bg-purple-700' : 'bg-gray-600'} text-white rounded transition text-sm`}
                    disabled={!canAfford}
                  >
                    {canAfford ? 'Купить' : 'Недостаточно алмазов'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Модальное окно результата покупки */}
      {purchaseResult && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${purchaseResult.success ? 'bg-green-700' : 'bg-red-700'} text-white z-50 max-w-md`}>
          <div className="mb-2 font-semibold">{purchaseResult.message}</div>
          
          {purchaseResult.success && purchaseResult.rewards && (
            <div className="text-sm">
              <div className="flex items-center">
                <i className="fas fa-coins mr-1 text-yellow-300"></i>
                <span>Получено {formatNumber(purchaseResult.rewards.gold)} золота</span>
              </div>
              
              {purchaseResult.rewards.artifacts && purchaseResult.rewards.artifacts.length > 0 && (
                <div className="flex items-center mt-1">
                  <i className="fas fa-gem mr-1 text-purple-300"></i>
                  <span>Получен артефакт: {purchaseResult.rewards.artifacts.map(a => {
                    const artifactName = a === 'amulet' ? 'Древний амулет' : 'артефакт';
                    return artifactName;
                  }).join(', ')}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
