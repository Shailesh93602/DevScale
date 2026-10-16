import { useEffect, useRef, useState } from 'react';
import { useAxiosGet, useAxiosPost } from '@/hooks/useAxios';
import { logger } from '@/lib/logger';
import { DEFAULT_BOILERPLATE, IChallenge } from './challengeTypes';

type CodeByLanguage = Record<string, string>;

const progressKey = (id: string) => `challenge_progress_${id}`;

/**
 * Loads the challenge and keeps the per-language code in sync with
 * localStorage (immediately) and the cloud draft (debounced).
 */
export function useChallengeCode(id: string, language: string) {
  const [challenge, setChallenge] = useState<IChallenge>();
  const [userCode, setUserCode] = useState<CodeByLanguage>(DEFAULT_BOILERPLATE);
  // Nothing is persisted until the saved code has been restored, and nothing
  // reaches the cloud until the user edits that language: otherwise a
  // boilerplate is written over localStorage and the user's real cloud draft.
  const [restored, setRestored] = useState(false);
  const editedRef = useRef(new Set<string>());

  const [getChallenge] = useAxiosGet<IChallenge>(`/challenges/${id}`);
  const [saveDraft] = useAxiosPost('/run-code/draft');
  // The envelope's `data` IS the draft row (or null).
  const [getCloudDraft] = useAxiosGet<{ code: string } | null>(
    `/run-code/draft/${id}`,
  );

  const applyBoilerplates = (data: IChallenge) => {
    if (data.boilerplates) {
      setUserCode((prev) => ({ ...prev, ...data.boilerplates }));
    }
  };

  const restoreSavedCode = async (data: IChallenge) => {
    // Priority 1: LocalStorage (unsaved changes)
    const savedProgress = localStorage.getItem(progressKey(id));
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        setUserCode((prev) => ({ ...prev, ...parsed }));
        console.log('[DEBUG] Restored code from LocalStorage');
      } catch (e) {
        console.error('Failed to parse saved progress', e);
      }
      return;
    }
    // Priority 2: Cloud Draft, Priority 3: Standard boilerplates
    try {
      const cloudResp = await getCloudDraft({ params: { language } });
      const cloudCode = cloudResp.data?.code;
      if (cloudCode) {
        setUserCode((prev) => ({ ...prev, [language]: cloudCode }));
        console.log('[DEBUG] Restored code from Cloud');
      } else {
        applyBoilerplates(data);
      }
    } catch {
      applyBoilerplates(data);
    }
  };

  const fetchChallenge = async () => {
    try {
      const response = await getChallenge();
      const data = response.data;
      if (data) {
        setChallenge(data);
        await restoreSavedCode(data);
        setRestored(true);
      }
    } catch (error) {
      logger.error('Error fetching challenge:', error);
    }
  };

  // Auto-save to LocalStorage (Immediate)
  useEffect(() => {
    if (restored && userCode && Object.keys(userCode).length > 0) {
      localStorage.setItem(progressKey(id), JSON.stringify(userCode));
    }
  }, [userCode, id, restored]);

  // Cloud Sync (Debounced 2s)
  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (restored && editedRef.current.has(language) && userCode[language]) {
        try {
          await saveDraft({
            challengeId: id,
            code: userCode[language],
            language: language,
          });
          console.log('[DEBUG] Draft synced to cloud');
        } catch {
          // Silently fail, local storage is still there
        }
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [userCode[language], id, language, restored]);

  useEffect(() => {
    fetchChallenge();
  }, [id]);

  // Load cloud draft on language switch if not in userCode
  useEffect(() => {
    const loadDraft = async () => {
      // Simple heuristic for "empty"
      if (
        id &&
        language &&
        (!userCode[language] || userCode[language].length < 10)
      ) {
        try {
          const cloudResp = await getCloudDraft({ params: { language } });
          const cloudCode = cloudResp.data?.code;
          if (cloudCode) {
            setUserCode((prev) => ({ ...prev, [language]: cloudCode }));
          }
        } catch {
          // Ignore
        }
      }
    };
    loadDraft();
  }, [language, id]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      editedRef.current.add(language);
      setUserCode((prev) => ({ ...prev, [language]: value }));
    }
  };

  const resetCode = () => {
    editedRef.current.add(language);
    setUserCode((prev) => ({
      ...prev,
      [language]:
        DEFAULT_BOILERPLATE[language as keyof typeof DEFAULT_BOILERPLATE],
    }));
  };

  return { challenge, code: userCode[language], handleEditorChange, resetCode };
}
