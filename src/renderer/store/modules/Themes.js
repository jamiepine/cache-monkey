const state = {
  theme: "dark",
  // define styles here
  themes: {
    light: {
      background: "#f1f1f1",
      background2: "#1a1a1a",
      box: "#e6e6e6",
      boxLight: "#e6e6e6",
      boxHover: "#ececec",
      text: "#181818",
      avatar: "#f3f3f3",
      avatarActive: "#f5f5f5",
      shadow: "rgba(19, 19, 19, 0.09)",
      searchBackground: "#dadada",
      searchBorder: "rgba(216, 216, 216, 0)",
      headings: "#181818",
      faintText: "#535353",
      windowsBar: "#c6c6c6",
      sidebar: "#efefef"
    },
    dark: {
      sidebar: "#202020",
      background: "#181818",
      background2: "#1a1a1a",
      box: "#202020",
      boxLight: "#292929",
      boxHover: "#242424",
      avatar: "#313131",
      avatarActive: "#484848",
      text: "#fff",
      shadow: "rgba(0, 0, 0, 0.38)",
      searchBackground: "#1d1d1d",
      searchBorder: "#171717",
      faintText: "#535353",
      headings: "#a5a5a5",
      filterBar: "#1b1b1b",
      windowsBar: "#181818"
    }
  }
};
const mutations = {
  CHANGE_THEME(state, theme) {
    state.theme = theme;
  }
};

const actions = {
  toggleDark({ commit, state }) {
    let theme;
    if (state.theme === "light") theme = "dark";
    else theme = "light";
    commit("CHANGE_THEME", theme);
  }
};

const getters = {
  getThemeName: state => state.theme,
  getTheme: state => state.themes[state.theme]
};

export default {
  state,
  mutations,
  getters,
  actions
};
