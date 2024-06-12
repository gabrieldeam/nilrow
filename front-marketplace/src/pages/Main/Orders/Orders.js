import React, { memo } from 'react';
import { Helmet } from 'react-helmet-async';

const Orders = () => {
    return (
        <div>
            <Helmet>
                <title>Pedidos - Nilrow</title>
                <meta name="description" content="Veja seus pedidos na Nilrow." />
            </Helmet>
            <h1>Orders</h1>
        </div>
    );
};

export default memo(Orders);
