import { createContext } from "react";

export class PopupContextType {
  active: boolean = false;
  setActive: React.Dispatch<React.SetStateAction<boolean>> = () => {};
}

const PopupContext = createContext<PopupContextType>(new PopupContextType());

export default PopupContext;
