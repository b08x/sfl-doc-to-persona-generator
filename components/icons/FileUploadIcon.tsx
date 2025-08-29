import React from 'react';

export const FileUploadIcon: React.FC<{ className?: string }> = ({ className = "w-12 h-12 text-[#95aac0]" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M3 17.25V21h18v-3.75M9 13.5l.375-.375a2.25 2.25 0 013.25 0l.375.375" />
    </svg>
);