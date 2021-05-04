/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import ContingencyLists from './contingency-list';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Grid from '@material-ui/core/Grid';
import * as PropTypes from 'prop-types';
import { GenericFilter } from './generic-filter';
import FilterList from './filter-list';

GenericFilter.propTypes = { equipmentType: PropTypes.string };

const DataTabs = () => {
    const [tabIndex, setTabIndex] = useState(0);
    const intl = useIntl();
    const tabs = [
        {
            name: 'CONTINGENCY',
            render: () => <ContingencyLists listType={'contingencies'} />,
        },
        {
            name: 'FILTERS',
            render: () => <FilterList listType={'line'} />,
        },
    ];

    return (
        <Grid container justify={'space-between'} direction={'column'}>
            <Grid container justify={'space-between'} item>
                <Tabs
                    value={tabIndex}
                    indicatorColor="primary"
                    variant="scrollable"
                    scrollButtons="auto"
                    onChange={(event, newValue) => setTabIndex(newValue)}
                    aria-label="tables"
                >
                    {tabs.map((def) => (
                        <Tab
                            key={def.name}
                            label={intl.formatMessage({
                                id: def.name,
                            })}
                        />
                    ))}
                </Tabs>
            </Grid>
            <Grid item>{tabs[tabIndex].render()}</Grid>
        </Grid>
    );
};

export default DataTabs;
