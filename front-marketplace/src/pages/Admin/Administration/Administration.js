import React, { memo, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { getAllUsers, getChannelByPersonId, getCatalogsByChannelId, updateCatalogRelease, isCatalogReleased } from '../../../services/adminApi';
import getConfig from '../../../config';
import './Administration.css';

const { apiUrl, frontUrl } = getConfig();

const Administration = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [userChannels, setUserChannels] = useState({});
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [catalogs, setCatalogs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 10;

    useEffect(() => {
        fetchUsers(currentPage, pageSize);
    }, [currentPage]);

    const fetchUsers = async (page, size) => {
        try {
            const response = await getAllUsers(page, size);
            setUsers(response.content);
            setFilteredUsers(response.content);
            setTotalPages(response.totalPages);

            const channelsStatus = {};
            await Promise.all(response.content.map(async (user) => {
                try {
                    const channel = await getChannelByPersonId(user.peopleId);
                    channelsStatus[user.peopleId] = channel;
                } catch (error) {
                    channelsStatus[user.peopleId] = null;
                }
            }));

            setUserChannels(channelsStatus);

        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
        }
    };

    useEffect(() => {
        const filtered = users.filter(user =>
            user.cpf.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        setFilteredUsers(filtered);

        if (filtered.length === 1) {
            const exactMatch = filtered[0];
            if (
                exactMatch.cpf.toLowerCase() === searchTerm.toLowerCase() ||
                exactMatch.nickname.toLowerCase() === searchTerm.toLowerCase() ||
                exactMatch.email.toLowerCase() === searchTerm.toLowerCase()
            ) {
                setSelectedUser(exactMatch);
                setSelectedChannel(userChannels[exactMatch.peopleId]);
                fetchCatalogs(userChannels[exactMatch.peopleId]?.id);
            } else {
                setSelectedUser(null);
                setSelectedChannel(null);
                setCatalogs([]);
            }
        } else {
            setSelectedUser(null);
            setSelectedChannel(null);
            setCatalogs([]);
        }
    
    }, [searchTerm, users, userChannels]);

    const fetchCatalogs = async (channelId) => {
        try {
            if (channelId) {
                const catalogsData = await getCatalogsByChannelId(channelId);

                // Verifica se cada catálogo está liberado e adiciona essa informação ao objeto catálogo
                const catalogsWithReleaseStatus = await Promise.all(
                    catalogsData.map(async (catalog) => {
                        const isReleased = await isCatalogReleased(catalog.id);
                        return { ...catalog, released: isReleased };
                    })
                );

                setCatalogs(catalogsWithReleaseStatus);
            }
        } catch (error) {
            console.error('Erro ao buscar catálogos:', error);
            setCatalogs([]);
        }
    };

    const handleUserClick = (user) => {
        const selected = selectedUser?.id === user.id ? null : user;
        setSelectedUser(selected);
        setSelectedChannel(selected ? userChannels[user.peopleId] : null);

        if (selected && userChannels[user.peopleId]) {
            fetchCatalogs(userChannels[user.peopleId].id);
        } else {
            setCatalogs([]);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNicknameClick = () => {
        if (selectedChannel) {
            window.location.href = `${frontUrl}${selectedChannel.nickname}`;
        }
    };

    const handleCatalogRelease = async (catalogId, released) => {
        try {
            await updateCatalogRelease(catalogId, released);
            fetchCatalogs(selectedChannel?.id); // Atualiza a lista de catálogos após a alteração
        } catch (error) {
            console.error('Erro ao atualizar o status de liberação do catálogo:', error);
        }
    };

    return (
        <div className="administration-page">
            <Helmet>
                <title>Administration</title>
                <meta name="description" content="Administration na Nilrow." />
            </Helmet>
            <div className="administration-container">
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Pesquisar por CPF, nome de usuário ou e-mail"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="administration-search-input"
                    />
                    <span className="user-count">{filteredUsers.length} usuários</span>
                </div>
                <div className="users-section">
                    <div className={`users-list ${selectedUser ? 'with-card' : ''}`}>
                        <div className="users-header">
                            <div className="user-columnindex">#</div>
                            <div className="user-columncpf">CPF</div>
                            <div className="user-columnnickname">Nome de usuário</div>
                            <div className="user-columnemail">E-mail</div>
                            <div className="user-columnchannel">Possui Canal</div>
                            <div className="user-columnrole">Role</div>                            
                        </div>
                        {filteredUsers.map((user, index) => (
                            <div
                                key={user.id}
                                className={`user-row ${selectedUser?.id === user.id ? 'selected' : ''}`}
                                onClick={() => handleUserClick(user)}
                                style={{ 
                                    backgroundColor: selectedUser?.id === user.id ? '#414141' : (index % 2 === 0 ? '#0B0B0B' : 'black'), 
                                    height: '57px' 
                                }}
                            >
                                <div className="user-columnindex">{index + 1 + currentPage * pageSize}</div>
                                <div className="user-columncpf">{user.cpf}</div>
                                <div className="user-columnnickname">{user.nickname}</div>
                                <div className="user-columnemail">{user.email}</div>                                
                                <div className={`user-columnchannel ${userChannels[user.peopleId] ? 'channel-yes' : 'channel-no'}`}>
                                    <span className="user-columnchannel-name">
                                        {userChannels[user.peopleId] ? "Sim" : "Não"}
                                    </span>
                                </div>
                                <div className="user-columnrole">{user.role}</div>
                            </div>
                        ))}
                    
                    <div className={`pagination-controls ${selectedUser ? 'pagination-with-card' : ''}`}>
                        <button onClick={handlePreviousPage} disabled={currentPage === 0}>
                            Anterior
                        </button>
                        <span>Página {currentPage + 1} de {totalPages}</span>
                        <button onClick={handleNextPage} disabled={currentPage >= totalPages - 1}>
                            Próxima
                        </button>
                    </div>
                </div>
                </div>
                {selectedUser && (
                    <div className="user-card-container">
                        <div className="user-card">
                            <h3>Informações do Usuário</h3>
                            <p><span className="user-card-name">Nome de usuário</span> {selectedUser.nickname}</p>
                            <p><span className="user-card-name">Nome</span> {selectedUser.name}</p>
                            <p><span className="user-card-name">Email</span> {selectedUser.email}</p>
                            <p><span className="user-card-name">Telefone</span> {selectedUser.phone}</p>
                            <p><span className="user-card-name">CPF</span> {selectedUser.cpf}</p>
                            <p><span className="user-card-name">Data de nascimento</span> {selectedUser.birthDate}</p>
                            <p><span className="user-card-name">Role</span> {selectedUser.role}</p>
                        </div>
                        {selectedChannel && (
                            <div className="channel-card">
                                <img src={`${apiUrl}${selectedChannel.imageUrl}`} alt="Canal" className="channel-image" />
                                <div className="channel-info">
                                    <p className="channel-name">{selectedChannel.name}</p>
                                    <p className="channel-biography">{selectedChannel.biography}</p>
                                    <button className="channel-nickname-btn" onClick={handleNicknameClick}>
                                        Ir para o canal
                                    </button>
                                </div>
                            </div>
                        )}
                        {catalogs.length > 0 && catalogs.map(catalog => (
                            <div key={catalog.id} className="catalog-card">
                                <h3>{catalog.name}</h3>
                                <p><span className="catalog-card-label">Nome do responsável: </span>{catalog.nameBoss}</p>
                                <p><span className="catalog-card-label">CNPJ: </span>{catalog.cnpj}</p>
                                <p><span className="catalog-card-label">Email: </span>{catalog.email}</p>
                                <p><span className="catalog-card-label">Telefone: </span>{catalog.phone}</p>
                                <button
                                    className={`catalog-release-btn ${catalog.released ? 'btn-deactivate' : 'btn-activate'}`}
                                    onClick={() => handleCatalogRelease(catalog.id, !catalog.released)}
                                >
                                    {catalog.released ? 'Desativar' : 'Ativar'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default memo(Administration);
