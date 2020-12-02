/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createReducer } from '@reduxjs/toolkit';

import { SELECT_THEME, UPDATE_CONTINGENCY_LIST } from './actions';

import { USER, SIGNIN_CALLBACK_ERROR } from '@gridsuite/commons-ui';

const initialState = {
    theme: 'Dark',
    user: null,
    signInCallbackError: null,
    list: null,
};

export const reducer = createReducer(initialState, {
    [SELECT_THEME]: (state, action) => {
        state.theme = action.theme;
    },

    [USER]: (state, action) => {
        state.user = action.user;
    },

    [SIGNIN_CALLBACK_ERROR]: (state, action) => {
        state.signInCallbackError = action.signInCallbackError;
    },

    [UPDATE_CONTINGENCY_LIST]: (state, action) => {
        state.list = action.list;
    },
});
