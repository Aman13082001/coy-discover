import { Heart, MapPin } from "lucide-react";
import type { MatchSummary } from "@/lib/types";
import { ProfilePhoto } from "@/components/profile/ProfilePhoto";

const dateFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

export function MatchCard({ match }: { match: MatchSummary }) {
  const { profile } = match;
  return (
    <li className="overflow-hidden rounded-2xl border border-line bg-card shadow-[0_1px_2px_rgb(31_26_23/0.05)]">
      <div className="relative aspect-[4/5] bg-paper-deep">
        <ProfilePhoto src={profile.photoUrl} name={profile.name} sizes="(max-width: 640px) 50vw, 240px" />
      </div>
      <div className="p-3.5">
        <h3 className="truncate text-[16px] font-bold leading-tight">
          {profile.name}, <span className="font-semibold text-ink-soft">{profile.age}</span>
        </h3>
        <p className="mt-1 flex items-center gap-1 text-[13px] text-ink-soft">
          <MapPin className="size-3 shrink-0" strokeWidth={2.5} aria-hidden />
          <span className="truncate">{profile.location}</span>
        </p>
        <p className="mt-2.5 flex items-center gap-1 text-[12px] font-semibold text-ink-faint">
          <Heart className="size-3 shrink-0 fill-coral text-coral" strokeWidth={0} aria-hidden />
          Matched <time dateTime={match.createdAt}>{dateFormat.format(new Date(match.createdAt))}</time>
        </p>
      </div>
    </li>
  );
}
