/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

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
}));

const genericFields = {
    equipmentID: {
        name: 'equipmentID',
        type: filteredTypes.string,
    },
    equipmentName: {
        name: 'equipmentName',
        type: filteredTypes.string,
    },
};

const equipmentsDefinition = {
    LINE: {
        label: 'Lines',
        fields: {
            countries: {
                name: 'Countries',
                type: filteredTypes.countries,
                occurs: 2,
            },
            nominalVoltage: {
                name: 'nominalVoltage',
                type: filteredTypes.range,
                occurs: 2,
            },
            substationName: {
                name: 'substationName',
                type: filteredTypes.string,
                occurs: 2,
            },
        },
    },
    TWO_WINDINGS_TRANSFORMER: {
        label: 'TwoWindingsTransformers',
        fields: {
            countries: {
                name: 'Countries',
                type: filteredTypes.countries,
            },
            nominalVoltage: {
                name: 'nominalVoltage',
                type: filteredTypes.range,
                occurs: 2,
            },
            substationName: {
                name: 'substationName',
                type: filteredTypes.string,
            },
        },
    },
    THREE_WINDINGS_TRANSFORMER: {
        label: 'ThreeWindingsTransformers',
        fields: {
            countries: {
                name: 'Countries',
                type: filteredTypes.countries,
            },
            nominalVoltage: {
                name: 'nominalVoltage',
                type: filteredTypes.range,
                occurs: 3,
                direction: 'column',
            },
            substationName: {
                name: 'substationName',
                type: filteredTypes.string,
            },
        },
    },
    GENERATOR: {
        label: 'Generators',
        fields: {
            countries: {
                name: 'Countries',
                type: filteredTypes.countries,
            },
            nominalVoltage: {
                name: 'nominalVoltage',
                type: filteredTypes.range,
            },
            substationName: {
                name: 'substationName',
                type: filteredTypes.string,
            },
        },
    },
    LOAD: {
        label: 'Loads',
        fields: {
            countries: {
                name: 'Countries',
                type: filteredTypes.countries,
            },
            nominalVoltage: {
                name: 'nominalVoltage',
                type: filteredTypes.range,
            },
            substationName: {
                name: 'substationName',
                type: filteredTypes.string,
            },
        },
    },
    BATTERY: {
        label: 'Batteries',
        fields: {
            countries: {
                name: 'Countries',
                type: filteredTypes.countries,
            },
            nominalVoltage: {
                name: 'nominalVoltage',
                type: filteredTypes.range,
            },
            substationName: {
                name: 'substationName',
                type: filteredTypes.string,
            },
        },
    },
    SHUNT_COMPENSATOR: {
        label: 'ShuntCompensators',
        fields: {
            countries: {
                name: 'Countries',
                type: filteredTypes.countries,
            },
            nominalVoltage: {
                name: 'nominalVoltage',
                type: filteredTypes.range,
            },
            substationName: {
                name: 'substationName',
                type: filteredTypes.string,
            },
        },
    },
    STATIC_VAR_COMPENSATOR: {
        label: 'StaticVarCompensators',
        fields: {
            countries: {
                name: 'Countries',
                type: filteredTypes.countries,
            },
            nominalVoltage: {
                name: 'nominalVoltage',
                type: filteredTypes.range,
            },
            substationName: {
                name: 'substationName',
                type: filteredTypes.string,
            },
        },
    },
    DANGLING_LINE: {
        label: 'DanglingLines',
        fields: {
            countries: {
                name: 'Countries',
                type: filteredTypes.countries,
            },
            nominalVoltage: {
                name: 'nominalVoltage',
                type: filteredTypes.range,
            },
            substationName: {
                name: 'substationName',
                type: filteredTypes.string,
            },
        },
    },
    LCC_CONVERTER_STATION: {
        label: 'LccConverterStations',
        fields: {
            countries: {
                name: 'Countries',
                type: filteredTypes.countries,
            },
            nominalVoltage: {
                name: 'nominalVoltage',
                type: filteredTypes.range,
            },
            substationName: {
                name: 'substationName',
                type: filteredTypes.string,
            },
        },
    },
    VSC_CONVERTER_STATION: {
        label: 'VscConverterStations',
        fields: {
            countries: {
                name: 'Countries',
                type: filteredTypes.countries,
            },
            nominalVoltage: {
                name: 'nominalVoltage',
                type: filteredTypes.range,
            },
            substationName: {
                name: 'substationName',
                type: filteredTypes.string,
            },
        },
    },
    HVDC_LINE: {
        label: 'HvdcLines',
        fields: {
            countries: {
                name: 'Countries',
                type: filteredTypes.countries,
                occurs: 2,
            },
            nominalVoltage: {
                name: 'nominalVoltage',
                type: filteredTypes.range,
            },
            substationName: {
                name: 'substationName',
                type: filteredTypes.string,
                occurs: 2,
            },
        },
    },
};

function deepCopy(aObject) {
    if (!aObject) {
        return aObject;
    }
    let v;
    let bObject = Array.isArray(aObject) ? [] : {};
    for (const k in aObject) {
        v = aObject[k];
        bObject[k] = typeof v === 'object' ? deepCopy(v) : v;
    }
    return bObject;
}

function generateDefaultValue(val, originalValue) {
    if (originalValue != null) return { enabled: true, value: originalValue };
    return {
        enabled: val == null,
        value: deepCopy(val.defaultValue) || deepCopy(val.type.defaultValue),
    };
}

const SingleFilter = ({ filter, definition, onChange, sequence }) => {
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
        <Grid container item direction="row" key={definition.name + '-cont'}>
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
                    <FormattedMessage id={definition.name} />{' '}
                    {sequence ? sequence : ''}
                </Typography>
            </Grid>
            <Grid item xs key={definition.name + '-value'}>
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
        <Grid container item>
            <Grid
                item
                style={{ visibility: 'hidden' }}
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

export const GenericFilter = ({ initialFilter, onChange }) => {
    const [filterType, setFilterType] = useState(initialFilter.type);
    const currentEdit = useRef({ type: { enabled: true, value: filterType } });

    const editDone = () => {
        let res = {};
        Object.entries(currentEdit.current).forEach(([key, value]) => {
            res[key] = value.enabled ? value.value : null;
        });
        onChange(res);
    };

    const changeFilterType = (newType) => {
        currentEdit.current.type = { enabled: true, value: newType };
        setFilterType(newType);
        editDone();
    };

    const renderFilter = (key, definition, sequence) => {
        if (currentEdit.current[key] === undefined)
            currentEdit.current[key] = generateDefaultValue(
                definition,
                initialFilter[key]
            );
        return (
            <SingleFilter
                key={key}
                filter={currentEdit.current[key]}
                definition={definition}
                onChange={editDone}
                sequence={sequence}
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
                        <Grid
                            container
                            item
                            direction={
                                definition.direction === undefined
                                    ? 'row'
                                    : definition.direction
                            }
                            key={key}
                            spacing={1}
                        >
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
                                            definition,
                                            n + 1
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
        <Grid
            container
            spacing={1}
            style={{ width: '100%', padding: 10, paddingRight: 20 }}
        >
            {FilterTypeSelection({
                type: filterType,
                onChange: changeFilterType,
                disabled: false,
            })}
            {RenderGeneric()}
            <Grid item xs={12}>
                <Divider variant={'middle'} style={{ margin: 20 }} />
            </Grid>
            {renderSpecific()}
        </Grid>
    );
};
