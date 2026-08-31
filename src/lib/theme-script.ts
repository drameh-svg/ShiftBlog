export const themeBootScript = `
(function(){
  try {
    var cookie = document.cookie.match(/(?:^|; )shift-theme=([^;]+)/);
    var stored = cookie ? decodeURIComponent(cookie[1]) : localStorage.getItem("shift-theme");
    var theme = stored === "light" || stored === "dark" ? stored : "dark";
    var root = document.documentElement;
    root.classList.remove("light","dark");
    root.classList.add(theme);
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
  } catch (e) {}
})();
`;
