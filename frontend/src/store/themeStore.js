import { create } from "zustand";

function applyTheme(theme) {
  if (typeof document === "undefined") return;
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

export const useTheme = create((set, get) => ({
  theme: "light",

  init: () => {
    const saved = localStorage.getItem("shopchain-theme");
    const initial = saved || "light";
    set({ theme: initial });
    applyTheme(initial);
  },

  toggle: () => {
    const next = get().theme === "light" ? "dark" : "light";
    set({ theme: next });
    localStorage.setItem("shopchain-theme", next);
    applyTheme(next);
  },
}));