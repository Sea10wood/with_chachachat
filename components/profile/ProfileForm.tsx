import Button from '@/components/atoms/Button/Button';
import FormField from '@/components/molecules/FormField/FormField';
import type { FormState } from '@/types/profile';
import { updateProfile } from '@/utils/supabase/profile';
import { validateName } from '@/utils/validation/profile';
import { useState } from 'react';

interface ProfileFormProps {
  name: string;
  onNameChange: (name: string) => void;
  onError: (error: string) => void;
  onSuccess: (message: string) => void;
}

export default function ProfileForm({
  name,
  onNameChange,
  onError,
  onSuccess,
}: ProfileFormProps) {
  const [formState, setFormState] = useState<FormState>({
    isSubmitting: false,
    isComplete: false,
    validationError: null,
  });

  const validateForm = (): boolean => {
    const { isValid, error } = validateName(name);
    setFormState((prev) => ({
      ...prev,
      validationError: error,
    }));
    return isValid;
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setFormState((prev) => ({
        ...prev,
        isSubmitting: true,
        isComplete: false,
      }));

      await updateProfile(name, {
        name,
        updated_at: new Date().toISOString(),
      });

      setFormState((prev) => ({
        ...prev,
        isSubmitting: false,
        isComplete: true,
      }));

      onSuccess('プロフィールを更新しました');
    } catch (error) {
      console.error('プロフィール更新エラー:', error);
      setFormState((prev) => ({
        ...prev,
        isSubmitting: false,
        isComplete: false,
      }));
      onError('プロフィールの更新に失敗しました');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        id="name"
        label="ユーザー名"
        value={name}
        onChange={(e) => {
          onNameChange(e.target.value);
          setFormState((prev) => ({ ...prev, validationError: null }));
        }}
        error={formState.validationError}
        required
        disabled={formState.isSubmitting}
      />
      <Button
        type="submit"
        isLoading={formState.isSubmitting}
        disabled={formState.isSubmitting}
        className="w-full"
      >
        保存
      </Button>
    </form>
  );
}
