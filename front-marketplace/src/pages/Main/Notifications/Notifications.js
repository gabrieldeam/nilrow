import React, { memo } from 'react';
import { Helmet } from 'react-helmet-async';

const Notifications = () => {
    return (
        <div>
            <Helmet>
                <title>Notificações - Nilrow</title>
                <meta name="description" content="Veja suas notificações na Nilrow." />
            </Helmet>
            <h1>Notifications</h1>
        </div>
    );
};

export default memo(Notifications);
