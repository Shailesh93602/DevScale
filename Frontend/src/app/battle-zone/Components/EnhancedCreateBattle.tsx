'use client';

import { Edit, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { Form } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BattlePreview from './BattlePreview';
import { useCreateBattleWizard } from './create-battle/useCreateBattleWizard';
import { WizardProgress, WizardStepper } from './create-battle/WizardHeader';
import {
  BattleInfoStep,
  QuestionSourceStep,
} from './create-battle/InfoAndSourceSteps';
import { SettingsStep } from './create-battle/SettingsStep';
import { PreviewStep } from './create-battle/PreviewStep';
import { WizardNav } from './create-battle/WizardNav';

interface EnhancedCreateBattleFormProps {
  onSuccess?: (battleId: string) => void;
  onCancel?: () => void;
}

const EnhancedCreateBattleForm: React.FC<EnhancedCreateBattleFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const w = useCreateBattleWizard(onSuccess);
  const { activeStep, formValues, questionSource } = w;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full space-y-6"
    >
      <WizardProgress formProgress={w.formProgress} />
      <WizardStepper activeStep={activeStep} onStepBack={w.setActiveStep} />

      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-2">
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <Edit className="h-4 w-4" /> Edit
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" /> Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit">
          <Form {...w.form}>
            <div className="space-y-8">
              {activeStep === 1 && <BattleInfoStep w={w} />}
              {activeStep === 2 && <QuestionSourceStep w={w} />}
              {activeStep === 3 && <SettingsStep w={w} />}
              {activeStep === 4 && <PreviewStep w={w} />}
              <WizardNav w={w} onCancel={onCancel} />
            </div>
          </Form>
        </TabsContent>

        <TabsContent value="preview">
          <BattlePreview
            formValues={{
              title: formValues.title,
              description: formValues.description ?? '',
              difficulty: formValues.difficulty,
              type: formValues.type as 'QUICK' | 'SCHEDULED' | 'PRACTICE',
              questionSource: questionSource
                ? { label: questionSource.label, count: questionSource.count }
                : undefined,
            }}
          />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default EnhancedCreateBattleForm;
