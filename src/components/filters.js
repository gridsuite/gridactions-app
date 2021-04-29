import React, { useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Grid from '@material-ui/core/Grid';
import { Chip, InputAdornment, MenuItem, Select } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import { en_countries } from './filters-editor';
import Autocomplete from '@material-ui/lab/Autocomplete';

export const StringInput = ({ initialValue, onChange, disabled }) => {
    return (
        <TextField
            onChange={(e) => {
                onChange(e.target.value);
            }}
            disabled={disabled}
            defaultValue={initialValue}
            variant={'outlined'}
        />
    );
};

export const CountriesSelection = ({ initialValue, onChange, disabled }) => {
    let countriesList;
    try {
        countriesList = require('localized-countries')(
            require('localized-countries/data/' +
                navigator.language.substr(0, 2))
        );
    } catch (error) {
        // fallback to english if no localised list found
        countriesList = en_countries;
    }
    return (
        <Autocomplete
            id="select_countries"
            defaultValue={initialValue}
            multiple={true}
            disabled={disabled}
            onChange={(oldVal, newVal) => onChange(newVal)}
            options={Object.keys(countriesList.object())}
            getOptionLabel={(code) => countriesList.get(code)}
            renderInput={(props) => <TextField {...props} variant="outlined" />}
            renderTags={(val, getTagsProps) =>
                val.map((code, index) => (
                    <Chip
                        id={'chip_' + code}
                        size={'small'}
                        label={countriesList.get(code)}
                        {...getTagsProps({ index })}
                    />
                ))
            }
        />
    );
};

export const RangeType = {
    equality: 'EQUALITY',
    range: 'RANGE',
    approx: 'APPROX',
};

export const RangeSelection = ({ initialValue, onChange, disabled }) => {
    const [equalityType, setEqualityType] = useState(initialValue.type);
    const range = useRef(initialValue);

    function onSetEqualityType(e) {
        console.info(e.target.value);
        range.current.type = e.target.value;
        onChange(range.current);
        setEqualityType(e.target.value);
    }

    function onSetNumber(index, value) {
        console.info(value);
        range.current['value' + (index + 1)] = value;
        onChange(range.current);
    }

    const intl = useIntl();

    return (
        <Grid container spacing={1}>
            <Grid item xs>
                <Select
                    value={equalityType}
                    onChange={onSetEqualityType}
                    disabled={disabled}
                    variant={'filled'}
                >
                    {Object.entries(RangeType).map(([key, value]) => (
                        <MenuItem key={key} value={value}>
                            <FormattedMessage id={key} />
                        </MenuItem>
                    ))}
                </Select>
            </Grid>
            <Grid item xs>
                <TextField
                    onChange={(e) => {
                        onSetNumber(0, e.target.value);
                    }}
                    disabled={disabled}
                    defaultValue={range.current.value1}
                    inputMode={'numeric'}
                    type="number"
                    variant={'outlined'}
                    placeholder={
                        equalityType === RangeType.range
                            ? intl.formatMessage({ id: 'Min' })
                            : ''
                    }
                />
            </Grid>
            {equalityType !== RangeType.equality && (
                <Grid item xs>
                    <TextField
                        onChange={(e) => {
                            onSetNumber(1, e.target.value);
                        }}
                        InputProps={
                            equalityType === RangeType.approx
                                ? {
                                      endAdornment: (
                                          <InputAdornment position="end">
                                              %
                                          </InputAdornment>
                                      ),
                                  }
                                : {}
                        }
                        disabled={disabled}
                        defaultValue={range.current.value2}
                        inputMode={'numeric'}
                        type="number"
                        variant={'outlined'}
                        placeholder={
                            equalityType === RangeType.range
                                ? intl.formatMessage({ id: 'Max' })
                                : ''
                        }
                    />
                </Grid>
            )}
        </Grid>
    );
};

export const filteredTypes = {
    string: {
        defaultValue: '',
        renderer: StringInput,
    },
    countries: {
        defaultValue: [],
        renderer: CountriesSelection,
    },
    range: {
        renderer: RangeSelection,
        defaultValue: {
            type: RangeType.equality,
            value: [undefined, undefined],
        },
    },
};
