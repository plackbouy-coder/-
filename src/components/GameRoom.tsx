import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Eye, Shield, Target, Search, MessageSquare, Gavel, Home, Volume2, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Role = 'mafia' | 'doctor' | 'detective' | 'citizen';
type Phase = 'selection' | 'revealing' | 'night_mafia' | 'night_doctor' | 'night_detective' | 'day' | 'voting' | 'result' | 'end';

interface Player {
    id: number;
    name: string;
    role: Role | null;
    isAlive: boolean;
    isUser: boolean;
    avatar?: string;
}

const ROLES: Role[] = ['mafia', 'mafia', 'doctor', 'detective', 'citizen', 'citizen', 'citizen', 'citizen', 'citizen', 'citizen'];

const GAME_TIPS = [
    "سر: المحقق يمكنه كشف شخص واحد كل ليلة، استخدم هذه المعلومة بحذر.",
    "سر: الطبيب لا يمكنه حماية نفسه دائماً، نسق مع الآخرين.",
    "نصيحة: المافيا تفوز إذا تساوى عددها مع عدد المواطنين.",
    "نصيحة: كمواطن، راقب تصويت الآخرين لتكتشف التحالفات السرية.",
    "سر: بعض اللاعبين قد يدعون أنهم أطباء ليحموا أنفسهم.",
    "نصيحة: الصمت في النهار قد يجعلك مشتبهاً به.",
    "سر: المافيا تعرف بعضها البعض، راقب من يتجنب التصويت ضد الآخر.",
    "نصيحة: لا تكشف عن دورك الحقيقي مبكراً إذا كنت محققاً.",
    "نصيحة: كطبيب، حاول حماية الأشخاص النشطين في النقاش.",
    "سر: القرارات السريعة في التصويت غالباً ما تقف خلفها المافيا.",
    "نصيحة: النقاش هو سلاح المواطنين الوحيد، لا تضيعه.",
    "نصيحة: إذا كنت مافيا، حاول أن تبدو متعاوناً في البحث عن المافيا.",
    "سر: التردد في الدفاع عن شخص بريء قد يكشف هويتك الحقيقية.",
    "نصيحة: المحقق يجب أن يشارك المعلومات بذكاء دون فضح نفسه.",
    "نصيحة: المافيا قد تضحي بأحد أفرادها لكسب ثقة القرية.",
    "سر: تغيير التصويت في اللحظة الأخيرة تكتيك معروف للمافيا.",
    "نصيحة: الإجماع السريع على إعدام شخص قد يكون فخاً.",
    "نصيحة: حاول قراءة ردود أفعال اللاعبين عند اتهامهم.",
    "سر: الطبيب يمكنه تغيير مجرى اللعبة بإنقاذ المحقق.",
    "نصيحة: كمواطن، ابحث عن التناقضات في أقوال الآخرين.",
    "نصيحة: المافيا تحاول دائماً تشتيت الانتباه عن أفرادها.",
    "سر: اللعب الهادئ قد يكون خطيراً بقدر اللعب الهجومي.",
    "نصيحة: لا تثق بمن يوافق على كل شيء بسهولة.",
    "نصيحة: إذا كنت مافيا، اختر ضحاياك من بين اللاعبين المؤثرين.",
    "سر: المواطنون يفوزون بالمنطق، والمافيا تفوز بالخداع.",
    "نصيحة: احتفظ بملاحظات حول من صوت لمن في الجولات السابقة.",
    "نصيحة: المحقق المزيف تكتيك شائع، احذر منه.",
    "سر: الخوف من الموت قد يدفع المواطنين للتصويت بعشوائية.",
    "نصيحة: التعاون هو مفتاح فوز المواطنين.",
    "نصيحة: استمتع باللعبة ولا تأخذ الاتهامات بشكل شخصي!"
];

