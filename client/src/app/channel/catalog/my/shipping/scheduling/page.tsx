'use client';

import React, {
  useState,
  memo,
  useEffect,
  useCallback,
  ChangeEvent
} from 'react';
import { useRouter } from 'next/navigation';

import LoadingSpinner from '@/components/UI/LoadingSpinner/LoadingSpinner';
import MobileHeader from '@/components/Layout/MobileHeader/MobileHeader';
import SubHeader from '@/components/Layout/SubHeader/SubHeader';

import styles from './scheduling.module.css';

// Serviços para verificar se Delivery/Pickup estão ativos
import { getActiveByCatalog } from '@/services/pickupService';
import { getDeliveryActiveByCatalogId } from '@/services/deliveryService';

// Serviços para Scheduling
import {
  createScheduling,
  deleteScheduling,
  getSchedulingsByCatalogId,
  updateScheduling
} from '@/services/schedulingService';

// Serviços para SchedulingInterval
import {
  createSchedulingInterval,
  deleteSchedulingInterval,
  getSchedulingIntervalsBySchedulingId,
  updateSchedulingInterval
} from '@/services/schedulingIntervalService';

// Types
import {
  SchedulingDTO,
  SchedulingIntervalDTO,
  ShippingMode
} from '@/types/services/scheduling';

