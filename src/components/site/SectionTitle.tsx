import { StarSparkle } from "./icons";

export function SectionTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={`flex items-center gap-3 text-[28px] font-normal uppercase leading-tight text-ink md:text-[34px] ${className}`}>
      <StarSparkle className="size-5 shrink-0 md:size-6" />
      {children}
    </h2>
  );
}
