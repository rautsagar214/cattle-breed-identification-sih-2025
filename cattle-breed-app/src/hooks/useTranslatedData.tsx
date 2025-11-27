/**
 * React Hook for Real-time Translation of Backend Data
 * Usage: const { data, loading, error } = useTranslatedData(originalData, language);
 */

import { useState, useEffect } from 'react';
import { translateBreedData, BreedData, translateArray, translateWithCache } from '../utils/translation';

interface UseTranslatedDataResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to translate breed data automatically when language changes
 */
export function useTranslatedBreedData(
  breedData: BreedData | null,
  language: string
): UseTranslatedDataResult<BreedData> {
  const [data, setData] = useState<BreedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!breedData) {
      setData(null);
      return;
    }

    // If English, no translation needed
    if (language === 'en') {
      setData(breedData);
      setLoading(false);
      return;
    }

    // Translate data
    const translateData = async () => {
      setLoading(true);
      setError(null);

      try {
        const translated = await translateBreedData(breedData, language);
        setData(translated);
      } catch (err) {
        setError(err as Error);
        setData(breedData); // Fallback to original data
      } finally {
        setLoading(false);
      }
    };

    translateData();
  }, [breedData, language]);

  return { data, loading, error };
}

/**
 * Hook to translate a single text field
 */
export function useTranslatedText(
  text: string,
  language: string
): UseTranslatedDataResult<string> {
  const [data, setData] = useState<string>(text);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (language === 'en' || !text) {
      setData(text);
      setLoading(false);
      return;
    }

    const translate = async () => {
      setLoading(true);
      setError(null);

      try {
        const translated = await translateWithCache(text, language);
        setData(translated);
      } catch (err) {
        setError(err as Error);
        setData(text);
      } finally {
        setLoading(false);
      }
    };

    translate();
  }, [text, language]);

  return { data, loading, error };
}

/**
 * Hook to translate an array of strings
 */
export function useTranslatedArray(
  items: string[],
  language: string
): UseTranslatedDataResult<string[]> {
  const [data, setData] = useState<string[]>(items);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (language === 'en' || !items || items.length === 0) {
      setData(items);
      setLoading(false);
      return;
    }

    const translate = async () => {
      setLoading(true);
      setError(null);

      try {
        const translated = await translateArray(items, language);
        setData(translated);
      } catch (err) {
        setError(err as Error);
        setData(items);
      } finally {
        setLoading(false);
      }
    };

    translate();
  }, [items, language]);

  return { data, loading, error };
}
