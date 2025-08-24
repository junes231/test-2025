import React, { useState } from 'react';

export default function DeleteButton({ onDelete }: { onDelete: () => Promise<void> }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClick = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } catch (e) {
      // 可以处理异常
    }
    setTimeout(() => setIsDeleting(false), 3000);
  };

  return (
    <button
      disabled={isDeleting}
      className={isDeleting ? 'deleting' : ''}
      onClick={handleClick}
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  );
}
