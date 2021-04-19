import { FormattedMessage } from 'react-intl';
import React, { useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import { Divider, MenuItem, Select, Switch } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { filteredTypes } from './filters';

const useStyles = makeStyles((theme) => ({
    controlItem: {
        justifyContent: 'flex-end',
    },
    idText: {
        padding: 8,
    },
    button: {
        //marginBottom: '30px',
    },
}));

const genericFields = {
    id: {
        name: 'ID',
        type: filteredTypes.string,
    },
    name: {
        name: 'Name',
        type: filteredTypes.string,
    },
};

const equipmentsDefinition = {
    line: {
        label: 'Lines',
        fields: {
            countries: {
                name: 'Country',
                type: filteredTypes.countries,
                occurs: 2,
            },
            nominalVoltage: {
                name: 'nominalVoltage',
                type: filteredTypes.range,
                occurs: 2,
            },
        },
    },
    generator: {
        label: 'Generators',
        fields: {},
    },
};

function generateDefaultValue(val) {
    return { enabled: false, value: val.defaultValue || val.type.defaultValue };
}

const SingleFilter = ({ filter, definition, onChange }) => {
    const classes = useStyles();
    const [enabled, setEnabled] = useState(filter.enabled);

    const localChange = (newVal) => {
        filter.value = newVal;
        onChange();
    };

    const toggleFilter = () => {
        filter.enabled = !enabled;
        setEnabled(filter.enabled);
        onChange();
    };

    return (
        <Grid container direction="row" key={definition.name}>
            <Grid
                item
                className={classes.controlItem}
                key={definition.name + '-sw'}
            >
                <Switch
                    checked={enabled}
                    color="primary"
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                    onChange={() => {
                        toggleFilter();
                    }}
                />
            </Grid>
            <Grid
                item
                xs={2}
                className={classes.idText}
                key={definition.name + '-label'}
            >
                <Typography component="span" variant="body1">
                    <FormattedMessage id={definition.name} />
                </Typography>
            </Grid>
            <Grid item xs key={definition.name + '-value'}>
                {/* TODO MARGIN */}
                {definition.type.renderer({
                    initialValue: filter.value,
                    onChange: localChange,
                    disabled: !enabled,
                })}
            </Grid>
        </Grid>
    );
};

export const FilterTypeSelection = ({ type, onChange, disabled }) => {
    const classes = useStyles();

    return (
        <Grid container>
            <Grid
                style={{ visibility: 'hidden' }}
                item
                className={classes.controlItem}
            >
                <Switch />
            </Grid>
            <Grid xs={2} item className={classes.idText}>
                <Typography component="span" variant="body1">
                    <FormattedMessage id={'equipmentType'} />
                </Typography>
            </Grid>
            <Grid xs item>
                <Select
                    defaultValue={type}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    variant={'outlined'}
                >
                    {Object.entries(equipmentsDefinition).map(
                        ([key, value]) => (
                            <MenuItem key={key} value={key}>
                                <FormattedMessage id={value.label} />
                            </MenuItem>
                        )
                    )}
                </Select>
            </Grid>
        </Grid>
    );
};

export const GenericFilter = ({ equipmentType, filters, onChange }) => {
    const [filterType, setFilterType] = useState('line');

    const tmp = useRef({
        id: {
            enabled: true,
            value: ['azz', 'tek'],
        },
    });

    const onChangeFilter = () => {
        console.info('new Value : ');
        console.info(tmp.current);
    };
    const renderFilter = (key, definition) => {
        if (tmp.current[key] === undefined)
            tmp.current[key] = generateDefaultValue(definition);
        return (
            <SingleFilter
                filter={tmp.current[key]}
                definition={definition}
                onChange={onChangeFilter}
            />
        );
    };

    const RenderGeneric = () => {
        return Object.entries(genericFields).map(([key, definition]) =>
            renderFilter(key, definition)
        );
    };

    const renderSpecific = () => {
        return Object.entries(equipmentsDefinition[filterType].fields).map(
            ([key, definition]) => {
                if (definition.occurs)
                    return (
                        <Grid container direction={'row'}>
                            {[
                                ...Array.from(Array(definition.occurs).keys()),
                            ].map((n) => {
                                return (
                                    <Grid
                                        item
                                        xs
                                        key={definition.label + n.toString()}
                                        style={{}}
                                    >
                                        {renderFilter(
                                            key + (n + 1).toString(),
                                            definition
                                        )}
                                    </Grid>
                                );
                            })}
                        </Grid>
                    );
                else return renderFilter(key, definition);
            }
        );
    };

    return (
        <Grid container direction="row" spacing={2}>
            {FilterTypeSelection({
                type: filterType,
                onChange: setFilterType,
                disabled: false,
            })}
            {RenderGeneric()}
            <Grid item xs={12}>
                <Divider variant={'middle'} />
            </Grid>
            {renderSpecific()}
        </Grid>
    );
};
