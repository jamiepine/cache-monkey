const state = {
    theme: 'light',
    // define styles here
    themes: {
        light: {
            background: '#f1f1f1',
            sidebar: '#e6e6e6', 
            text: '#181818'         
        },
        dark: {
            background: '#181818',
            sidebar: '#202020',
            text: '#fff'  
        }
    }
};

const mutations = {
    CHANGE_THEME(state, theme) {
        state.theme = theme;
    },
};

const actions = {
    toggleDark({ commit, state }) {
        let theme;
        if (state.theme === 'light') theme = 'dark'
        else theme = 'light'
        commit('CHANGE_THEME', theme)
    },
};

const getters = {
    getThemeName: (state) => state.theme,
    getTheme: (state) => state.themes[state.theme]
};
  
export default {
    state,
    mutations,
    getters,
    actions
};
  