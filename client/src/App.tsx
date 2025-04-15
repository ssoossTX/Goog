import { useEffect, useState } from 'react';
import { GameProvider } from './contexts/GameContext';
import ClassSelection from './components/ClassSelection';
import Header from './components/Header';
import ClickerTab from './components/ClickerTab';
import MapTab from './components/MapTab';
import DungeonTab from './components/DungeonTab';
import ShopTab from './components/ShopTab';
import ProfileTab from './components/ProfileTab';
import { useLocalStorage } from './hooks/useLocalStorage';
import { initialPlayerState } from './lib/gameData';

function App() {
  const [activeTab, setActiveTab] = useState('clicker');
  const [player, setPlayer] = useLocalStorage('mmorpg-clicker-player', null);
  const [showClassSelection, setShowClassSelection] = useState(player === null);

  // Инициализация нового игрока при первом запуске
  useEffect(() => {
    if (player === null) {
      // Не создаем игрока здесь, пусть сначала выберет класс
      setShowClassSelection(true);
    }
  }, [player]);

  // Обработчик выбора класса
  const handleClassSelected = (classType, mergedClass = null) => {
    const newPlayer = {
      ...initialPlayerState,
      class: classType,
      mergedClass: mergedClass,
      classBonus: getClassBonus(classType, mergedClass)
    };
    setPlayer(newPlayer);
    setShowClassSelection(false);
  };

  // Получение бонусов класса
  const getClassBonus = (classType, mergedClass) => {
    let bonuses = [];
    
    // Бонусы основного класса
    switch (classType) {
      case 'warrior':
        bonuses.push('+30% к силе клика', '+20% к урону в подземельях', 'Бонусный шанс критического урона');
        break;
      case 'explorer':
        bonuses.push('-25% к времени экспедиций', '+40% к добыче редких предметов', 'Доступ к скрытым локациям');
        break;
      case 'merchant':
        bonuses.push('-20% к ценам в магазине', '+30% к удаче при открытии сундуков', 'Бонусное золото за все действия');
        break;
      case 'mage':
        bonuses.push('+50% к эффекту автокликера', 'Способность замедлять врагов в подземельях', 'Бонус к опыту за все действия');
        break;
      case 'shaman':
        bonuses.push('+40% к эффекту всех артефактов', 'Возможность исцеления в подземельях', 'Уникальные зелья и эликсиры');
        break;
      default:
        break;
    }
    
    // Если есть слияние классов, добавляем бонусы и от второго класса
    if (mergedClass) {
      // Слияние дает один уникальный бонус и два бонуса от второго класса
      const uniqueBonus = `Уникальная способность: ${classType}-${mergedClass}`; // в реальной игре здесь будет более детальное описание
      bonuses.push(uniqueBonus);
      
      // Можно добавить бонусы от второго класса, но в упрощенном виде
    }
    
    return bonuses;
  };

  return (
    <GameProvider value={{ player, setPlayer }}>
      <div className="min-h-screen flex flex-col bg-[#1A202C] text-[#E2E8F0] font-[Rubik, sans-serif]">
        {/* Верхняя навигация */}
        <Header />

        {/* Модальное окно выбора класса */}
        {showClassSelection && (
          <ClassSelection onClassSelected={handleClassSelected} />
        )}

        {/* Основной контент */}
        <main className="flex-grow container mx-auto p-4">
          {/* Информация о персонаже (адаптивная) */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-700 mb-4 pb-2">
            <div className="flex items-center space-x-2 text-sm mb-3 sm:mb-0 w-full sm:w-auto">
              <div className="bg-[#6B46C1] px-3 py-1.5 rounded-full">
                <i className="fas fa-star mr-1 text-yellow-300"></i>
                Уровень {player?.level || 0}
              </div>
              <div className="bg-gray-700 px-3 py-1.5 rounded-full">
                <i className="fas fa-brain mr-1 text-blue-300"></i>
                Очки: {player?.skillPoints || 0}
              </div>
            </div>
          </div>
          
          {/* Верхняя навигация по вкладкам - адаптивная */}
          <div className="mb-6">
            {/* Мобильная навигация */}
            <div className="grid grid-cols-5 sm:hidden bg-[#2D3748] rounded-lg overflow-hidden">
              <div 
                className={`flex flex-col items-center justify-center p-2 text-xs cursor-pointer ${activeTab === 'clicker' ? 'bg-[#6B46C1] text-white' : 'hover:bg-gray-700'}`} 
                onClick={() => setActiveTab('clicker')}
              >
                <i className="fas fa-mouse-pointer text-lg mb-1"></i>
                <span>Кликер</span>
              </div>
              <div 
                className={`flex flex-col items-center justify-center p-2 text-xs cursor-pointer ${activeTab === 'map' ? 'bg-[#6B46C1] text-white' : 'hover:bg-gray-700'}`}
                onClick={() => setActiveTab('map')}
              >
                <i className="fas fa-map-marked-alt text-lg mb-1"></i>
                <span>Карта</span>
              </div>
              <div 
                className={`flex flex-col items-center justify-center p-2 text-xs cursor-pointer ${activeTab === 'dungeon' ? 'bg-[#6B46C1] text-white' : 'hover:bg-gray-700'}`}
                onClick={() => setActiveTab('dungeon')}
              >
                <i className="fas fa-dungeon text-lg mb-1"></i>
                <span>Данж</span>
              </div>
              <div 
                className={`flex flex-col items-center justify-center p-2 text-xs cursor-pointer ${activeTab === 'shop' ? 'bg-[#6B46C1] text-white' : 'hover:bg-gray-700'}`}
                onClick={() => setActiveTab('shop')}
              >
                <i className="fas fa-store text-lg mb-1"></i>
                <span>Магазин</span>
              </div>
              <div 
                className={`flex flex-col items-center justify-center p-2 text-xs cursor-pointer ${activeTab === 'profile' ? 'bg-[#6B46C1] text-white' : 'hover:bg-gray-700'}`}
                onClick={() => setActiveTab('profile')}
              >
                <i className="fas fa-user text-lg mb-1"></i>
                <span>Профиль</span>
              </div>
            </div>
            
            {/* Десктопная навигация */}
            <div className="hidden sm:flex justify-between items-center">
              <div className="flex border-b border-gray-700 w-full">
                <div 
                  className={`tab px-4 py-2 cursor-pointer ${activeTab === 'clicker' ? 'tab-active border-b-2 border-[#6B46C1] text-white' : ''}`} 
                  onClick={() => setActiveTab('clicker')}
                >
                  <i className="fas fa-mouse-pointer mr-2"></i>Кликер
                </div>
                <div 
                  className={`tab px-4 py-2 cursor-pointer ${activeTab === 'map' ? 'tab-active border-b-2 border-[#6B46C1] text-white' : ''}`}
                  onClick={() => setActiveTab('map')}
                >
                  <i className="fas fa-map-marked-alt mr-2"></i>Карта
                </div>
                <div 
                  className={`tab px-4 py-2 cursor-pointer ${activeTab === 'dungeon' ? 'tab-active border-b-2 border-[#6B46C1] text-white' : ''}`}
                  onClick={() => setActiveTab('dungeon')}
                >
                  <i className="fas fa-dungeon mr-2"></i>Подземелья
                </div>
                <div 
                  className={`tab px-4 py-2 cursor-pointer ${activeTab === 'shop' ? 'tab-active border-b-2 border-[#6B46C1] text-white' : ''}`}
                  onClick={() => setActiveTab('shop')}
                >
                  <i className="fas fa-store mr-2"></i>Магазин
                </div>
                <div 
                  className={`tab px-4 py-2 cursor-pointer ${activeTab === 'profile' ? 'tab-active border-b-2 border-[#6B46C1] text-white' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <i className="fas fa-user mr-2"></i>Профиль
                </div>
              </div>
            </div>
          </div>
          
          {/* Содержимое активной вкладки */}
          {activeTab === 'clicker' && <ClickerTab />}
          {activeTab === 'map' && <MapTab />}
          {activeTab === 'dungeon' && <DungeonTab />}
          {activeTab === 'shop' && <ShopTab />}
          {activeTab === 'profile' && <ProfileTab />}
        </main>
        
        {/* Подвал с информацией */}
        <footer className="bg-[#2D3748] p-4 text-center text-gray-500 text-xs">
          <div className="container mx-auto">
            <p>MMORPG-clicker v1.0 | Создано с любовью ❤️</p>
          </div>
        </footer>
      </div>
    </GameProvider>
  );
}

export default App;
