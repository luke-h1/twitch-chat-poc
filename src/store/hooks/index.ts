import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import { AppDispatcch, RootState } from "..";

export const useAppDispatch: () => AppDispatcch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
