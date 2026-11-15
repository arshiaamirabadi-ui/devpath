import { tx } from "./locale";
import type { ReactNode, HTMLAttributes } from "react";
import { Code2, BrainCircuit, Cpu, Rocket, type LucideIcon } from "lucide-react";
export type Tone = "blue" | "violet" | "rose" | "amber";
export const trackTones = {
  backend: "blue",
  ai: "violet",
  systems: "rose",
  project: "amber"
} as const;
export function Surface({
  as: Element = "section",
  tone = "blue",
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLElement> & {
  as?: "section" | "article" | "div";
  tone?: Tone;
}) {
  return <Element {...props} data-tone={tone} className={`panel surface-card ${className}`}>{tx(children)}</Element>;
}
export function StatCard({
  label,
  icon: Icon,
  tone,
  value,
  detail,
  children,
  progress
}: {
  label: string;
  icon: LucideIcon;
  tone: Tone;
  value: ReactNode;
  detail?: ReactNode;
  children?: ReactNode;
  progress?: number;
}) {
  const circumference = 2 * Math.PI * 23;
  return <Surface as="div" className="stat" tone={tone}>
  <div className="stat-heading"><span className="stat-icon"><Icon size={21} /></span><span>{tx(label)}</span></div>
  <div className="stat-value"><strong>{tx(value)}</strong>{tx(progress !== undefined && <svg className="stat-ring" viewBox="0 0 56 56" aria-hidden="true"><circle className="ring-track" cx="28" cy="28" r="23" /><circle className="ring-value" cx="28" cy="28" r="23" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - Math.max(0, Math.min(100, progress)) / 100)} /></svg>)}</div>
  {tx(children)}{tx(detail && <p>{tx(detail)}</p>)}
 </Surface>;
}
export function LessonHeading({
  compact,
  icon: Icon,
  tone,
  children
}: {
  compact: boolean;
  icon: LucideIcon;
  tone: Tone;
  children: ReactNode;
}) {
  const Heading = compact ? "h3" : "h2";
  return <Heading className="lesson-heading" data-tone={tone}><span className="section-icon"><Icon size={21} /></span>{tx(children)}</Heading>;
}

export const trackIcons = { backend: Code2, ai: BrainCircuit, systems: Cpu, project: Rocket } as const;
export function TrackMark({track}:{track:keyof typeof trackTones}) {
 const Icon=trackIcons[track];
 return <span className="track-mark" data-tone={trackTones[track]} data-track={track} aria-hidden="true"><Icon size={20}/></span>;
}
