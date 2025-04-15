import { useState, useRef, useEffect } from 'react';
import { classes } from '../lib/gameData';
import { getMergedClassBonuses } from '../utils/gameUtils';

export default function ClassSelection({ onClassSelected }) {
  const [showMergedSelection, setShowMergedSelection] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedMergedClass, setSelectedMergedClass] = useState(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const classContainerRef = useRef(null);
  const scrollAmount = 200; // количество пикселей для прокрутки

  // Выбор обычного класса
  const handleSelectClass = (classId) => {
    if (!showMergedSelection) {
      onClassSelected(classId);
    } else {
      setSelectedClass(classId);
    }
  };

  // Выбор второго класса для слияния
  const handleSelectMergedClass = (classId) => {
    if (classId !== selectedClass) {
      setSelectedMergedClass(classId);
    }
  };

  // Подтверждение слияния классов
  const handleConfirmMergedClass = () => {
    if (selectedClass && selectedMergedClass) {
      onClassSelected(selectedClass, selectedMergedClass);
    }
  };

  // Функция для прокрутки вверх
  const scrollUp = () => {
    if (classContainerRef.current) {
      const newOffset = Math.max(0, scrollOffset - scrollAmount);
      setScrollOffset(newOffset);
      classContainerRef.current.scrollTop = newOffset;
    }
  };

  // Функция для прокрутки вниз
  const scrollDown = () => {
    if (classContainerRef.current) {
      const maxScroll = classContainerRef.current.scrollHeight - classContainerRef.current.clientHeight;
      const newOffset = Math.min(maxScroll, scrollOffset + scrollAmount);
      setScrollOffset(newOffset);
      classContainerRef.current.scrollTop = newOffset;
    }
  };

  // Отображение экрана выбора обычного класса
  if (!showMergedSelection) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
        <div className="bg-[#2D3748] rounded-lg p-6 max-w-4xl w-full mx-4 relative">
          <h2 className="font-['Press_Start_2P,_cursive'] text-2xl text-center text-[#D69E2E] mb-6">Выберите ваш класс</h2>
          <p className="text-center mb-8">Ваш выбор определит ваши особые способности в игре</p>
          
          {/* Кнопка прокрутки вверх */}
          <button 
            className="absolute top-4 right-4 w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white hover:bg-gray-600 transition-colors z-10"
            onClick={scrollUp}
          >
            <i className="fas fa-chevron-up"></i>
          </button>
          
          {/* Кнопка прокрутки вниз */}
          <button 
            className="absolute bottom-4 right-4 w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white hover:bg-gray-600 transition-colors z-10"
            onClick={scrollDown}
          >
            <i className="fas fa-chevron-down"></i>
          </button>
          
          <div 
            ref={classContainerRef}
            className="max-h-[70vh] overflow-y-auto custom-scrollbar pr-2"
            style={{ scrollBehavior: 'smooth' }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {classes.slice(0, 3).map(classData => (
                <div 
                  key={classData.id}
                  className={`bg-[#4C566A] rounded-lg p-4 hover:bg-opacity-80 cursor-pointer transform hover:scale-105 transition border-2 border-class-${classData.id} relative overflow-hidden`}
                  onClick={() => handleSelectClass(classData.id)}
                >
                  <div className="shine"></div>
                  <div className="flex justify-center mb-4">
                    <div className={`w-24 h-24 rounded-full bg-class-${classData.id} flex items-center justify-center`}>
                      <i className={`fas fa-${classData.icon} text-4xl`}></i>
                    </div>
                  </div>
                  <h3 className="font-['Press_Start_2P,_cursive'] text-center text-xl mb-2">{classData.name}</h3>
                  <ul className="text-sm space-y-2">
                    {classData.bonuses.map((bonus, index) => (
                      <li key={index} className="flex items-start">
                        <i className="fas fa-check text-green-400 mt-1 mr-2"></i>
                        <span>{bonus}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {classes.slice(3, 5).map(classData => (
                <div 
                  key={classData.id}
                  className={`bg-[#4C566A] rounded-lg p-4 hover:bg-opacity-80 cursor-pointer transform hover:scale-105 transition border-2 border-class-${classData.id} relative overflow-hidden`}
                  onClick={() => handleSelectClass(classData.id)}
                >
                  <div className="shine"></div>
                  <div className="flex justify-center mb-4">
                    <div className={`w-24 h-24 rounded-full bg-class-${classData.id} flex items-center justify-center`}>
                      <i className={`fas fa-${classData.icon} text-4xl`}></i>
                    </div>
                  </div>
                  <h3 className="font-['Press_Start_2P,_cursive'] text-center text-xl mb-2">{classData.name}</h3>
                  <ul className="text-sm space-y-2">
                    {classData.bonuses.map((bonus, index) => (
                      <li key={index} className="flex items-start">
                        <i className="fas fa-check text-green-400 mt-1 mr-2"></i>
                        <span>{bonus}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 text-center">
            <button 
              className="px-6 py-3 bg-[#6B46C1] text-white rounded-lg hover:bg-purple-700 transition"
              onClick={() => setShowMergedSelection(true)}
            >
              <i className="fas fa-flask mr-2"></i> Продвинутый выбор (Слияние классов)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Отображение экрана слияния классов
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-[#2D3748] rounded-lg p-6 max-w-4xl w-full mx-4 relative">
        <h2 className="font-['Press_Start_2P,_cursive'] text-2xl text-center text-[#D69E2E] mb-6">Слияние классов</h2>
        <p className="text-center mb-8">Выберите два класса, чтобы создать уникальный гибрид с комбинированными способностями</p>
        
        {/* Кнопка прокрутки вверх */}
        <button 
          className="absolute top-4 right-4 w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white hover:bg-gray-600 transition-colors z-10"
          onClick={scrollUp}
        >
          <i className="fas fa-chevron-up"></i>
        </button>
        
        {/* Кнопка прокрутки вниз */}
        <button 
          className="absolute bottom-4 right-4 w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white hover:bg-gray-600 transition-colors z-10"
          onClick={scrollDown}
        >
          <i className="fas fa-chevron-down"></i>
        </button>
        
        <div 
          ref={classContainerRef}
          className="max-h-[70vh] overflow-y-auto custom-scrollbar pr-2"
          style={{ scrollBehavior: 'smooth' }}
        >
          {!selectedClass ? (
            <>
              <h3 className="text-center text-xl mb-4">Выберите основной класс</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {classes.map(classData => (
                  <div 
                    key={classData.id}
                    className={`bg-[#4C566A] rounded-lg p-4 hover:bg-opacity-80 cursor-pointer border-2 border-class-${classData.id}`}
                    onClick={() => setSelectedClass(classData.id)}
                  >
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-full bg-class-${classData.id} flex items-center justify-center mr-4`}>
                        <i className={`fas fa-${classData.icon} text-2xl`}></i>
                      </div>
                      <h4 className="font-semibold">{classData.name}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : !selectedMergedClass ? (
            <>
              <div className="mb-6 bg-[#1A202C] p-4 rounded-lg">
                <h3 className="text-center text-xl mb-4">Основной класс: {classes.find(c => c.id === selectedClass)?.name}</h3>
                <p className="text-center">Теперь выберите второй класс для слияния</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {classes.filter(c => c.id !== selectedClass).map(classData => (
                  <div 
                    key={classData.id}
                    className={`bg-[#4C566A] rounded-lg p-4 hover:bg-opacity-80 cursor-pointer border-2 border-class-${classData.id}`}
                    onClick={() => handleSelectMergedClass(classData.id)}
                  >
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-full bg-class-${classData.id} flex items-center justify-center mr-4`}>
                        <i className={`fas fa-${classData.icon} text-2xl`}></i>
                      </div>
                      <h4 className="font-semibold">{classData.name}</h4>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center">
                <button 
                  className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
                  onClick={() => setSelectedClass(null)}
                >
                  Назад
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6 bg-[#1A202C] p-4 rounded-lg">
                <h3 className="text-center text-xl mb-4">Слияние классов</h3>
                <div className="flex items-center justify-center space-x-6">
                  <div className="text-center">
                    <div className={`w-16 h-16 rounded-full bg-class-${selectedClass} flex items-center justify-center mx-auto mb-2`}>
                      <i className={`fas fa-${classes.find(c => c.id === selectedClass)?.icon} text-2xl`}></i>
                    </div>
                    <p>{classes.find(c => c.id === selectedClass)?.name}</p>
                  </div>
                  
                  <div className="text-2xl">+</div>
                  
                  <div className="text-center">
                    <div className={`w-16 h-16 rounded-full bg-class-${selectedMergedClass} flex items-center justify-center mx-auto mb-2`}>
                      <i className={`fas fa-${classes.find(c => c.id === selectedMergedClass)?.icon} text-2xl`}></i>
                    </div>
                    <p>{classes.find(c => c.id === selectedMergedClass)?.name}</p>
                  </div>
                  
                  <div className="text-2xl">=</div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-class-{selectedClass} to-class-{selectedMergedClass} flex items-center justify-center mx-auto mb-2">
                      <i className="fas fa-star text-2xl"></i>
                    </div>
                    <p>{getMergedClassBonuses(selectedClass, selectedMergedClass).name}</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="font-semibold mb-2">Бонусы слияния:</h4>
                  <ul className="text-sm space-y-1">
                    {getMergedClassBonuses(selectedClass, selectedMergedClass).bonuses.map((bonus, index) => (
                      <li key={index} className="flex items-start">
                        <i className="fas fa-check text-green-400 mt-1 mr-2"></i>
                        <span>{bonus}</span>
                      </li>
                    ))}
                    {classes.find(c => c.id === selectedClass)?.bonuses.map((bonus, index) => (
                      <li key={`primary-${index}`} className="flex items-start">
                        <i className="fas fa-check text-yellow-400 mt-1 mr-2"></i>
                        <span>{bonus}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="flex justify-center space-x-4">
                <button 
                  className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
                  onClick={() => setSelectedMergedClass(null)}
                >
                  Назад
                </button>
                
                <button 
                  className="px-6 py-2 bg-[#6B46C1] text-white rounded hover:bg-purple-700 transition"
                  onClick={handleConfirmMergedClass}
                >
                  Подтвердить выбор
                </button>
              </div>
            </>
          )}
        </div>
        
        <div className="mt-6 text-center">
          <button 
            className="px-4 py-2 text-gray-400 hover:text-white transition"
            onClick={() => setShowMergedSelection(false)}
          >
            Вернуться к обычному выбору
          </button>
        </div>
      </div>
    </div>
  );
}
