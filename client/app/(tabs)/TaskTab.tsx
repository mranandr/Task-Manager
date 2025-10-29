export interface Theme {
  background: string;
  cardBg: string;
  text: string;
  subText: string;
  primary: string;
  emptyCell: string;
  border: string;
  danger?: string;
  success?: string;
  warning?: string;
  darkMode: boolean;
}

export const lightTheme: Theme = {
  darkMode: false,
  background: "#fff6e5",  // warm background
  cardBg: "#ffe0b2",      // light orange card
  text: "#1E1E1E",
  subText: "#7A7A7A",
  primary: "#ff9800",
  success: "#4CAF50",
  danger: "#E74C3C",
  warning: "#F57C00",
  emptyCell: "#fff3e0",
  border: "#ffcc80",
};

export const darkTheme: Theme = {
  darkMode: true,
  background: "#0d0d0d",  // deep black
  cardBg: "#1a1a1a",      // near black card
  text: "#ffa726",        // glowing orange text
  subText: "#bdbdbd",
  primary: "#ff9800",
  success: "#81c784",
  danger: "#ef5350",
  warning: "#ffb74d",
  emptyCell: "#2a2a2a",
  border: "#333333",
};


