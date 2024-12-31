"use client";

import { makeStore } from "@frontend/store";
import { ReactNode } from "react";
import { Provider } from "react-redux";

interface Props {
  children: ReactNode;
}

export default function Providers({ children }: Props) {
  return <Provider store={makeStore()}>{children}</Provider>;
}
