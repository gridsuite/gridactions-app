/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { store } from '../redux/store';

const PREFIX_ACTIONS_QUERIES = process.env.REACT_APP_API_GATEWAY + '/actions';

const APPS_METADATA_SERVER_URL = fetch('env.json');

function getToken() {
    const state = store.getState();
    return state.user.id_token;
}

function backendFetch(url, init) {
    if (!(typeof init == 'undefined' || typeof init == 'object')) {
        throw new TypeError(
            'Argument 2 of backendFetch is not an object' + typeof init
        );
    }
    const initCopy = Object.assign({}, init);
    initCopy.headers = new Headers(initCopy.headers || {});
    initCopy.headers.append('Authorization', 'Bearer ' + getToken());

    return fetch(url, initCopy);
}

export function fetchAppsAndUrls() {
    console.info(`Fetching apps and urls...`);
    return APPS_METADATA_SERVER_URL.then((res) => res.json()).then((res) => {
        return fetch(res.appsMetadataServerUrl + '/apps-metadata.json').then(
            (response) => {
                return response.json();
            }
        );
    });
}

/**
 * Get all contingency lists
 * @returns {Promise<Response>}
 */
export function getContingencyLists(guiMode) {
    const url = PREFIX_ACTIONS_QUERIES + '/v1/contingency-lists';
    if(guiMode) {
        return Promise.resolve([{'name' : 'Gui script 1'}]);
    } else {
        return backendFetch(url).then((response) => response.json());
    }
}

/**
 * Add new contingency list
 * @returns {Promise<Response>}
 */
export function addContingencyList(name, script) {
    const url =
        PREFIX_ACTIONS_QUERIES +
        '/v1/script-contingency-lists/' +
        encodeURIComponent(name);
    return backendFetch(url, {
        method: 'put',
        body: script,
    });
}

/**
 * Delete contingency list by name
 * @param name
 * @returns {Promise<Response>}
 */
export function deleteListByName(name) {
    const url =
        PREFIX_ACTIONS_QUERIES +
        '/v1/contingency-lists/' +
        encodeURIComponent(name);
    return backendFetch(url, {
        method: 'delete',
    });
}

/**
 * Rename list by name
 * @param oldNameList
 * @param newNameList
 * @returns {Promise<Response>}
 */
export function renameListByName(oldName, newName) {
    const url =
        PREFIX_ACTIONS_QUERIES +
        '/v1/contingency-lists/' +
        encodeURIComponent(oldName) +
        '/rename';

    return backendFetch(url, {
        method: 'post',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newContingencyListName: newName }),
    });
}
