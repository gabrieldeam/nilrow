import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Following.css';
import getConfig from '../../config';
import rightArrow from '../../assets/rightarrow.svg';
import { getMyFollowingChannels } from '../../services/channelApi'; 
import './Sections.css';

const Following = () => {
  const { apiUrl, frontUrl } = getConfig();
  const navigate = useNavigate();
  const followingListRef = useRef(null);
  
  const [channels, setChannels] = useState([]); // Lista de canais seguidos
  const [page, setPage] = useState(0); // Página atual de carregamento
  const [isLoading, setIsLoading] = useState(false); // Estado de carregamento
  const [hasMore, setHasMore] = useState(true); // Indica se há mais canais para carregar

  // Função para carregar canais, memoizada com useCallback
  const loadChannels = useCallback(async () => {
    if (isLoading || !hasMore) return; // Evita carregamentos se já está carregando ou não há mais itens
    
    setIsLoading(true); // Inicia o estado de carregamento

    try {
      const response = await getMyFollowingChannels(page, 10); // Carrega 10 canais por vez
      setChannels((prevChannels) => [...prevChannels, ...response]); // Atualiza a lista de canais

      if (response.length < 10) {
        setHasMore(false); // Se menos de 10 itens, marca como sem mais itens
      }
    } catch (error) {
      console.error('Erro ao carregar canais seguidos:', error);
    } finally {
      setIsLoading(false); // Finaliza o estado de carregamento
    }
  }, [page, isLoading, hasMore]); // Incluímos as dependências corretas

  // Chama loadChannels quando a página muda
  useEffect(() => {
    loadChannels(); // Carrega os canais sempre que a página for incrementada
  }, [loadChannels]); // Agora o useEffect depende de loadChannels, resolvendo o aviso do ESLint

  // Função de rolagem para carregar mais canais quando o usuário atinge o final da lista
  const handleScroll = useCallback(() => {
    const { scrollLeft, scrollWidth, clientWidth } = followingListRef.current;

    if (scrollLeft + clientWidth >= scrollWidth - 50 && !isLoading && hasMore) {
      setPage((prevPage) => prevPage + 1); // Incrementa a página para carregar mais canais
    }
  }, [isLoading, hasMore]);

  useEffect(() => {
    const ref = followingListRef.current;

    if (ref) {
      ref.addEventListener('scroll', handleScroll); // Adiciona evento de rolagem
    }

    return () => {
      if (ref) {
        ref.removeEventListener('scroll', handleScroll); // Remove evento de rolagem ao desmontar
      }
    };
  }, [handleScroll]);

  // Renderiza os canais seguidos
  const renderFollowingChannels = () => {
    return channels.length > 0 ? (
      channels.map((channel, index) => (
        <a href={`${frontUrl}${channel.nickname}`} key={`${channel.id}-${index}`} className="following-channel-item">
          <img src={`${apiUrl}${channel.imageUrl}`} alt={channel.name} className="channel-image-following" />
          <div className="channel-name-following">{channel.name}</div>
        </a>
      ))
    ) : (
      <div>No channels found</div>
    );
  };

  return (
    <div className="following-channel-section-content">
      <div className="following-channel-header">
        <div className="following-title">Canais que você segue</div>
        <button onClick={() => navigate('/my-following')} className="following-button">
          <img src={rightArrow} alt="Following" className="right-arrow-icon" />
        </button>
      </div>
      <div className="following-channel">
        <div className="following-channel-content" ref={followingListRef}>
          {renderFollowingChannels()}
        </div>
      </div>
      <div className="posts-following-channel">Posts dos Canais Seguidos</div>
    </div>
  );
};

export default Following;
