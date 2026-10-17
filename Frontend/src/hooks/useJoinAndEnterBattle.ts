import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import useBattleApi from '@/hooks/useBattleApi';
import { useToast } from '@/hooks/use-toast';

/** A rejected join whose message says the caller is already in: entering is still right. */
export const isAlreadyJoined = (message: string) =>
  /already|joined/i.test(message);

/** Join, then enter only when the server agreed — `joinExistingBattle` resolves `{ ok: false }`, it never throws. */
export function useJoinAndEnterBattle(options?: { successToast?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { joinExistingBattle } = useBattleApi();
  const successToast = options?.successToast;

  return useCallback(
    async (battleId: string): Promise<boolean> => {
      const result = await joinExistingBattle(battleId);
      if (result.ok || isAlreadyJoined(result.message)) {
        if (result.ok && successToast) toast({ title: successToast });
        router.push(`/battle-zone/${battleId}`);
        return true;
      }
      toast({ title: result.message, variant: 'destructive' });
      return false;
    },
    [joinExistingBattle, router, toast, successToast],
  );
}
