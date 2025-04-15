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
          {/* Верхняя навигация по вкладкам */}
          <div className="flex justify-between items-center border-b border-gray-700 mb-6">
            <div className="flex">
              <div 
                className={`tab px-4 py-2 cursor-pointer ${activeTab === 'clicker' ? 'tab-active border-b-3 border-[#6B46C1] text-white' : ''}`} 
                onClick={() => setActiveTab('clicker')}
              >
                Кликер
              </div>
              <div 
                className={`tab px-4 py-2 cursor-pointer ${activeTab === 'map' ? 'tab-active border-b-3 border-[#6B46C1] text-white' : ''}`}
                onClick={() => setActiveTab('map')}
              >
                Карта
              </div>
              <div 
                className={`tab px-4 py-2 cursor-pointer ${activeTab === 'dungeon' ? 'tab-active border-b-3 border-[#6B46C1] text-white' : ''}`}
                onClick={() => setActiveTab('dungeon')}
              >
                Подземелья
              </div>
              <div 
                className={`tab px-4 py-2 cursor-pointer ${activeTab === 'shop' ? 'tab-active border-b-3 border-[#6B46C1] text-white' : ''}`}
                onClick={() => setActiveTab('shop')}
              >
                Магазин
              </div>
              <div 
                className={`tab px-4 py-2 cursor-pointer ${activeTab === 'profile' ? 'tab-active border-b-3 border-[#6B46C1] text-white' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                Профиль
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="bg-[#6B46C1] px-3 py-1 rounded-full">
                <i className="fas fa-star mr-1 text-yellow-300"></i>
                Уровень {player?.level || 0}
              </div>
              <div className="bg-gray-700 px-3 py-1 rounded-full">
                <i className="fas fa-brain mr-1 text-blue-300"></i>
                Очки навыков: {player?.skillPoints || 0}
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
