'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import MobileHeader from '@/components/Layout/MobileHeader/MobileHeader';
import SubHeader from '@/components/Layout/SubHeader/SubHeader';
import Card from '@/components/UI/Card/Card';
import styles from './Product.module.css';

const Product: React.FC = () => {
    const router = useRouter();
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

    const handleBack = useCallback(() => {
        router.push('/channel/catalog/my');
    }, [router]);

 

    return (
        <div className={styles.productPage}>
            <Head>
                <title>Produto</title>
                <meta name="description" content="Visualize os dados detalhados do catálogo." />
            </Head>
            {isMobile && (
                <MobileHeader title="Produto" buttons={{ close: true }} handleBack={handleBack} />
            )}
            <div className={styles.productContainer}>
                <div className={styles.productHeader}>
                    <SubHeader title="Produto" handleBack={handleBack} />
                </div>
                <Card 
                title="Cadastrados"
                rightLink={{ href: "/channel/catalog/my/product/add", text: "+ Adicionar produto" }}
                >
                    <h1>Produtos aqui</h1>          
                </Card>        
            </div>
        </div>
    );
};

export default Product;
