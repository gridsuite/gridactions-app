/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { createReducer } from '@reduxjs/toolkit';

import { getLocalStorageTheme, saveLocalStorageTheme } from './local-storage';

import {
    SELECT_THEME,
    UPDATE_CONTINGENCY_LIST,
    UPDATE_FILTER_EQUIPMENT_ID,
    UPDATE_FILTER_EQUIPMENT_NAME,
    UPDATE_FILTER_NOMINAL_VOLTAGE,
    UPDATE_FILTER_NOMINAL_VOLTAGE_OPERATOR,
    UPDATE_FILTER_EQUIPMENT_TYPE,
    UPDATE_GUI_CONTINGENCY_LIST,
    UPDATE_SCRIPT_CONTINGENCY_LIST,
} from './actions';

import { USER, SIGNIN_CALLBACK_ERROR } from '@gridsuite/commons-ui';

const initialState = {
    theme: getLocalStorageTheme(),
    user: null,
    signInCallbackError: null,
    scriptList: [],
    guiList: [],
    contingencyLists: [],

    equipmentID: '*',
    equipmentName: '*',
    equipmentType: '*',
    nominalVoltageOperator: '=',
    nominalVoltage: '*',
};

export const reducer = createReducer(initialState, {
    [SELECT_THEME]: (state, action) => {
        state.theme = action.theme;
        saveLocalStorageTheme(state.theme);
    },

    [USER]: (state, action) => {
        state.user = action.user;
    },

    [SIGNIN_CALLBACK_ERROR]: (state, action) => {
        state.signInCallbackError = action.signInCallbackError;
    },

    [UPDATE_SCRIPT_CONTINGENCY_LIST]: (state, action) => {
        state.scriptList = action.scriptList;
    },

    [UPDATE_GUI_CONTINGENCY_LIST]: (state, action) => {
        state.guiList = action.guiList;
    },

    [UPDATE_CONTINGENCY_LIST]: (state, action) => {
        state.contingencyLists = action.contingencyLists;
    },

    [UPDATE_FILTER_EQUIPMENT_ID]: (state, action) => {
        state.equipmentID = action.equipmentID;
    },

    [UPDATE_FILTER_EQUIPMENT_NAME]: (state, action) => {
        state.equipmentName = action.equipmentName;
    },

    [UPDATE_FILTER_NOMINAL_VOLTAGE_OPERATOR]: (state, action) => {
        state.nominalVoltageOperator = action.nominalVoltageOperator;
    },

    [UPDATE_FILTER_NOMINAL_VOLTAGE]: (state, action) => {
        state.nominalVoltage = action.nominalVoltage;
    },

    [UPDATE_FILTER_EQUIPMENT_TYPE]: (state, action) => {
        state.equipmentType = action.equipmentType;
    },
});
