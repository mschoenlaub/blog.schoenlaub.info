function calculateSettingAsThemeString({ localStorageTheme, systemSettingDark }) {
  if (localStorageTheme !== null) {
    return localStorageTheme;
  }
  if (systemSettingDark.matches) {
    return "dark";
  }
  return "light";
}

function testMedia(mq) {
  return matchMedia(`${mq}, not all and ${mq}`).matches;
}

function enableThemeSwitcher(currentThemeSetting) {
  const button = document.querySelector("#theme-switch");
  button.setAttribute("aria-pressed", (currentThemeSetting === "dark").toString());
  button.disabled = false;
  button.addEventListener("click", (ev) => (currentThemeSetting = switchTheme(ev.currentTarget, currentThemeSetting)));
}

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
  if (document.readyState === "loading") {
    addEventListener("DOMContentLoaded", () => enableThemeSwitcher(currentThemeSetting));
  } else {
    enableThemeSwitcher(currentThemeSetting);
  }
}

export { switchTheme };
