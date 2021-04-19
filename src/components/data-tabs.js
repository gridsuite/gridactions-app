import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import ContingencyLists from './contingency-list';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Grid from '@material-ui/core/Grid';
import * as PropTypes from 'prop-types';
import { GenericFilter } from './generic-filter';
import FiltersEditor from './filters-editor';

GenericFilter.propTypes = { equipmentType: PropTypes.string };
const DataTabs = () => {
    const [tabIndex, setTabIndex] = useState(0);
    const intl = useIntl();

    const tabs = [
        {
            name: 'CONTINGENCY',
            render: () => (
                <ContingencyLists
                    FilterRenderer={FiltersEditor}
                    listType={'contingencies'}
                />
            ),
        },
        {
            name: 'LINE',
            render: () =>
                <ContingencyLists
                    FilterRenderer={GenericFilter}
                    listType={'line'}
            />
        },
    ];

    return (
        <>
            <Grid container justify={'space-between'}>
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
            </Grid>
            <div style={{ flexGrow: 1 }}>{tabs[tabIndex].render()}</div>
        </>
    );
};

export default DataTabs;
