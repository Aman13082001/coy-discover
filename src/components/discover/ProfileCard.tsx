import { MapPin } from "lucide-react";
import type { PublicProfile } from "@/lib/types";
import { ProfilePhoto } from "@/components/profile/ProfilePhoto";

/** Static presentation of a profile. Gesture handling lives in SwipeCard. */
export function ProfileCard({ profile, priority }: { profile: PublicProfile; priority?: boolean }) {
  return (
    <article
      aria-label={`${profile.name}, ${profile.age}`}
      className="relative h-full w-full overflow-hidden rounded-[var(--radius-card)] bg-ink shadow-[var(--shadow-card)]"
    >
      <ProfilePhoto src={profile.photoUrl} name={profile.name} sizes="(max-width: 480px) 100vw, 420px" priority={priority} />

      <div className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-[#140f0c]/90 via-[#140f0c]/45 to-transparent" aria-hidden />

      <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
        <h2 className="font-display text-[30px] font-semibold leading-none tracking-tight sm:text-[34px]">
          {profile.name}
          <span className="ml-2 font-sans text-[24px] font-medium text-white/85 sm:text-[26px]">{profile.age}</span>
        </h2>
        <p className="mt-2 flex items-center gap-1.5 text-[14px] font-semibold text-white/85">
          <MapPin className="size-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
          <span className="truncate">{profile.location}</span>
        </p>
        <p className="mt-3 line-clamp-3 text-[15px] leading-snug text-white/90">{profile.bio}</p>
        {profile.interests.length > 0 && (
          <ul aria-label="Interests" className="mt-4 flex flex-wrap gap-1.5">
            {profile.interests.map((interest) => (
              <li
                key={interest}
                className="rounded-full border border-white/20 bg-white/12 px-3 py-1 text-[12.5px] font-semibold text-white backdrop-blur-sm"
              >
                {interest}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
