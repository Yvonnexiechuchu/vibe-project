import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

type Props = {
  children: ReactNode;
  /** Show the bottom tab bar. Defaults to true. */
  nav?: boolean;
  /** Add bottom padding to clear the fixed nav. Defaults to true when nav is true. */
  padBottom?: boolean;
};

export function Screen({ children, nav = true, padBottom }: Props) {
  const shouldPad = padBottom ?? nav;
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className={`flex-1 ${shouldPad ? "pb-[120px]" : ""}`}>{children}</div>
      {nav && <BottomNav />}
    </div>
  );
}
