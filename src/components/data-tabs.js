import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import ContingencyLists from './contingency-list';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Grid from '@material-ui/core/Grid';
import * as PropTypes from 'prop-types';
import { GenericFilter } from './generic-filter';
import FilterList from './filter-list';
import FiltersEditor from './filters-editor';
import makeStyles from '@material-ui/core/styles/makeStyles';

GenericFilter.propTypes = { equipmentType: PropTypes.string };

const useStyles = makeStyles((theme) => ({
    tabs: {
        display: 'flex',
        flexDirection: 'row',
        //height:'300px',
        //flexShrink:'0',
        //flexGrow:'1',
    },
}));

const DataTabs = () => {
    const [tabIndex, setTabIndex] = useState(0);
    const intl = useIntl();
    const classes = useStyles();

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
            name: 'FILTERS',
            render: () => (
                <FilterList
                    FilterRenderer={GenericFilter}
                    listType={'line'}
                />
            ),
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
            <Grid item>
                {tabs[tabIndex].render()}
            </Grid>
        </Grid>
    );
};

export default DataTabs;
