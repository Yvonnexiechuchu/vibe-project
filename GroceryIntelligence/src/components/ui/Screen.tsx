import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

type Props = {
  children: ReactNode;
  nav?: boolean;
  padBottom?: boolean;
};

export function Screen({ children, nav = true, padBottom }: Props) {
  const shouldPad = padBottom ?? nav;
  return (
    <div className="min-h-screen flex flex-col">
      <div className={`flex-1 ${shouldPad ? "pb-[100px]" : ""}`}>{children}</div>
      {nav && <BottomNav />}
    </div>
  );
}
