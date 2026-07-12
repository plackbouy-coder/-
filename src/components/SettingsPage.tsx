import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Save, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const SettingsPage = () => {
    const { settings, setSettings, setCurrentView } = useGame();
    const [draftSettings, setDraftSettings] = useState(settings);
    const { t } = useTranslation();

    useEffect(() => {
        setDraftSettings(settings);
    }, [settings]);

    const isDirty = JSON.stringify(draftSettings) !== JSON.stringify(settings);

    const updateDraft = (key: string, value: any) => {
        setDraftSettings((prev: any) => ({ ...prev, [key]: value }));
    };

    const saveSettings = () => {
        setSettings(draftSettings);
    };

    const settingItems = [
        { key: 'soundEffects', label: t('soundEffects'), type: 'toggle' },
        { key: 'music', label: t('music'), type: 'toggle' },
        { key: 'volume', label: t('volume'), type: 'slider' },
        { key: 'language', label: t('language'), type: 'select', options: ['ar', 'en', 'es'] },
        { key: 'notifications', label: t('notifications'), type: 'toggle' },
        { key: 'displayName', label: t('displayName'), type: 'text' },
        { key: 'profilePublic', label: t('profilePublic'), type: 'toggle' },
        { key: 'difficulty', label: t('difficulty'), type: 'select', options: ['easy', 'medium', 'hard'] },
        { key: 'autoJoin', label: t('autoJoin'), type: 'toggle' },
        { key: 'chatEnabled', label: t('chatEnabled'), type: 'toggle' },
        { key: 'filterProfanity', label: t('filterProfanity'), type: 'toggle' },
        { key: 'showFPS', label: t('showFPS'), type: 'toggle' },
        { key: 'graphics', label: t('graphics'), type: 'select', options: ['low', 'medium', 'high'] },
        { key: 'animationSpeed', label: t('animationSpeed'), type: 'select', options: ['slow', 'normal', 'fast'] },
        { key: 'vSync', label: t('vSync'), type: 'toggle' },
        { key: 'analytics', label: t('analytics'), type: 'toggle' },
        { key: 'showTutorial', label: t('showTutorial'), type: 'toggle' },
    ];

    return (
        <div className="w-full h-full p-6 text-gray-900 overflow-y-auto relative" dir="rtl">
            <div className="flex items-center gap-4 mb-6">                <button onClick={() => setCurrentView('home')} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">                    <ArrowRight className="w-5 h-5" />                </button>                <h2 className="text-2xl font-bold">الإعدادات</h2>            </div>
            <div className="grid grid-cols-1 gap-4 max-w-lg">
                {settingItems.map(item => (
                    <div key={item.key} className="bg-white border border-gray-200 shadow-sm p-4 rounded-xl flex items-center justify-between">
                        <label className="text-sm font-medium">{item.label}</label>
                        {item.type === 'toggle' && (
                            <button onClick={() => updateDraft(item.key, !draftSettings[item.key as keyof typeof draftSettings])} className={`w-12 h-6 rounded-full transition-colors relative ${draftSettings[item.key as keyof typeof draftSettings] ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                                <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${draftSettings[item.key as keyof typeof draftSettings] ? 'right-7' : 'right-1'}`}></div>
                            </button>
                        )}
                        {item.type === 'select' && (
                            <select value={draftSettings[item.key as keyof typeof draftSettings] as string} onChange={(e) => updateDraft(item.key, e.target.value)} className="bg-gray-100 border border-gray-300 rounded p-1 text-sm">
                                {item.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        )}
                        {item.type === 'slider' && (
                            <input type="range" min="0" max="100" value={draftSettings[item.key as keyof typeof draftSettings] as number} onChange={(e) => updateDraft(item.key, parseInt(e.target.value))} />
                        )}
                        {item.type === 'text' && (
                            <input type="text" value={draftSettings[item.key as keyof typeof draftSettings] as string} onChange={(e) => updateDraft(item.key, e.target.value)} className="bg-gray-100 border border-gray-300 rounded p-1 text-sm" />
                        )}
                    </div>
                ))}
            </div>
            
            {isDirty && (
                <button onClick={saveSettings} className="fixed bottom-20 left-6 bg-indigo-600 hover:bg-indigo-700 p-4 rounded-full shadow-lg flex items-center gap-2">
                    <Save className="w-5 h-5" />
                    <span>حفظ</span>
                </button>
            )}
        </div>
    );
};