export const GameRoom = () => {
    const { setCurrentView, settings } = useGame();
    
    const [phase, setPhase] = useState<Phase>('selection');
    const [timer, setTimer] = useState(20);
    const [round, setRound] = useState(1);
    
    const [players, setPlayers] = useState<Player[]>([]);
    const [userRole, setUserRole] = useState<Role | null>(null);
    const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
    
    // Night actions
    const [nightTargets, setNightTargets] = useState<{mafia: number | null, doctor: number | null, detective: number | null}>({mafia: null, doctor: null, detective: null});
    
    // Voting
    const [voteTarget, setVoteTarget] = useState<number | null>(null);

    // Chat messages
    const [messages, setMessages] = useState<{sender: string, text: string, isSystem?: boolean}[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [showChatMobile, setShowChatMobile] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [isConfirmExitOpen, setIsConfirmExitOpen] = useState(false);
    const [isVotingOpen, setIsVotingOpen] = useState(false);
    const [votes, setVotes] = useState<Record<number, number>>({});
    const [hasVoted, setHasVoted] = useState(false);
    const [voteTimer, setVoteTimer] = useState(30);
    const [speakingPlayers, setSpeakingPlayers] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (phase === 'voting') {
            setIsVotingOpen(true);
            setVoteTimer(30);
            setHasVoted(false);
            setVotes({});
        } else {
            setIsVotingOpen(false);
        }
    }, [phase]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isVotingOpen && voteTimer > 0) {
            interval = setInterval(() => setVoteTimer(prev => prev - 1), 1000);
        } else if (isVotingOpen && voteTimer === 0) {
            setIsVotingOpen(false);
        }
        return () => clearInterval(interval);
    }, [isVotingOpen, voteTimer]);

    // Microphone simulation and real audio analysis
    const [isMicActive, setIsMicActive] = useState(false);
    
    const handleToggleMic = () => {
        const nextMicState = !isMicActive;
        setIsMicActive(nextMicState);
        const userId = players.find(p => p.isUser)?.id;
        if (userId) {
            setSpeakingPlayers(prev => {
                const next = new Set(prev);
                if (nextMicState) next.add(userId);
                else next.delete(userId);
                return next;
            });
        }
    };
    const [voiceLevel, setVoiceLevel] = useState(0);
    const [useCustomVoice, setUseCustomVoice] = useState(true);
    const audioContextRef = React.useRef<AudioContext | null>(null);
    const analyserRef = React.useRef<AnalyserNode | null>(null);
    const micStreamRef = React.useRef<MediaStream | null>(null);
    const animationFrameRef = React.useRef<number | null>(null);

    // Simulated talking states for AI bots
    const [speakingBotId, setSpeakingBotId] = useState<number | null>(null);

    useEffect(() => {
        if (isMicActive) {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    micStreamRef.current = stream;
                    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                    const ctx = new AudioContextClass();
                    audioContextRef.current = ctx;
                    
                    const source = ctx.createMediaStreamSource(stream);
                    const analyser = ctx.createAnalyser();
                    analyser.fftSize = 64;
                    source.connect(analyser);
                    analyserRef.current = analyser;

                    const bufferLength = analyser.frequencyBinCount;
                    const dataArray = new Uint8Array(bufferLength);

                    const updateVolume = () => {
                        if (!analyserRef.current) return;
                        analyserRef.current.getByteFrequencyData(dataArray);
                        let sum = 0;
                        for (let i = 0; i < bufferLength; i++) {
                            sum += dataArray[i];
                        }
                        const average = sum / bufferLength;
                        setVoiceLevel(Math.min(100, Math.round((average / 32) * 100))); // Scaled for normal talking sensitivity
                        animationFrameRef.current = requestAnimationFrame(updateVolume);
                    };
                    updateVolume();
                })
                .catch(err => {
                    console.error("Error accessing microphone:", err);
                    alert("فشل تشغيل الميكروفون. يرجى التحقق من الصلاحيات ومنح الإذن للمتصفح.");
                    setIsMicActive(false);
                });
        } else {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (micStreamRef.current) {
                micStreamRef.current.getTracks().forEach(track => track.stop());
            }
            if (audioContextRef.current) {
                audioContextRef.current.close().catch(()=>{});
            }
            setVoiceLevel(0);
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (micStreamRef.current) {
                micStreamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [isMicActive]);

    // Simulate other players turning on their mics and talking sometimes during day discussion
    useEffect(() => {
        let speakTimeout: NodeJS.Timeout;
        if (phase === 'day' && gameStarted) {
            const triggerBotSpeak = () => {
                const aliveBots = players.filter(p => p.isAlive && !p.isUser);
                if (aliveBots.length > 0 && Math.random() > 0.4) {
                    const randomBot = aliveBots[Math.floor(Math.random() * aliveBots.length)];
                    setSpeakingBotId(randomBot.id);
                    
                    // Stop speaking after 3-5 seconds
                    speakTimeout = setTimeout(() => {
                        setSpeakingBotId(null);
                        // schedule next speak
                        const nextDelay = 6000 + Math.random() * 8000;
                        speakTimeout = setTimeout(triggerBotSpeak, nextDelay);
                    }, 3000 + Math.random() * 2000);
                } else {
                    const nextDelay = 4000 + Math.random() * 4000;
                    speakTimeout = setTimeout(triggerBotSpeak, nextDelay);
                }
            };

            speakTimeout = setTimeout(triggerBotSpeak, 6000);
        } else {
            setSpeakingBotId(null);
        }

        return () => clearTimeout(speakTimeout);
    }, [phase, gameStarted, players]);

    const handleExit = () => {
        setIsConfirmExitOpen(true);
    };

    const speak = (text: string, phaseId?: string) => {
        if (useCustomVoice && phaseId && settings.customAudio?.[phaseId]) {
            const audio = new Audio(settings.customAudio[phaseId]);
            audio.volume = (settings.volume ?? 80) / 100;
            audio.play().catch(e => {
                console.error("Error playing custom audio:", e);
                playTTS(text);
            });
            return;
        }
        playTTS(text);
    };

    const playTTS = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ar-SA';
            utterance.rate = 0.9;
            utterance.volume = (settings.volume ?? 80) / 100;
            window.speechSynthesis.speak(utterance);
        }
    };

    useEffect(() => {
        if (!gameStarted) return;
        if (phase === 'selection') {
            speak('أهلاً بكم في ليالي الشك. يرجى من الجميع اختيار بطاقة للبدء.', 'selection');
        } else if (phase === 'revealing') {
            speak('تم توزيع الأدوار. تفقد دورك جيداً.', 'revealing');
            
            setTimeout(() => {
                if (userRole === 'mafia') speak('أنت فرد من عصابة المافيا. ميزتك هي اختيار ضحية لقتلها في كل ليلة بالتعاون مع أفراد المافيا الآخرين.', 'role_mafia');
                else if (userRole === 'doctor') speak('أنت الطبيب. ميزتك هي اختيار شخص واحد كل ليلة لحمايته من القتل.', 'role_doctor');
                else if (userRole === 'detective') speak('أنت المحقق. ميزتك هي التحقيق من هوية شخص واحد كل ليلة لمعرفة ما إذا كان من المافيا أم لا.', 'role_detective');
                else if (userRole === 'citizen') speak('أنت مواطن صالح. ليس لديك قدرات ليلية، لكن يمكنك النقاش والتصويت في النهار لإعدام المافيا.', 'role_citizen');
            }, 3000);
        } else if (phase === 'night_mafia') {
            speak('حل الظلام. المافيا، استيقظوا واختاروا ضحيتكم.', 'night_mafia');
        } else if (phase === 'night_doctor') {
            if (userRole === 'mafia' && players.find(p => p.isUser)?.isAlive) {
                speak('تم اختيار الضحية. الطبيب، الآن قم بشفاء مستخدم.', 'night_doctor');
            } else {
                speak('المافيا اختارت ضحيتها. الطبيب، استيقظ واختر شخصاً لحمايته.', 'night_doctor');
            }
        } else if (phase === 'night_detective') {
            if (userRole === 'doctor' && players.find(p => p.isUser)?.isAlive) {
                speak('الطبيب قام بشفاء مستخدم. أيها المحقق، اسأل عن مستخدم، هل هو مافيا أم لا؟', 'night_detective');
            } else {
                speak('الطبيب اختار. المحقق، استيقظ واختر شخصاً للتحقيق عنه.', 'night_detective');
            }
        } else if (phase === 'day') {
            speak('أشرقت الشمس. حان وقت النقاش، من تعتقدون أنه المافيا؟', 'day');
        } else if (phase === 'voting') {
            speak('انتهى وقت النقاش. حان وقت التصويت. من ستعدمون؟', 'voting');
        } else if (phase === 'result') {
            speak('ظهرت نتيجة التصويت.', 'result');
        } else if (phase === 'end') {
            speak('انتهت اللعبة.', 'end');
        }
    }, [phase]);

    useEffect(() => {
        // Initialize game when selection starts
        if (phase === 'selection' && players.length === 0) {
            const initialPlayers = Array.from({ length: 10 }).map((_, i) => ({
                id: i,
                name: i === 0 ? (settings.displayName || 'أنت') : `اللاعب ${i + 1}`,
                role: null,
                isAlive: true,
                isUser: i === 0,
                avatar: i === 0 ? settings.profileImage : `https://api.dicebear.com/7.x/bottts/svg?seed=player${i}`
            }));
            setPlayers(initialPlayers);
            setMessages([{ sender: 'قائد اللعبة', text: 'أهلاً بكم في ليالي الشك. يرجى من الجميع اختيار بطاقة للبدء.', isSystem: true }]);
        }
    }, [phase, players, settings.displayName]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0 && phase !== 'end') {
            interval = setInterval(() => setTimer(prev => prev - 1), 1000);
        } else if (timer === 0) {
            handlePhaseTransition();
        }
        return () => clearInterval(interval);
    }, [timer, phase]);

    const handlePhaseTransition = () => {
        const randomTip = GAME_TIPS[Math.floor(Math.random() * GAME_TIPS.length)];
        
        switch (phase) {
            case 'selection':
                if (selectedCardIndex === null) {
                    handleSelectCard(Math.floor(Math.random() * 10));
                }
                break;
            case 'revealing':
                setPhase('night_mafia');
                setTimer(10);
                setNightTargets({mafia: null, doctor: null, detective: null});
                setMessages(prev => [
                    ...prev, 
                    { sender: 'قائد اللعبة', text: `حلّ الظلام وبدأت الليلة ${round}. المافيا، استيقظوا.`, isSystem: true },
                    { sender: 'قائد اللعبة', text: randomTip, isSystem: true }
                ]);
                break;
            case 'night_mafia':
                // Bots logic for mafia
                let mTarget = nightTargets.mafia;
                if (!players.find(p => p.role === 'mafia' && p.isUser && p.isAlive) || mTarget === null) {
                    const alive = players.filter(p => p.isAlive && p.role !== 'mafia');
                    if (alive.length > 0) mTarget = alive[Math.floor(Math.random() * alive.length)].id;
                }
                setNightTargets(prev => ({...prev, mafia: mTarget}));
                
                setPhase('night_doctor');
                setTimer(userRole === 'doctor' && players.find(p => p.isUser)?.isAlive ? 10 : 6);
                break;
            case 'night_doctor':
                // Bots logic for doctor
                let docTarget = nightTargets.doctor;
                if (!players.find(p => p.role === 'doctor' && p.isUser && p.isAlive) || docTarget === null) {
                    const alive = players.filter(p => p.isAlive);
                    if (alive.length > 0) docTarget = alive[Math.floor(Math.random() * alive.length)].id;
                }
                setNightTargets(prev => ({...prev, doctor: docTarget}));
                
                setPhase('night_detective');
                setTimer(userRole === 'detective' && players.find(p => p.isUser)?.isAlive ? 10 : 6);
                break;
            case 'night_detective':
                // Resolve night actions (simulated)
                let killedPlayerId = nightTargets.mafia; // This will use the state from previous transitions! Wait, the state updates are asynchronous.
                // Let's calculate directly here to avoid stale state.
                
                let finalMafiaTarget = nightTargets.mafia;
                if (!players.find(p => p.role === 'mafia' && p.isUser && p.isAlive) || finalMafiaTarget === null) {
                    const alive = players.filter(p => p.isAlive && p.role !== 'mafia');
                    if (alive.length > 0) finalMafiaTarget = alive[Math.floor(Math.random() * alive.length)].id;
                }
                
                let finalDoctorTarget = nightTargets.doctor;
                if (!players.find(p => p.role === 'doctor' && p.isUser && p.isAlive) || finalDoctorTarget === null) {
                    const alive = players.filter(p => p.isAlive);
                    if (alive.length > 0) finalDoctorTarget = alive[Math.floor(Math.random() * alive.length)].id;
                }

                if (finalDoctorTarget === finalMafiaTarget) {
                    killedPlayerId = null; // Saved!
                } else {
                    killedPlayerId = finalMafiaTarget;
                }

                if (killedPlayerId !== null) {
                    const killedPlayer = players.find(p => p.id === killedPlayerId);
                    setPlayers(prev => prev.map(p => p.id === killedPlayerId ? { ...p, isAlive: false } : p));
                    setMessages(prev => [...prev, { sender: 'قائد اللعبة', text: `أشرقت الشمس... ولكن للأسف وجدنا أن ${killedPlayer?.name} قد قُتل الليلة الماضية!`, isSystem: true }]);
                    speak('أشرقت الشمس... ولكن للأسف وجدنا جريمة قتل الليلة الماضية!', 'morning_kill');
                    if (killedPlayer?.isUser) {
                        setTimeout(() => speak('لقد قتلتك المافيا في الليل.', 'user_killed_night'), 4000);
                    }
                } else {
                    setMessages(prev => [...prev, { sender: 'قائد اللعبة', text: `أشرقت الشمس على القرية بسلام، لم يُقتل أحد الليلة الماضية.`, isSystem: true }]);
                    speak('أشرقت الشمس على القرية بسلام، لم يُقتل أحد الليلة الماضية.', 'morning_no_kill');
                }

                checkWinCondition();
                
                if (phase !== 'end') {
                    setPhase('day');
                    setTimer(90);
                    setVoteTarget(null);
                    setMessages(prev => [...prev, { sender: 'قائد اللعبة', text: `الآن حان وقت النقاش. أمامكم وقت كافٍ لاكتشاف المافيا.`, isSystem: true }]);
                }
                break;
            case 'day':
                setPhase('voting');
                setTimer(30);
                setMessages(prev => [...prev, { sender: 'قائد اللعبة', text: `انتهى وقت النقاش. حان وقت التصويت! من تعتقدون أنه المافيا؟`, isSystem: true }]);
                break;
            case 'voting':
                // Simulate AI voting
                const alive = players.filter(p => p.isAlive);
                const votes: Record<number, number> = {};
                alive.forEach(p => {
                    if (p.isUser && voteTarget !== null) {
                        votes[voteTarget] = (votes[voteTarget] || 0) + 1;
                    } else if (!p.isUser) {
                        // Random vote for another alive player
                        const others = alive.filter(o => o.id !== p.id);
                        if (others.length > 0) {
                            const v = others[Math.floor(Math.random() * others.length)].id;
                            votes[v] = (votes[v] || 0) + 1;
                        }
                    }
                });

                let maxVotes = 0;
                let executedId: number | null = null;
                for (const [id, count] of Object.entries(votes)) {
                    if (count > maxVotes) {
                        maxVotes = count;
                        executedId = parseInt(id);
                    } else if (count === maxVotes) {
                        executedId = null; // Tie
                    }
                }

                if (executedId !== null) {
                    const executedPlayer = players.find(p => p.id === executedId);
                    setPlayers(prev => prev.map(p => p.id === executedId ? { ...p, isAlive: false } : p));
                    setMessages(prev => [...prev, { sender: 'قائد اللعبة', text: `بناءً على تصويت الأغلبية، قررت القرية إعدام ${executedPlayer?.name}.`, isSystem: true }]);
                    speak('بناءً على تصويت الأغلبية، قررت القرية تنفيذ الإعدام.', 'vote_execute');
                    if (executedPlayer?.isUser) {
                        setTimeout(() => speak('لقد قررت القرية إعدامك.', 'user_executed_day'), 4000);
                    }
                } else {
                    setMessages(prev => [...prev, { sender: 'قائد اللعبة', text: `تعادلت الأصوات ولم تتفق القرية، لذا لن يتم إعدام أحد اليوم.`, isSystem: true }]);
                    speak('تعادلت الأصوات ولم تتفق القرية، لذا لن يتم إعدام أحد اليوم.', 'vote_tie');
                }

                setPhase('result');
                setTimer(15);
                checkWinCondition();
                break;
            case 'result':
                if (phase !== 'end') {
                    setRound(prev => prev + 1);
                    setPhase('night_mafia');
                    setTimer(10);
                    setNightTargets({mafia: null, doctor: null, detective: null});
                    setMessages(prev => [
                        ...prev, 
                        { sender: 'قائد اللعبة', text: `انتهى اليوم، وانتقلنا إلى الجولة التالية (الليل). استعدوا! المافيا، استيقظوا.`, isSystem: true },
                        { sender: 'قائد اللعبة', text: randomTip, isSystem: true }
                    ]);
                }
                break;
        }
    };

    const checkWinCondition = () => {
        // Evaluate after states updates
        setTimeout(() => {
            setPlayers(currentPlayers => {
                const alive = currentPlayers.filter(p => p.isAlive);
                const mafias = alive.filter(p => p.role === 'mafia').length;
                const citizens = alive.length - mafias;

                if (mafias === 0) {
                    setPhase('end');
                    setMessages(prev => [...prev, { sender: 'قائد اللعبة', text: `أعلن انتهاء اللعبة! انتصر المواطنون وتم القضاء على جميع أفراد المافيا بنجاح. أحسنتم!`, isSystem: true }]);
                    speak('انتصر المواطنون! لقد قضيتم على المافيا.', 'game_win_citizen');
                } else if (mafias >= citizens) {
                    setPhase('end');
                    setMessages(prev => [...prev, { sender: 'قائد اللعبة', text: `أعلن انتهاء اللعبة! انتصرت المافيا وسيطرت على القرية بالكامل. حظاً أوفر للمواطنين في المرة القادمة!`, isSystem: true }]);
                    speak('انتصرت المافيا! لقد سيطرتم على القرية.', 'game_win_mafia');
                }
                return currentPlayers;
            });
        }, 100);
    };

    const handleSelectCard = (index: number) => {
        if (selectedCardIndex !== null) return;
        setSelectedCardIndex(index);
        
        speak('تم اختيار البطاقة، جاري توزيع الأدوار.', 'card_selected');
        
        // Assign roles
        const shuffledRoles = [...ROLES].sort(() => Math.random() - 0.5);
        const newPlayers = [...players];
        newPlayers.forEach((p, i) => {
            p.role = shuffledRoles[i];
            if (p.isUser) setUserRole(shuffledRoles[i]);
        });
        setPlayers(newPlayers);
        
        setPhase('revealing');
        setTimer(10);
    };

    const handleAction = (targetId: number) => {
        if (phase === 'night_mafia') {
            setNightTargets(prev => ({...prev, mafia: targetId}));
            setTimer(1);
        } else if (phase === 'night_doctor') {
            setNightTargets(prev => ({...prev, doctor: targetId}));
            setTimer(1);
        } else if (phase === 'night_detective') {
            if (nightTargets.detective === null) {
                setNightTargets(prev => ({...prev, detective: targetId}));
                const isMafia = players.find(p => p.id === targetId)?.role === 'mafia';
                if (isMafia) {
                    speak('نعم، هذا المستخدم من المافيا.', 'detective_yes');
                    setMessages(prev => [...prev, { sender: 'النظام', text: `(سر المحقق) نعم، ${players.find(p => p.id === targetId)?.name} من المافيا!`, isSystem: true }]);
                } else {
                    speak('لا، هذا ليس هو المستخدم المطلوب، ليس أحد أعضاء المافيا.', 'detective_no');
                    setMessages(prev => [...prev, { sender: 'النظام', text: `(سر المحقق) لا، ${players.find(p => p.id === targetId)?.name} ليس من المافيا.`, isSystem: true }]);
                }
                setTimer(3);
            }
        } else if (phase === 'voting') {
            setVoteTarget(targetId);
        }
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;
        setMessages(prev => [...prev, { sender: 'أنت', text: chatInput.trim() }]);
        setChatInput('');
        
        // AI response simulation
        setTimeout(() => {
            if (Math.random() > 0.3 && (phase === 'day' || phase === 'voting')) {
                const aliveBots = players.filter(p => p.isAlive && !p.isUser);
                if (aliveBots.length > 0) {
                    const bot = aliveBots[Math.floor(Math.random() * aliveBots.length)];
                    const responses = [
                        "أنا أثق بك.", "لا أعتقد ذلك.", "من تظنون أنه المافيا؟", "أنا مجرد مواطن صالح!", "تصرفاتك مريبة.", 
                        "هل لاحظتم كيف يتصرف هذا الشخص؟", "أظن أننا يجب أن نصوت بحذر.", "أرجوكم لا تتسرعوا في الحكم.",
                        "لدي شكوك قوية.", "يجب أن نتعاون لنجد المافيا."
                    ];
                    setMessages(prev => [...prev, { sender: bot.name, text: responses[Math.floor(Math.random() * responses.length)] }]);
                }
            }
        }, 1500);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const renderRoleDescription = () => {
        switch (userRole) {
            case 'mafia': return 'أنت فرد من عصابة المافيا. استهدف المواطنين ليلاً وحاول عدم لفت الانتباه نهاراً.';
            case 'doctor': return 'أنت الطبيب. يمكنك حماية شخص واحد كل ليلة من القتل.';
            case 'detective': return 'أنت المحقق. يمكنك كشف هوية شخص واحد كل ليلة.';
            case 'citizen': return 'أنت مواطن صالح. حاول العثور على المافيا وإعدامهم نهاراً.';
            default: return '';
        }
    };

    if (!gameStarted) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-slate-950 text-slate-100 relative" dir={settings.language === 'ar' ? 'rtl' : 'ltr'}>
                <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center shadow-2xl animate-in fade-in duration-500">
                    <div className="w-16 h-16 bg-indigo-600/10 rounded-full flex items-center justify-center mb-6 border border-indigo-500/20">
                        <Volume2 className="w-8 h-8 text-indigo-400 animate-pulse" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black mb-3 text-slate-100">ليالي الشك</h2>
                    <p className="text-sm text-slate-400 mb-8 leading-relaxed">
                        استعد لتجربة غامضة ومثيرة. اضغط على الزر أدناه لتفعيل الأصوات والمؤثرات المخصصة وبدء اختيار الأدوار وسماع توجيهات قائد اللعبة.
                    </p>
                    
                    <button 
                        onClick={() => {
                            // Play silent audio to unlock sound in modern browsers
                            const a = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA");
                            a.volume = 0.01;
                            a.play().catch(()=>{});
                            
                            setGameStarted(true);
                            speak('أهلاً بكم في ليالي الشك. يرجى من الجميع اختيار بطاقة للبدء.', 'selection');
                        }} 
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 px-6 rounded-xl shadow-lg hover:shadow-indigo-500/20 transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base border border-indigo-500/30"
                    >
                        <span>دخول اللعبة وتشغيل الأصوات 🔊</span>
                    </button>
                    
                    <button onClick={() => setCurrentView('lobby')} className="mt-4 text-xs text-slate-500 hover:text-slate-300 transition-colors">
                        العودة لساحة الانتظار
                    </button>
                </div>
            </div>
        );
    }

    if (phase === 'selection') {
        return (
            <div className="w-full h-full p-4 sm:p-6 flex flex-col items-center justify-center bg-slate-950 text-slate-100 relative pb-20" dir={settings.language === 'ar' ? 'rtl' : 'ltr'}>
                <div className="bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-2xl shadow-xl w-full max-w-lg text-center mb-6 animate-in fade-in duration-300">
                    <h2 className="text-lg sm:text-xl font-black text-indigo-400 mb-1">اختر بطاقتك</h2>
                    <p className="text-slate-400 text-xs sm:text-sm">الوقت المتبقي لتبدأ اللعبة تلقائياً: {timer} ثانية</p>
                </div>
                <div className="grid grid-cols-5 gap-2 sm:gap-3 max-w-lg w-full mb-4">
                    {[...Array(10)].map((_, i) => (
                        <motion.button 
                            key={i} 
                            onClick={() => handleSelectCard(i)} 
                            disabled={selectedCardIndex !== null} 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`aspect-square bg-slate-900 border-2 border-slate-800 rounded-xl flex items-center justify-center font-bold text-lg sm:text-xl text-slate-400 hover:bg-slate-850 hover:border-indigo-500/50 shadow transition-all ${
                                selectedCardIndex === i ? 'bg-indigo-600 text-white border-indigo-600 scale-105 shadow-indigo-600/20' : ''
                            }`}
                        >
                            ?
                        </motion.button>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 border-t border-slate-800 p-2.5 px-4 flex items-center justify-between backdrop-blur-md shadow-2xl">
                    <span className="text-xs text-slate-500">اختر بطاقة لتبدأ اللعبة...</span>
                    <button onClick={handleExit} className="flex items-center gap-1.5 bg-red-950/50 hover:bg-red-950/80 text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-red-900/40 shadow-sm">
                        <Home className="w-3.5 h-3.5" /> الخروج من المباراة
                    </button>
                </div>
            </div>
        );
    }
    
    if (phase === 'revealing') {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-950 text-slate-100 relative pb-20" dir={settings.language === 'ar' ? 'rtl' : 'ltr'}>
                <div className="w-72 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center shadow-2xl mb-6 transform transition-transform animate-in zoom-in duration-500">
                    <div className="w-16 h-16 bg-slate-950 rounded-full flex items-center justify-center mb-4 border border-slate-800">
                        {userRole === 'mafia' && <Target className="w-8 h-8 text-red-500 animate-pulse" />}
                        {userRole === 'doctor' && <Shield className="w-8 h-8 text-green-500 animate-pulse" />}
                        {userRole === 'detective' && <Search className="w-8 h-8 text-blue-500 animate-pulse" />}
                        {userRole === 'citizen' && <Eye className="w-8 h-8 text-gray-400 animate-pulse" />}
                    </div>
                    <h3 className="text-xl font-black mb-3 text-indigo-400">
                        {userRole === 'mafia' && 'مافيا'}
                        {userRole === 'doctor' && 'طبيب'}
                        {userRole === 'detective' && 'محقق'}
                        {userRole === 'citizen' && 'مواطن صالح'}
                    </h3>
                    <p className="text-center text-xs text-slate-300 font-medium leading-relaxed">{renderRoleDescription()}</p>
                </div>
                
                <div className="bg-indigo-950/60 text-indigo-300 border border-indigo-900/50 px-4 py-2 rounded-full font-bold shadow-md flex items-center gap-3 text-xs">
                    <span>يبدأ اللعب بعد: {timer} ثانية</span>
                    <button onClick={() => setTimer(0)} className="text-[10px] bg-indigo-900/80 hover:bg-indigo-800 text-indigo-200 px-2.5 py-0.5 rounded transition-colors">البدء فوراً</button>
                </div>

                {/* Bottom Bar */}
                <div className="fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 border-t border-slate-800 p-2.5 px-4 flex items-center justify-between backdrop-blur-md shadow-2xl">
                    <div className="flex items-center gap-1 text-xs">
                        <span className="text-slate-500">دورك:</span>
                        <span className={`font-black ${userRole === 'mafia' ? 'text-red-400' : userRole === 'doctor' ? 'text-green-400' : userRole === 'detective' ? 'text-blue-400' : 'text-slate-300'}`}>
                            {userRole === 'mafia' ? 'مافيا' : userRole === 'doctor' ? 'طبيب' : userRole === 'detective' ? 'محقق' : 'مواطن صالح'}
                        </span>
                    </div>
                    <button onClick={handleExit} className="flex items-center gap-1.5 bg-red-950/50 hover:bg-red-950/80 text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-red-900/40 shadow-sm">
                        <Home className="w-3.5 h-3.5" /> الخروج من المباراة
                    </button>
                </div>
            </div>
        );
    }

    const phaseNames = {
        'night_mafia': 'الليل (دور المافيا)',
        'night_doctor': 'الليل (دور الطبيب)',
        'night_detective': 'الليل (دور المحقق)',
        'day': 'النهار (نقاش)',
        'voting': 'التصويت',
        'result': 'النتيجة',
        'end': 'النهاية'
    };

    const isNightPhase = phase.startsWith('night_');
    const isUserDead = !players.find(p => p.isUser)?.isAlive;

    return (
        <div className="w-full h-full bg-slate-950 text-slate-100 flex flex-col p-2 sm:p-4 pb-16 lg:pb-16 lg:flex-row gap-3 overflow-hidden" dir={settings.language === 'ar' ? 'rtl' : 'ltr'}>
            
            {/* Main Game Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="bg-slate-900/90 backdrop-blur rounded-xl p-2 px-3 sm:p-3 sm:px-4 flex items-center justify-between shadow-md mb-3 border border-slate-800">
                    <div className="flex items-center gap-2">
                        <div className="bg-slate-900 px-2.5 py-1 rounded-lg text-base sm:text-lg font-mono font-bold text-indigo-400 tracking-wider flex items-center gap-1 border border-indigo-500/20 shadow-inner">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
                            {formatTime(timer)}
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] sm:text-xs font-black tracking-widest text-indigo-400 uppercase">
                            الجولة {round} • {isNightPhase ? 'الليل 🌙' : 'النهار ☀️'}
                        </span>
                        <h2 className="text-xs sm:text-sm font-bold text-slate-100 mt-0.5">
                            {phaseNames[phase as keyof typeof phaseNames] || phase}
                        </h2>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold border border-emerald-500/20">
                            <span>حي:</span>
                            <span>{players.filter(p => p.isAlive).length}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-red-500/10 text-red-400 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold border border-red-500/20">
                            <span>ميت:</span>
                            <span>{players.filter(p => !p.isAlive).length}</span>
                        </div>
                    </div>
                </div>

                {/* Player Grid (Responsive layout and ultra-compact responsive cards) */}
                <motion.div 
                    key={phase}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-3 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1.5 sm:gap-2 flex-1 overflow-y-auto pb-4 custom-scrollbar"
                >
                        {players.map(player => {
                            const isVisibleToMafia = userRole === 'mafia' && player.role === 'mafia';
                            const showRole = player.isUser || !player.isAlive || phase === 'end' || isVisibleToMafia;
                            return (
                                <div key={player.id} className={`bg-slate-900/80 rounded-xl p-2 sm:p-2.5 border flex flex-col justify-between relative transition-all duration-200 ${!player.isAlive ? 'border-red-950/40 bg-slate-950/60 opacity-50' : 'border-slate-800'} ${(nightTargets.mafia === player.id || nightTargets.doctor === player.id || nightTargets.detective === player.id || voteTarget === player.id) ? 'ring-2 ring-indigo-500 border-indigo-500' : ''}`}>
                                    
                                    <div className="flex items-center justify-between mb-1.5 text-[9px] sm:text-[10px]">
                                        <Eye className={`w-3.5 h-3.5 ${showRole ? 'text-indigo-400' : 'text-slate-600'}`} />
                                        <span className={`font-black px-1.5 py-0.2 rounded-full ${player.isAlive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                                            {player.isAlive ? 'حي' : 'ميت'}
                                        </span>
                                    </div>

                                    <div className="relative text-center mb-1.5 flex flex-col items-center">
                                        {speakingPlayers.has(player.id) && (
                                            <motion.div
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: [1, 1.2, 1], opacity: 1 }}
                                                transition={{ repeat: Infinity, duration: 1.5 }}
                                                className="absolute -top-1 right-3 bg-emerald-500 rounded-full p-0.5 shadow-lg border border-white"
                                            >
                                                <Mic className="w-2.5 h-2.5 text-white" />
                                            </motion.div>
                                        )}
                                        {isVotingOpen && votes[player.id] > 0 && (
                                            <div className="absolute -bottom-1 -left-1 bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold border border-white shadow-sm z-10">
                                                {votes[player.id]}
                                            </div>
                                        )}
                                        {player.avatar ? (
                                            <img src={player.avatar} alt={player.name} className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full mb-1 object-cover border-2 ${!player.isAlive ? 'border-red-950 grayscale' : speakingPlayers.has(player.id) ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-slate-800'}`} />
                                        ) : (
                                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full mb-1 flex items-center justify-center border-2 ${!player.isAlive ? 'bg-slate-950 border-slate-950 text-slate-600' : speakingPlayers.has(player.id) ? 'bg-emerald-500/20 border-emerald-500' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>
                                                <span className="font-bold text-xs sm:text-sm">{player.name.substring(0, 1)}</span>
                                            </div>
                                        )}
                                        <h3 className="font-bold text-xs text-slate-100 mb-0.5 line-clamp-1">{player.name} {player.isUser && <span className="text-[9px] text-indigo-400 font-medium">(أنت)</span>}</h3>
                                        <p className="text-[10px] text-slate-400 italic">
                                            {showRole ? (
                                                <span className={player.role === 'mafia' ? 'text-red-400' : player.role === 'doctor' ? 'text-green-400' : player.role === 'detective' ? 'text-blue-400' : 'text-slate-300'}>
                                                    {player.role === 'mafia' ? 'مافيا' : player.role === 'doctor' ? 'طبيب' : player.role === 'detective' ? 'محقق' : 'مواطن صالح'}
                                                </span>
                                            ) : 'الدور مخفي'}
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    {player.isAlive && isNightPhase && userRole && userRole !== 'citizen' && !player.isUser && players.find(p => p.isUser)?.isAlive && (
                                        <div className="mt-1 flex gap-1 justify-center">
                                            {userRole === 'mafia' && phase === 'night_mafia' && player.role !== 'mafia' && (
                                                <button onClick={() => handleAction(player.id)} className={`py-1 rounded text-[10px] font-bold flex-1 transition-colors ${nightTargets.mafia === player.id ? 'bg-red-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-750'}`}>
                                                    استهداف
                                                </button>
                                            )}
                                            {userRole === 'doctor' && phase === 'night_doctor' && (
                                                <button onClick={() => handleAction(player.id)} className={`py-1 rounded text-[10px] font-bold flex-1 transition-colors ${nightTargets.doctor === player.id ? 'bg-green-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-750'}`}>
                                                    حماية
                                                </button>
                                            )}
                                            {userRole === 'detective' && phase === 'night_detective' && (
                                                <button onClick={() => handleAction(player.id)} className={`py-1 rounded text-[10px] font-bold flex-1 transition-colors ${nightTargets.detective === player.id ? 'bg-blue-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-750'}`}>
                                                    فحص
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {player.isAlive && phase === 'voting' && !player.isUser && players.find(p => p.isUser)?.isAlive && (
                                        <div className="mt-1 flex justify-center">
                                            <button onClick={() => handleAction(player.id)} className={`w-full py-1 rounded text-[10px] font-bold transition-all ${voteTarget === player.id ? 'bg-orange-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-750'}`}>
                                                <Gavel className="w-3 h-3 inline-block ml-1" /> إعدام
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </motion.div>
                
                {phase === 'end' && (
                     <div className="mt-4 flex justify-center">
                        <button onClick={() => setCurrentView('home')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-xl shadow-lg transition-colors text-sm">
                            العودة للرئيسية
                        </button>
                    </div>
                )}
            </div>

            {/* Chat Sidebar (Compact & hideable on mobile) */}
            <div className={`w-full lg:w-80 bg-slate-900 rounded-xl border border-slate-800 flex flex-col shadow-lg shrink-0 ${showChatMobile ? 'flex h-56 mt-1' : 'hidden lg:flex lg:h-auto'} transition-all duration-300`}>
                <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 rounded-t-xl">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-indigo-400" />
                        <h3 className="font-bold text-slate-200 text-xs sm:text-sm">سجل الأحداث والدردشة</h3>
                    </div>
                    {showChatMobile && (
                        <button onClick={() => setShowChatMobile(false)} className="lg:hidden text-slate-400 hover:text-slate-200 text-xs font-bold bg-slate-800 px-2 py-1 rounded-md">
                            إغلاق
                        </button>
                    )}
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`p-2.5 rounded-lg text-xs ${msg.isSystem ? 'bg-slate-950/50 text-slate-400 italic border border-slate-800/40' : msg.sender === 'أنت' ? 'bg-indigo-900/40 text-indigo-100 border border-indigo-800/30 mr-4' : 'bg-slate-800/50 text-slate-200 border border-slate-700/40 ml-4'}`}>
                            {!msg.isSystem && <div className="font-bold text-[10px] opacity-70 mb-0.5">{msg.sender}</div>}
                            {msg.text}
                        </div>
                    ))}
                </div>
                {(phase === 'day' || phase === 'voting') && players.find(p => p.isUser)?.isAlive && (
                    <form onSubmit={handleSendMessage} className="p-2 border-t border-slate-800 bg-slate-900/50 rounded-b-xl flex gap-1.5">
                        <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="اكتب رسالة للمناقشة..." className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors" />
                        <button type="submit" disabled={!chatInput.trim()} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                            إرسال
                        </button>
                    </form>
                )}
            </div>

            {/* Bottom Bar with exit option, role display and action controls */}
            
            {isVotingOpen && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-2xl w-full max-w-sm"
                    >
                        <h3 className="text-xl font-black text-white mb-2 text-center">التصويت للإقصاء</h3>
                        <p className="text-slate-400 text-sm mb-6 text-center">الوقت المتبقي: <span className="font-mono text-indigo-400 font-bold">{voteTimer}</span> ثانية</p>
                        
                        <div className="grid grid-cols-2 gap-3 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {players.filter(p => p.isAlive).map(player => (
                                <button
                                    key={player.id}
                                    disabled={hasVoted}
                                    onClick={() => {
                                        setVotes(prev => ({ ...prev, [player.id]: (prev[player.id] || 0) + 1 }));
                                        setHasVoted(true);
                                    }}
                                    className={`p-2 rounded-lg text-xs font-bold border transition-all ${hasVoted ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-indigo-600 hover:text-white'}`}
                                >
                                    {player.name}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </div>
            )}

            {isConfirmExitOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                   <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl shadow-xl w-full max-w-sm">
                       <h3 className="text-lg font-bold text-white mb-4">تأكيد الخروج</h3>
                       <p className="text-slate-300 mb-6">هل أنت متأكد من مغادرة اللعبة؟ سيتم إنهاء جلستك.</p>
                       <div className="flex gap-4">
                           <button onClick={() => setIsConfirmExitOpen(false)} className="flex-1 bg-slate-700 text-white py-2 rounded-lg font-bold">إلغاء</button>
                           <button onClick={() => { setIsConfirmExitOpen(false); setCurrentView('home'); }} className="flex-1 bg-red-600 text-white py-2 rounded-lg font-bold">مغادرة</button>
                       </div>
                   </div>
                </div>
            )}
            <div className="fixed bottom-0 left-0 right-0 h-14 bg-slate-950/95 backdrop-blur-md border-t border-slate-850 flex items-center justify-between px-4 z-20 shadow-2xl">
                <button onClick={handleExit} className="flex items-center gap-1.5 bg-red-950/40 text-red-400 hover:bg-red-900/60 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-black transition-all">
                    <Home className="w-4 h-4" /> الخروج من اللعبة
                </button>
                
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleToggleMic} 
                        className={`p-2 rounded-lg transition-colors ${isMicActive ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-750'}`}
                    >
                        {isMicActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    </button>
                    <div className="flex items-center gap-1 bg-slate-900 border border-slate-850 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300">
                        <span className="text-slate-500">دورك:</span>
                        <span className={`font-black ${userRole === 'mafia' ? 'text-red-400' : userRole === 'doctor' ? 'text-green-400' : userRole === 'detective' ? 'text-blue-400' : 'text-slate-300'}`}>
                            {userRole === 'mafia' && 'مافيا'}
                            {userRole === 'doctor' && 'طبيب'}
                            {userRole === 'detective' && 'محقق'}
                            {userRole === 'citizen' && 'مواطن صالح'}
                        </span>
                    </div>

                    {(phase === 'day' || phase === 'voting') && players.find(p => p.isUser)?.isAlive && (
                        <button 
                            onClick={() => setShowChatMobile(!showChatMobile)} 
                            className={`lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black border transition-all ${
                                showChatMobile 
                                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg' 
                                    : 'bg-slate-800 text-slate-300 border-slate-700/60'
                            }`}
                        >
                            <MessageSquare className="w-4 h-4" />
                            <span>الدردشة</span>
                        </button>
                    )}
                    
                    <button onClick={() => setTimer(0)} className="flex items-center gap-1 bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-750 px-3 py-1.5 rounded-lg text-xs font-black transition-all">
                        تخطي الوقت
                    </button>
                </div>
            </div>
        </div>
    );
};

