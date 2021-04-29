import { ScriptTypes } from '../utils/script-types';
import PanToolIcon from '@material-ui/icons/PanTool';
import DescriptionIcon from '@material-ui/icons/Description';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import EditIcon from '@material-ui/icons/Edit';
import { FormattedMessage } from 'react-intl';
import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import Menu from '@material-ui/core/Menu';
import { ListItem } from '@material-ui/core';

const useStyles = makeStyles(() => ({
    iconList: {
        margin: '0 15px 0 10px',
    },
    listItemText: {
        padding: '15px 25px 15px',
        margin: '0',
        overflow: 'hidden',
        '& span': {
            width: 220,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
        },
    },
    listItem: {
        margin: '0',
        padding: '0',
    },
}));

const maxLengthListName = 21; // Max length of list name

const useStylesCustomTooltip = makeStyles((theme) => ({
    tooltip: {
        boxShadow: theme.shadows[1],
        fontSize: '20px',
        textTransform: 'capitalize',
    },
}));

const CustomTooltip = (props) => {
    const classes = useStylesCustomTooltip();

    return <Tooltip arrow classes={classes} {...props} />;
};

const ListAction = ({ anchorEl, setAnchorEl, actions }) => {
    const [currentAction, setCurrentAction] = useState(null);

    const handleCloseMenu = () => {
        setCurrentAction(null);
        setAnchorEl(null);
    };

    const makeMenu = (key) => {
        return (
            <MenuItem onClick={() => setCurrentAction(key)} key={key}>
                <ListItemIcon>
                    <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={<FormattedMessage id={key} />} />
            </MenuItem>
        );
    };

    return currentAction === null ? (
        <Menu
            id="list-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
        >
            {Object.keys(actions).map(makeMenu)}
        </Menu>
    ) : (
        actions[currentAction]({ onClose: handleCloseMenu, open: true })
    );
};

export const CustomListItem = ({
    item,
    selected,
    handleItemClicked,
    actions,
}) => {
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = React.useState(null);

    const IconItem = ({ type }) => {
        return type === ScriptTypes.SCRIPT ? (
            <DescriptionIcon className={classes.iconList} />
        ) : (
            <PanToolIcon className={classes.iconList} />
        );
    };

    return (
        <ListItem
            className={classes.listItem}
            button
            key={item.name}
            selected={selected}
            onClick={() => handleItemClicked(item)}
        >
            <IconItem type={item.type}/>
            {item.name.length > maxLengthListName ? (
                <CustomTooltip title={item.name}>
                    <ListItemText
                        className={classes.listItemText}
                        primary={item.name}
                    />
                </CustomTooltip>
            ) : (
                <ListItemText
                    className={classes.listItemText}
                    primary={item.name}
                />
            )}
            <IconButton
                aria-label="settings"
                aria-controls="list-menu"
                aria-haspopup="true"
                variant="contained"
                onClick={(event) => setAnchorEl(event.currentTarget)}
            >
                <MoreVertIcon />
            </IconButton>
            <ListAction
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                actions={actions}
            />
        </ListItem>
    );
};
