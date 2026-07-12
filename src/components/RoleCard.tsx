import React from 'react';
import { motion } from 'motion/react';
import { Shield, Target, Search, Users } from 'lucide-react';

type Role = 'mafia' | 'doctor' | 'detective' | 'citizen';

interface RoleCardProps {
    role: Role;
    onClose: () => void;
}

const roleDetails = {
    mafia: { title: 'المافيا', description: 'تخلص من المواطنين في الليل.', icon: Target, color: 'text-red-500' },
    doctor: { title: 'الطبيب', description: 'أنقذ أحد اللاعبين من القتل.', icon: Shield, color: 'text-emerald-500' },
    detective: { title: 'الشرطي', description: 'اكشف هوية أحد اللاعبين.', icon: Search, color: 'text-indigo-500' },
    citizen: { title: 'مواطن', description: 'اكتشف المافيا وصوت لإقصائهم.', icon: Users, color: 'text-slate-500' },
};

export const RoleCard: React.FC<RoleCardProps> = ({ role, onClose }) => {
    const details = roleDetails[role];
    const Icon = details.icon;

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, rotateY: 90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="bg-slate-900 border border-slate-700 p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full"
            >
                <h2 className="text-white text-3xl font-black mb-2">دورك هو</h2>
                <div className={`text-6xl font-black mb-6 ${details.color}`}>
                    {details.title}
                </div>
                <Icon className={`w-20 h-20 mx-auto mb-6 ${details.color}`} />
                <p className="text-slate-300 text-lg mb-8">{details.description}</p>
                <button 
                    onClick={onClose}
                    className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700"
                >
                    فهمت
                </button>
            </motion.div>
        </div>
    );
};
