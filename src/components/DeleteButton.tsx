import React, { useState } from 'react';

const DeleteButton = ({ funnelId, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(funnelId);
    } catch (error) {
      // 可以处理异常
    }
    setTimeout(() => setIsDeleting(false), 3000); // 动画3秒
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      style={{
        background: isDeleting ? '#d9534f' : 'transparent',
        color: isDeleting ? '#fff' : '#d9534f',
        border: '1px solid #d9534f',
        borderRadius: 4,
        padding: '4px 16px',
        transition: 'all 0.3s',
        cursor: isDeleting ? 'not-allowed' : 'pointer',
        opacity: isDeleting ? 0.7 : 1
      }}
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  );
};

export default DeleteButton;
