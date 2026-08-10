import { useState, useEffect, useCallback } from 'react';

export default function useEconomy() {
  const [coins, setCoins] = useState(0);
  const [ownedHats, setOwnedHats] = useState(['none']);
  const [equippedHat, setEquippedHat] = useState('none');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedCoins = localStorage.getItem('jelly_coins');
      const storedHats = localStorage.getItem('jelly_owned_hats');
      const storedEquipped = localStorage.getItem('jelly_equipped_hat');

      if (storedCoins) setCoins(parseInt(storedCoins, 10));
      if (storedHats) setOwnedHats(JSON.parse(storedHats));
      if (storedEquipped) setEquippedHat(storedEquipped);
    } catch (e) {
      console.error('Error loading economy data from localStorage', e);
    }
    setIsLoaded(true);
  }, []);

  const equipHat = useCallback((hatId) => {
    if (ownedHats.includes(hatId)) {
      setEquippedHat(hatId);
      localStorage.setItem('jelly_equipped_hat', hatId);
      return true;
    }
    return false;
  }, [ownedHats]);

  const addCoins = useCallback((amount) => {
    setCoins(prev => {
      const newAmount = prev + amount;
      localStorage.setItem('jelly_coins', newAmount);
      return newAmount;
    });
  }, []);

  const spendCoins = useCallback((amount) => {
    let success = false;
    setCoins(prev => {
      if (prev >= amount) {
        const newAmount = prev - amount;
        localStorage.setItem('jelly_coins', newAmount);
        success = true;
        return newAmount;
      }
      return prev;
    });
    return success;
  }, []);

  const buyHat = useCallback((hatId, price) => {
    if (ownedHats.includes(hatId)) return true;
    
    if (spendCoins(price)) {
      setOwnedHats(prev => {
        const newHats = [...prev, hatId];
        localStorage.setItem('jelly_owned_hats', JSON.stringify(newHats));
        return newHats;
      });
      return true;
    }
    return false;
  }, [ownedHats, spendCoins]);

  return {
    coins,
    ownedHats,
    equippedHat,
    isLoaded,
    addCoins,
    spendCoins,
    buyHat,
    equipHat
  };
}
