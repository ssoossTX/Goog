import { useGame } from '../contexts/GameContext';
import { formatNumber } from '../utils/gameUtils';

export default function Header() {
  const { player } = useGame();
  
  // Проверяем, существует ли игрок
  if (!player) {
    return (
      <nav id="mainNav" className="bg-[#2D3748] p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="font-['Press_Start_2P,_cursive'] text-xl text-[#D69E2E]">MMORPG-clicker</h1>
        </div>
      </nav>
    );
  }
  
  return (
    <nav id="mainNav" className="bg-[#2D3748] p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="font-['Press_Start_2P,_cursive'] text-xl text-[#D69E2E]">MMORPG-clicker</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <i className="fas fa-coins text-yellow-400 mr-2"></i>
            <span className="font-semibold">{formatNumber(player.resources.gold)}</span>
          </div>
          <div className="flex items-center">
            <i className="fas fa-gem text-blue-400 mr-2"></i>
            <span className="font-semibold">{formatNumber(player.resources.diamonds)}</span>
          </div>
          <div className="relative">
            <button id="settingsBtn" className="p-2 text-gray-300 hover:text-white transition">
              <i className="fas fa-cog"></i>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
