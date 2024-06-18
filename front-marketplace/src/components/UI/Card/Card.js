import React, { memo } from 'react';
import PropTypes from 'prop-types';
import './Card.css';

const Card = ({ title, children, leftLink, rightLink, rightButton }) => {
    return (
        <div className="card-container">
            {title && (
                <div className="card-header">
                    <h2 className="card-title">{title}</h2>
                    <div className="card-links">
                        {leftLink && (
                            <a href={leftLink.href} className="left-link">
                                {leftLink.text}
                            </a>
                        )}
                        {rightLink && (
                            <a href={rightLink.href} className="right-link">
                                {rightLink.text}
                            </a>
                        )}
                        {rightButton && (
                            <button type="button" onClick={rightButton.onClick} className="right-link-button">
                                {rightButton.text}
                            </button>
                        )}
                    </div>
                </div>
            )}
            <div className="card-content">{children}</div>
        </div>
    );
};

Card.propTypes = {
    title: PropTypes.string,
    children: PropTypes.node.isRequired,
    leftLink: PropTypes.shape({
        href: PropTypes.string,
        text: PropTypes.string
    }),
    rightLink: PropTypes.shape({
        href: PropTypes.string,
        text: PropTypes.string
    }),
    rightButton: PropTypes.shape({
        onClick: PropTypes.func.isRequired,
        text: PropTypes.string.isRequired
    })
};

export default memo(Card);
