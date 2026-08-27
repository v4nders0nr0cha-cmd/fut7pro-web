import type { ReactNode } from "react";

const SECONDARY_POSITION_HINT_TEXT =
  "Posição secundária: é a segunda posição em que o jogador também costuma atuar. Exemplo: ele joga mais como meia, mas também pode atuar como atacante.";

type SecondaryPositionHintProps = {
  className?: string;
  children?: ReactNode;
};

function mergeClasses(base: string, extra?: string) {
  return extra ? `${base} ${extra}` : base;
}

export function SecondaryPositionHint({ className, children }: SecondaryPositionHintProps) {
  return (
    <p className={mergeClasses("mt-1 text-[11px] leading-relaxed text-zinc-400", className)}>
      {children ?? SECONDARY_POSITION_HINT_TEXT}
    </p>
  );
}

export { SECONDARY_POSITION_HINT_TEXT };
