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

function relativeDate(date) {
  const diff = Math.round((new Date() - new Date(date)) / 1000);

  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30;
  const year = month * 12;

  if (diff < 30) {
    return "just now";
  } else if (diff < minute) {
    return diff + " seconds ago";
  } else if (diff < 2 * minute) {
    return "a minute ago";
  } else if (diff < hour) {
    return Math.floor(diff / minute) + " minutes ago";
  } else if (Math.floor(diff / hour) == 1) {
    return "1 hour ago";
  } else if (diff < day) {
    return Math.floor(diff / hour) + " hours ago";
  } else if (diff < day * 2) {
    return "yesterday";
  } else if (diff < week) {
    return week + " days ago";
  } else if (diff < month) {
    return Math.floor(diff / week) + " weeks ago";
  } else if (diff < year) {
    return Math.floor(diff / month) + " months ago";
  } else {
    return Math.floor(diff / year) + " years ago";
  }
}

document.querySelectorAll(".relative-date").forEach((el) => {
  el.innerHTML = relativeDate(el.innerHTML);
});

export { switchTheme };
