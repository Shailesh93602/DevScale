'use client';

import { useRouter } from 'next/navigation';
import EnhancedCreateBattleForm from '../Components/EnhancedCreateBattle';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function CreateBattlePage() {
  const router = useRouter();

  const handleSuccess = (battleId: string) => {
    router.push(`/battle-zone/${battleId}`);
  };

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-8 flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Create New Battle</h1>
      </div>

      <EnhancedCreateBattleForm onSuccess={handleSuccess} />
    </div>
  );
}
