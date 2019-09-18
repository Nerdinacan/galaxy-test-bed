import { getCurrentUser } from "./queries";
import User from "./User";

const state = {
    currentUser: null
}

const getters = {

    currentUser(state) {
        if (!state.currentUser) {
            // TODO: remove when we no longer use the galaxy instance
            try {
                return window.Galaxy.user;
            } catch(err) {
                console.warn(err);
            }
        }
        return state.currentUser;
    },

    hasUser(state, getters) {
        const user = getters.currentUser;
        return user && user.id;
    }

}

const mutations = {
    setCurrentUser(state, user) {
        state.currentUser = user;
    }
}

const actions = {
    async $init({ commit }) {
        const rawUser = await getCurrentUser();
        const user = User.create(rawUser);
        commit("setCurrentUser", user);
    }
}

export const userStore = {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
}
