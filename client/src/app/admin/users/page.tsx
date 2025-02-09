'use client';

import React, { memo, useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';

// Import dos serviços
import {
  getAllUsers,
  getChannelByPersonId,
  getCatalogsByChannelId,
} from '../../../services/adminService';

import {
    updateCatalogRelease,
    isCatalogReleased,
  } from '../../../services/catalogService';

// Se você usava getConfig, substitua por variáveis de ambiente:
const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
const frontUrl = process.env.NEXT_PUBLIC_FRONT_URL || '';

// Componentes
import HeaderButton from '../../../components/UI/HeaderButton/HeaderButton';
import LoadingSpinner from '../../../components/UI/LoadingSpinner/LoadingSpinner';

// Ícones/imagens
import closeIcon from '../../../../public/assets/close.svg';

// CSS modules
import styles from './users.module.css';

function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [userChannels, setUserChannels] = useState<{ [key: string]: any }>({});
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [catalogs, setCatalogs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const pageSize = 10;
  const router = useRouter();

  // Carregar usuários ao montar e/ou quando currentPage muda
  useEffect(() => {
    fetchUsers(currentPage, pageSize);
  }, [currentPage]);

  async function fetchUsers(page: number, size: number) {
    try {
      setLoading(true);
      const response = await getAllUsers(page, size);
      // Ex: response.content, response.totalPages
      setUsers(response.content);
      setFilteredUsers(response.content);
      setTotalPages(response.totalPages);

      const channelsStatus: { [key: string]: any } = {};
      await Promise.all(
        response.content.map(async (user: any) => {
          try {
            const channel = await getChannelByPersonId(user.peopleId);
            channelsStatus[user.peopleId] = channel;
          } catch (error) {
            channelsStatus[user.peopleId] = null;
          }
        })
      );
      setUserChannels(channelsStatus);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  }

  // Filtro pelo searchTerm
  useEffect(() => {
    const filtered = users.filter((user) => {
      const lowerSearch = searchTerm.toLowerCase();
      return (
        user.cpf.toLowerCase().includes(lowerSearch) ||
        user.nickname.toLowerCase().includes(lowerSearch) ||
        user.email.toLowerCase().includes(lowerSearch)
      );
    });

    setFilteredUsers(filtered);

    if (filtered.length === 1) {
      const exactMatch = filtered[0];
      const lowerSearch = searchTerm.toLowerCase();
      if (
        exactMatch.cpf.toLowerCase() === lowerSearch ||
        exactMatch.nickname.toLowerCase() === lowerSearch ||
        exactMatch.email.toLowerCase() === lowerSearch
      ) {
        setSelectedUser(exactMatch);
        setSelectedChannel(userChannels[exactMatch.peopleId]);
        fetchCatalogs(userChannels[exactMatch.peopleId]?.id);
      } else {
        clearSelection();
      }
    } else {
      clearSelection();
    }
  }, [searchTerm, users, userChannels]);

  function clearSelection() {
    setSelectedUser(null);
    setSelectedChannel(null);
    setCatalogs([]);
  }

  async function fetchCatalogs(channelId?: string) {
    try {
      if (channelId) {
        const catalogsData = await getCatalogsByChannelId(channelId);
        const catalogsWithReleaseStatus = await Promise.all(
          catalogsData.map(async (catalog: any) => {
            const released = await isCatalogReleased(catalog.id);
            return { ...catalog, released };
          })
        );
        setCatalogs(catalogsWithReleaseStatus);
      }
    } catch (error) {
      console.error('Erro ao buscar catálogos:', error);
      setCatalogs([]);
    }
  }

  function handleUserClick(user: any, index: number) {
    const alreadySelected = selectedUser?.id === user.id;
    if (alreadySelected) {
      clearSelection();
      return;
    }

    setSelectedUser(user);
    const channel = userChannels[user.peopleId];
    setSelectedChannel(channel);

    if (channel) {
      fetchCatalogs(channel.id);
    } else {
      setCatalogs([]);
    }
  }

  function handleNextPage() {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  }

  function handlePreviousPage() {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  }

  function handleNicknameClick() {
    // Caso seja um link externo, pode manter window.location.href
    // ou usar router.push se for interno
    if (selectedChannel) {
      window.location.href = `${frontUrl}${selectedChannel.nickname}`;
      // ou router.push(`${frontUrl}${selectedChannel.nickname}`) se for dentro do seu app
    }
  }

  async function handleCatalogRelease(catalogId: string, released: boolean) {
    try {
      await updateCatalogRelease(catalogId, released);
      if (selectedChannel?.id) {
        fetchCatalogs(selectedChannel.id);
      }
    } catch (error) {
      console.error('Erro ao atualizar o status de liberação do catálogo:', error);
    }
  }

  return (
    <div className={styles['users-page']}>
      <Head>
        <title>Administration</title>
        <meta name="description" content="Administration na Nilrow." />
      </Head>

      <div className={styles['users-container']}>
        {loading && <LoadingSpinner />}

        <div className={styles['users-search-container']}>
          <HeaderButton
            onClick={() => router.back()} // Substitui navigate(-1)
            icon={closeIcon}
          />
          <input
            type="text"
            placeholder="Pesquisar por CPF, nome de usuário ou e-mail"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles['users-search-input']}
          />
          <span className={styles['user-count']}>
            {filteredUsers.length} usuários
          </span>
        </div>

        <div className={styles['users-section']}>
          <div
            className={`${styles['users-list']} ${
              selectedUser ? styles['with-card'] : ''
            }`}
          >
            <div className={styles['users-header']}>
              <div className={styles['user-columnindex']}>#</div>
              <div className={styles['user-columncpf']}>CPF</div>
              <div className={styles['user-columnnickname']}>Nome de usuário</div>
              <div className={styles['user-columnemail']}>E-mail</div>
              <div className={styles['user-columnchannel']}>Possui Canal</div>
              <div className={styles['user-columnrole']}>Role</div>
            </div>

            {filteredUsers.map((user, index) => {
              const isSelected = selectedUser?.id === user.id;
              const backgroundColor = isSelected
                ? '#414141'
                : index % 2 === 0
                ? '#0B0B0B'
                : 'black';

              return (
                <div
                  key={user.id}
                  className={`
                    ${styles['user-row']} 
                    ${isSelected ? styles['selected'] : ''}
                  `}
                  onClick={() => handleUserClick(user, index)}
                  style={{ backgroundColor, height: '57px', cursor: 'pointer' }}
                >
                  <div className={styles['user-columnindex']}>
                    {index + 1 + currentPage * pageSize}
                  </div>
                  <div className={styles['user-columncpf']}>{user.cpf}</div>
                  <div className={styles['user-columnnickname']}>{user.nickname}</div>
                  <div className={styles['user-columnemail']}>{user.email}</div>
                  <div
                    className={`
                      ${styles['user-columnchannel']} 
                      ${userChannels[user.peopleId] ? styles['channel-yes'] : styles['channel-no']}
                    `}
                  >
                    <span className={styles['user-columnchannel-name']}>
                      {userChannels[user.peopleId] ? 'Sim' : 'Não'}
                    </span>
                  </div>
                  <div className={styles['user-columnrole']}>{user.role}</div>
                </div>
              );
            })}

            <div
              className={`
                ${styles['pagination-controls']} 
                ${selectedUser ? styles['pagination-with-card'] : ''}
              `}
            >
              <button onClick={handlePreviousPage} disabled={currentPage === 0}>
                Anterior
              </button>
              <span>
                Página {currentPage + 1} de {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages - 1}
              >
                Próxima
              </button>
            </div>
          </div>

          {/* Se tiver um usuário selecionado */}
          {selectedUser && (
            <div className={styles['user-card-container']}>
              <div className={styles['user-card']}>
                <h3>Informações do Usuário</h3>
                <p>
                  <span className={styles['user-card-name']}>Nome de usuário</span>
                  {selectedUser.nickname}
                </p>
                <p>
                  <span className={styles['user-card-name']}>Nome</span>
                  {selectedUser.name}
                </p>
                <p>
                  <span className={styles['user-card-name']}>Email</span>
                  {selectedUser.email}
                </p>
                <p>
                  <span className={styles['user-card-name']}>Telefone</span>
                  {selectedUser.phone}
                </p>
                <p>
                  <span className={styles['user-card-name']}>CPF</span>
                  {selectedUser.cpf}
                </p>
                <p>
                  <span className={styles['user-card-name']}>Data de nascimento</span>
                  {selectedUser.birthDate}
                </p>
                <p>
                  <span className={styles['user-card-name']}>Role</span>
                  {selectedUser.role}
                </p>
              </div>

              {/* Card de Canal (se existir) */}
              {selectedChannel && (
                <div className={styles['channel-card']}>
                  {/* Se quiser otimizar, use next/image */}
                  <img
                    src={`${apiUrl}${selectedChannel.imageUrl}`}
                    alt="Canal"
                    className={styles['channel-image']}
                  />
                  <div className={styles['channel-info']}>
                    <p className={styles['channel-name']}>{selectedChannel.name}</p>
                    <p className={styles['channel-biography']}>
                      {selectedChannel.biography}
                    </p>
                    <button
                      className={styles['channel-nickname-btn']}
                      onClick={handleNicknameClick}
                    >
                      Ir para o canal
                    </button>
                  </div>
                </div>
              )}

              {/* Lista de catálogos (se houver) */}
              {catalogs.length > 0 &&
                catalogs.map((catalog) => (
                  <div key={catalog.id} className={styles['catalog-card']}>
                    <h3>{catalog.name}</h3>
                    <p>
                      <span className={styles['catalog-card-label']}>
                        Nome do responsável:
                      </span>
                      {catalog.nameBoss}
                    </p>
                    <p>
                      <span className={styles['catalog-card-label']}>CNPJ: </span>
                      {catalog.cnpj}
                    </p>
                    <p>
                      <span className={styles['catalog-card-label']}>Email: </span>
                      {catalog.email}
                    </p>
                    <p>
                      <span className={styles['catalog-card-label']}>Telefone: </span>
                      {catalog.phone}
                    </p>
                    <button
                      className={`
                        ${styles['catalog-release-btn']} 
                        ${catalog.released ? styles['btn-deactivate'] : styles['btn-activate']}
                      `}
                      onClick={() =>
                        handleCatalogRelease(catalog.id, !catalog.released)
                      }
                    >
                      {catalog.released ? 'Desativar' : 'Ativar'}
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(UsersPage);
