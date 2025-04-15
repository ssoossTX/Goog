import { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { locations } from '../lib/gameData';
import { startExpedition, completeExpedition, formatTime, formatNumber, checkExpeditions } from '../utils/gameUtils';
import { EXPEDITION_CHECK_INTERVAL } from '../constants';
import mapImage from '../assets/images/map.svg';

export default function MapTab() {
  const { player, setPlayer } = useGame();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [expeditionResult, setExpeditionResult] = useState(null);
  const [expeditionProgress, setExpeditionProgress] = useState({});
  const [lastRewards, setLastRewards] = useState([]);
  
  // Периодическая проверка экспедиций
  useEffect(() => {
    if (!player) return;
    
    // Обновление прогресса всех активных экспедиций
    const updateProgress = () => {
      const progress = {};
      player.activeExpeditions.forEach(expedition => {
        const now = Date.now();
        if (now < expedition.endTime) {
          const elapsed = now - expedition.startTime;
          const total = expedition.endTime - expedition.startTime;
          progress[expedition.id] = (elapsed / total) * 100;
        } else {
          progress[expedition.id] = 100;
        }
      });
      setExpeditionProgress(progress);
    };
    
    // Начальное обновление
    updateProgress();
    
    // Регулярное обновление прогресса
    const progressInterval = setInterval(updateProgress, 1000);
    
    // Проверка завершенных экспедиций
    const checkInterval = setInterval(() => {
      const result = checkExpeditions(player);
      setPlayer(result.player);
      
      // Если есть завершенные экспедиции, добавляем их в историю
      if (result.completedExpeditions.length > 0) {
        // Для каждой завершенной экспедиции
        result.completedExpeditions.forEach(expedition => {
          const location = locations.find(loc => loc.id === expedition.locationId);
          if (location) {
            // Добавляем в начало массива, чтобы последние были вверху
            setLastRewards(prev => [{
              locationName: location.name,
              rewards: expedition.rewards,
              timestamp: Date.now()
            }, ...prev].slice(0, 5)); // Храним максимум 5 последних
          }
        });
      }
    }, EXPEDITION_CHECK_INTERVAL);
    
    return () => {
      clearInterval(progressInterval);
      clearInterval(checkInterval);
    };
  }, [player, setPlayer]);
  
  // Обработчик выбора локации
  const handleSelectLocation = (locationId) => {
    const location = locations.find(loc => loc.id === locationId);
    if (location) {
      setSelectedLocation(location);
    }
  };
  
  // Обработчик начала экспедиции
  const handleStartExpedition = () => {
    if (!selectedLocation || !player) return;
    
    const result = startExpedition(player, selectedLocation.id);
    if (result.success) {
      setPlayer(result.player);
      setExpeditionResult({
        success: true,
        message: result.message
      });
      setSelectedLocation(null);
      
      // Скрываем сообщение через 3 секунды
      setTimeout(() => {
        setExpeditionResult(null);
      }, 3000);
    } else {
      setExpeditionResult({
        success: false,
        message: result.message
      });
    }
  };
  
  // Обработчик получения наград из экспедиции
  const handleCollectExpedition = (expeditionId) => {
    if (!player) return;
    
    const result = completeExpedition(player, expeditionId);
    if (result.success) {
      setPlayer(result.player);
      
      // Добавляем в историю
      const expedition = player.activeExpeditions.find(e => e.id === expeditionId);
      if (expedition) {
        const location = locations.find(loc => loc.id === expedition.locationId);
        if (location) {
          setLastRewards(prev => [{
            locationName: location.name,
            rewards: result.rewards,
            timestamp: Date.now()
          }, ...prev].slice(0, 5));
        }
      }
      
      setExpeditionResult({
        success: true,
        message: result.message
      });
      
      // Скрываем сообщение через 3 секунды
      setTimeout(() => {
        setExpeditionResult(null);
      }, 3000);
    } else {
      setExpeditionResult({
        success: false,
        message: result.message
      });
    }
  };
  
  // Если игрок не инициализирован
  if (!player) {
    return <div className="text-center">Загрузка...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Карта мира */}
      <div className="lg:col-span-2 bg-[#4C566A] rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 bg-[#2D3748] font-['Press_Start_2P,_cursive'] text-[#D69E2E] flex justify-between items-center">
          <h3>Карта мира</h3>
          <div className="text-sm text-gray-300">
            Открыто локаций: <span>{player.unlockedLocations.length}/{locations.length}</span>
          </div>
        </div>
        <div className="p-4 bg-gray-800 relative" style={{ height: '500px' }}>
          {/* Карта мира */}
          <img src={mapImage} alt="Карта мира" className="w-full h-full object-cover rounded-lg" />
          
          {/* Локации на карте */}
          {locations.map(location => {
            // Определяем, разблокирована ли локация
            const isUnlocked = player.unlockedLocations.includes(location.id);
            // Определяем, доступна ли локация по уровню
            const levelUnlocked = player.level >= location.levelRequired;
            
            // Позиционирование локаций (в реальной игре это будут правильные координаты)
            let positionStyle = {};
            switch (location.id) {
              case 'forest':
                positionStyle = { top: '25%', left: '25%' };
                break;
              case 'cave':
                positionStyle = { top: '50%', left: '33%' };
                break;
              case 'ruins':
                positionStyle = { top: '33%', right: '25%' };
                break;
              case 'swamp':
                positionStyle = { bottom: '25%', left: '50%' };
                break;
              case 'volcano':
                positionStyle = { bottom: '33%', right: '25%' };
                break;
              default:
                positionStyle = { top: '50%', left: '50%' };
            }
            
            return (
              <div 
                key={location.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={positionStyle}
              >
                <div 
                  className={`w-12 h-12 ${isUnlocked && levelUnlocked ? `bg-${location.color} border-2 border-white cursor-pointer hover:scale-110` : 'bg-gray-800 border-2 border-gray-600 opacity-50 cursor-not-allowed'} rounded-full flex items-center justify-center transition shadow-lg`}
                  onClick={() => isUnlocked && levelUnlocked && handleSelectLocation(location.id)}
                >
                  <i className={`fas fa-${location.icon} ${isUnlocked && levelUnlocked ? `text-${location.color === 'blue-700' ? 'blue-300' : location.color === 'red-500' ? 'red-300' : 'white'}` : `text-${location.color}`}`}></i>
                  {!isUnlocked && <i className="fas fa-lock absolute text-xs text-red-500"></i>}
                  {isUnlocked && !levelUnlocked && (
                    <div className="absolute -bottom-6 whitespace-nowrap bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded">
                      Уровень {location.levelRequired}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Модальное окно выбора локации */}
          {selectedLocation && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
              <div className="bg-[#2D3748] rounded-lg p-6 max-w-md w-full">
                <h3 className="font-['Press_Start_2P,_cursive'] text-[#D69E2E] text-xl mb-4">{selectedLocation.name}</h3>
                
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 rounded-full bg-${selectedLocation.color} flex items-center justify-center mr-4`}>
                    <i className={`fas fa-${selectedLocation.icon} text-white`}></i>
                  </div>
                  <div>
                    <div className="text-sm mb-1">Сложность: <span className="text-white">{selectedLocation.difficulty}</span></div>
                    <div className="text-sm">Время: <span className="text-white">{formatTime(selectedLocation.expeditionTime)}</span></div>
                  </div>
                </div>
                
                <div className="bg-gray-800 p-3 rounded-lg mb-4">
                  <h4 className="text-sm font-semibold mb-2">Награды:</h4>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="bg-gray-700 px-2 py-1 rounded-full flex items-center">
                      <i className="fas fa-coins text-yellow-400 mr-1"></i> {selectedLocation.rewards.gold.min}-{selectedLocation.rewards.gold.max}
                    </span>
                    <span className="bg-gray-700 px-2 py-1 rounded-full flex items-center">
                      <i className="fas fa-gem text-blue-400 mr-1"></i> {selectedLocation.rewards.diamonds.min}-{selectedLocation.rewards.diamonds.max}
                    </span>
                    <span className="bg-gray-700 px-2 py-1 rounded-full flex items-center">
                      <i className="fas fa-star text-purple-400 mr-1"></i> {selectedLocation.rewards.exp.min}-{selectedLocation.rewards.exp.max} опыта
                    </span>
                    {selectedLocation.rewards.itemChance > 0 && (
                      <span className="bg-gray-700 px-2 py-1 rounded-full flex items-center">
                        <i className="fas fa-scroll text-green-400 mr-1"></i> {Math.round(selectedLocation.rewards.itemChance * 100)}% шанс предмета
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button 
                    className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
                    onClick={() => setSelectedLocation(null)}
                  >
                    Отмена
                  </button>
                  <button 
                    className="px-4 py-2 bg-[#6B46C1] text-white rounded hover:bg-purple-700 transition"
                    onClick={handleStartExpedition}
                    disabled={player.activeExpeditions.length >= 2}
                  >
                    {player.activeExpeditions.length >= 2 
                      ? 'Максимум экспедиций' 
                      : 'Начать экспедицию'}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Сообщение о результате экспедиции */}
          {expeditionResult && (
            <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${expeditionResult.success ? 'bg-green-700' : 'bg-red-700'} text-white z-50`}>
              {expeditionResult.message}
            </div>
          )}
        </div>
      </div>
      
      {/* Активные экспедиции */}
      <div className="bg-[#4C566A] rounded-lg shadow-lg">
        <div className="p-4 bg-[#2D3748] font-['Press_Start_2P,_cursive'] text-[#D69E2E]">
          <h3>Экспедиции</h3>
        </div>
        <div className="p-4">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm text-gray-300">
                Активные экспедиции: <span>{player.activeExpeditions.length}/2</span>
              </div>
              {player.class === 'explorer' && (
                <div className="text-sm text-blue-300">
                  <i className="fas fa-map-marker-alt mr-1"></i>
                  Бонус исследователя: <span>-25% времени</span>
                </div>
              )}
            </div>
            
            {/* Список активных экспедиций */}
            {player.activeExpeditions.map(expedition => {
              const location = locations.find(loc => loc.id === expedition.locationId);
              if (!location) return null;
              
              const now = Date.now();
              const isCompleted = now >= expedition.endTime;
              const progress = expeditionProgress[expedition.id] || 0;
              
              return (
                <div key={expedition.id} className="bg-gray-800 rounded-lg p-3 mb-4 border border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <div className={`mr-3 w-10 h-10 bg-${location.color} rounded-full flex items-center justify-center`}>
                        <i className={`fas fa-${location.icon} text-white`}></i>
                      </div>
                      <div>
                        <h4 className="font-semibold">Экспедиция в {location.name}</h4>
                        <p className="text-xs text-gray-400">Сложность: <span className={`text-${location.difficulty === 'Легкая' ? 'green-400' : location.difficulty === 'Средняя' ? 'yellow-400' : 'red-400'}`}>{location.difficulty}</span></p>
                      </div>
                    </div>
                    <div className="text-sm">
                      {isCompleted ? (
                        <button 
                          className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition text-xs"
                          onClick={() => handleCollectExpedition(expedition.id)}
                        >
                          Забрать награду
                        </button>
                      ) : (
                        <div className="text-gray-300">
                          Осталось: <span>{formatTime((expedition.endTime - now) / 1000)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className={`progress-fill ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`} 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    Ожидаемая награда: 
                    <span className="text-yellow-400"> {location.rewards.gold.min}-{location.rewards.gold.max} золота</span>, 
                    <span className="text-blue-400"> {location.rewards.diamonds.min}-{location.rewards.diamonds.max} алмаза</span>, 
                    <span className="text-green-400"> опыт</span>
                  </div>
                </div>
              );
            })}
            
            {/* Кнопка начала новой экспедиции */}
            {player.activeExpeditions.length < 2 && (
              <div 
                className="bg-gray-800 rounded-lg p-3 border border-gray-700 border-dashed flex items-center justify-center h-24 cursor-pointer hover:bg-gray-700 transition"
                onClick={() => handleSelectLocation(player.unlockedLocations[0])}
              >
                <div className="text-center">
                  <i className="fas fa-plus text-gray-500 text-xl mb-2"></i>
                  <div className="text-sm text-gray-500">Начать новую экспедицию</div>
                </div>
              </div>
            )}
          </div>
          
          {/* Последние награды */}
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <h4 className="text-sm font-semibold mb-2 text-[#D69E2E]">Последние награды</h4>
            <div className="space-y-2 text-sm">
              {lastRewards.length > 0 ? (
                lastRewards.map((reward, index) => (
                  <div key={index} className="flex justify-between items-center text-xs">
                    <div>{reward.locationName}:</div>
                    <div>
                      <span className="text-yellow-400">{reward.rewards.gold} золота</span>, 
                      <span className="text-blue-400"> {reward.rewards.diamonds} алмаза</span>
                      {reward.rewards.item && (
                        <span className="text-purple-400"> + предмет</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-400">Здесь будут отображаться ваши последние награды из экспедиций.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
