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
import { useDispatch, useSelector } from 'react-redux';
import {
    updateEquipmentID,
    updateEquipmentType,
    updateNominalVoltageOperator,
    updateEquipmentName,
    updateNominalVoltage,
} from '../redux/actions';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        padding: 10,
    },
}));

const BootstrapInput = withStyles((theme) => ({
    input: {
        borderRadius: 4,
        position: 'relative',
        minWidth: '185px',
        border: '1px solid',
        fontSize: 16,
        padding: 10,
    },
}))(InputBase);

const FiltersEditor = ({ item }) => {
    const classes = useStyles();

    const dispatch = useDispatch();

    const equipmentID = useSelector((state) => state.equipmentID);
    const equipmentName = useSelector((state) => state.equipmentName);
    const equipmentType = useSelector((state) => state.equipmentType);
    const nominalVoltageOperator = useSelector((state) => state.nominalVoltageOperator);
    const nominalVoltage = useSelector((state) => state.nominalVoltage);

    function handleOperator(event) {
        dispatch(updateNominalVoltageOperator(event.target.value));
    }

    function handleEquipmentType(event) {
        dispatch(updateEquipmentType(event.target.value));
    }

    function handleEquipmentID(event) {
        dispatch(updateEquipmentID(event.target.value));
    }

    function handleEquipmentName(event) {
        dispatch(updateEquipmentName(event.target.value));
    }

    function handleNominalVoltage(event) {
        dispatch(updateNominalVoltage(event.target.value));
    }

    useEffect(() => {
        if (item !== null) {
            dispatch(updateEquipmentName(item.equipmentName));
            dispatch(updateEquipmentID(item.equipmentID));
            dispatch(updateNominalVoltageOperator(item.nominalVoltageOperator));
            dispatch(updateNominalVoltage(item.nominalVoltage));
            dispatch(updateEquipmentType(item.equipmentType));
        }
    }, item);

    return (
        <div className={classes.root}>
            <Grid container direction="row" spacing={1}>
                <Grid item xs={12} sm={4}>
                    <h3>Equipment ID</h3>
                </Grid>
                <Grid item xs={12} sm={8}>
                    <TextField
                        onChange={handleEquipmentID}
                        label="Equipment ID"
                        variant="outlined"
                        value={item !== null ? item.equipmentID : equipmentID}
                    />
                </Grid>
            </Grid>

            <Grid container direction="row" spacing={1}>
                <Grid item xs={12} sm={4}>
                    <h3>Equipment name</h3>
                </Grid>
                <Grid item xs={12} sm={8}>
                    <TextField
                        onChange={handleEquipmentName}
                        label="Equipment name"
                        variant="outlined"
                        value={
                            item !== null ? item.equipmentName : equipmentName
                        }
                    />
                </Grid>
            </Grid>

            <Grid container direction="row" spacing={1}>
                <Grid item xs={12} sm={4}>
                    <h3>Equipment type</h3>
                </Grid>
                <Grid item xs={12} sm={8}>
                    <FormControl className="MuiFormControl-root">
                        <NativeSelect
                            id="demo-customized-select-native"
                            value={equipmentType}
                            onChange={handleEquipmentType}
                            input={<BootstrapInput />}
                        >
                            <option value={'*'}>*</option>
                            <option value={'Lines'}>Lines</option>
                            <option value={'Substations'}>Substations</option>
                        </NativeSelect>
                    </FormControl>
                </Grid>
            </Grid>

            <Grid container direction="row" spacing={1}>
                <Grid item xs={10} sm={3}>
                    <h3>Nominal voltage (KV)</h3>
                </Grid>
                <Grid item xs={2} sm={1}>
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
                <Grid item xs={12} sm={8}>
                    <TextField
                        onChange={handleNominalVoltage}
                        label="Nominal voltage"
                        variant="outlined"
                        value={
                            item !== null ? item.nominalVoltage : nominalVoltage
                        }
                    />
                </Grid>
            </Grid>
        </div>
    );
};

export default FiltersEditor;
