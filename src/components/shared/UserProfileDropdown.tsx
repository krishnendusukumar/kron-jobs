import { useRef, useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { UserProfile } from "@/lib/user-profile-service";

export default function UserProfileDropdown({ userProfile }: { userProfile: UserProfile | null }) {
    const { user } = useUser();
    const { signOut } = useClerk();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        if (open) document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    if (!user || !userProfile) return null;

    return (
        <div className="relative" ref={ref}>
            <button
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-cyan-600 to-purple-600 text-white font-bold shadow-lg border-2 border-cyan-400/40"
                onClick={() => setOpen((v) => !v)}
                aria-label="Open user menu"
            >
                {user.imageUrl ? (
                    <img src={user.imageUrl} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                    <span className="uppercase">{user.firstName?.[0] || user.primaryEmailAddress?.emailAddress?.[0] || "U"}</span>
                )}
            </button>
            {open && (
                <div className="absolute right-0 mt-2 w-80 bg-[#101c2b] border border-cyan-400/20 rounded-2xl shadow-2xl p-5 z-50 text-cyan-100 backdrop-blur-xl">
                    <div className="flex items-center gap-4 mb-4">
                        <img
                            src={user.imageUrl || '/default-avatar.png'}
                            alt="avatar"
                            className="w-14 h-14 rounded-full border-2 border-cyan-400/30"
                        />
                        <div>
                            <div className="font-bold text-lg">{user.fullName || "No Name"}</div>
                            <div className="text-xs text-cyan-300">{user.primaryEmailAddress?.emailAddress}</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                        <div><b>Plan:</b> <span className="capitalize">{userProfile.plan}</span></div>
                        <div><b>Credits:</b> {userProfile.credits_remaining}</div>
                        <div><b>Cron Jobs:</b> {('cron_jobs_used' in userProfile && 'cron_jobs_limit' in userProfile) ? `${(userProfile as any).cron_jobs_used} / ${(userProfile as any).cron_jobs_limit}` : "N/A"}</div>
                        <div><b>Last Sign-in:</b> {userProfile.last_sign_in ? new Date(userProfile.last_sign_in).toLocaleString() : "N/A"}</div>
                        <div><b>Signup:</b> {userProfile.sign_up_date ? new Date(userProfile.sign_up_date).toLocaleDateString() : "N/A"}</div>
                    </div>
                    <button
                        className="w-full py-2 rounded-xl bg-[#0a182e] text-white font-semibold shadow hover:bg-[#162a4d] transition"
                        onClick={() => signOut(() => window.location.href = '/sign-in')}
                        aria-label="Log out"
                    >
                        Log out
                    </button>
                </div>
            )}
        </div>
    );
} 