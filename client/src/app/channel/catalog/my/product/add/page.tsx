'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Image from 'next/image';
import MobileHeader from '@/components/Layout/MobileHeader/MobileHeader';
import SubHeader from '@/components/Layout/SubHeader/SubHeader';
import CustomInput from '@/components/UI/CustomInput/CustomInput';
import StageButton from '@/components/UI/StageButton/StageButton';
import Card from '@/components/UI/Card/Card';
import defaultImage from '../../../../../../../public/assets/user.png';
import styles from './addProduct.module.css';

const Product: React.FC = () => {
    const router = useRouter();
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    const [imagePreview, setImagePreview] = useState<string>(defaultImage.src);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const handleBack = useCallback(() => {
        router.push('/channel/catalog/my/product');
    }, [router]);

    const handleSubmit = useCallback((event: React.FormEvent) => {
        event.preventDefault();
        console.log("Formulário enviado!");
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

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
                <form onSubmit={handleSubmit}>
                    <div className={styles.addChannelImageUpload}>
                        {imagePreview && (
                            <Image
                                src={imagePreview}
                                alt="Preview"
                                className={styles.addChannelImagePreview}
                                width={70}
                                height={70}
                            />
                        )}
                        <div className={styles.addChannelUploadSection}>
                            {!imageFile && (
                                <div className={styles.uploadInstruction}>
                                    Escolha a imagem de apresentação do seu canal para todo mundo
                                </div>
                            )}
                            <label htmlFor="channel-image" className={styles.addChannelUploadButton}>
                                Escolher arquivo
                            </label>
                            <input
                                type="file"
                                id="channel-image"
                                name="image"
                                onChange={handleImageChange}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                            {imageFile && (
                                <div className={styles.fileName}>{imageFile.name}</div>
                            )}
                        </div>
                    </div>
                    <Card title="Produto">
                        <h1>teste</h1>                        
                    </Card>
                    <div className={styles.confirmationButtonSpace}>
                        <StageButton text="Criar" backgroundColor={'#7B33E5'} type="submit" />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Product;
