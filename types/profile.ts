export type ProfileState = {
  isLoading: boolean;
  isComplete: boolean;
  error: string | null;
  successMessage: string | null;
};

export type UploadState = {
  isLoading: boolean;
  isComplete: boolean;
  progress: number;
};

export type FormState = {
  isSubmitting: boolean;
  isComplete: boolean;
  validationError: string | null;
};

export interface Profile {
  id: string;
  name: string;
  avatar_url: string;
  updated_at: string;
}

export interface ProfileUpdateData {
  name?: string;
  avatar_url?: string;
  updated_at: string;
}
