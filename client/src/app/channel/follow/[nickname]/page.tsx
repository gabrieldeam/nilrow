"use client";

import React, { useState, useEffect, useCallback, memo } from "react";
import Head from "next/head";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import MobileHeader from "@/components/Layout/MobileHeader/MobileHeader";
import HeaderButton from "@/components/UI/HeaderButton/HeaderButton";
import CustomButton from "@/components/UI/CustomButton/CustomButton";

// Obs: como os assets agora estão em public/assets, estamos importando assim:
import closeIcon from "../../../../../public/assets/close.svg";
import userIcon from "../../../../../public/assets/user.png";

import { isChannelOwner } from "@/services/channel/channelService";
import {
  getFollowingChannels,
  getFollowers,
  isFollowing,
  followChannel,
  unfollowChannel,
} from "@/services/channel/followService";
import { FollowerData, ChannelData } from "@/types/services/channel";

import styles from "./ChannelFollow.module.css";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
const frontUrl = process.env.NEXT_PUBLIC_FRONT_URL || "";

const ChannelFollow: React.FC = () => {
  const params = useParams();
  const { nickname } = params as { nickname: string };

  // --------------------------
  //  STATES
  // --------------------------
  const [followers, setFollowers] = useState<FollowerData[]>([]);
  const [followersPage, setFollowersPage] = useState(0); // Página atual de seguidores

  const [followingChannels, setFollowingChannels] = useState<ChannelData[]>([]);
  const [followingPage, setFollowingPage] = useState(0); // Página atual de canais seguindo

  const [activeSection, setActiveSection] = useState<"followers" | "following">(
    "followers"
  );
  const [searchQuery, setSearchQuery] = useState("");

  const [ownerChannels, setOwnerChannels] = useState<Record<string, boolean>>({});
  const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>(
    {}
  );

  const [hasMoreFollowers, setHasMoreFollowers] = useState(true);
  const [hasMoreFollowing, setHasMoreFollowing] = useState(true);

  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const isMobile = typeof window !== "undefined" ? window.innerWidth <= 768 : false;

  // --------------------------
  //  FETCH FUNCTIONS
  // --------------------------
  const fetchFollowers = useCallback(
    async (nickname: string, page: number) => {
      setLoading(true);
      try {
        const response: FollowerData[] = await getFollowers(nickname, page, 10);

        if (response.length === 0) {
          setHasMoreFollowers(false);
        } else {
          setFollowers((prev) => [...prev, ...response]);
          setFollowersPage(page + 1); // Incrementa a página após receber dados
        }
      } catch (error) {
        console.error("Error fetching followers", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchFollowingChannels = useCallback(
    async (nickname: string, page: number) => {
      setLoading(true);
      try {
        const response: ChannelData[] = await getFollowingChannels(
          nickname,
          page,
          10
        );

        if (response.length === 0) {
          setHasMoreFollowing(false);
        } else {
          setFollowingChannels((prev) => [...prev, ...response]);

          // Verifica se o usuário é dono do canal e/ou se já segue cada canal
          const ownerStatuses: Record<string, boolean> = {};
          const followingStatuses: Record<string, boolean> = {};

          for (const channel of response) {
            const isOwner = await isChannelOwner(channel.id);
            const isFollowingChannel = await isFollowing(channel.id);

            ownerStatuses[channel.id] = isOwner;
            followingStatuses[channel.id] = isFollowingChannel;
          }

          setOwnerChannels((prev) => ({ ...prev, ...ownerStatuses }));
          setFollowingStatus((prev) => ({ ...prev, ...followingStatuses }));

          setFollowingPage(page + 1); // Incrementa a página após receber dados
        }
      } catch (error) {
        console.error("Error fetching following channels", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // --------------------------
  //  EFFECTS
  // --------------------------
  // Atualiza a lista de seguidores ou seguindo ao trocar a aba
  useEffect(() => {
    if (activeSection === "followers") {
      setFollowers([]);
      setHasMoreFollowers(true);
      setFollowersPage(0);
      fetchFollowers(nickname, 0);
    } else if (activeSection === "following") {
      setFollowingChannels([]);
      setHasMoreFollowing(true);
      setFollowingPage(0);
      fetchFollowingChannels(nickname, 0);
    }
  }, [activeSection, nickname, fetchFollowers, fetchFollowingChannels]);

  // Verifica scroll para carregamento infinito
  useEffect(() => {
    const handleScroll = () => {
      if (loading) return;

      // Se o usuário chegou perto do final da página...
      if (
        window.innerHeight + document.documentElement.scrollTop + 1 >=
        document.documentElement.scrollHeight
      ) {
        if (activeSection === "followers" && hasMoreFollowers) {
          fetchFollowers(nickname, followersPage);
        } else if (activeSection === "following" && hasMoreFollowing) {
          fetchFollowingChannels(nickname, followingPage);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [
    loading,
    activeSection,
    hasMoreFollowers,
    hasMoreFollowing,
    fetchFollowers,
    fetchFollowingChannels,
    nickname,
    followersPage,
    followingPage,
  ]);

  // --------------------------
  //  HANDLERS
  // --------------------------
  const handleFollow = async (channelId: string) => {
    try {
      await followChannel(channelId);
      setFollowingStatus((prev) => ({ ...prev, [channelId]: true }));
    } catch (error) {
      console.error("Error following channel", error);
    }
  };

  const handleUnfollow = async (channelId: string) => {
    try {
      await unfollowChannel(channelId);
      setFollowingStatus((prev) => ({ ...prev, [channelId]: false }));
    } catch (error) {
      console.error("Error unfollowing channel", error);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleBack = () => {
    router.back();
  };

  // --------------------------
  //  FILTERS
  // --------------------------
  const filteredFollowers = followers.filter((follower) =>
    (follower.name?.toLowerCase() || follower.nickname.toLowerCase()).includes(
      searchQuery.toLowerCase()
    )
  );

  const filteredFollowingChannels = followingChannels.filter(
    (channel) =>
      channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      channel.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --------------------------
  //  RENDER
  // --------------------------
  return (
    <div className={styles.channelFollowPage}>
      <Head>
        <title>{`Channel Follow - ${nickname}`}</title>
        <meta
          name="description"
          content={`Veja os seguidores e os canais que ${nickname} segue na Nilrow.`}
        />
      </Head>

      {isMobile && (
        <MobileHeader
          title={`@${nickname}`}
          buttons={{ close: true }}
          handleBack={handleBack}
        />
      )}

      <div className={styles.channelFollowContainer}>
        <div className={styles.channelFollowHeader}>
          <div className={styles.channelFollowButtons}>
            <button
              className={`${styles.channelFollowButton} ${
                activeSection === "followers" ? styles.active : ""
              }`}
              onClick={() => setActiveSection("followers")}
            >
              Seguidores
            </button>
            <button
              className={`${styles.channelFollowButton} ${
                activeSection === "following" ? styles.active : ""
              }`}
              onClick={() => setActiveSection("following")}
            >
              Seguindo
            </button>
          </div>

          <div className={styles.channelFollowSearchContainer}>
            {!isMobile && (
              <HeaderButton
                icon={closeIcon}
                onClick={handleBack}
                // Se a interface HeaderButtonProps não aceitar className, adicione na interface
                className={styles.channelFollowDesktopOnly}
              />
            )}

            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearch}
              className={styles.channelFollowSearchInput}
            />
          </div>
        </div>

        <div
          className={
            isMobile
              ? styles.channelFollowListMobile
              : styles.channelFollowListDesktop
          }
        >
          {activeSection === "followers" &&
            filteredFollowers.map((follower, index) => (
              <div
                key={`${follower.id}-${index}`}
                className={styles.channelFollowItem}
              >
                <button className={styles.channelFollowInfo2}>
                  <Image
                    src={
                      follower.profileImage
                        ? `${apiUrl}${follower.profileImage}`
                        : userIcon
                    }
                    alt={follower.name || follower.nickname}
                    className={styles.channelFollowImage}
                    width={50}
                    height={50}
                  />
                  <div className={styles.channelFollowDetails}>
                    <span className={styles.channelFollowName}>
                      {follower.name || follower.nickname}
                    </span>
                    <span className={styles.channelFollowNickname}>
                      @{follower.nickname}
                    </span>
                  </div>
                </button>
              </div>
            ))}

          {activeSection === "following" &&
            filteredFollowingChannels.map((channel, index) => (
              <div
                key={`${channel.id}-${index}`}
                className={styles.channelFollowItem}
              >
                <a
                  className={styles.channelFollowInfo2}
                  href={`${frontUrl}/${channel.nickname}`}
                >
                  <Image
                    src={
                      channel.imageUrl
                        ? `${apiUrl}${channel.imageUrl}`
                        : userIcon
                    }
                    alt={channel.name}
                    className={styles.channelFollowImage}
                    width={50}
                    height={50}
                  />
                  <div className={styles.channelFollowDetails}>
                    <span className={styles.channelFollowName}>
                      {channel.name}
                    </span>
                    <span className={styles.channelFollowNickname}>
                      @{channel.nickname}
                    </span>
                  </div>
                </a>

                {ownerChannels[channel.id] ? (
                  <CustomButton
                    title="Editar Canal"
                    backgroundColor="#212121"
                    onClick={() => router.push(`/edit-channel/${channel.id}`)}
                  />
                ) : followingStatus[channel.id] ? (
                  <CustomButton
                    title="Amigos"
                    backgroundColor="#212121"
                    onClick={() => handleUnfollow(channel.id)}
                  />
                ) : (
                  <CustomButton
                    title="Seguir"
                    backgroundColor="#DF1414"
                    onClick={() => handleFollow(channel.id)}
                  />
                )}
              </div>
            ))}
        </div>
        {loading && <div>Loading...</div>}
      </div>
    </div>
  );
};

export default memo(ChannelFollow);
