"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Heart, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { SwipeFeedback } from "@/hooks/useSwipe";

/** Brief confirmation after each swipe. Also announced to screen readers. */
export function SwipeFeedbackToast({ feedback }: { feedback: SwipeFeedback | null }) {
  const [visible, setVisible] = useState<SwipeFeedback | null>(null);

  useEffect(() => {
    setVisible(feedback);
    if (!feedback) return;
    const timer = setTimeout(() => setVisible(null), 1400);
    return () => clearTimeout(timer);
  }, [feedback]);

  const text = visible ? (visible.action === "LIKE" ? `You liked ${visible.name}` : `You passed on ${visible.name}`) : "";

  return (
    <>
      <p className="sr-only" aria-live="polite">{text}</p>
      <div className="pointer-events-none absolute inset-x-0 -top-1 z-10 flex justify-center" aria-hidden>
        <AnimatePresence>
          {visible && (
            <motion.div
              key={visible.key}
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-bold shadow-[var(--shadow-float)] ${
                visible.action === "LIKE" ? "bg-coral text-white" : "bg-ink text-paper"
              }`}
            >
              {visible.action === "LIKE" ? (
                <Heart className="size-3.5 fill-current" strokeWidth={0} />
              ) : (
                <X className="size-3.5" strokeWidth={3} />
              )}
              {visible.action === "LIKE" ? `Liked ${visible.name}` : `Passed on ${visible.name}`}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
