'use client';

import React, { memo, useEffect, useState, ChangeEvent } from 'react';
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

const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
const frontUrl = process.env.NEXT_PUBLIC_FRONT_URL || '';

// Componentes
import HeaderButton from '../../../components/UI/HeaderButton/HeaderButton';
import LoadingSpinner from '../../../components/UI/LoadingSpinner/LoadingSpinner';

// Ícones/imagens
import closeIcon from '../../../../public/assets/close.svg';

// CSS modules
import styles from './users.module.css';

// Renomeia a importação do componente Image para evitar conflitos
import NextImage from 'next/image';

// Interfaces para os dados retornados pela API

interface User {
  id: string;
  cpf: string;
  nickname?: string;
  email: string;
  peopleId?: string;
  role?: string;
  name?: string;
  phone?: string;
  birthDate?: string;
}

interface Channel {
  id: string;
  name: string;
  imageUrl?: string;
  nickname?: string;
  biography?: string;
}

// Tipo dos dados recebidos da API para catálogo (sem released)
interface CatalogData {
  id: string;
  name?: string;
  nameBoss?: string;
  cnpj?: string;
  email?: string;
  phone?: string;
}

// Interface Catalog que extende CatalogData e inclui released
interface Catalog extends CatalogData {
  released: boolean;
}

// Interface para resposta paginada de usuários
interface PaginatedUsers {
  content: User[];
  totalPages: number;
}

