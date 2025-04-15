import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
  // Получаем сохраненное значение из localStorage или используем initialValue
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      // Проверяем, есть ли что-то в localStorage
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Ошибка при получении данных из localStorage:', error);
      return initialValue;
    }
  });

  // Функция для обновления значения в localStorage
  const setValue = (value) => {
    try {
      // Позволяем value быть функцией для совместимости с useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Сохраняем значение в state
      setStoredValue(valueToStore);
      
      // Сохраняем значение в localStorage
      if (valueToStore === null) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error('Ошибка при сохранении данных в localStorage:', error);
    }
  };

  // Обновление значения при изменении ключа
  useEffect(() => {
    const item = window.localStorage.getItem(key);
    if (item) {
      try {
        setStoredValue(JSON.parse(item));
      } catch (error) {
        console.error('Ошибка при чтении данных из localStorage:', error);
      }
    } else if (initialValue !== null) {
      window.localStorage.setItem(key, JSON.stringify(initialValue));
      setStoredValue(initialValue);
    }
  }, [key, initialValue]);

  return [storedValue, setValue];
}
