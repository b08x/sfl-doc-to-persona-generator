import React from 'react';

export const DragHandleIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M5 4.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM8.5 6a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM11.5 4.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM15 6a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM5 9.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm3.5 1.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM11.5 9.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm3.5 1.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM5 14.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm3.5 1.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm3.5-1.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm3.5 1.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
    </svg>
);
