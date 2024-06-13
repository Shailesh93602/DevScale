import React from 'react';
import { Button } from 'reactstrap';
import classNames from 'classnames';
import './CustomButton.scss'
import '../common/CustomButton.scss';



const CentralizeButton = ({
    text,
    className,
    icon: Icon,
    iconClassNames,
    size = 'md',
    color = 'primary',
    iconColor = undefined,
    outline,
    isIconLeftSide = false,
    iconSize, // Default icon size
    onClick,
    styleIcon,
    iconFill,
    ...props
}) => {
    const propsData =
        color === 'gradient' && outline ? { ...props, data: text } : { ...props };
    const iconSizeData = iconSize || getIconSize(size);
    const iconProps = iconFill ? { fill: iconFill } : {};

    const buttonClasses = classNames({
        custom: true,
        display: 'flex',
        [`btn-custom-${size}`]: true,
        [`btn-custom-${color}`]: true,
        [`btn-custom-outline-${color}`]: outline,
        'btn-custom-icon': !!Icon,
        [`btn-custom-icon-direction-${isIconLeftSide ? 'left' : 'right'}`]: true,
    });

    const iconClasses = classNames(iconClassNames, {
        'btn-custom-icon-data': true,
        [`btn-custom-icon-${isIconLeftSide ? 'left' : 'right'}`]: true,
    });

    return (
        <Button
            onClick={onClick}
            className={className}
            color={buttonClasses}
            {...propsData}
        >
            {isIconLeftSide && Icon && (
                <Icon
                    color={iconColor || undefined}
                    style={styleIcon}
                    className={iconClasses}
                    size={parseInt(iconSizeData, 10)}
                    {...iconProps}
                />
            )}

            {color === 'gradient' && outline ? (
                <></>
            ) : (
                <>
                    <span>{text}</span>
                </>
            )}

            {!isIconLeftSide && Icon && (
                <Icon
                    color={iconColor || undefined}
                    style={styleIcon}
                    className={iconClasses}
                    size={parseInt(iconSizeData, 10)}
                    {...iconProps}
                />
            )}
        </Button>
    );
};

function getIconSize(btnSize) {
    if (btnSize === 'lg') {
        return '22';
    }
    if (btnSize === 'sm') {
        return '14';
    }

    return '16';
}

export default CentralizeButton;
