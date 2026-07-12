import React from 'react';
import * as LucideIcons from 'lucide-react';
import { Snippet } from '../types';

interface SnippetBadgeProps {
    snippet: Snippet;
}

export const SnippetBadge: React.FC<SnippetBadgeProps> = ({ snippet }) => {
    const IconComponent = (LucideIcons as any)[snippet.icon] || LucideIcons.HelpCircle;
    return (
        <div className="border bg-white border-gray-200 shadow-sm p-3 rounded-lg flex items-center gap-3 w-full">
            <IconComponent className="w-5 h-5 text-indigo-700" />
            <div className='flex flex-col'>
                <span className="font-bold text-sm text-gray-900">{snippet.title}</span>
                <span className="text-[10px] text-gray-500">{snippet.description}</span>
            </div>
        </div>
    );
};
