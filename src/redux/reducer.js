/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createReducer } from '@reduxjs/toolkit';

import {
    SELECT_THEME,
    UPDATE_CONTINGENCY_LIST,
    SELECT_LANGUAGE,
    SELECT_COMPUTED_LANGUAGE,
    UPDATE_FILTER_LIST,
} from './actions';

import { USER, SIGNIN_CALLBACK_ERROR } from '@gridsuite/commons-ui';
import {
    getLocalStorageTheme,
    saveLocalStorageTheme,
    getLocalStorageLanguage,
    saveLocalStorageLanguage,
    getLocalStorageComputedLanguage,
} from './local-storage';
import { PARAM_LANGUAGE, PARAM_THEME } from '../utils/config-params';

const paramsInitialState = {
    [PARAM_THEME]: getLocalStorageTheme(),
    [PARAM_LANGUAGE]: getLocalStorageLanguage(),
};

const initialState = {
    computedLanguage: getLocalStorageComputedLanguage(),
    user: null,
    signInCallbackError: null,
    contingencyLists: null,
    ...paramsInitialState,
    filterList: null,
};

export const reducer = createReducer(initialState, {
    [SELECT_THEME]: (state, action) => {
        state[PARAM_THEME] = action[PARAM_THEME];
        saveLocalStorageTheme(state[PARAM_THEME]);
    },

    [SELECT_LANGUAGE]: (state, action) => {
        state[PARAM_LANGUAGE] = action[PARAM_LANGUAGE];
        saveLocalStorageLanguage(state[PARAM_LANGUAGE]);
    },

    [SELECT_COMPUTED_LANGUAGE]: (state, action) => {
        state.computedLanguage = action.computedLanguage;
    },

    [USER]: (state, action) => {
        state.user = action.user;
    },

    [SIGNIN_CALLBACK_ERROR]: (state, action) => {
        state.signInCallbackError = action.signInCallbackError;
    },

    [UPDATE_CONTINGENCY_LIST]: (state, action) => {
        state.contingencyLists = action.contingencyLists;
    },

    [UPDATE_FILTER_LIST]: (state, action) => {
        state.filterList = action.filterList;
    },
});
