import { createContext, useContext } from 'react';

// Создаем контекст для игровых данных
const GameContext = createContext();

// Провайдер для обертывания приложения
export function GameProvider({ children, value }) {
  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

// Хук для использования игрового контекста
export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame должен использоваться внутри GameProvider');
  }
  return context;
}
