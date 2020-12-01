/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useEffect, useState } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import NativeSelect from '@material-ui/core/NativeSelect';
import InputBase from '@material-ui/core/InputBase';
import withStyles from '@material-ui/core/styles/withStyles';
import { equipmentTypes } from '../utils/equipment-types';
import { FormattedMessage, useIntl } from 'react-intl';

const useStyles = makeStyles(() => ({
    root: {
        flexGrow: 1,
        paddingLeft: '40px',
    },
    textField: {
        color: 'red',
        width: '2033px',
    },
}));

const BootstrapInput = withStyles(() => ({
    input: {
        minWidth: '223px',
        minHeight: '19px',
        color: 'white',
        borderColor: 'grey',
        borderRadius: 4,
        position: 'relative',
        border: '1px solid',
        fontSize: 16,
        paddingLeft: 14,
        paddingRight: 14,
        paddingTop: 18.5,
        paddingBottom: 18.5,
    },
}))(InputBase);

const CustomTextField = withStyles(() => ({
    root: {
        width: '263px',
    },
}))(TextField);

const FiltersEditor = ({ item, onChange }) => {
    const classes = useStyles();

    const [equipmentID, setEquipmentID] = useState('*');
    const [equipmentName, setEquipmentName] = useState('*');
    const [equipmentType, setEquipmentType] = useState(equipmentTypes.LINE);
    const [nominalVoltageOperator, setNominalVoltageOperator] = useState('=');
    const [nominalVoltage, setNominalVoltage] = useState('*');

    const intl = useIntl();

    function handleOperator(event) {
        setNominalVoltageOperator(event.target.value);
    }

    function handleEquipmentType(event) {
        setEquipmentType(event.target.value);
    }

    function handleEquipmentID(event) {
        setEquipmentID(event.target.value);
    }

    function handleEquipmentName(event) {
        setEquipmentName(event.target.value);
    }

    function handleNominalVoltage(event) {
        setNominalVoltage(event.target.value);
    }

    useEffect(() => {
        onChange(
            equipmentID,
            equipmentName,
            equipmentType,
            nominalVoltageOperator,
            nominalVoltage
        );
    }, [
        onChange,
        equipmentID,
        equipmentName,
        equipmentType,
        nominalVoltage,
        nominalVoltageOperator,
    ]);

    useEffect(() => {
        if (item !== null) {
            setEquipmentName(item.equipmentName);
            setEquipmentID(item.equipmentID);
            setNominalVoltageOperator(item.nominalVoltageOperator);
            setNominalVoltage(item.nominalVoltage);
            setEquipmentType(item.equipmentType);
        } else {
            setEquipmentName('*');
            setEquipmentID('*');
            setNominalVoltageOperator('=');
            setNominalVoltage('*');
            setEquipmentType(equipmentTypes.BRANCH);
        }
    }, [item]);

    return (
        <div className={classes.root}>
            <Grid container direction="row" spacing={1}>
                <Grid item xs={12} sm={3}>
                    <h3>
                        <FormattedMessage id="equipmentID" />
                    </h3>
                </Grid>
                <Grid item xs={12} sm={9}>
                    <CustomTextField
                        onChange={handleEquipmentID}
                        variant="outlined"
                        value={equipmentID}
                    />
                </Grid>
            </Grid>

            <Grid container direction="row" spacing={1}>
                <Grid item xs={12} sm={3}>
                    <h3>
                        <FormattedMessage id="equipmentName" />
                    </h3>
                </Grid>
                <Grid item xs={12} sm={9}>
                    <CustomTextField
                        onChange={handleEquipmentName}
                        variant="outlined"
                        value={equipmentName}
                    />
                </Grid>
            </Grid>

            <Grid container direction="row" spacing={1}>
                <Grid item xs={9} sm={2}>
                    <h3>
                        <FormattedMessage id="nominalVoltage" />
                    </h3>
                </Grid>
                <Grid item xs={3} sm={1}>
                    <FormControl className={classes.formControl}>
                        <Select
                            native
                            value={nominalVoltageOperator}
                            onChange={handleOperator}
                        >
                            <option value={'='}>=</option>
                            <option value={'>'}> &gt; </option>
                            <option value={'>='}> &ge; </option>
                            <option value={'<'}> &lt; </option>
                            <option value={'<='}> &le; </option>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={9}>
                    <CustomTextField
                        onChange={handleNominalVoltage}
                        variant="outlined"
                        value={nominalVoltage}
                    />
                </Grid>
            </Grid>

            <Grid container direction="row" spacing={1}>
                <Grid item xs={12} sm={3}>
                    <h3>
                        {' '}
                        <FormattedMessage id="equipmentType" />
                    </h3>
                </Grid>
                <Grid item xs={12} sm={9}>
                    <FormControl>
                        <NativeSelect
                            id="demo-customized-select-native"
                            value={equipmentType}
                            onChange={handleEquipmentType}
                            input={<BootstrapInput />}
                        >
                            {Object.values(equipmentTypes).map((val) => (
                                <option value={val} key={val}>
                                    {intl.formatMessage({ id: val })}
                                </option>
                            ))}
                        </NativeSelect>
                    </FormControl>
                </Grid>
            </Grid>
        </div>
    );
};

export default FiltersEditor;