function Scheduling() {
  const router = useRouter();

  // --- Estados Gerais ---
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [catalogId, setCatalogId] = useState<string | null>(null);

  // Estados de "ativo" para cada modo
  const [deliveryActive, setDeliveryActive] = useState<boolean | null>(null);
  const [pickupActive, setPickupActive] = useState<boolean | null>(null);

  // --- Dados de Scheduling ---
  const [deliverySchedulings, setDeliverySchedulings] = useState<SchedulingDTO[]>([]);
  const [pickupSchedulings, setPickupSchedulings] = useState<SchedulingDTO[]>([]);

  // --- Dados de Intervalos ---
  const [intervalsByScheduling, setIntervalsByScheduling] = useState<{
    [schedulingId: string]: SchedulingIntervalDTO[];
  }>({});

  // --- Formulário de criação de Intervalo ---
  const [newIntervalData, setNewIntervalData] = useState<{
    [schedulingId: string]: {
      startTime: string;
      endTime: string;
      maxAppointments: number;
    };
  }>({});

  /**
   * Estados para gerenciar edição de intervalos.
   * A key é o id do intervalo; se existir, estamos em modo de edição.
   */
  const [editingIntervals, setEditingIntervals] = useState<{
    [intervalId: string]: SchedulingIntervalDTO;
  }>({});

  // ---------------------------------------------------------------------------
  // 1) Recupera o catalogId do localStorage e redireciona se não existir
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const storedCatalogId = localStorage.getItem('selectedCatalogId');
    if (!storedCatalogId) {
      router.push('/channel/catalog/my');
    } else {
      setCatalogId(storedCatalogId);
    }
  }, [router]);

  // ---------------------------------------------------------------------------
  // 2) Função para voltar à tela anterior
  // ---------------------------------------------------------------------------
  const handleBack = useCallback(() => {
    router.push('/channel/catalog/my/shipping');
  }, [router]);

  // ---------------------------------------------------------------------------
  // 3) Detecta se o dispositivo é mobile
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth <= 768);
    checkIsMobile();
  }, []);

  // ---------------------------------------------------------------------------
  // 4) Carrega os dados de Delivery/Pickup e dos Schedulings/Intervals,
  //    criando automaticamente um Scheduling se o modo estiver ativo e nenhum existir.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!catalogId) return;

    const loadData = async () => {
      try {
        setLoading(true);

        // Recupera os status (true/false ou null) e os schedulings já cadastrados
        const [pickupResult, deliveryResult, schedulingsFromApi] = await Promise.all([
          getActiveByCatalog(catalogId),
          getDeliveryActiveByCatalogId(catalogId),
          getSchedulingsByCatalogId(catalogId)
        ]);

        setPickupActive(pickupResult);
        setDeliveryActive(deliveryResult);

        // Filtra os schedulings por modo
        let deliveryList = schedulingsFromApi.filter(
          (s) => s.shippingMode === ShippingMode.DELIVERY
        );
        let pickupList = schedulingsFromApi.filter(
          (s) => s.shippingMode === ShippingMode.PICKUP
        );

        // Se o modo estiver ativo e não houver scheduling, cria automaticamente
        if (deliveryResult === true && deliveryList.length === 0) {
          const newDelivery = await createScheduling({
            catalogId,
            active: true,
            shippingMode: ShippingMode.DELIVERY
          });
          deliveryList.push(newDelivery);
        }
        if (pickupResult === true && pickupList.length === 0) {
          const newPickup = await createScheduling({
            catalogId,
            active: true,
            shippingMode: ShippingMode.PICKUP
          });
          pickupList.push(newPickup);
        }

        // Atualiza os estados de schedulings
        setDeliverySchedulings(deliveryList);
        setPickupSchedulings(pickupList);

        // Carrega os intervalos para cada scheduling (incluindo os recém-criados)
        const allSchedulings = [...deliveryList, ...pickupList];
        for (const scheduling of allSchedulings) {
          const intervals = await getSchedulingIntervalsBySchedulingId(scheduling.id);
          setIntervalsByScheduling((prev) => ({
            ...prev,
            [scheduling.id]: intervals
          }));
        }
      } catch (err) {
        console.error('Erro ao buscar dados de Scheduling:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [catalogId]);

  // ---------------------------------------------------------------------------
  // 5) Excluir um Scheduling
  // ---------------------------------------------------------------------------
  const handleDeleteScheduling = async (id: string, mode: ShippingMode) => {
    const confirmDel = window.confirm('Deseja realmente excluir este scheduling?');
    if (!confirmDel) return;

    setLoading(true);
    try {
      await deleteScheduling(id);

      if (mode === ShippingMode.DELIVERY) {
        setDeliverySchedulings((prev) => prev.filter((d) => d.id !== id));
      } else {
        setPickupSchedulings((prev) => prev.filter((p) => p.id !== id));
      }

      // Remove os intervalos associados
      setIntervalsByScheduling((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });

      alert('Scheduling excluído com sucesso');
    } catch (error) {
      console.error('Erro ao excluir scheduling:', error);
      alert('Erro ao excluir scheduling.');
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 6) Criar um novo Intervalo para um Scheduling
  // ---------------------------------------------------------------------------
  const handleChangeNewIntervalData = (
    e: ChangeEvent<HTMLInputElement>,
    schedulingId: string
  ) => {
    const { name, value } = e.target;
    setNewIntervalData((prev) => ({
      ...prev,
      [schedulingId]: {
        ...prev[schedulingId],
        [name]: name === 'maxAppointments' ? Number(value) : value
      }
    }));
  };

  const handleCreateInterval = async (schedulingId: string) => {
    if (!newIntervalData[schedulingId]) return;
    const { startTime, endTime, maxAppointments } = newIntervalData[schedulingId];

    setLoading(true);
    try {
      const intervalCreated = await createSchedulingInterval({
        schedulingId,
        startTime,
        endTime,
        maxAppointments
      });

      setIntervalsByScheduling((prev) => ({
        ...prev,
        [schedulingId]: prev[schedulingId]
          ? [...prev[schedulingId], intervalCreated]
          : [intervalCreated]
      }));

      setNewIntervalData((prev) => ({
        ...prev,
        [schedulingId]: { startTime: '', endTime: '', maxAppointments: 0 }
      }));
    } catch (error) {
      console.error('Erro ao criar intervalo:', error);
      alert('Erro ao criar intervalo.');
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 7) Excluir um Intervalo
  // ---------------------------------------------------------------------------
  const handleDeleteInterval = async (intervalId: string, schedulingId: string) => {
    const confirmDel = window.confirm('Deseja realmente excluir este intervalo?');
    if (!confirmDel) return;

    setLoading(true);
    try {
      await deleteSchedulingInterval(intervalId);
      setIntervalsByScheduling((prev) => ({
        ...prev,
        [schedulingId]: prev[schedulingId].filter((intv) => intv.id !== intervalId)
      }));
      alert('Intervalo excluído com sucesso.');
    } catch (error) {
      console.error('Erro ao excluir intervalo:', error);
      alert('Erro ao excluir intervalo.');
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 8) Toggle para ativar/desativar Scheduling
  // ---------------------------------------------------------------------------
  const handleToggleSchedulingActive = async (scheduling: SchedulingDTO) => {
    setLoading(true);
    try {
      // Envia catalogId e shippingMode junto com o novo valor de active
      const updated = await updateScheduling(scheduling.id, {
        catalogId: scheduling.catalogId,
        shippingMode: scheduling.shippingMode,
        active: !scheduling.active
      });
      alert(`Scheduling atualizado para Ativo = ${updated.active}`);

      if (scheduling.shippingMode === ShippingMode.DELIVERY) {
        setDeliverySchedulings((prev) =>
          prev.map((d) => (d.id === scheduling.id ? updated : d))
        );
      } else {
        setPickupSchedulings((prev) =>
          prev.map((p) => (p.id === scheduling.id ? updated : p))
        );
      }
    } catch (error) {
      console.error('Erro ao atualizar scheduling:', error);
      alert('Erro ao atualizar scheduling.');
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 9) Edição de Intervalo
  // ---------------------------------------------------------------------------
  const handleEditInterval = (intv: SchedulingIntervalDTO) => {
    setEditingIntervals((prev) => ({
      ...prev,
      [intv.id]: { ...intv }
    }));
  };

  const handleChangeEditInterval = (
    e: ChangeEvent<HTMLInputElement>,
    intervalId: string
  ) => {
    const { name, value } = e.target;
    setEditingIntervals((prev) => ({
      ...prev,
      [intervalId]: {
        ...prev[intervalId],
        [name]: name === 'maxAppointments' ? Number(value) : value
      }
    }));
  };

  const handleSaveEditInterval = async (intervalId: string, schedulingId: string) => {
    const editedData = editingIntervals[intervalId];
    if (!editedData) return;

    setLoading(true);
    try {
      const updated = await updateSchedulingInterval(intervalId, {
        schedulingId, // garante que o schedulingId é enviado
        startTime: editedData.startTime,
        endTime: editedData.endTime,
        maxAppointments: editedData.maxAppointments
      });
      setIntervalsByScheduling((prev) => ({
        ...prev,
        [schedulingId]: prev[schedulingId].map((intv) =>
          intv.id === intervalId ? updated : intv
        )
      }));
      setEditingIntervals((prev) => {
        const newState = { ...prev };
        delete newState[intervalId];
        return newState;
      });
    } catch (error) {
      console.error('Erro ao salvar intervalo:', error);
      alert('Erro ao salvar intervalo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEditInterval = (intervalId: string) => {
    setEditingIntervals((prev) => {
      const newState = { ...prev };
      delete newState[intervalId];
      return newState;
    });
  };

  // ---------------------------------------------------------------------------
  // Renderização
  // ---------------------------------------------------------------------------
  return (
    <div className={styles.schedulingPage}>
      {isMobile && (
        <MobileHeader
          title="Agendamento"
          buttons={{ close: true }}
          handleBack={handleBack}
        />
      )}

      {loading && <LoadingSpinner />}

      <div className={styles.schedulingContainer}>
        <SubHeader title="Agendamento" handleBack={handleBack} />

        {/* Seção Delivery */}
        {deliveryActive !== null && (
          <div className={styles.section}>
            <h2>Delivery</h2>
            {deliveryActive ? (
              <>
                {deliverySchedulings.length > 0 ? (
                  deliverySchedulings.map((sched) => (
                    <div key={sched.id} className={styles.schedulingItem}>
                      <p>
                        <strong>ID:</strong> {sched.id}
                      </p>
                      <p>
                        <strong>Ativo:</strong> {sched.active ? 'Sim' : 'Não'}{' '}
                        <button onClick={() => handleToggleSchedulingActive(sched)}>
                          {sched.active ? 'Desativar' : 'Ativar'}
                        </button>
                      </p>
                      <button
                        onClick={() => handleDeleteScheduling(sched.id, ShippingMode.DELIVERY)}
                      >
                        Excluir Scheduling
                      </button>

                      {/* Listagem e criação de intervals para este scheduling */}
                      <div className={styles.intervalContainer}>
                        <h4>Intervals:</h4>
                        {intervalsByScheduling[sched.id]?.length ? (
                          intervalsByScheduling[sched.id].map((intv) => {
                            const isEditing = editingIntervals[intv.id] != null;
                            return (
                              <div key={intv.id} className={styles.intervalItem}>
                                {isEditing ? (
                                  <>
                                    <p>
                                      <input
                                        type="time"
                                        name="startTime"
                                        value={editingIntervals[intv.id].startTime}
                                        onChange={(e) => handleChangeEditInterval(e, intv.id)}
                                      />
                                      {' - '}
                                      <input
                                        type="time"
                                        name="endTime"
                                        value={editingIntervals[intv.id].endTime}
                                        onChange={(e) => handleChangeEditInterval(e, intv.id)}
                                      />
                                    </p>
                                    <p>
                                      Máx.:
                                      <input
                                        type="number"
                                        name="maxAppointments"
                                        value={editingIntervals[intv.id].maxAppointments}
                                        onChange={(e) => handleChangeEditInterval(e, intv.id)}
                                        style={{ width: '60px', marginLeft: '0.5rem' }}
                                      />
                                    </p>
                                    <button onClick={() => handleSaveEditInterval(intv.id, sched.id)}>
                                      Salvar
                                    </button>
                                    <button
                                      onClick={() => handleCancelEditInterval(intv.id)}
                                      style={{ marginLeft: '0.5rem' }}
                                    >
                                      Cancelar
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <p>
                                      Horário: {intv.startTime} - {intv.endTime} | Máx.: {intv.maxAppointments}
                                    </p>
                                    <button
                                      onClick={() => handleEditInterval(intv)}
                                      style={{ marginRight: '0.5rem' }}
                                    >
                                      Editar
                                    </button>
                                    <button
                                      onClick={() => handleDeleteInterval(intv.id, sched.id)}
                                    >
                                      Excluir
                                    </button>
                                  </>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <p>Nenhum intervalo criado.</p>
                        )}

                        {/* Formulário para criar novo intervalo */}
                        <div style={{ marginTop: '0.5rem' }}>
                          <input
                            type="time"
                            name="startTime"
                            placeholder="Início"
                            value={newIntervalData[sched.id]?.startTime || ''}
                            onChange={(e) => handleChangeNewIntervalData(e, sched.id)}
                          />
                          <input
                            type="time"
                            name="endTime"
                            placeholder="Fim"
                            value={newIntervalData[sched.id]?.endTime || ''}
                            onChange={(e) => handleChangeNewIntervalData(e, sched.id)}
                          />
                          <input
                            type="number"
                            name="maxAppointments"
                            placeholder="Máx."
                            value={newIntervalData[sched.id]?.maxAppointments || 0}
                            onChange={(e) => handleChangeNewIntervalData(e, sched.id)}
                          />
                          <button onClick={() => handleCreateInterval(sched.id)}>
                            Criar Intervalo
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>Nenhum scheduling criado ainda para delivery.</p>
                )}
              </>
            ) : (
              <p>Para editar e criar intervalos, o delivery precisa estar ativo.</p>
            )}
          </div>
        )}

        {/* Seção Pickup */}
        {pickupActive !== null && (
          <div className={styles.section}>
            <h2>Pickup</h2>
            {pickupActive ? (
              <>
                {pickupSchedulings.length > 0 ? (
                  pickupSchedulings.map((sched) => (
                    <div key={sched.id} className={styles.schedulingItem}>
                      <p>
                        <strong>ID:</strong> {sched.id}
                      </p>
                      <p>
                        <strong>Ativo:</strong> {sched.active ? 'Sim' : 'Não'}{' '}
                        <button onClick={() => handleToggleSchedulingActive(sched)}>
                          {sched.active ? 'Desativar' : 'Ativar'}
                        </button>
                      </p>
                      <button onClick={() => handleDeleteScheduling(sched.id, ShippingMode.PICKUP)}>
                        Excluir Scheduling
                      </button>

                      {/* Listagem e criação de intervals para este scheduling */}
                      <div className={styles.intervalContainer}>
                        <h4>Intervals:</h4>
                        {intervalsByScheduling[sched.id]?.length ? (
                          intervalsByScheduling[sched.id].map((intv) => {
                            const isEditing = editingIntervals[intv.id] != null;
                            return (
                              <div key={intv.id} className={styles.intervalItem}>
                                {isEditing ? (
                                  <>
                                    <p>
                                      <input
                                        type="time"
                                        name="startTime"
                                        value={editingIntervals[intv.id].startTime}
                                        onChange={(e) => handleChangeEditInterval(e, intv.id)}
                                      />
                                      {' - '}
                                      <input
                                        type="time"
                                        name="endTime"
                                        value={editingIntervals[intv.id].endTime}
                                        onChange={(e) => handleChangeEditInterval(e, intv.id)}
                                      />
                                    </p>
                                    <p>
                                      Máx.:
                                      <input
                                        type="number"
                                        name="maxAppointments"
                                        value={editingIntervals[intv.id].maxAppointments}
                                        onChange={(e) => handleChangeEditInterval(e, intv.id)}
                                        style={{ width: '60px', marginLeft: '0.5rem' }}
                                      />
                                    </p>
                                    <button onClick={() => handleSaveEditInterval(intv.id, sched.id)}>
                                      Salvar
                                    </button>
                                    <button onClick={() => handleCancelEditInterval(intv.id)} style={{ marginLeft: '0.5rem' }}>
                                      Cancelar
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <p>
                                      Horário: {intv.startTime} - {intv.endTime} | Máx.: {intv.maxAppointments}
                                    </p>
                                    <button onClick={() => handleEditInterval(intv)} style={{ marginRight: '0.5rem' }}>
                                      Editar
                                    </button>
                                    <button onClick={() => handleDeleteInterval(intv.id, sched.id)}>
                                      Excluir
                                    </button>
                                  </>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <p>Nenhum intervalo criado.</p>
                        )}

                        {/* Formulário para criar novo intervalo */}
                        <div style={{ marginTop: '0.5rem' }}>
                          <input
                            type="time"
                            name="startTime"
                            placeholder="Início"
                            value={newIntervalData[sched.id]?.startTime || ''}
                            onChange={(e) => handleChangeNewIntervalData(e, sched.id)}
                          />
                          <input
                            type="time"
                            name="endTime"
                            placeholder="Fim"
                            value={newIntervalData[sched.id]?.endTime || ''}
                            onChange={(e) => handleChangeNewIntervalData(e, sched.id)}
                          />
                          <input
                            type="number"
                            name="maxAppointments"
                            placeholder="Máx."
                            value={newIntervalData[sched.id]?.maxAppointments || 0}
                            onChange={(e) => handleChangeNewIntervalData(e, sched.id)}
                          />
                          <button onClick={() => handleCreateInterval(sched.id)}>
                            Criar Intervalo
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>Nenhum scheduling criado ainda para pickup.</p>
                )}
              </>
            ) : (
              <p>Para editar e criar intervalos, o pickup precisa estar ativo.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(Scheduling);
