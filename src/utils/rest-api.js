/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { store } from '../redux/store';

const PREFIX_APPS_URLS_QUERIES = process.env.REACT_APP_APPS_URLS;

const ENV_VARIABLES = fetch('env.json');

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
    let url;
    return ENV_VARIABLES.then(res => res.json()).then(res => {
        if (res.isRunningInsideDockerCompose) {
            url = PREFIX_APPS_URLS_QUERIES + '/dev-urls.json';
        } else {
            url = PREFIX_APPS_URLS_QUERIES + '/prod-urls.json';
        }
        console.log(url);
        return backendFetch(url).then((response) => {
            return response.json();
        });
    });
}