function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [userChannels, setUserChannels] = useState<{ [key: string]: Channel | null }>({});
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const pageSize = 10;
  const router = useRouter();

  // Carrega os usuários ao montar e/ou quando a página atual mudar
  useEffect(() => {
    fetchUsers(currentPage, pageSize);
  }, [currentPage]);

  async function fetchUsers(page: number, size: number) {
    try {
      setLoading(true);
      const response: PaginatedUsers = await getAllUsers(page, size);
      // Transforme os dados para garantir que as propriedades existam
      const transformedUsers = response.content.map((u) => ({
        ...u,
        peopleId: u.peopleId || '',
        role: u.role || '',
      }));
      setUsers(transformedUsers);
      setFilteredUsers(transformedUsers);
      setTotalPages(response.totalPages);

      const channelsStatus: { [key: string]: Channel | null } = {};
      await Promise.all(
        transformedUsers.map(async (user) => {
          try {
            const channel: Channel = await getChannelByPersonId(user.peopleId);
            channelsStatus[user.peopleId] = channel;
          } catch {
            channelsStatus[user.peopleId] = null;
          }
        })
      );
      setUserChannels(channelsStatus);
    } catch {
      console.error('Erro ao buscar usuários');
    } finally {
      setLoading(false);
    }
  }

  // Filtro pelo termo de busca
  useEffect(() => {
    const lowerSearch = searchTerm.toLowerCase();
    const filtered = users.filter((user) =>
      user.cpf.toLowerCase().includes(lowerSearch) ||
      (user.nickname && user.nickname.toLowerCase().includes(lowerSearch)) ||
      user.email.toLowerCase().includes(lowerSearch)
    );
    setFilteredUsers(filtered);

    if (filtered.length === 1) {
      const exactMatch = filtered[0];
      if (
        exactMatch.cpf.toLowerCase() === lowerSearch ||
        (exactMatch.nickname && exactMatch.nickname.toLowerCase() === lowerSearch) ||
        exactMatch.email.toLowerCase() === lowerSearch
      ) {
        setSelectedUser(exactMatch);
        setSelectedChannel(userChannels[exactMatch.peopleId || '']);
        fetchCatalogs(userChannels[exactMatch.peopleId || '']?.id);
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
        // Supondo que getCatalogsByChannelId retorne CatalogData[]
        const catalogsData: CatalogData[] = await getCatalogsByChannelId(channelId);
        const catalogsWithReleaseStatus: Catalog[] = await Promise.all(
          catalogsData.map(async (catalogData) => {
            const released = await isCatalogReleased(catalogData.id);
            return { ...catalogData, released };
          })
        );
        setCatalogs(catalogsWithReleaseStatus);
      }
    } catch {
      console.error('Erro ao buscar catálogos');
      setCatalogs([]);
    }
  }

  function handleUserClick(user: User) {
    const alreadySelected = selectedUser?.id === user.id;
    if (alreadySelected) {
      clearSelection();
      return;
    }
    setSelectedUser(user);
    const channel = userChannels[user.peopleId || ''];
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
    if (selectedChannel) {
      window.location.href = `${frontUrl}${selectedChannel.nickname || ''}`;
    }
  }

  async function handleCatalogRelease(catalogId: string, released: boolean) {
    try {
      await updateCatalogRelease(catalogId, released);
      if (selectedChannel?.id) {
        fetchCatalogs(selectedChannel.id);
      }
    } catch {
      console.error('Erro ao atualizar o status de liberação do catálogo');
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
          <HeaderButton onClick={() => router.back()} icon={closeIcon} />
          <input
            type="text"
            placeholder="Pesquisar por CPF, nome de usuário ou e-mail"
            value={searchTerm}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className={styles['users-search-input']}
          />
          <span className={styles['user-count']}>{filteredUsers.length} usuários</span>
        </div>

        <div className={styles['users-section']}>
          <div className={`${styles['users-list']} ${selectedUser ? styles['with-card'] : ''}`}>
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
              const backgroundColor =
                isSelected ? '#414141' : index % 2 === 0 ? '#0B0B0B' : 'black';

              return (
                <div
                  key={user.id}
                  className={`${styles['user-row']} ${isSelected ? styles['selected'] : ''}`}
                  onClick={() => handleUserClick(user)}
                  style={{ backgroundColor, height: '57px', cursor: 'pointer' }}
                >
                  <div className={styles['user-columnindex']}>
                    {index + 1 + currentPage * pageSize}
                  </div>
                  <div className={styles['user-columncpf']}>{user.cpf}</div>
                  <div className={styles['user-columnnickname']}>{user.nickname}</div>
                  <div className={styles['user-columnemail']}>{user.email}</div>
                  <div
                    className={`${styles['user-columnchannel']} ${
                      userChannels[user.peopleId || ''] ? styles['channel-yes'] : styles['channel-no']
                    }`}
                  >
                    <span className={styles['user-columnchannel-name']}>
                      {userChannels[user.peopleId || ''] ? 'Sim' : 'Não'}
                    </span>
                  </div>
                  <div className={styles['user-columnrole']}>{user.role}</div>
                </div>
              );
            })}

            <div
              className={`${styles['pagination-controls']} ${
                selectedUser ? styles['pagination-with-card'] : ''
              }`}
            >
              <button onClick={handlePreviousPage} disabled={currentPage === 0}>
                Anterior
              </button>
              <span>
                Página {currentPage + 1} de {totalPages}
              </span>
              <button onClick={handleNextPage} disabled={currentPage >= totalPages - 1}>
                Próxima
              </button>
            </div>
          </div>

          {selectedUser && (
            <div className={styles['user-card-container']}>
              <div className={styles['user-card']}>
                <h3>Informações do Usuário</h3>
                <p>
                  <span className={styles['user-card-name']}>Nome de usuário: </span>
                  {selectedUser.nickname}
                </p>
                <p>
                  <span className={styles['user-card-name']}>Nome: </span>
                  {selectedUser.name}
                </p>
                <p>
                  <span className={styles['user-card-name']}>Email: </span>
                  {selectedUser.email}
                </p>
                <p>
                  <span className={styles['user-card-name']}>Telefone: </span>
                  {selectedUser.phone}
                </p>
                <p>
                  <span className={styles['user-card-name']}>CPF: </span>
                  {selectedUser.cpf}
                </p>
                <p>
                  <span className={styles['user-card-name']}>Data de nascimento: </span>
                  {selectedUser.birthDate}
                </p>
                <p>
                  <span className={styles['user-card-name']}>Role: </span>
                  {selectedUser.role}
                </p>
              </div>

              {selectedChannel && (
                <div className={styles['channel-card']}>
                  <NextImage
                    src={`${apiUrl}${selectedChannel.imageUrl || ''}`}
                    alt="Canal"
                    className={styles['channel-image']}
                    width={100}
                    height={100}
                  />
                  <div className={styles['channel-info']}>
                    <p className={styles['channel-name']}>{selectedChannel.name}</p>
                    <p className={styles['channel-biography']}>{selectedChannel.biography}</p>
                    <button
                      className={styles['channel-nickname-btn']}
                      onClick={handleNicknameClick}
                    >
                      Ir para o canal
                    </button>
                  </div>
                </div>
              )}

              {catalogs.length > 0 &&
                catalogs.map((catalog) => (
                  <div key={catalog.id} className={styles['catalog-card']}>
                    <h3>{catalog.name}</h3>
                    <p>
                      <span className={styles['catalog-card-label']}>
                        Nome do responsável:{' '}
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
                      className={`${styles['catalog-release-btn']} ${
                        catalog.released ? styles['btn-activate'] : styles['btn-deactivate']
                      }`}
                      onClick={() => handleCatalogRelease(catalog.id, !catalog.released)}
                    >
                      {catalog.released ? 'Ativar' : 'Desativar'}
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
