function calculateSettingAsThemeString({ localStorageTheme, systemSettingDark }) {
  if (localStorageTheme !== null) {
    return localStorageTheme;
  }
  if (systemSettingDark.matches) {
    return "dark";
  }
  return "light";
}

const testMedia = (mq) => matchMedia(`${mq}, not all and ${mq}`).matches;

function switchTheme(currentTarget, currentThemeSetting) {
  const newTheme = currentThemeSetting === "dark" ? "light" : "dark";

  document.documentElement.classList.remove(currentThemeSetting);
  document.documentElement.classList.add(newTheme);
  localStorage.setItem("theme", newTheme);

  currentTarget.setAttribute("aria-pressed", newTheme === "dark");
  return newTheme;
}

if (testMedia("(prefers-color-scheme: dark)")) {
  const localStorageTheme = localStorage.getItem("theme");
  const systemSettingDark = window.matchMedia("(prefers-color-scheme: dark)");
  let currentThemeSetting = calculateSettingAsThemeString({ localStorageTheme, systemSettingDark });
  document.documentElement.classList.add(currentThemeSetting);
  const button = document.querySelector(".theme-switch");
  button.setAttribute("aria-pressed", (currentThemeSetting === "dark").toString());
  button.addEventListener("click", (ev) => (currentThemeSetting = switchTheme(ev.currentTarget, currentThemeSetting)));
}

export { switchTheme };
