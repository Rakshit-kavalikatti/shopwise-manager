import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useTheme = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    loadTheme();
    
    // Listen for theme changes
    const channel = supabase
      .channel('settings-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'settings'
        },
        () => loadTheme()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadTheme = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("settings")
      .select("theme")
      .eq("user_id", user.id)
      .single();

    if (data?.theme) {
      const newTheme = data.theme as "light" | "dark";
      setTheme(newTheme);
      applyTheme(newTheme);
    }
  };

  const applyTheme = (newTheme: "light" | "dark") => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(newTheme);
  };

  return { theme };
};
