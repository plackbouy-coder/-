import React, { useState, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { Camera, ArrowRight } from 'lucide-react';
import { SnippetBadge } from './SnippetBadge';

export const ProfilePage = () => {
    const { user, ownedSnippets, settings, setSettings, setCurrentView } = useGame();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(settings.displayName || 'لاعب');
    const [image, setImage] = useState<string | null>(settings.profileImage || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setImage(base64);
                setSettings(prev => ({ ...prev, profileImage: base64 }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const saveProfile = () => {
        setSettings(prev => ({ ...prev, displayName: name }));
        setIsEditing(false);
    };

    return (
        <div className="w-full h-full flex flex-col items-center p-6 text-gray-900 overflow-y-auto relative" dir={settings.language === 'ar' ? 'rtl' : 'ltr'}>
            <button onClick={() => setCurrentView('home')} className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-10">
                <ArrowRight className="w-5 h-5" />
            </button>
            <div className="relative mb-6 mt-8">
                <div onClick={() => isEditing && fileInputRef.current?.click()} className={`w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border-2 border-indigo-200 ${isEditing ? 'cursor-pointer hover:opacity-80' : ''}`}>
                    {image ? <img src={image} alt="Profile" className="w-full h-full object-cover" /> : <Camera className="w-10 h-10 text-indigo-500" />}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
            </div>
            
            {isEditing ? (
                <input value={name} onChange={(e) => setName(e.target.value)} className="bg-white border border-gray-200 shadow-sm rounded-lg px-4 py-2 text-center text-xl font-bold mb-6" />
            ) : (
                <h2 className="text-xl font-bold mb-6">{name}</h2>
            )}

            <button onClick={() => isEditing ? saveProfile() : setIsEditing(true)} className="mb-6 px-6 py-2 bg-indigo-100 hover:bg-indigo-200 rounded-full text-sm">
                {isEditing ? 'حفظ' : 'تعديل الملف'}
            </button>

            <div className="w-full max-w-sm space-y-2 mb-6">
                <h3 className="font-bold text-sm mb-2">اشتراكاتي:</h3>
                {ownedSnippets.map(s => <SnippetBadge key={s.id} snippet={s} />)}
            </div>

            <div className="grid grid-cols-3 w-full max-w-sm gap-2 text-center text-xs">
                <div className="bg-white border border-gray-200 shadow-sm p-2 rounded-lg">الانتصارات<br/><span className="font-bold text-sm">42</span></div>
                <div className="bg-white border border-gray-200 shadow-sm p-2 rounded-lg">المستوى<br/><span className="font-bold text-sm">24</span></div>
                <div className="bg-white border border-gray-200 shadow-sm p-2 rounded-lg">النقاط<br/><span className="font-bold text-sm">1250</span></div>
            </div>
        </div>
    );
};
