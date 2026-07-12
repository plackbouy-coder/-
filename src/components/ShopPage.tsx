import React from 'react';
import { useGame } from '../context/GameContext';
import * as LucideIcons from 'lucide-react';

const subscriptions = [
    { id: 's1', name: 'الباقة الذهبية', icon: 'Crown', description: 'دخول غير محدود لجميع الغرف', price: 5 },
    { id: 's2', name: 'تعزيز الخبرة', icon: 'Zap', description: 'ضعف نقاط الخبرة مدى الحياة', price: 3 },
    { id: 's3', name: 'درع الحماية', icon: 'Shield', description: 'حماية ملفك الشخصي من الإبلاغات', price: 4 },
    { id: 's4', name: 'تأثيرات بصرية', icon: 'Sparkles', description: 'تأثيرات مميزة في الساحة', price: 2 },
    { id: 's5', name: 'عضوية VIP', icon: 'Star', description: 'شعار خاص وأولوية في الدعم', price: 10 },
];

export const ShopPage = () => {    const { setCurrentView } = useGame();
    return (
        <div className="w-full h-full p-6 text-gray-900 overflow-y-auto" dir="rtl">
            <div className="flex items-center gap-4 mb-6">                <button onClick={() => setCurrentView('home')} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">                    <LucideIcons.ArrowRight className="w-5 h-5" />                </button>                <h2 className="text-2xl font-bold">متجر الاشتراكات</h2>            </div>
            <div className="grid grid-cols-1 gap-4 max-w-md">
                {subscriptions.map(sub => {
                    const IconComponent = (LucideIcons as any)[sub.icon] || LucideIcons.Star;
                    return (
                        <div key={sub.id} className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm flex items-center justify-between gap-4">
                            <div className='flex items-center gap-3'>
                                <IconComponent className="w-8 h-8 text-indigo-600" />
                                <div>
                                    <h3 className="font-bold">{sub.name}</h3>
                                    <p className="text-xs text-gray-500">{sub.description}</p>
                                </div>
                            </div>
                            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold">
                                $ {sub.price}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
