import { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { formatNumber } from '../utils/gameUtils';

export default function Header() {
  const { player } = useGame();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Проверяем, существует ли игрок
  if (!player) {
    return (
      <nav id="mainNav" className="bg-[#2D3748] p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="font-['Press_Start_2P,_cursive'] text-lg sm:text-xl text-[#D69E2E]">MMORPG-clicker</h1>
        </div>
      </nav>
    );
  }
  
  return (
    <nav id="mainNav" className="bg-[#2D3748] p-3 sm:p-4 shadow-md">
      <div className="container mx-auto">
        {/* Основная панель навигации */}
        <div className="flex justify-between items-center">
          {/* Логотип */}
          <h1 className="font-['Press_Start_2P,_cursive'] text-lg sm:text-xl text-[#D69E2E] truncate">
            <span className="hidden sm:inline">MMORPG-clicker</span>
            <span className="sm:hidden">RPG-clicker</span>
          </h1>
          
          {/* Ресурсы для десктопа */}
          <div className="hidden sm:flex items-center space-x-4">
            <div className="flex items-center">
              <i className="fas fa-coins text-yellow-400 mr-2"></i>
              <span className="font-semibold">{formatNumber(player.resources?.gold || 0)}</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-gem text-blue-400 mr-2"></i>
              <span className="font-semibold">{formatNumber(player.resources?.diamonds || 0)}</span>
            </div>
            <div className="relative">
              <button id="settingsBtn" className="p-2 text-gray-300 hover:text-white transition">
                <i className="fas fa-cog text-white text-lg"></i>
              </button>
            </div>
          </div>
          
          {/* Компактный вид для мобильных */}
          <div className="flex sm:hidden items-center space-x-3">
            <div className="flex items-center">
              <i className="fas fa-coins text-yellow-400 mr-1"></i>
              <span className="font-semibold text-sm">{formatNumber(player.resources?.gold || 0)}</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-gem text-blue-400 mr-1"></i>
              <span className="font-semibold text-sm">{formatNumber(player.resources?.diamonds || 0)}</span>
            </div>
            <button 
              className="p-2 text-gray-300 hover:text-white transition"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <i className={`fas ${showMobileMenu ? 'fa-times' : 'fa-cog'} text-white text-lg`}></i>
            </button>
          </div>
        </div>
        
        {/* Мобильное меню настроек (выпадающее) */}
        {showMobileMenu && (
          <div className="sm:hidden bg-[#374151] mt-2 p-3 rounded-lg shadow-lg transition-all">
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center bg-[#4B5563] p-2 rounded-lg hover:bg-[#6B7280] transition">
                <i className="fas fa-save mr-2"></i>
                <span>Сохранить</span>
              </button>
              <button className="flex items-center justify-center bg-[#4B5563] p-2 rounded-lg hover:bg-[#6B7280] transition">
                <i className="fas fa-volume-up mr-2"></i>
                <span>Звук</span>
              </button>
              <button className="flex items-center justify-center bg-[#4B5563] p-2 rounded-lg hover:bg-[#6B7280] transition">
                <i className="fas fa-info-circle mr-2"></i>
                <span>Справка</span>
              </button>
              <button className="flex items-center justify-center bg-[#4B5563] p-2 rounded-lg hover:bg-[#6B7280] transition">
                <i className="fas fa-sign-out-alt mr-2"></i>
                <span>Выход</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
