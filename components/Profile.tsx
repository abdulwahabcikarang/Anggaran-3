
import React, { useState, useRef } from 'react';
import type { AppState } from '../types';
import { UserIcon, PencilSquareIcon, CameraIcon, TrophyIcon, SparklesIcon, StarIconFilled, ArrowUturnLeftIcon, CheckCircleIcon } from './Icons';

interface ProfileProps {
    state: AppState;
    onUpdateProfile: (name: string, avatar: string) => void;
    onBack: () => void;
    totalPoints: number;
    totalBadges: number;
    userLevel: {
        level: string;
        levelNumber: number; // Explicitly use number
        currentLevelPoints: number;
        nextLevelPoints: number | null;
    };
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const Profile: React.FC<ProfileProps> = ({ state, onUpdateProfile, onBack, totalPoints, totalBadges, userLevel }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(state.userProfile?.name || 'Pengguna');
    const [avatar, setAvatar] = useState(state.userProfile?.avatar || '');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const base64 = await fileToBase64(e.target.files[0]);
                setAvatar(base64);
                if(!isEditing) {
                    // Auto save if not in full edit mode
                    onUpdateProfile(state.userProfile.name, base64);
                }
            } catch (err) {
                console.error("Error uploading image", err);
            }
        }
    };

    const handleSave = () => {
        onUpdateProfile(newName, avatar);
        setIsEditing(false);
    };

    // Calculate Border Color based on Level Number
    const getLevelBorder = () => {
        const lvl = userLevel.levelNumber;
        if (lvl >= 20) return 'border-purple-500 ring-purple-300'; // Master
        if (lvl >= 15) return 'border-yellow-400 ring-yellow-200'; // Sultan
        if (lvl >= 10) return 'border-gray-400 ring-gray-200'; // Pakar (Silver)
        if (lvl >= 5) return 'border-orange-400 ring-orange-200'; // Pengelola (Bronze)
        return 'border-blue-300 ring-blue-100'; // Pemula
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24 relative overflow-hidden">
            {/* Header Background */}
            <div className="h-48 bg-gradient-to-r from-primary-navy to-teal-600 rounded-b-[3rem] relative shadow-lg">
                <button onClick={onBack} className="absolute top-4 left-4 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-white transition-colors z-10">
                    <ArrowUturnLeftIcon className="w-6 h-6" />
                </button>
                
                {/* Decorative Circles */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full translate-x-1/4 translate-y-1/4"></div>
            </div>

            <div className="px-6 -mt-20 relative z-10 flex flex-col items-center">
                {/* Avatar Section */}
                <div className="relative group">
                    <div className={`w-32 h-32 rounded-full border-4 ${getLevelBorder()} bg-white p-1 shadow-xl ring-4 ring-opacity-50 overflow-hidden flex items-center justify-center relative`}>
                        {avatar ? (
                            <img src={avatar} alt="Profile" className="w-full h-full object-cover rounded-full" />
                        ) : (
                            <UserIcon className="w-20 h-20 text-gray-300" />
                        )}
                        
                        {/* Edit Overlay */}
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full"
                        >
                            <CameraIcon className="w-8 h-8 text-white" />
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleImageUpload}
                        />
                    </div>
                    {/* Level Badge Badge */}
                    <div className="absolute bottom-0 right-0 bg-primary-navy text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-white shadow-md">
                        LV {userLevel.levelNumber}
                    </div>
                </div>

                {/* Name & Title */}
                <div className="mt-4 text-center w-full">
                    {isEditing ? (
                        <div className="flex items-center justify-center gap-2">
                            <input 
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="text-2xl font-bold text-center bg-white border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-navy text-primary-navy w-full max-w-xs"
                            />
                            <button onClick={handleSave} className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 shadow-sm">
                                <CheckCircleIcon className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-2">
                            <h1 className="text-2xl font-bold text-primary-navy">{state.userProfile?.name || 'Pengguna'}</h1>
                            <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-primary-navy transition-colors">
                                <PencilSquareIcon className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                    <p className="text-accent-teal font-semibold mt-1 text-sm uppercase tracking-wide">{userLevel.level}</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 w-full mt-8">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                        <div className="bg-blue-100 p-2 rounded-full mb-2">
                            <StarIconFilled className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-lg font-bold text-dark-text">
                            {userLevel.levelNumber}
                        </span>
                        <span className="text-[10px] text-secondary-gray uppercase font-bold">Level</span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                        <div className="bg-purple-100 p-2 rounded-full mb-2">
                            <SparklesIcon className="w-5 h-5 text-purple-600" />
                        </div>
                        <span className="text-lg font-bold text-dark-text">{totalPoints}</span>
                        <span className="text-[10px] text-secondary-gray uppercase font-bold">Total XP</span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                        <div className="bg-orange-100 p-2 rounded-full mb-2">
                            <TrophyIcon className="w-5 h-5 text-orange-600" />
                        </div>
                        <span className="text-lg font-bold text-dark-text">{totalBadges}</span>
                        <span className="text-[10px] text-secondary-gray uppercase font-bold">Lencana</span>
                    </div>
                </div>

                {/* Detailed Stats Section */}
                <div className="w-full mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-50">
                        <h3 className="font-bold text-primary-navy text-sm">Detail Perjalanan</h3>
                    </div>
                    <div className="p-4 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-secondary-gray">XP Menuju Level Berikutnya</span>
                            <span className="text-sm font-bold text-dark-text">
                                {userLevel.nextLevelPoints ? userLevel.nextLevelPoints - totalPoints : 0} XP
                            </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div 
                                className="bg-gradient-to-r from-blue-400 to-teal-400 h-2 rounded-full transition-all duration-1000"
                                style={{ 
                                    width: `${userLevel.nextLevelPoints 
                                        ? ((totalPoints - (userLevel.currentLevelPoints || 0)) / (userLevel.nextLevelPoints - (userLevel.currentLevelPoints || 0))) * 100 
                                        : 100}%` 
                                }}
                            ></div>
                        </div>
                        
                        <div className="pt-2">
                            <div className="flex justify-between items-center border-t border-gray-50 pt-3">
                                <span className="text-sm text-secondary-gray">Bergabung Sejak</span>
                                <span className="text-sm font-bold text-dark-text">
                                    {/* Assuming first archive or fund history as rough join date if not stored explicitly */}
                                    {state.fundHistory.length > 0 
                                        ? new Date(Math.min(...state.fundHistory.map(t => t.timestamp))).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) 
                                        : 'Baru Saja'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
