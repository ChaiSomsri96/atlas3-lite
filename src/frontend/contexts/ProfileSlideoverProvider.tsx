import React, {
  FC,
  ReactNode,
  useState,
  createContext,
  useContext,
} from "react";
import ProfileSlideover from "../components/ProfileSlideover";

const Context = createContext({
  open: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setOpen: (_open: boolean) => {},
});

export const ProfileSlideoverProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Context.Provider value={{ open, setOpen }}>
      {children}
      <ProfileSlideover open={open} setOpen={setOpen} />
    </Context.Provider>
  );
};

export function useProfileSlideoverProvider() {
  const context = useContext(Context);
  return context;
}
