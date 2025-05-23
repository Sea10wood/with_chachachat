export function validateName(name: string): {
  isValid: boolean;
  error: string | null;
} {
  if (!name.trim()) {
    return {
      isValid: false,
      error: 'ユーザー名を入力してください',
    };
  }

  if (name.length > 50) {
    return {
      isValid: false,
      error: 'ユーザー名は50文字以内で入力してください',
    };
  }

  return {
    isValid: true,
    error: null,
  };
}

export function validateAvatarFile(file: File): {
  isValid: boolean;
  error: string | null;
} {
  if (!file) {
    return {
      isValid: false,
      error: '画像を選択してください',
    };
  }

  const fileSize = file.size / 1024 / 1024; // MBに変換
  if (fileSize > 1) {
    return {
      isValid: false,
      error: 'ファイルサイズは1MB以下にしてください',
    };
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'JPEG、PNG、またはWebP形式の画像を選択してください',
    };
  }

  return {
    isValid: true,
    error: null,
  };
}
