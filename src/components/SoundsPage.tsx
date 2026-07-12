import React, { useState, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { Mic, Square, Play, Trash2, ArrowRight } from 'lucide-react';

const PHASES = [
    { id: 'selection', label: 'بدء اللعبة واختيار البطاقات', defaultText: 'أهلاً بكم في ليالي الشك. يرجى من الجميع اختيار بطاقة للبدء.' },
    { id: 'card_selected', label: 'عند اختيار البطاقة', defaultText: 'تم اختيار البطاقة، جاري توزيع الأدوار.' },
    { id: 'revealing', label: 'كشف الأدوار', defaultText: 'تم توزيع الأدوار. تفقد دورك جيداً.' },
    { id: 'role_mafia', label: 'بطاقة المافيا (الدور والميزات)', defaultText: 'أنت فرد من عصابة المافيا. ميزتك هي اختيار ضحية لقتلها في كل ليلة بالتعاون مع أفراد المافيا الآخرين.' },
    { id: 'role_doctor', label: 'بطاقة الطبيب (الدور والميزات)', defaultText: 'أنت الطبيب. ميزتك هي اختيار شخص واحد كل ليلة لحمايته من القتل.' },
    { id: 'role_detective', label: 'بطاقة المحقق (الدور والميزات)', defaultText: 'أنت المحقق. ميزتك هي التحقيق من هوية شخص واحد كل ليلة لمعرفة ما إذا كان من المافيا أم لا.' },
    { id: 'role_citizen', label: 'بطاقة مواطن صالح (الدور والميزات)', defaultText: 'أنت مواطن صالح. ليس لديك قدرات ليلية، لكن يمكنك النقاش والتصويت في النهار لإعدام المافيا.' },
    { id: 'night_mafia', label: 'بداية الليل (دور المافيا)', defaultText: 'حل الظلام. المافيا، استيقظوا واختاروا ضحيتكم.' },
    { id: 'night_doctor', label: 'الليل (دور الطبيب)', defaultText: 'المافيا اختارت ضحيتها. الطبيب، استيقظ واختر شخصاً لحمايته.' },
    { id: 'night_detective', label: 'الليل (دور المحقق)', defaultText: 'الطبيب اختار. المحقق، استيقظ واختر شخصاً للتحقيق عنه.' },
    { id: 'detective_yes', label: 'نتيجة فحص المحقق (إيجابي)', defaultText: 'نعم، هذا المستخدم من المافيا.' },
    { id: 'detective_no', label: 'نتيجة فحص المحقق (سلبي)', defaultText: 'لا، هذا ليس هو المستخدم المطلوب، ليس أحد أعضاء المافيا.' },
    { id: 'morning_no_kill', label: 'الصباح (نجاح الطبيب في الحماية)', defaultText: 'أشرقت الشمس على القرية بسلام، لم يُقتل أحد الليلة الماضية.' },
    { id: 'morning_kill', label: 'الصباح (وقوع جريمة قتل)', defaultText: 'أشرقت الشمس... ولكن للأسف وجدنا جريمة قتل الليلة الماضية!' },
    { id: 'day', label: 'النهار وبدء النقاش', defaultText: 'أشرقت الشمس. حان وقت النقاش، من تعتقدون أنه المافيا؟' },
    { id: 'voting', label: 'التصويت', defaultText: 'انتهى وقت النقاش. حان وقت التصويت. من ستعدمون؟' },
    { id: 'result', label: 'إعلان نتيجة التصويت', defaultText: 'ظهرت نتيجة التصويت.' },
    { id: 'vote_tie', label: 'النتيجة (تعادل / لا إعدام)', defaultText: 'تعادلت الأصوات ولم تتفق القرية، لذا لن يتم إعدام أحد اليوم.' },
    { id: 'vote_execute', label: 'النتيجة (تنفيذ الإعدام)', defaultText: 'بناءً على تصويت الأغلبية، قررت القرية تنفيذ الإعدام.' },
    { id: 'user_killed_night', label: 'موت اللاعب في الليل', defaultText: 'لقد قتلتك المافيا في الليل.' },
    { id: 'user_executed_day', label: 'إعدام اللاعب في النهار', defaultText: 'لقد قررت القرية إعدامك.' },
    { id: 'game_win_citizen', label: 'انتصار المواطنين', defaultText: 'انتصر المواطنون! لقد قضيتم على المافيا.' },
    { id: 'game_win_mafia', label: 'انتصار المافيا', defaultText: 'انتصرت المافيا! لقد سيطرتم على القرية.' },
    { id: 'end', label: 'انتهاء اللعبة', defaultText: 'انتهت اللعبة.' },
];

export const SoundsPage = () => {
    const { settings, setSettings, setCurrentView } = useGame();
    const [recordingPhase, setRecordingPhase] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = async (phaseId: string) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current);
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = () => {
                    const base64data = reader.result as string;
                    setSettings(prev => ({
                        ...prev,
                        customAudio: {
                            ...(prev.customAudio || {}),
                            [phaseId]: base64data
                        }
                    }));
                };
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setRecordingPhase(phaseId);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("فشل الوصول إلى الميكروفون. يرجى التأكد من منح الصلاحيات اللازمة.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && recordingPhase) {
            mediaRecorderRef.current.stop();
            setRecordingPhase(null);
        }
    };

    const playAudio = (phaseId: string) => {
        const audioData = settings.customAudio?.[phaseId];
        if (audioData) {
            const audio = new Audio(audioData);
            audio.play();
        }
    };

    const deleteAudio = (phaseId: string) => {
        setSettings(prev => {
            const newAudio = { ...prev.customAudio };
            delete newAudio[phaseId];
            return {
                ...prev,
                customAudio: newAudio
            };
        });
    };

    return (
        <div className="w-full h-full p-6 text-gray-900 overflow-y-auto relative" dir="rtl">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => setCurrentView('settings')} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                        <ArrowRight className="w-5 h-5" />
                    </button>
                    <div>
                    <h2 className="text-2xl font-bold mb-2">أصوات اللعبة المخصصة</h2>
                    <p className="text-gray-600 text-sm">قم بتسجيل صوتك الخاص لكل مرحلة من مراحل اللعبة. سيتم تشغيل هذه التسجيلات بدلاً من الصوت الآلي.</p>
                </div>

                </div>
                <div className="space-y-4">
                    {PHASES.map(phase => {
                        const hasCustomAudio = !!settings.customAudio?.[phase.id];
                        const isRecording = recordingPhase === phase.id;

                        return (
                            <div key={phase.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900">{phase.label}</h3>
                                    <p className="text-xs text-gray-500 mt-1 italic">النص الافتراضي: "{phase.defaultText}"</p>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    {isRecording ? (
                                        <button 
                                            onClick={stopRecording}
                                            className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition-colors animate-pulse font-medium text-sm"
                                        >
                                            <Square className="w-4 h-4 fill-current" /> إيقاف التسجيل
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => startRecording(phase.id)}
                                            disabled={recordingPhase !== null}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium text-sm ${recordingPhase !== null ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'}`}
                                        >
                                            <Mic className="w-4 h-4" /> {hasCustomAudio ? 'إعادة التسجيل' : 'تسجيل'}
                                        </button>
                                    )}

                                    {hasCustomAudio && !isRecording && (
                                        <>
                                            <button 
                                                onClick={() => playAudio(phase.id)}
                                                className="p-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors"
                                                title="تشغيل"
                                            >
                                                <Play className="w-4 h-4 fill-current" />
                                            </button>
                                            <button 
                                                onClick={() => deleteAudio(phase.id)}
                                                className="p-2 bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-lg transition-colors"
                                                title="حذف"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
