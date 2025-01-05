import React, { useCallback, memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import MobileHeader from '../../../../components/Main/MobileHeader/MobileHeader';
import SubHeader from '../../../../components/Main/SubHeader/SubHeader';
import CustomInput from '../../../../components/UI/CustomInput/CustomInput';
import StageButton from '../../../../components/UI/Buttons/StageButton/StageButton';
import Card from '../../../../components/UI/Card/Card';
import defaultImage from '../../../../assets/user.png';
import './Product.css';


const Product = () => {
    const navigate = useNavigate();
    const isMobile = window.innerWidth <= 768;    
    const [imagePreview, setImagePreview] = useState(defaultImage);
    const [imageFile, setImageFile] = useState(null);

    const handleBack = useCallback(() => {
        navigate('/my-catalog');
    }, [navigate]);

    const handleSubmit = useCallback((event) => {
        event.preventDefault();
        console.log("Formulário enviado!");
    }, []);
    

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };


    return (
        <div className="product-page">
            <Helmet>
                <title>Produto</title>
                <meta name="description" content="Visualize os dados detalhados do catálogo." />
            </Helmet>
            {isMobile && (
                <MobileHeader title="Produto" buttons={{ close: true }} handleBack={handleBack} />
            )}
            <div className="product-container">
                <div className="product-header">
                    <SubHeader title="Produto" handleBack={handleBack} />
                </div>
                <form onSubmit={handleSubmit}>
                <div className="add-channel-image-upload">
                        {imagePreview && (
                            <img src={imagePreview} alt="Preview" className="add-channel-image-preview" />
                        )}
                        <div className="add-channel-upload-section">
                            {!imageFile && (
                                <div className="upload-instruction">
                                    Escolha a imagem de apresentação do seu canal para todo mundo
                                </div>
                            )}
                            <label htmlFor="channel-image" className="add-channel-upload-button">
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
                                <div className="file-name">
                                    {imageFile.name}
                                </div>
                            )}
                        </div>
                    </div>
                    <Card title="Produto">
                        <CustomInput
                            title="Nome do produto"
                            type="text"
                            name="name"
                            // value={}
                            // onChange={}
                        />                        
                    </Card>                    
                    <div className="confirmationButton-space">
                        <StageButton text="Salvar" backgroundColor={'#7B33E5'} type="submit" />
                    </div>
                </form>                
            </div>
        </div>
    );
};

export default memo(Product);
