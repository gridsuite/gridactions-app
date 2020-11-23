/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useState } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import NativeSelect from '@material-ui/core/NativeSelect';
import InputBase from '@material-ui/core/InputBase';
import withStyles from '@material-ui/core/styles/withStyles';

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

const GuiPane = () => {
    const classes = useStyles();

    const [equipmentID, setEquipmentID] = useState('*');
    const [equipmentName, setEquipmentName] = useState('*');
    const [equipmentType, setEquipmentType] = useState('*');
    const [operator, setOperator] = useState('=');
    const [nominalVoltage, setNominalVoltage] = useState('*');

    function handleOperator(event) {
        setOperator(event.target.value);
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
                            value={operator}
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
                    />
                </Grid>
            </Grid>
        </div>
    );
};

export default GuiPane;
